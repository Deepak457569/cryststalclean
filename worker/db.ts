// Cloudflare D1 Database Access Layer
import { Env, Category, Product, AccessCode, Inquiry, InquiryItem, OrderStatus, ORDER_STATUSES } from './types';
import { hashPassword } from './auth';

// Helper to generate unique inquiry references: CC-ORD-YYYYMMDD-XXXX
export function generateInquiryReference(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-ORD-${year}${month}${day}-${randomChars}`;
}

// Generate random secure access code
export function generateRandomAccessCode(prefix = 'CC'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Omits confusing chars 0/O, 1/I
  let code = '';
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 8; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  return `${prefix}-${code.substring(0, 4)}-${code.substring(4)}`;
}

// Ensure database tables exist (automatic bootstrap for seamless dev)
export async function bootstrapDatabase(db: D1Database, env: Env): Promise<void> {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS administrators (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        salt TEXT,
        role TEXT DEFAULT 'admin',
        google_id TEXT,
        name TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        gallery_json TEXT DEFAULT '[]',
        variants_json TEXT DEFAULT '[]',
        pack_size TEXT,
        specs_json TEXT DEFAULT '{}',
        is_featured INTEGER DEFAULT 0,
        is_customizable INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS access_codes (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        code_hash TEXT,
        client_name TEXT NOT NULL,
        contact_name TEXT,
        contact_phone TEXT,
        max_uses INTEGER DEFAULT 50,
        used_count INTEGER DEFAULT 0,
        expires_at TEXT,
        status TEXT DEFAULT 'active',
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        reference TEXT UNIQUE NOT NULL,
        inquiry_type TEXT DEFAULT 'cart',
        customer_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT,
        delivery_city TEXT NOT NULL,
        expected_date TEXT,
        notes TEXT,
        access_code_id TEXT,
        status TEXT DEFAULT 'New Inquiry',
        admin_notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inquiry_items (
        id TEXT PRIMARY KEY,
        inquiry_id TEXT NOT NULL,
        product_id TEXT,
        product_name_snapshot TEXT NOT NULL,
        variant_snapshot TEXT,
        pack_size_snapshot TEXT,
        quantity INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS access_code_logs (
        id TEXT PRIMARY KEY,
        access_code_id TEXT NOT NULL,
        inquiry_id TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        used_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inquiry_status_history (
        id TEXT PRIMARY KEY,
        inquiry_id TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT NOT NULL,
        note TEXT,
        changed_by TEXT,
        changed_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS business_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        token_hash TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        revoked INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Ensure Initial Admin accounts exist
    const emailsToSeed = Array.from(new Set([
      (env.INITIAL_ADMIN_EMAIL || 'crystalclean457@gmail.com').toLowerCase().trim(),
      'crystalclean457@gmail.com',
      'admin@crystalclean.in'
    ])).filter(Boolean);

    for (const adminEmail of emailsToSeed) {
      const adminCheck = await db.prepare('SELECT id FROM administrators WHERE LOWER(email) = ?').bind(adminEmail).first();
      if (!adminCheck) {
        const defaultPassword = env.INITIAL_ADMIN_PASSWORD || 'CrystalCleanAdmin2026!';
        const { hash, salt } = await hashPassword(defaultPassword);
        const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.prepare(`
          INSERT INTO administrators (id, email, password_hash, salt, role, name)
          VALUES (?, ?, ?, ?, 'admin', 'CrystalClean Administrator')
        `).bind(adminId, adminEmail, hash, salt).run();
      }
    }
  } catch (err) {
    console.error('Bootstrap error:', err);
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

export async function getProductById(db: D1Database, id: string): Promise<Product | null> {
  const result = await db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? OR p.slug = ?
  `).bind(id, id).first<Product>();
  return result;
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

// --- Access Codes ---
export async function getAccessCodes(db: D1Database): Promise<AccessCode[]> {
  const result = await db.prepare('SELECT * FROM access_codes ORDER BY created_at DESC').all<AccessCode>();
  return result.results || [];
}

