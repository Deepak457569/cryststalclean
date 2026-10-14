// Cloudflare D1 Database Access Layer
import { Category, Product, AccessCode, Inquiry, InquiryItem, OrderStatus, ORDER_STATUSES } from './types';
import { sha256Hex, constantTimeEqual } from './auth';

// Helper to generate unique inquiry references: CC-ORD-YYYYMMDD-XXXX
export function generateInquiryReference(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-ORD-${year}${month}${day}-${randomChars}`;
}

// Generate secure unguessable access code (minimum 16 uppercase base32 chars)
export function generateSecureAccessCode(prefix = 'CC'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Base32 excluding ambiguous chars 0, 1, 8, O, I, B
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  
  let codeStr = '';
  for (let i = 0; i < 16; i++) {
    codeStr += chars[randomBytes[i] % chars.length];
  }
  
  // Format: CC-XXXX-XXXX-XXXX-XXXX
  return `${prefix}-${codeStr.substring(0, 4)}-${codeStr.substring(4, 8)}-${codeStr.substring(8, 12)}-${codeStr.substring(12, 16)}`;
}

// TODO: In addition to this D1-backed rate limiter, Cloudflare dashboard WAF / Rate Limiting rules should be enabled in production.
export async function checkD1RateLimit(
  db: D1Database,
  key: string,
  maxRequests: number,
  windowSeconds = 60
): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000);
  const currentWindow = now - (now % windowSeconds);

  try {
    const existing = await db
      .prepare('SELECT window_start, count FROM rate_limits WHERE key = ?')
      .bind(key)
      .first<{ window_start: number; count: number }>();

    if (existing && existing.window_start === currentWindow) {
      if (existing.count >= maxRequests) {
        const retryAfter = windowSeconds - (now % windowSeconds);
        return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : 60 };
      }
      await db
        .prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?')
        .bind(key)
        .run();
      return { allowed: true, retryAfter: 0 };
    }

    // New window or new key
    await db
      .prepare(`
        INSERT INTO rate_limits (key, window_start, count)
        VALUES (?, ?, 1)
        ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1
      `)
      .bind(key, currentWindow)
      .run();

    return { allowed: true, retryAfter: 0 };
  } catch (err) {
    console.error('Rate limit query warning:', err);
    return { allowed: true, retryAfter: 0 };
  }
}

// --- Categories ---
export async function getCategories(db: D1Database): Promise<Category[]> {
  const result = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all<Category>();
  return result.results || [];
}

export async function createCategory(db: D1Database, data: Partial<Category>): Promise<Category> {
  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = data.slug || data.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  await db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.name,
    slug,
    data.description || null,
    data.image_url || null,
    data.sort_order || 0,
    data.is_active !== undefined ? data.is_active : 1
  ).run();

  const created = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<Category>();
  return created!;
}

export async function updateCategory(db: D1Database, id: string, data: Partial<Category>): Promise<Category | null> {
  await db.prepare(`
    UPDATE categories SET
      name = COALESCE(?, name),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      image_url = COALESCE(?, image_url),
      sort_order = COALESCE(?, sort_order),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).bind(
    data.name !== undefined ? data.name : null,
    data.slug !== undefined ? data.slug : null,
    data.description !== undefined ? data.description : null,
    data.image_url !== undefined ? data.image_url : null,
    data.sort_order !== undefined ? data.sort_order : null,
    data.is_active !== undefined ? data.is_active : null,
    id
  ).run();

  return await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<Category>();
}

export async function deleteCategory(db: D1Database, id: string): Promise<boolean> {
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return true;
}

