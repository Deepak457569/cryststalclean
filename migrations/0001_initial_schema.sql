-- CrystalClean Cloudflare D1 Initial Migration Schema
-- Safe, idempotent, structured for D1 SQLite

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
  category_id TEXT NOT NULL REFERENCES categories(id),
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
  inquiry_type TEXT DEFAULT 'cart', -- 'cart' or 'bulk_quote'
  customer_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  delivery_city TEXT NOT NULL,
  expected_date TEXT,
  notes TEXT,
  access_code_id TEXT REFERENCES access_codes(id),
  status TEXT DEFAULT 'New Inquiry',
  admin_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiry_items (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name_snapshot TEXT NOT NULL,
  variant_snapshot TEXT,
  pack_size_snapshot TEXT,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS access_code_logs (
  id TEXT PRIMARY KEY,
  access_code_id TEXT NOT NULL REFERENCES access_codes(id),
  inquiry_id TEXT REFERENCES inquiries(id),
  ip_hash TEXT,
  user_agent TEXT,
  used_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiry_status_history (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
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
  admin_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  token_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON inquiries(reference);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_items_inquiry ON inquiry_items(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_id);