export async function createAccessCode(db: D1Database, data: Partial<AccessCode>): Promise<AccessCode> {
  const id = `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const code = (data.code || generateRandomAccessCode()).toUpperCase().trim();

  await db.prepare(`
    INSERT INTO access_codes (
      id, code, client_name, contact_name, contact_phone, max_uses, used_count, expires_at, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    code,
    data.client_name,
    data.contact_name || null,
    data.contact_phone || null,
    data.max_uses || 50,
    0,
    data.expires_at || null,
    data.status || 'active',
    data.created_by || null
  ).run();

  const created = await db.prepare('SELECT * FROM access_codes WHERE id = ?').bind(id).first<AccessCode>();
  return created!;
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

// --- Sessions & Token Management ---
export async function createSession(db: D1Database, adminId: string, tokenId: string, expiresAt: string): Promise<void> {
  await db.prepare(`
    INSERT INTO sessions (token_id, admin_id, expires_at, revoked, created_at)
    VALUES (?, ?, ?, 0, datetime('now'))
  `).bind(tokenId, adminId, expiresAt).run();
}

export async function revokeSession(db: D1Database, tokenId: string): Promise<void> {
  await db.prepare('UPDATE sessions SET revoked = 1 WHERE token_id = ?').bind(tokenId).run();
}

export async function isSessionActive(db: D1Database, tokenId: string): Promise<boolean> {
  const session = await db.prepare('SELECT revoked, expires_at FROM sessions WHERE token_id = ?').bind(tokenId).first<{ revoked: number; expires_at: string }>();
  if (!session) return true;
  if (session.revoked === 1) return false;
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) return false;
  return true;
}

export async function createPasswordResetToken(db: D1Database, adminId: string): Promise<string> {
  const token = `rst_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}`;
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour validity
  await db.prepare(`
    INSERT INTO password_reset_tokens (token, admin_id, expires_at, used, created_at)
    VALUES (?, ?, ?, 0, datetime('now'))
  `).bind(token, adminId, expiresAt).run();
  return token;
}