// --- Products ---
export async function getProducts(
  db: D1Database,
  options: { categoryId?: string; search?: string; activeOnly?: boolean; featuredOnly?: boolean } = {}
): Promise<Product[]> {
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (options.activeOnly) {
    query += ' AND p.is_active = 1';
  }

  if (options.featuredOnly) {
    query += ' AND p.is_featured = 1';
  }

  if (options.categoryId) {
    query += ' AND (p.category_id = ? OR c.slug = ?)';
    bindings.push(options.categoryId, options.categoryId);
  }

  if (options.search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const term = `%${options.search}%`;
    bindings.push(term, term);
  }

  query += ' ORDER BY p.is_featured DESC, p.created_at DESC';

  const stmt = db.prepare(query);
  const result = await (bindings.length > 0 ? stmt.bind(...bindings).all<Product>() : stmt.all<Product>());
  return result.results || [];
}

export async function getProductById(db: D1Database, id: string, activeOnly = false): Promise<Product | null> {
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p.id = ? OR p.slug = ?)
  `;
  if (activeOnly) {
    query += ' AND p.is_active = 1';
  }
  const result = await db.prepare(query).bind(id, id).first<Product>();
  return result || null;
}

export async function createProduct(db: D1Database, data: Partial<Product>): Promise<Product> {
  const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = data.slug || data.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  await db.prepare(`
    INSERT INTO products (
      id, name, slug, description, category_id, image_url,
      gallery_json, variants_json, pack_size, specs_json, is_featured, is_customizable, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.name,
    slug,
    data.description || '',
    data.category_id,
    data.image_url,
    data.gallery_json || '[]',
    data.variants_json || '[]',
    data.pack_size || null,
    data.specs_json || '{}',
    data.is_featured ? 1 : 0,
    data.is_customizable ? 1 : 0,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : 0
  ).run();

  return (await getProductById(db, id))!;
}

export async function updateProduct(db: D1Database, id: string, data: Partial<Product>): Promise<Product | null> {
  await db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      category_id = COALESCE(?, category_id),
      image_url = COALESCE(?, image_url),
      gallery_json = COALESCE(?, gallery_json),
      variants_json = COALESCE(?, variants_json),
      pack_size = COALESCE(?, pack_size),
      specs_json = COALESCE(?, specs_json),
      is_featured = COALESCE(?, is_featured),
      is_customizable = COALESCE(?, is_customizable),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    data.name !== undefined ? data.name : null,
    data.slug !== undefined ? data.slug : null,
    data.description !== undefined ? data.description : null,
    data.category_id !== undefined ? data.category_id : null,
    data.image_url !== undefined ? data.image_url : null,
    data.gallery_json !== undefined ? data.gallery_json : null,
    data.variants_json !== undefined ? data.variants_json : null,
    data.pack_size !== undefined ? data.pack_size : null,
    data.specs_json !== undefined ? data.specs_json : null,
    data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : null,
    data.is_customizable !== undefined ? (data.is_customizable ? 1 : 0) : null,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
    id
  ).run();

  return await getProductById(db, id);
}

export async function deleteProduct(db: D1Database, id: string): Promise<boolean> {
  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return true;
}

// --- Access Codes (Hardened with SHA-256 Hashes) ---
export async function getAccessCodes(db: D1Database): Promise<AccessCode[]> {
  const result = await db.prepare('SELECT id, client_name, contact_name, contact_phone, max_uses, used_count, expires_at, status, created_by, created_at, updated_at FROM access_codes ORDER BY created_at DESC').all<AccessCode>();
  return result.results || [];
}

export async function createAccessCode(
  db: D1Database,
  data: Partial<AccessCode>
): Promise<{ access_code: AccessCode; plaintext_code: string }> {
  const id = `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const plaintextCode = generateSecureAccessCode();
  const codeHash = await sha256Hex(plaintextCode);
  const maskedDisplay = `${plaintextCode.substring(0, 7)}****-****`;

  await db.prepare(`
    INSERT INTO access_codes (
      id, code, code_hash, client_name, contact_name, contact_phone, max_uses, used_count, expires_at, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).bind(
    id,
    maskedDisplay,
    codeHash,
    data.client_name,
    data.contact_name || null,
    data.contact_phone || null,
    data.max_uses || 50,
    data.expires_at || null,
    data.status || 'active',
    data.created_by || null
  ).run();

  const created = await db.prepare('SELECT * FROM access_codes WHERE id = ?').bind(id).first<AccessCode>();
  return {
    access_code: created!,
    plaintext_code: plaintextCode
  };
}

