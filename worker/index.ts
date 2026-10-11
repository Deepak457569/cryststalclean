// CrystalClean Main Cloudflare Worker API & Static Asset Handler
import { Env, ORDER_STATUSES, OrderStatus } from './types';
import {
  bootstrapDatabase,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAccessCodes,
  createAccessCode,
  updateAccessCode,
  deleteAccessCode,
  checkAccessCodeQuick,
  verifyAndConsumeAccessCode,
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  updateInquiryAdminNotes,
  getInquiryHistory,
  getAdminStats,
} from './db';
import {
  hashPassword,
  verifyPassword,
  createJWT,
  authenticateAdmin,
  isEmailAllowed,
} from './auth';
import { generateWhatsAppLink } from './whatsapp';

// JSON response helper with CORS
function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

// In-memory rate limiting map for basic protection
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 25, windowMs = 60000): boolean {
  const now = Date.now();
  const record = ipRateMap.get(ip);
  if (!record || record.resetAt < now) {
    ipRateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count += 1;
  return true;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only intercept /api routes in the worker router
    if (url.pathname.startsWith('/api/')) {
      const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

      // Basic rate limiting on sensitive API endpoints
      if (['/api/auth/login', '/api/inquiries', '/api/access-codes/verify'].includes(url.pathname)) {
        if (!checkRateLimit(clientIp, 30, 60000)) {
          return errorResponse('Too many requests. Please try again in a moment.', 429);
        }
      }

      // Automatically ensure database schema exists
      if (env.DB) {
        ctx.waitUntil(bootstrapDatabase(env.DB, env));
      }

      try {
        // --- AUTHENTICATION ENDPOINTS ---

        // POST /api/auth/login (Admin Email & Password)
        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          const body = await request.json() as { email?: string; password?: string };
          if (!body.email || !body.password) {
            return errorResponse('Email and password are required', 400);
          }

          const cleanEmail = body.email.trim().toLowerCase();
          if (!isEmailAllowed(cleanEmail, env)) {
            return errorResponse('Access denied. This email is not authorized as an administrator.', 403);
          }

          let admin = await env.DB.prepare('SELECT * FROM administrators WHERE LOWER(email) = ?').bind(cleanEmail).first<any>();
          
          // Bootstrap initial admin if DB is newly initialized
          if (!admin && cleanEmail === (env.INITIAL_ADMIN_EMAIL || 'admin@crystalclean.in').toLowerCase().trim()) {
            const { hash, salt } = await hashPassword(body.password);
            await env.DB.prepare(`
              INSERT INTO administrators (id, email, password_hash, salt, role, name)
              VALUES (?, ?, ?, ?, 'admin', 'CrystalClean Executive')
            `).bind(`admin_${Date.now()}`, cleanEmail, hash, salt).run();
            admin = await env.DB.prepare('SELECT * FROM administrators WHERE LOWER(email) = ?').bind(cleanEmail).first<any>();
          }

          if (!admin || !admin.password_hash || !admin.salt) {
            return errorResponse('Invalid email or password', 401);
          }

          const valid = await verifyPassword(body.password, admin.password_hash, admin.salt);
          if (!valid) {
            return errorResponse('Invalid email or password', 401);
          }

          const secret = env.JWT_SECRET || 'crystalclean-jwt-secret-default-key';
          const token = await createJWT({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role }, secret);

          // Return token in response & Set-Cookie
          const cookie = `cc_admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${env.ENVIRONMENT === 'production' ? '; Secure' : ''}`;
          return jsonResponse({
            success: true,
            token,
            user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
          }, 200, { 'Set-Cookie': cookie });
        }

        // GET /api/auth/google (Initiates Google OAuth)
        if (url.pathname === '/api/auth/google' && request.method === 'GET') {
          const clientId = env.GOOGLE_CLIENT_ID;
          if (!clientId) {
            return errorResponse('Google OAuth is not configured on this server. Please contact administrator.', 500);
          }

          const state = crypto.randomUUID();
          const redirectUri = `${url.origin}/api/auth/google/callback`;
          const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          googleAuthUrl.searchParams.set('client_id', clientId);
          googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
          googleAuthUrl.searchParams.set('response_type', 'code');
          googleAuthUrl.searchParams.set('scope', 'openid email profile');
          googleAuthUrl.searchParams.set('state', state);
          googleAuthUrl.searchParams.set('access_type', 'online');
          googleAuthUrl.searchParams.set('prompt', 'select_account');

          return Response.redirect(googleAuthUrl.toString(), 302);
        }

        // GET /api/auth/google/callback (Google OAuth Callback & Strict Allowlist Verification)
        if (url.pathname === '/api/auth/google/callback' && request.method === 'GET') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error || !code) {
            return Response.redirect(`${url.origin}/admin/login?error=oauth_denied`, 302);
          }

          const clientId = env.GOOGLE_CLIENT_ID;
          const clientSecret = env.GOOGLE_CLIENT_SECRET;
          const redirectUri = `${url.origin}/api/auth/google/callback`;

          if (!clientId || !clientSecret) {
            return Response.redirect(`${url.origin}/admin/login?error=oauth_not_configured`, 302);
          }

          // Exchange code for tokens
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });

          if (!tokenRes.ok) {
            return Response.redirect(`${url.origin}/admin/login?error=token_exchange_failed`, 302);
          }

          const tokenData = await tokenRes.json() as { access_token: string; id_token?: string };

          // Fetch verified user info
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (!userInfoRes.ok) {
            return Response.redirect(`${url.origin}/admin/login?error=userinfo_failed`, 302);
          }

          const profile = await userInfoRes.json() as { email: string; name?: string; sub: string; email_verified?: boolean };

          // STRICT ADMIN ALLOWLIST ENFORCEMENT
          if (!profile.email_verified || !isEmailAllowed(profile.email, env)) {
            // Explicitly Deny Unauthorized Google Accounts
            return Response.redirect(`${url.origin}/admin/login?error=unauthorized_email&email=${encodeURIComponent(profile.email)}`, 302);
          }

          // Find or create admin account in DB
          let admin = await env.DB.prepare('SELECT * FROM administrators WHERE LOWER(email) = ?').bind(profile.email.toLowerCase()).first<any>();
          if (!admin) {
            const adminId = `admin_g_${Date.now()}`;
            await env.DB.prepare(`
              INSERT INTO administrators (id, email, google_id, role, name)
              VALUES (?, ?, ?, 'admin', ?)
            `).bind(adminId, profile.email.toLowerCase(), profile.sub, profile.name || 'Google Admin').run();
            admin = await env.DB.prepare('SELECT * FROM administrators WHERE id = ?').bind(adminId).first<any>();
          } else if (!admin.google_id) {
            await env.DB.prepare('UPDATE administrators SET google_id = ?, name = COALESCE(name, ?) WHERE id = ?').bind(profile.sub, profile.name, admin.id).run();
          }

          // Issue session JWT
          const secret = env.JWT_SECRET || 'crystalclean-jwt-secret-default-key';
          const sessionToken = await createJWT({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role }, secret);
          const cookie = `cc_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${env.ENVIRONMENT === 'production' ? '; Secure' : ''}`;

          return new Response(null, {
            status: 302,
            headers: {
              'Location': `${url.origin}/admin?auth_success=1`,
              'Set-Cookie': cookie,
            },
          });
        }

        // GET /api/auth/me (Check current admin session)
        if (url.pathname === '/api/auth/me' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) {
            return errorResponse('Unauthorized', 401);
          }
          return jsonResponse({ authenticated: true, user: admin });
        }

        // POST /api/auth/logout
        if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
          const cookie = `cc_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
          return jsonResponse({ success: true }, 200, { 'Set-Cookie': cookie });
        }

        // --- PUBLIC & ADMIN CATEGORIES ---

        // GET /api/categories
        if (url.pathname === '/api/categories' && request.method === 'GET') {
          const categories = await getCategories(env.DB);
          return jsonResponse({ categories });
        }

        // POST /api/categories (Admin)
        if (url.pathname === '/api/categories' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const body = await request.json() as any;
          if (!body.name) return errorResponse('Category name is required', 400);

          const created = await createCategory(env.DB, body);
          return jsonResponse({ category: created, success: true }, 201);
        }

        // PUT /api/categories/:id (Admin)
        if (url.pathname.startsWith('/api/categories/') && request.method === 'PUT') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/categories/', '');
          const body = await request.json() as any;
          const updated = await updateCategory(env.DB, id, body);
          return jsonResponse({ category: updated, success: true });
        }

        // DELETE /api/categories/:id (Admin)
        if (url.pathname.startsWith('/api/categories/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/categories/', '');
          await deleteCategory(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- PUBLIC & ADMIN PRODUCTS ---

        // GET /api/products
        if (url.pathname === '/api/products' && request.method === 'GET') {
          const categoryId = url.searchParams.get('category') || undefined;
          const search = url.searchParams.get('q') || undefined;
          const featuredOnly = url.searchParams.get('featured') === '1';
          
          // If public request, show active products only. If admin with auth, can show all.
          const isAdmin = !!(await authenticateAdmin(request, env));
          const activeOnly = !isAdmin || url.searchParams.get('active_only') === '1';

          const products = await getProducts(env.DB, { categoryId, search, activeOnly, featuredOnly });
          return jsonResponse({ products });
        }

        // GET /api/products/:id
        if (url.pathname.startsWith('/api/products/') && request.method === 'GET') {
          const id = url.pathname.replace('/api/products/', '');
          const product = await getProductById(env.DB, id);
          if (!product) return errorResponse('Product not found', 404);
          return jsonResponse({ product });
        }

        // POST /api/products (Admin)
        if (url.pathname === '/api/products' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const body = await request.json() as any;
          if (!body.name || !body.category_id || !body.image_url) {
            return errorResponse('Product name, category, and image URL are required', 400);
          }

          const created = await createProduct(env.DB, body);
          return jsonResponse({ product: created, success: true }, 201);
        }

        // PUT /api/products/:id (Admin)
        if (url.pathname.startsWith('/api/products/') && request.method === 'PUT') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/products/', '');
          const body = await request.json() as any;
          const updated = await updateProduct(env.DB, id, body);
          return jsonResponse({ product: updated, success: true });
        }

        // DELETE /api/products/:id (Admin)
        if (url.pathname.startsWith('/api/products/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/products/', '');
          await deleteProduct(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- CUSTOMER ACCESS CODE SYSTEM ---

        // POST /api/access-codes/verify (Public quick check for UI feedback)
        if (url.pathname === '/api/access-codes/verify' && request.method === 'POST') {
          const body = await request.json() as { code?: string };
          if (!body.code) return errorResponse('Access code is required', 400);

          const check = await checkAccessCodeQuick(env.DB, body.code);
          if (!check.valid) {
            return jsonResponse({ valid: false, message: check.error || 'Invalid code' }, 200);
          }
          return jsonResponse({
            valid: true,
            client_name: check.client_name,
            remaining_uses: check.remaining_uses,
          });
        }

        // GET /api/access-codes (Admin)
        if (url.pathname === '/api/access-codes' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const codes = await getAccessCodes(env.DB);
          return jsonResponse({ codes });
        }

        // POST /api/access-codes (Admin create code)
        if (url.pathname === '/api/access-codes' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const body = await request.json() as any;
          if (!body.client_name) {
            return errorResponse('Client / Hotel name is required', 400);
          }

          const created = await createAccessCode(env.DB, {
            ...body,
            created_by: admin.email,
          });
          return jsonResponse({ code: created, success: true }, 201);
        }

        // PATCH /api/access-codes/:id (Admin update or revoke code)
        if (url.pathname.startsWith('/api/access-codes/') && request.method === 'PATCH') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/access-codes/', '');
          const body = await request.json() as any;
          const updated = await updateAccessCode(env.DB, id, body);
          return jsonResponse({ code: updated, success: true });
        }

        // DELETE /api/access-codes/:id (Admin delete code)
        if (url.pathname.startsWith('/api/access-codes/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/access-codes/', '');
          await deleteAccessCode(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- CUSTOMER INQUIRIES & WHATSAPP ORDERING ---

        // POST /api/inquiries (Public inquiry submission with atomic code verification)
        if (url.pathname === '/api/inquiries' && request.method === 'POST') {
          const body = await request.json() as {
            inquiry_type?: 'cart' | 'bulk_quote';
            access_code: string;
            customer_name: string;
            company_name: string;
            contact_phone: string;
            contact_email?: string;
            delivery_city: string;
            expected_date?: string;
            notes?: string;
            items?: Array<{
              product_id?: string;
              product_name: string;
              variant?: string;
              pack_size?: string;
              quantity: number;
            }>;
          };

          // Validation
          if (!body.access_code) {
            return errorResponse('A valid customer access code is required to submit an inquiry.', 403);
          }
          if (!body.customer_name || !body.company_name || !body.contact_phone || !body.delivery_city) {
            return errorResponse('Customer name, company/hotel name, contact phone, and delivery city are required.', 400);
          }

          const items = body.items || [];
          if (items.length === 0 && body.inquiry_type !== 'bulk_quote') {
            return errorResponse('Your requirements cart is empty. Please select products before submitting.', 400);
          }

          // ATOMIC ACCESS CODE CHECK & CONSUMPTION
          const codeVerification = await verifyAndConsumeAccessCode(env.DB, body.access_code);
          if (!codeVerification.valid || !codeVerification.accessCode) {
            return errorResponse(codeVerification.error || 'Access code is invalid, expired, or inquiry limit reached.', 403);
          }

          // Create inquiry in D1 database
          const inquiry = await createInquiry(
            env.DB,
            {
              inquiry_type: body.inquiry_type || 'cart',
              customer_name: body.customer_name.trim(),
              company_name: body.company_name.trim(),
              contact_phone: body.contact_phone.trim(),
              contact_email: body.contact_email?.trim(),
              delivery_city: body.delivery_city.trim(),
              expected_date: body.expected_date,
              notes: body.notes,
              access_code_id: codeVerification.accessCode.id,
            },
            items
          );

          // Generate prepared WhatsApp Click-to-Chat URL
          const businessPhone = env.BUSINESS_WHATSAPP || '919149953610';
          const whatsappData = generateWhatsAppLink({
            reference: inquiry.reference,
            customer_name: inquiry.customer_name,
            company_name: inquiry.company_name,
            delivery_city: inquiry.delivery_city,
            notes: inquiry.notes || undefined,
            items: items.map(item => ({
              product_name: item.product_name,
              variant: item.variant,
              pack_size: item.pack_size,
              quantity: item.quantity,
            })),
          }, businessPhone);

          return jsonResponse({
            success: true,
            reference: inquiry.reference,
            inquiry_id: inquiry.id,
            whatsapp_url: whatsappData.url,
            prepared_message: whatsappData.formattedMessage,
          }, 201);
        }

        // GET /api/inquiries (Admin list inquiries)
        if (url.pathname === '/api/inquiries' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const status = url.searchParams.get('status') || undefined;
          const search = url.searchParams.get('q') || undefined;
          const limit = parseInt(url.searchParams.get('limit') || '100', 10);
          const offset = parseInt(url.searchParams.get('offset') || '0', 10);

          const inquiries = await getInquiries(env.DB, { status, search, limit, offset });
          return jsonResponse({ inquiries });
        }

        // GET /api/inquiries/:id (Admin get single inquiry details)
        if (url.pathname.startsWith('/api/inquiries/') && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/inquiries/', '');
          const inquiry = await getInquiryById(env.DB, id);
          if (!inquiry) return errorResponse('Inquiry not found', 404);

          const history = await getInquiryHistory(env.DB, inquiry.id);
          return jsonResponse({ inquiry, history });
        }

        // PATCH /api/inquiries/:id/status (Admin update order status)
        if (url.pathname.match(/^\/api\/inquiries\/[^\/]+\/status$/) && request.method === 'PATCH') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.split('/')[3];
          const body = await request.json() as { status: OrderStatus; note?: string };
          
          if (!body.status || !ORDER_STATUSES.includes(body.status)) {
            return errorResponse(`Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`, 400);
          }

          const updated = await updateInquiryStatus(env.DB, id, body.status, admin.email, body.note);
          if (!updated) return errorResponse('Inquiry not found', 404);

          return jsonResponse({ success: true, status: body.status });
        }

        // PATCH /api/inquiries/:id/notes (Admin update private notes)
        if (url.pathname.match(/^\/api\/inquiries\/[^\/]+\/notes$/) && request.method === 'PATCH') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.split('/')[3];
          const body = await request.json() as { admin_notes: string };
          await updateInquiryAdminNotes(env.DB, id, body.admin_notes || '');
          return jsonResponse({ success: true });
        }

        // GET /api/admin/stats (Admin dashboard stats overview)
        if (url.pathname === '/api/admin/stats' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const stats = await getAdminStats(env.DB);
          return jsonResponse({ stats });
        }

        // POST /api/upload (Admin upload product image to R2 or data URL)
        if (url.pathname === '/api/upload' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const contentType = request.headers.get('content-type') || '';
          if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            if (!file) return errorResponse('No file provided', 400);

            // If Cloudflare R2 bucket is bound
            if (env.BUCKET) {
              const fileKey = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
              await env.BUCKET.put(fileKey, await file.arrayBuffer(), {
                httpMetadata: { contentType: file.type }
              });
              const publicUrl = `/assets/${fileKey}`;
              return jsonResponse({ url: publicUrl, success: true });
            }

            // Fallback: convert to base64 Data URL for standalone zero-config storage
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            const dataUrl = `data:${file.type};base64,${base64}`;
            return jsonResponse({ url: dataUrl, success: true });
          }

          return errorResponse('Expected multipart/form-data', 400);
        }

        return errorResponse('API endpoint not found', 404);
      } catch (err: any) {
        console.error('API Error:', err);
        return errorResponse(err.message || 'Internal Server Error', 500);
      }
    }

    // Static Assets fallback for Cloudflare Workers with Static Assets
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