export async function verifyAndUsePasswordResetToken(
  db: D1Database,
  token: string,
  newPasswordHash: string,
  newSalt: string
): Promise<{ success: boolean; error?: string }> {
  const record = await db.prepare(`
    SELECT * FROM password_reset_tokens WHERE token = ?
  `).bind(token).first<{ token: string; admin_id: string; expires_at: string; used: number }>();

  if (!record || record.used === 1) {
    return { success: false, error: 'Password reset token is invalid or has already been used.' };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: 'Password reset token has expired.' };
  }

  // Update administrator password
  await db.prepare(`
    UPDATE administrators SET password_hash = ?, salt = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(newPasswordHash, newSalt, record.admin_id).run();

  // Mark token used
  await db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').bind(token).run();

  // Invalidate all existing active sessions for this admin
  await db.prepare('UPDATE sessions SET revoked = 1 WHERE admin_id = ?').bind(record.admin_id).run();

  return { success: true };
}

// Atomically check and verify access code for customer inquiry submission
export async function verifyAndConsumeAccessCode(
  db: D1Database,
  rawCode: string,
  ipHash?: string
): Promise<{ valid: boolean; accessCode?: AccessCode; error?: string }> {
  const cleanCode = rawCode.trim().toUpperCase();

  // 1. Single atomic conditional UPDATE preventing race conditions
  const updateRes = await db.prepare(`
    UPDATE access_codes
    SET used_count = used_count + 1,
        status = CASE WHEN used_count + 1 >= max_uses THEN 'exhausted' ELSE status END,
        updated_at = datetime('now')
    WHERE code = ?
      AND status = 'active'
      AND used_count < max_uses
      AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
  `).bind(cleanCode).run();

  const changes = updateRes.meta?.changes ?? (updateRes as any).changes ?? 0;

  if (changes > 0) {
    const updated = await db.prepare('SELECT * FROM access_codes WHERE code = ?').bind(cleanCode).first<AccessCode>();
    return { valid: true, accessCode: updated! };
  }

  // If changes === 0, fetch record to identify specific rejection reason
  const record = await db.prepare('SELECT * FROM access_codes WHERE code = ?').bind(cleanCode).first<AccessCode>();
  if (!record) {
    return { valid: false, error: 'Invalid access code. Please request an authorized access code from CrystalClean.' };
  }
  if (record.status === 'revoked') {
    return { valid: false, error: 'This access code has been revoked. Please contact CrystalClean support.' };
  }
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    await db.prepare('UPDATE access_codes SET status = "expired" WHERE id = ?').bind(record.id).run();
    return { valid: false, error: 'This access code has expired. Please contact CrystalClean to renew.' };
  }
  if (record.used_count >= record.max_uses || record.status === 'exhausted') {
    await db.prepare('UPDATE access_codes SET status = "exhausted" WHERE id = ?').bind(record.id).run();
    return { valid: false, error: 'Inquiry limit reached for this access code. Please request an extension.' };
  }
  return { valid: false, error: 'Access code is not currently active.' };
}

// Quick check without consuming (for frontend validation indicator)
export async function checkAccessCodeQuick(db: D1Database, rawCode: string): Promise<{ valid: boolean; client_name?: string; remaining_uses?: number; error?: string }> {
  const cleanCode = rawCode.trim().toUpperCase();
  const record = await db.prepare('SELECT * FROM access_codes WHERE code = ?').bind(cleanCode).first<AccessCode>();

  if (!record) {
    return { valid: false, error: 'Access code not found' };
  }
  if (record.status === 'revoked') {
    return { valid: false, error: 'Access code is revoked' };
  }
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Access code has expired' };
  }
  if (record.used_count >= record.max_uses) {
    return { valid: false, error: 'Inquiry limit reached' };
  }

  return {
    valid: true,
    client_name: record.client_name,
    remaining_uses: Math.max(0, record.max_uses - record.used_count)
  };
}

// --- Inquiries ---
export async function createInquiry(
  db: D1Database,
  data: {
    inquiry_type: 'cart' | 'bulk_quote';
    customer_name: string;
    company_name: string;
    contact_phone: string;
    contact_email?: string;
    delivery_city: string;
    expected_date?: string;
    notes?: string;
    access_code_id?: string;
  },
  items: Array<{
    product_id?: string;
    product_name: string;
    variant?: string;
    pack_size?: string;
    quantity: number;
  }>,
  ipHash?: string
): Promise<Inquiry> {
  // Prevent duplicate submissions within 60 seconds
  const existing = await db.prepare(`
    SELECT id FROM inquiries
    WHERE customer_name = ? AND company_name = ? AND delivery_city = ? AND access_code_id = ?
      AND datetime(created_at) > datetime('now', '-60 seconds')
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(
    data.customer_name,
    data.company_name,
    data.delivery_city,
    data.access_code_id || null
  ).first<{ id: string }>();

  if (existing) {
    const existingInquiry = await getInquiryById(db, existing.id);
    if (existingInquiry) return existingInquiry;
  }

  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const reference = generateInquiryReference();

  await db.prepare(`
    INSERT INTO inquiries (
      id, reference, inquiry_type, customer_name, company_name,
      contact_phone, contact_email, delivery_city, expected_date, notes,
      access_code_id, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New Inquiry', datetime('now'), datetime('now'))
  `).bind(
    id,
    reference,
    data.inquiry_type,
    data.customer_name,
    data.company_name,
    data.contact_phone,
    data.contact_email || null,
    data.delivery_city,
    data.expected_date || null,
    data.notes || null,
    data.access_code_id || null
  ).run();

  // Insert items snapshots (Strictly NO pricing fields)
  for (const item of items) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO inquiry_items (
        id, inquiry_id, product_id, product_name_snapshot, variant_snapshot, pack_size_snapshot, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      itemId,
      id,
      item.product_id || null,
      item.product_name,
      item.variant || null,
      item.pack_size || null,
      Math.max(1, Number(item.quantity) || 1)
    ).run();
  }

  // Insert status history
  const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.prepare(`
    INSERT INTO inquiry_status_history (
      id, inquiry_id, from_status, to_status, note, changed_by, changed_at
    ) VALUES (?, ?, NULL, 'New Inquiry', 'Inquiry created via website submission', 'Customer', datetime('now'))
  `).bind(historyId, id).run();

  // Log access code usage
  if (data.access_code_id) {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO access_code_logs (id, access_code_id, inquiry_id, ip_hash, used_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(logId, data.access_code_id, id, ipHash || null).run();
  }

  const created = await getInquiryById(db, id);
  return created!;
}

