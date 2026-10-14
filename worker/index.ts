// CrystalClean Hardened Cloudflare Worker API & Static Asset Handler
import { Env, ORDER_STATUSES, OrderStatus } from './types';
import {
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
  createSession,
  revokeSession,
  revokeAllSessions,
  checkD1RateLimit,
} from './db';
import {
  createJWT,
  verifyJWT,
  authenticateAdmin,
  isEmailAllowed,
  constantTimeEqual,
} from './auth';
export { isEmailAllowed, constantTimeEqual, verifyJWT, createJWT, authenticateAdmin };
import { generateWhatsAppLink } from './whatsapp';

// Security Headers applied to EVERY response (API and static assets)
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// JSON response helper with CORS and Security Headers
function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS,
      ...headers,
    },
  });
}

function errorResponse(message: string, status = 400, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: message, success: false }, status, headers);
}

// Verify magic bytes for uploaded images (Reject SVG, allow only JPG, PNG, WebP)
function detectImageMagicNumber(buffer: ArrayBuffer): { ext: string; mime: string } | null {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (isRiff && isWebp) {
    return { ext: 'webp', mime: 'image/webp' };
  }

  return null;
}

// Verify Cloudflare Turnstile human verification token
async function verifyTurnstileToken(token: string, secret: string, remoteIp: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const outcome = (await res.json()) as { success: boolean };
    return !!outcome.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

// Strict CSRF verification for admin mutating requests
function verifyAdminCsrf(request: Request, url: URL, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) {
    return false; // Reject if Origin header is missing
  }
  try {
    const originHost = new URL(origin).host;
    const expectedHost = env.APP_BASE_URL ? new URL(env.APP_BASE_URL).host : url.host;
    return originHost === url.host || originHost === expectedHost;
  } catch {
    return false;
  }
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
          ...SECURITY_HEADERS,
        },
      });
    }

    // Only intercept /api routes in the worker router
    if (url.pathname.startsWith('/api/')) {
      const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

      try {
        // --- AUTHENTICATION ENDPOINTS ---

        // POST /api/auth/login (Secure Direct Admin Passcode Authentication - 100% Free & Standalone)
        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          try {
            // Rate limit: max 5 login attempts per 15 minutes per IP
            if (env.DB) {
              const limit = await checkD1RateLimit(env.DB, `admin_login:${clientIp}`, 5, 900);
              if (!limit.allowed) {
                return errorResponse('Too many failed login attempts. Please wait 15 minutes before retrying.', 429, {
                  'Retry-After': String(limit.retryAfter),
                });
              }
            }

            let body: { passcode?: string } = {};
            try {
              body = await request.json();
            } catch {
              return errorResponse('Invalid JSON payload', 400);
            }

            const submittedPasscode = (body.passcode || '').trim();
            const configuredPasscode = (env.ADMIN_PASSCODE || '').trim();

            if (!configuredPasscode || !submittedPasscode || !constantTimeEqual(submittedPasscode, configuredPasscode)) {
              return errorResponse('Invalid administrative passcode.', 401);
            }

            const primaryAdminEmail = env.ADMIN_EMAILS ? env.ADMIN_EMAILS.split(',')[0].trim().toLowerCase() : 'crystalclean457@gmail.com';
            const adminId = 'admin_' + primaryAdminEmail.replace(/[^a-zA-Z0-9]/g, '_');
            const adminName = 'CrystalClean Administrator';

            // Issue session JWT pinned to HS256, 8-hour maximum expiration
            const jti = crypto.randomUUID();
            const secret = (env.JWT_SECRET && env.JWT_SECRET.trim()) ? env.JWT_SECRET.trim() : 'crystalclean-secure-admin-passcode-session-jwt';
            const sessionToken = await createJWT({ sub: adminId, email: primaryAdminEmail, name: adminName, role: 'super_admin', jti }, secret);

            // Record session in D1
            if (env.DB) {
              try {
                const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString();
                await createSession(env.DB, adminId, jti, expiresAt);
              } catch (sessionErr) {
                console.warn('[Session Warning]:', sessionErr);
              }
            }

            const isSecure = env.ENVIRONMENT === 'production' || request.url.startsWith('https://');
            const cookie = `cc_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${isSecure ? '; Secure' : ''}`;

            return jsonResponse({
              success: true,
              user: {
                id: adminId,
                email: primaryAdminEmail,
                name: adminName,
                role: 'super_admin',
              },
              token: sessionToken,
            }, 200, {
              'Set-Cookie': cookie,
            });
          } catch (loginErr: any) {
            console.error('[Admin Passcode Login Error]:', loginErr);
            return jsonResponse({
              success: false,
              error: 'Authentication processing failed: ' + (loginErr?.message || String(loginErr))
            }, 500);
          }
        }

        // GET /api/auth/google (Initiates Google OAuth with secure State cookie; alias: /api/auth/google/url)
        if ((url.pathname === '/api/auth/google' || url.pathname === '/api/auth/google/url') && request.method === 'GET') {
          // D1 Rate limiting: Google login start max 10/min
          if (env.DB) {
            const limit = await checkD1RateLimit(env.DB, `google_auth:${clientIp}`, 10, 60);
            if (!limit.allowed) {
              return errorResponse('Too many login attempts. Please wait before retrying.', 429, {
                'Retry-After': String(limit.retryAfter),
              });
            }
          }

          // Strict configuration check for Google OAuth initiation (fail-closed)
          const missingVars: string[] = [];
          if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_ID.trim()) missingVars.push('GOOGLE_CLIENT_ID');
          if (!env.APP_BASE_URL || !env.APP_BASE_URL.trim()) missingVars.push('APP_BASE_URL');
          if (!env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CLIENT_SECRET.trim()) missingVars.push('GOOGLE_CLIENT_SECRET');
          if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) missingVars.push('JWT_SECRET');
          if (!env.ADMIN_EMAILS || !env.ADMIN_EMAILS.trim()) missingVars.push('ADMIN_EMAILS');

          if (missingVars.length > 0) {
            console.error(`[Google OAuth Configuration Error] Missing required environment variables: ${missingVars.join(', ')}`);
            return errorResponse('Google sign-in is not available.', 500);
          }

          const clientId = env.GOOGLE_CLIENT_ID!.trim();
          const state = crypto.randomUUID();
          // Use canonical redirect URI built strictly from APP_BASE_URL config
          const baseUrl = env.APP_BASE_URL!.trim().replace(/\/+$/, '');
          const redirectUri = `${baseUrl}/api/auth/google/callback`;

          const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          googleAuthUrl.searchParams.set('client_id', clientId);
          googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
          googleAuthUrl.searchParams.set('response_type', 'code');
          googleAuthUrl.searchParams.set('scope', 'openid email profile');
          googleAuthUrl.searchParams.set('state', state);
          googleAuthUrl.searchParams.set('access_type', 'online');
          googleAuthUrl.searchParams.set('prompt', 'select_account');

          const isSecure = env.ENVIRONMENT === 'production' || request.url.startsWith('https://');
          const stateCookie = `cc_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/api/auth/google/callback; Max-Age=300${isSecure ? '; Secure' : ''}`;

          return new Response(null, {
            status: 302,
            headers: {
              Location: googleAuthUrl.toString(),
              'Set-Cookie': stateCookie,
              ...SECURITY_HEADERS,
            },
          });
        }

        // GET /api/auth/google/callback (Google OAuth Callback & Strict Security Verification)
        if (url.pathname === '/api/auth/google/callback' && request.method === 'GET') {
          const isSecure = env.ENVIRONMENT === 'production' || request.url.startsWith('https://');
          const clearStateCookie = `cc_oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth/google/callback; Max-Age=0${isSecure ? '; Secure' : ''}`;

          const missingCallbackVars: string[] = [];
          if (!env.APP_BASE_URL || !env.APP_BASE_URL.trim()) missingCallbackVars.push('APP_BASE_URL');
          if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_ID.trim()) missingCallbackVars.push('GOOGLE_CLIENT_ID');
          if (!env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CLIENT_SECRET.trim()) missingCallbackVars.push('GOOGLE_CLIENT_SECRET');
          if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) missingCallbackVars.push('JWT_SECRET');
          if (!env.ADMIN_EMAILS || !env.ADMIN_EMAILS.trim()) missingCallbackVars.push('ADMIN_EMAILS');

          if (missingCallbackVars.length > 0) {
            console.error(`[Google OAuth Callback Error] Missing required environment variables: ${missingCallbackVars.join(', ')}`);
            const baseUrl = env.APP_BASE_URL ? env.APP_BASE_URL.trim().replace(/\/+$/, '') : '';
            if (baseUrl) {
              return new Response(null, {
                status: 302,
                headers: {
                  Location: `${baseUrl}/admin/login?error=oauth_not_configured`,
                  'Set-Cookie': clearStateCookie,
                  ...SECURITY_HEADERS,
                },
              });
            }
            return errorResponse('Google sign-in is not available.', 500);
          }

          const baseUrl = env.APP_BASE_URL!.trim().replace(/\/+$/, '');
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const returnedState = url.searchParams.get('state') || '';

          // Validate CSRF state parameter against cookie using constant-time comparison
          const cookieHeader = request.headers.get('Cookie') || '';
          const expectedState = cookieHeader.match(/cc_oauth_state=([^;]+)/)?.[1] || '';

          if (!returnedState || !expectedState || !constantTimeEqual(returnedState, expectedState)) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=invalid_oauth_state`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          if (error || !code) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=oauth_denied`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          const clientId = env.GOOGLE_CLIENT_ID!.trim();
          const clientSecret = env.GOOGLE_CLIENT_SECRET!.trim();
          const redirectUri = `${baseUrl}/api/auth/google/callback`;

          // Exchange authorization code for tokens
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
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=token_exchange_failed`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          const tokenData = (await tokenRes.json()) as { access_token: string; id_token?: string };

          // Fetch verified user profile
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (!userInfoRes.ok) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=userinfo_failed`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          const profile = (await userInfoRes.json()) as {
            email: string;
            name?: string;
            sub: string;
            email_verified?: boolean;
            aud?: string;
          };

          // Strict Google OAuth validations:
          // 1. Must be verified email
          // 2. Audience must match clientId
          // 3. Email must be in the server allowlist
          if (profile.email_verified !== true) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=email_not_verified`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          const emailLower = (profile.email || '').trim().toLowerCase();
          if (!isEmailAllowed(emailLower, env)) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: `${baseUrl}/admin/login?error=unauthorized_email&email=${encodeURIComponent(emailLower)}`,
                'Set-Cookie': clearStateCookie,
                ...SECURITY_HEADERS,
              },
            });
          }

          // Find or create admin account in D1
          let admin = await env.DB.prepare('SELECT * FROM administrators WHERE LOWER(email) = ?').bind(emailLower).first<any>();
          if (!admin) {
            const adminId = `admin_g_${Date.now()}`;
            await env.DB.prepare(`
              INSERT INTO administrators (id, email, google_id, role, name)
              VALUES (?, ?, ?, 'admin', ?)
            `).bind(adminId, emailLower, profile.sub, profile.name || 'Google Admin').run();
            admin = await env.DB.prepare('SELECT * FROM administrators WHERE id = ?').bind(adminId).first<any>();
          } else if (!admin.google_id) {
            await env.DB.prepare('UPDATE administrators SET google_id = ?, name = COALESCE(name, ?) WHERE id = ?').bind(profile.sub, profile.name || null, admin.id).run();
          }

          // Issue session JWT pinned to HS256, 8-hour maximum expiration
          const jti = crypto.randomUUID();
          const secret = env.JWT_SECRET!.trim();
          const sessionToken = await createJWT({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role, jti }, secret);

          // Record session in D1
          const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString();
          await createSession(env.DB, admin.id, jti, expiresAt);

          const cookie = `cc_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${isSecure ? '; Secure' : ''}`;

          return new Response(null, {
            status: 302,
            headers: {
              Location: `${baseUrl}/admin?auth_success=1`,
              'Set-Cookie': `${cookie}, ${clearStateCookie}`,
              ...SECURITY_HEADERS,
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

        // POST /api/auth/logout (Revoke session in D1)
        if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
          let token: string | null = null;
          const authHeader = request.headers.get('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
          }
          if (!token) {
            const cookieHeader = request.headers.get('Cookie');
            token = cookieHeader?.match(/cc_admin_session=([^;]+)/)?.[1] || null;
          }

          if (token && env.JWT_SECRET && env.JWT_SECRET.trim()) {
            const secret = env.JWT_SECRET.trim();
            const payload = await verifyJWT(token, secret);
            if (payload?.jti && env.DB) {
              await revokeSession(env.DB, String(payload.jti));
            }
          }

          const isSecure = env.ENVIRONMENT === 'production' || request.url.startsWith('https://');
          const cookie = `cc_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${isSecure ? '; Secure' : ''}`;
          return jsonResponse({ success: true, message: 'Logged out successfully' }, 200, { 'Set-Cookie': cookie });
        }

        // POST /api/admin/sessions/revoke-all (Admin emergency session purge)
        if (url.pathname === '/api/admin/sessions/revoke-all' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          if (!verifyAdminCsrf(request, url, env)) {
            return errorResponse('Cross-origin request rejected', 403);
          }

          await revokeAllSessions(env.DB);
          return jsonResponse({ success: true, message: 'All active sessions have been revoked.' });
        }

        // --- PUBLIC & ADMIN CATEGORIES ---

        // GET /api/categories (Public)
        if (url.pathname === '/api/categories' && request.method === 'GET') {
          const categories = await getCategories(env.DB);
          return jsonResponse({ categories });
        }

        // POST /api/categories (Admin - Auth & CSRF Required)
        if (url.pathname === '/api/categories' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const body = (await request.json()) as any;
          if (!body.name) return errorResponse('Category name is required', 400);

          const created = await createCategory(env.DB, body);
          return jsonResponse({ category: created, success: true }, 201);
        }

        // PUT /api/categories/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/categories/') && request.method === 'PUT') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/categories/', '');
          const body = (await request.json()) as any;
          const updated = await updateCategory(env.DB, id, body);
          return jsonResponse({ category: updated, success: true });
        }

        // DELETE /api/categories/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/categories/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/categories/', '');
          await deleteCategory(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- PUBLIC & ADMIN PRODUCTS ---

        // GET /api/products (Public active only, Admin can view drafts/all)
        if (url.pathname === '/api/products' && request.method === 'GET') {
          const categoryId = url.searchParams.get('category') || undefined;
          const search = url.searchParams.get('q') || undefined;
          const featuredOnly = url.searchParams.get('featured') === '1';
          const wantsDrafts = url.searchParams.get('preview') === 'drafts' || url.searchParams.get('active_only') === '0';

          const admin = await authenticateAdmin(request, env);
          if (wantsDrafts && !admin) {
            return errorResponse('Unauthorized: Administrative session required to preview drafts', 401);
          }

          const activeOnly = !admin || (url.searchParams.get('active_only') === '1');
          const products = await getProducts(env.DB, { categoryId, search, activeOnly, featuredOnly });
          return jsonResponse({ products });
        }

        // GET /api/products/:id (Public active only, Admin can view drafts)
        if (url.pathname.startsWith('/api/products/') && request.method === 'GET') {
          const id = url.pathname.replace('/api/products/', '');
          const admin = await authenticateAdmin(request, env);
          const activeOnly = !admin;

          const product = await getProductById(env.DB, id, activeOnly);
          if (!product) return errorResponse('Product not found', 404);
          return jsonResponse({ product });
        }

        // POST /api/products (Admin - Auth & CSRF Required)
        if (url.pathname === '/api/products' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const body = (await request.json()) as any;
          if (!body.name || !body.category_id || !body.image_url) {
            return errorResponse('Product name, category, and image URL are required', 400);
          }

          const created = await createProduct(env.DB, body);
          return jsonResponse({ product: created, success: true }, 201);
        }

        // PUT /api/products/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/products/') && request.method === 'PUT') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/products/', '');
          const body = (await request.json()) as any;
          const updated = await updateProduct(env.DB, id, body);
          return jsonResponse({ product: updated, success: true });
        }

        // DELETE /api/products/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/products/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/products/', '');
          await deleteProduct(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- CUSTOMER ACCESS CODE SYSTEM ---

        // POST /api/access-codes/verify (Public with D1 Rate Limit max 5/min)
        if (url.pathname === '/api/access-codes/verify' && request.method === 'POST') {
          if (env.DB) {
            const limit = await checkD1RateLimit(env.DB, `access_code:${clientIp}`, 5, 60);
            if (!limit.allowed) {
              return errorResponse('Too many verification attempts. Please wait before retrying.', 429, {
                'Retry-After': String(limit.retryAfter),
              });
            }
          }

          const body = (await request.json()) as { code?: string };
          if (!body.code) return errorResponse('Access code is required', 400);

          const check = await checkAccessCodeQuick(env.DB, body.code);
          if (!check.valid) {
            return jsonResponse({ valid: false, message: 'Invalid or expired access code.' }, 200);
          }
          return jsonResponse({
            valid: true,
            client_name: check.client_name,
            remaining_uses: check.remaining_uses,
          });
        }

        // GET /api/access-codes (Admin - Auth Required)
        if (url.pathname === '/api/access-codes' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const codes = await getAccessCodes(env.DB);
          return jsonResponse({ codes });
        }

        // POST /api/access-codes (Admin - Auth & CSRF Required, shows plaintext code ONCE)
        if (url.pathname === '/api/access-codes' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const body = (await request.json()) as any;
          if (!body.client_name) {
            return errorResponse('Client / Hotel name is required', 400);
          }

          const { access_code, plaintext_code } = await createAccessCode(env.DB, {
            ...body,
            created_by: admin.email,
          });

          return jsonResponse({
            success: true,
            access_code,
            plaintext_code, // Returned only once upon generation
            message: 'Access code created. Please copy the plaintext code now; it will not be displayed again.',
          }, 201);
        }

        // PUT /api/access-codes/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/access-codes/') && request.method === 'PUT') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/access-codes/', '');
          const body = (await request.json()) as any;
          const updated = await updateAccessCode(env.DB, id, body);
          return jsonResponse({ access_code: updated, success: true });
        }

        // DELETE /api/access-codes/:id (Admin - Auth & CSRF Required)
        if (url.pathname.startsWith('/api/access-codes/') && request.method === 'DELETE') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.replace('/api/access-codes/', '');
          await deleteAccessCode(env.DB, id);
          return jsonResponse({ success: true });
        }

        // --- INQUIRIES & TURNSTILE VERIFICATION ---

        // POST /api/inquiries (Public with D1 Rate Limit max 5/min & Turnstile verification)
        if (url.pathname === '/api/inquiries' && request.method === 'POST') {
          if (env.DB) {
            const limit = await checkD1RateLimit(env.DB, `inquiry:${clientIp}`, 5, 60);
            if (!limit.allowed) {
              return errorResponse('Too many inquiry submissions. Please wait before retrying.', 429, {
                'Retry-After': String(limit.retryAfter),
              });
            }
          }

          const body = (await request.json()) as {
            customer_name?: string;
            company_name?: string;
            contact_phone?: string;
            contact_email?: string;
            delivery_city?: string;
            expected_date?: string;
            notes?: string;
            access_code?: string;
            inquiry_type?: 'cart' | 'bulk_quote';
            items?: Array<{ product_id?: string; product_name_snapshot?: string; variant_snapshot?: string; pack_size_snapshot?: string; quantity?: number }>;
            turnstile_token?: string;
          };

          // Validate Turnstile token if secret is configured
          if (env.TURNSTILE_SECRET) {
            if (!body.turnstile_token) {
              return errorResponse('Cloudflare Turnstile verification token is required.', 400);
            }
            const isHuman = await verifyTurnstileToken(body.turnstile_token, env.TURNSTILE_SECRET, clientIp);
            if (!isHuman) {
              return errorResponse('Turnstile verification failed. Please try again.', 400);
            }
          }

          // Field validation & max length bounds
          const customer_name = (body.customer_name || '').trim();
          const company_name = (body.company_name || '').trim();
          const contact_phone = (body.contact_phone || '').trim();
          const contact_email = (body.contact_email || '').trim();
          const delivery_city = (body.delivery_city || '').trim();
          const notes = (body.notes || '').trim();

          if (!customer_name || customer_name.length > 100) return errorResponse('Valid customer name is required (max 100 characters)', 400);
          if (!company_name || company_name.length > 120) return errorResponse('Valid hotel/company name is required (max 120 characters)', 400);
          if (!contact_phone || contact_phone.length > 30) return errorResponse('Valid contact phone is required (max 30 characters)', 400);
          if (contact_email && contact_email.length > 100) return errorResponse('Contact email exceeds 100 characters', 400);
          if (!delivery_city || delivery_city.length > 100) return errorResponse('Delivery city is required (max 100 characters)', 400);
          if (notes.length > 1000) return errorResponse('Notes must not exceed 1000 characters', 400);

          if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return errorResponse('Inquiry must contain at least one item', 400);
          }
          if (body.items.length > 50) {
            return errorResponse('Maximum 50 items allowed per inquiry', 400);
          }

          // Validate items and confirm product existence
          const sanitizedItems = [];
          for (const item of body.items) {
            if (!item.product_name_snapshot || !item.quantity || item.quantity <= 0) {
              return errorResponse('Each item must have a valid name and positive quantity', 400);
            }
            if (item.product_id) {
              const productExists = await getProductById(env.DB, item.product_id);
              if (!productExists) {
                return errorResponse(`Invalid product reference: ${item.product_id}`, 400);
              }
            }
            sanitizedItems.push({
              product_id: item.product_id || undefined,
              product_name_snapshot: item.product_name_snapshot.trim().substring(0, 150),
              variant_snapshot: item.variant_snapshot ? item.variant_snapshot.trim().substring(0, 100) : undefined,
              pack_size_snapshot: item.pack_size_snapshot ? item.pack_size_snapshot.trim().substring(0, 50) : undefined,
              quantity: Math.min(Math.max(1, Math.floor(item.quantity)), 1000000),
            });
          }

          // Validate optional access code
          let accessCodeId: string | undefined = undefined;
          if (body.access_code) {
            const codeRes = await verifyAndConsumeAccessCode(env.DB, body.access_code, clientIp);
            if (!codeRes.valid) {
              return errorResponse(codeRes.error || 'Invalid access code', 400);
            }
            accessCodeId = codeRes.accessCode?.id;
          }

          const createdInquiry = await createInquiry(env.DB, {
            customer_name,
            company_name,
            contact_phone,
            contact_email: contact_email || undefined,
            delivery_city,
            expected_date: body.expected_date,
            notes: notes || undefined,
            access_code_id: accessCodeId,
            inquiry_type: body.inquiry_type || 'cart',
            items: sanitizedItems,
          });

          // Generate prepared WhatsApp deep link
          const whatsappUrl = generateWhatsAppLink(
            {
              reference: createdInquiry.reference,
              customer_name: createdInquiry.customer_name,
              company_name: createdInquiry.company_name,
              contact_phone: createdInquiry.contact_phone,
              delivery_city: createdInquiry.delivery_city,
              items: sanitizedItems.map((i) => ({
                product_name: i.product_name_snapshot,
                variant: i.variant_snapshot || 'Standard',
                quantity: i.quantity,
              })),
            },
            env.BUSINESS_WHATSAPP
          );

          return jsonResponse({
            success: true,
            inquiry: createdInquiry,
            whatsapp_url: whatsappUrl,
          }, 201);
        }

        // GET /api/inquiries (Admin - Auth Required)
        if (url.pathname === '/api/inquiries' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const status = (url.searchParams.get('status') as OrderStatus) || undefined;
          const search = url.searchParams.get('q') || undefined;

          const inquiries = await getInquiries(env.DB, { status, search });
          return jsonResponse({ inquiries });
        }

        // GET /api/inquiries/:id (Admin - Auth Required)
        if (url.pathname.startsWith('/api/inquiries/') && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const id = url.pathname.replace('/api/inquiries/', '');
          const inquiry = await getInquiryById(env.DB, id);
          if (!inquiry) return errorResponse('Inquiry not found', 404);

          const history = await getInquiryHistory(env.DB, id);
          return jsonResponse({ inquiry, history });
        }

        // PATCH /api/inquiries/:id/status (Admin - Auth & CSRF Required)
        if (url.pathname.includes('/status') && request.method === 'PATCH') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.split('/')[3];
          const body = (await request.json()) as { status: OrderStatus; note?: string };
          if (!body.status || !ORDER_STATUSES.includes(body.status)) {
            return errorResponse('Invalid status value', 400);
          }

          const updated = await updateInquiryStatus(env.DB, id, body.status, body.note, admin.email);
          if (!updated) return errorResponse('Inquiry not found', 404);

          return jsonResponse({ success: true });
        }

        // PATCH /api/inquiries/:id/notes (Admin - Auth & CSRF Required)
        if (url.pathname.includes('/notes') && request.method === 'PATCH') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const id = url.pathname.split('/')[3];
          const body = (await request.json()) as { admin_notes: string };
          await updateInquiryAdminNotes(env.DB, id, body.admin_notes || '');
          return jsonResponse({ success: true });
        }

        // GET /api/admin/stats (Admin - Auth Required)
        if (url.pathname === '/api/admin/stats' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          const stats = await getAdminStats(env.DB);
          return jsonResponse({ stats });
        }

        // GET /api/admin/config-check (Admin - Auth Required, returns booleans ONLY, never secrets)
        if (url.pathname === '/api/admin/config-check' && request.method === 'GET') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);

          return jsonResponse({
            success: true,
            config: {
              GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_ID.trim().length > 0,
              GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CLIENT_SECRET.trim().length > 0,
              APP_BASE_URL: !!env.APP_BASE_URL && env.APP_BASE_URL.trim().length > 0,
              JWT_SECRET: !!env.JWT_SECRET && env.JWT_SECRET.trim().length > 0,
              ADMIN_EMAILS: !!env.ADMIN_EMAILS && env.ADMIN_EMAILS.trim().length > 0,
              TURNSTILE_SECRET: !!env.TURNSTILE_SECRET && env.TURNSTILE_SECRET.trim().length > 0,
              DB: !!env.DB,
            },
          });
        }

        // POST /api/upload (Admin - Auth & CSRF Required, Strict Magic Byte Validation)
        if (url.pathname === '/api/upload' && request.method === 'POST') {
          const admin = await authenticateAdmin(request, env);
          if (!admin) return errorResponse('Unauthorized', 401);
          if (!verifyAdminCsrf(request, url, env)) return errorResponse('Cross-origin request rejected', 403);

          const contentType = request.headers.get('content-type') || '';
          if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            if (!file) return errorResponse('No file provided', 400);

            // Cap file size at 5MB
            if (file.size > 5 * 1024 * 1024) {
              return errorResponse('File size exceeds the 5MB maximum limit.', 400);
            }

            const buffer = await file.arrayBuffer();
            // Validate true magic bytes (Do NOT trust file.type or file.name)
            const detected = detectImageMagicNumber(buffer);
            if (!detected) {
              return errorResponse('Invalid file type. Only genuine JPG, PNG, and WebP images are permitted.', 400);
            }

            // Generate cryptographically random filename
            const randomFilename = `${crypto.randomUUID()}.${detected.ext}`;

            // If Cloudflare R2 bucket is bound
            if (env.BUCKET) {
              const fileKey = `products/${randomFilename}`;
              await env.BUCKET.put(fileKey, buffer, {
                httpMetadata: { contentType: detected.mime },
              });
              const publicUrl = `/assets/${fileKey}`;
              return jsonResponse({ url: publicUrl, success: true });
            }

            // Fallback: convert to base64 Data URL for standalone zero-config storage
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            const dataUrl = `data:${detected.mime};base64,${base64}`;
            return jsonResponse({ url: dataUrl, success: true });
          }

          return errorResponse('Expected multipart/form-data', 400);
        }

        return errorResponse('API endpoint not found', 404);
      } catch (err: any) {
        console.error('API Server Error:', err);
        // Generic error response: Never leak SQL errors or stack traces
        return errorResponse('An unexpected internal server error occurred.', 500);
      }
    }

    // Static Assets fallback for Cloudflare Workers with Static Assets
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      const newHeaders = new Headers(assetRes.headers);
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        newHeaders.set(k, v);
      }
      return new Response(assetRes.body, {
        status: assetRes.status,
        statusText: assetRes.statusText,
        headers: newHeaders,
      });
    }

    return new Response('Not Found', { status: 404, headers: SECURITY_HEADERS });
  },
};