export async function updateAccessCode(db: D1Database, id: string, data: Partial<AccessCode>): Promise<AccessCode | null> {
  await db.prepare(`
    UPDATE access_codes SET
      client_name = COALESCE(?, client_name),
      contact_name = COALESCE(?, contact_name),
      contact_phone = COALESCE(?, contact_phone),
      max_uses = COALESCE(?, max_uses),
      expires_at = COALESCE(?, expires_at),
      status = COALESCE(?, status),
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    data.client_name !== undefined ? data.client_name : null,
    data.contact_name !== undefined ? data.contact_name : null,
    data.contact_phone !== undefined ? data.contact_phone : null,
    data.max_uses !== undefined ? data.max_uses : null,
    data.expires_at !== undefined ? data.expires_at : null,
    data.status !== undefined ? data.status : null,
    id
  ).run();

  return await db.prepare('SELECT * FROM access_codes WHERE id = ?').bind(id).first<AccessCode>();
}

export async function deleteAccessCode(db: D1Database, id: string): Promise<boolean> {
  await db.prepare('DELETE FROM access_codes WHERE id = ?').bind(id).run();
  return true;
}

// Atomically check access code for quick UI feedback
export async function checkAccessCodeQuick(
  db: D1Database,
  rawCode: string
): Promise<{ valid: boolean; client_name?: string; remaining_uses?: number; error?: string }> {
  const cleanCode = rawCode.trim().toUpperCase();
  const inputHash = await sha256Hex(cleanCode);

  // Search by code_hash or plain code (legacy support)
  const code = await db.prepare(`
    SELECT * FROM access_codes WHERE code_hash = ? OR code = ?
  `).bind(inputHash, cleanCode).first<AccessCode>();

  if (!code) {
    return { valid: false, error: 'Invalid or expired access code.' };
  }

  // Constant-time check verification
  if (code.code_hash && !constantTimeEqual(code.code_hash, inputHash)) {
    return { valid: false, error: 'Invalid or expired access code.' };
  }

  if (code.status !== 'active') {
    return { valid: false, error: 'Invalid or expired access code.' };
  }

  if (code.expires_at && new Date(code.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Invalid or expired access code.' };
  }

  if (code.used_count >= code.max_uses) {
    return { valid: false, error: 'Invalid or expired access code.' };
  }

  return {
    valid: true,
    client_name: code.client_name,
    remaining_uses: code.max_uses - code.used_count
  };
}

// Atomically check and verify access code for customer inquiry submission
export async function verifyAndConsumeAccessCode(
  db: D1Database,
  rawCode: string,
  ipHash?: string
): Promise<{ valid: boolean; accessCode?: AccessCode; error?: string }> {
  const cleanCode = rawCode.trim().toUpperCase();
  const inputHash = await sha256Hex(cleanCode);

  // 1. Single atomic conditional UPDATE preventing race conditions
  const updateRes = await db.prepare(`
    UPDATE access_codes
    SET used_count = used_count + 1,
        status = CASE WHEN used_count + 1 >= max_uses THEN 'exhausted' ELSE status END,
        updated_at = datetime('now')
    WHERE (code_hash = ? OR code = ?)
      AND status = 'active'
      AND used_count < max_uses
      AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
  `).bind(inputHash, cleanCode).run();

  const changes = updateRes.meta?.changes ?? (updateRes as any).changes ?? 0;

  if (changes > 0) {
    const updated = await db.prepare('SELECT * FROM access_codes WHERE code_hash = ? OR code = ?').bind(inputHash, cleanCode).first<AccessCode>();
    return { valid: true, accessCode: updated! };
  }

  return { valid: false, error: 'Invalid or expired access code.' };
}

// --- Sessions & Token Management ---
export async function createSession(db: D1Database, adminId: string, tokenId: string, expiresAt: string): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO sessions (token_id, admin_id, expires_at, revoked, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `).bind(tokenId, adminId, expiresAt).run();
  } catch {
    // If sessions table does not exist yet on remote D1, create it automatically and retry
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
          token_id TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL,
          token_hash TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          expires_at TEXT NOT NULL,
          revoked INTEGER DEFAULT 0
        )
      `).run();
      await db.prepare(`
        INSERT INTO sessions (token_id, admin_id, expires_at, revoked, created_at)
        VALUES (?, ?, ?, 0, datetime('now'))
      `).bind(tokenId, adminId, expiresAt).run();
    } catch (err) {
      console.warn('[Session Store Warning] Session persistence bypassed:', err);
    }
  }
}

export async function revokeSession(db: D1Database, tokenId: string): Promise<void> {
  await db.prepare('UPDATE sessions SET revoked = 1 WHERE token_id = ?').bind(tokenId).run();
}

export async function revokeAllSessions(db: D1Database): Promise<void> {
  await db.prepare('UPDATE sessions SET revoked = 1').run();
}

export async function isSessionActive(db: D1Database, tokenId: string): Promise<boolean> {
  const session = await db.prepare('SELECT revoked, expires_at FROM sessions WHERE token_id = ?').bind(tokenId).first<{ revoked: number; expires_at: string }>();
  if (!session) return true;
  if (session.revoked === 1) return false;
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) return false;
  return true;
}

// --- Inquiries ---
export async function createInquiry(
  db: D1Database,
  inquiryData: {
    customer_name: string;
    company_name: string;
    contact_phone: string;
    contact_email?: string;
    delivery_city: string;
    expected_date?: string;
    notes?: string;
    access_code_id?: string;
    inquiry_type?: 'cart' | 'bulk_quote';
    items: Array<{
      product_id?: string;
      product_name_snapshot: string;
      variant_snapshot?: string;
      pack_size_snapshot?: string;
      quantity: number;
    }>;
  }
): Promise<Inquiry> {
  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const reference = generateInquiryReference();

  await db.prepare(`
    INSERT INTO inquiries (
      id, reference, inquiry_type, customer_name, company_name,
      contact_phone, contact_email, delivery_city, expected_date,
      notes, access_code_id, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New Inquiry', datetime('now'), datetime('now'))
  `).bind(
    id,
    reference,
    inquiryData.inquiry_type || 'cart',
    inquiryData.customer_name,
    inquiryData.company_name,
    inquiryData.contact_phone,
    inquiryData.contact_email || null,
    inquiryData.delivery_city,
    inquiryData.expected_date || null,
    inquiryData.notes || null,
    inquiryData.access_code_id || null
  ).run();

  // Insert items
  if (inquiryData.items && inquiryData.items.length > 0) {
    const itemStatements = inquiryData.items.map((item) => {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return db.prepare(`
        INSERT INTO inquiry_items (
          id, inquiry_id, product_id, product_name_snapshot,
          variant_snapshot, pack_size_snapshot, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        itemId,
        id,
        item.product_id || null,
        item.product_name_snapshot,
        item.variant_snapshot || null,
        item.pack_size_snapshot || null,
        item.quantity
      );
    });

    await db.batch(itemStatements);
  }

  // Initial status history log
  const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.prepare(`
    INSERT INTO inquiry_status_history (id, inquiry_id, from_status, to_status, note, changed_by, changed_at)
    VALUES (?, ?, NULL, 'New Inquiry', 'Inquiry created via website submission', 'customer', datetime('now'))
  `).bind(historyId, id).run();

  return (await getInquiryById(db, id))!;
}