export async function getInquiries(
  db: D1Database,
  options: { status?: string; search?: string; limit?: number; offset?: number } = {}
): Promise<Inquiry[]> {
  let query = `
    SELECT i.*, a.code as access_code_value,
           (SELECT COUNT(*) FROM inquiry_items WHERE inquiry_id = i.id) as item_count
    FROM inquiries i
    LEFT JOIN access_codes a ON i.access_code_id = a.id
    WHERE 1=1
  `;
  const bindings: unknown[] = [];

  if (options.status) {
    query += ' AND i.status = ?';
    bindings.push(options.status);
  }

  if (options.search) {
    query += ' AND (i.reference LIKE ? OR i.customer_name LIKE ? OR i.company_name LIKE ? OR i.contact_phone LIKE ?)';
    const term = `%${options.search}%`;
    bindings.push(term, term, term, term);
  }

  query += ' ORDER BY i.created_at DESC';

  if (options.limit) {
    query += ' LIMIT ?';
    bindings.push(options.limit);
    if (options.offset) {
      query += ' OFFSET ?';
      bindings.push(options.offset);
    }
  }

  const stmt = db.prepare(query);
  const result = await (bindings.length > 0 ? stmt.bind(...bindings).all<Inquiry>() : stmt.all<Inquiry>());
  return result.results || [];
}

export async function getInquiryById(db: D1Database, id: string): Promise<Inquiry | null> {
  const inquiry = await db.prepare(`
    SELECT i.*, a.code as access_code_value
    FROM inquiries i
    LEFT JOIN access_codes a ON i.access_code_id = a.id
    WHERE i.id = ? OR i.reference = ?
  `).bind(id, id).first<Inquiry>();

  if (!inquiry) return null;

  const items = await db.prepare(`
    SELECT * FROM inquiry_items WHERE inquiry_id = ?
  `).bind(inquiry.id).all<InquiryItem>();

  inquiry.items = items.results || [];
  return inquiry;
}

export async function updateInquiryStatus(
  db: D1Database,
  id: string,
  newStatus: OrderStatus,
  adminEmail: string,
  note?: string
): Promise<boolean> {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const existing = await db.prepare('SELECT status FROM inquiries WHERE id = ?').bind(id).first<{ status: string }>();
  if (!existing) return false;

  await db.prepare(`
    UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(newStatus, id).run();

  const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.prepare(`
    INSERT INTO inquiry_status_history (
      id, inquiry_id, from_status, to_status, note, changed_by, changed_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(historyId, id, existing.status, newStatus, note || null, adminEmail).run();

  return true;
}

export async function updateInquiryAdminNotes(db: D1Database, id: string, adminNotes: string): Promise<boolean> {
  await db.prepare(`UPDATE inquiries SET admin_notes = ?, updated_at = datetime('now') WHERE id = ?`).bind(adminNotes, id).run();
  return true;
}

export async function getInquiryHistory(db: D1Database, inquiryId: string) {
  const res = await db.prepare('SELECT * FROM inquiry_status_history WHERE inquiry_id = ? ORDER BY changed_at DESC').bind(inquiryId).all();
  return res.results || [];
}

// --- Admin Stats ---
export async function getAdminStats(db: D1Database) {
  const statusCountsRes = await db.prepare(`
    SELECT status, COUNT(*) as count FROM inquiries GROUP BY status
  `).all<{ status: string; count: number }>();

  const statusMap: Record<string, number> = {};
  ORDER_STATUSES.forEach(st => {
    statusMap[st] = 0;
  });

  let totalInquiries = 0;
  (statusCountsRes.results || []).forEach(row => {
    statusMap[row.status] = row.count;
    totalInquiries += row.count;
  });

  const productsCountRes = await db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').first<{ count: number }>();
  const accessCodesCountRes = await db.prepare('SELECT COUNT(*) as count FROM access_codes WHERE status = "active"').first<{ count: number }>();

  return {
    totalInquiries,
    statusCounts: statusMap,
    activeProductsCount: productsCountRes?.count || 0,
    activeCodesCount: accessCodesCountRes?.count || 0
  };
}