export async function getInquiries(
  db: D1Database,
  options: { status?: OrderStatus; search?: string } = {}
): Promise<Inquiry[]> {
  let query = `
    SELECT i.*, ac.code as access_code_value
    FROM inquiries i
    LEFT JOIN access_codes ac ON i.access_code_id = ac.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (options.status) {
    query += ' AND i.status = ?';
    bindings.push(options.status);
  }

  if (options.search) {
    query += ' AND (i.customer_name LIKE ? OR i.company_name LIKE ? OR i.reference LIKE ? OR i.delivery_city LIKE ?)';
    const term = `%${options.search}%`;
    bindings.push(term, term, term, term);
  }

  query += ' ORDER BY i.created_at DESC';

  const stmt = db.prepare(query);
  const result = await (bindings.length > 0 ? stmt.bind(...bindings).all<Inquiry>() : stmt.all<Inquiry>());
  const inquiries = result.results || [];

  for (const inq of inquiries) {
    const itemsRes = await db.prepare('SELECT * FROM inquiry_items WHERE inquiry_id = ?').bind(inq.id).all<InquiryItem>();
    inq.items = itemsRes.results || [];
  }

  return inquiries;
}

export async function getInquiryById(db: D1Database, id: string): Promise<Inquiry | null> {
  const inquiry = await db.prepare(`
    SELECT i.*, ac.code as access_code_value
    FROM inquiries i
    LEFT JOIN access_codes ac ON i.access_code_id = ac.id
    WHERE i.id = ? OR i.reference = ?
  `).bind(id, id).first<Inquiry>();

  if (!inquiry) return null;

  const itemsRes = await db.prepare('SELECT * FROM inquiry_items WHERE inquiry_id = ?').bind(inquiry.id).all<InquiryItem>();
  inquiry.items = itemsRes.results || [];

  return inquiry;
}

export async function updateInquiryStatus(
  db: D1Database,
  id: string,
  newStatus: OrderStatus,
  note?: string,
  changedBy = 'admin'
): Promise<boolean> {
  const current = await db.prepare('SELECT status FROM inquiries WHERE id = ?').bind(id).first<{ status: OrderStatus }>();
  if (!current) return false;

  await db.prepare(`
    UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(newStatus, id).run();

  const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.prepare(`
    INSERT INTO inquiry_status_history (id, inquiry_id, from_status, to_status, note, changed_by, changed_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(historyId, id, current.status, newStatus, note || null, changedBy).run();

  return true;
}

export async function updateInquiryAdminNotes(db: D1Database, id: string, adminNotes: string): Promise<boolean> {
  await db.prepare(`
    UPDATE inquiries SET admin_notes = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(adminNotes, id).run();
  return true;
}

export async function getInquiryHistory(db: D1Database, inquiryId: string) {
  const result = await db.prepare('SELECT * FROM inquiry_status_history WHERE inquiry_id = ? ORDER BY changed_at ASC').bind(inquiryId).all();
  return result.results || [];
}

// --- Admin Stats ---
export async function getAdminStats(db: D1Database) {
  const totalInquiries = (await db.prepare('SELECT COUNT(*) as c FROM inquiries').first<{ c: number }>())?.c || 0;
  const newInquiries = (await db.prepare("SELECT COUNT(*) as c FROM inquiries WHERE status = 'New Inquiry'").first<{ c: number }>())?.c || 0;
  const totalProducts = (await db.prepare('SELECT COUNT(*) as c FROM products').first<{ c: number }>())?.c || 0;
  const activeProducts = (await db.prepare('SELECT COUNT(*) as c FROM products WHERE is_active = 1').first<{ c: number }>())?.c || 0;
  const activeCodes = (await db.prepare("SELECT COUNT(*) as c FROM access_codes WHERE status = 'active'").first<{ c: number }>())?.c || 0;

  return {
    totalInquiries,
    newInquiries,
    totalProducts,
    activeProducts,
    activeCodes
  };
}
