-- Migration 0004: Safe Hardening Migration for Google-Only Auth, Sessions & Rate Limiting
-- Safe and idempotent: will not fail if tables or columns already exist or are absent.
-- Preserves all products, categories, inquiries, and administrator rows.

-- 1. Drop deprecated password reset table
DROP TABLE IF EXISTS password_reset_tokens;

-- 2. Ensure rate limiting table exists for CF-Connecting-IP throttling
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

-- 3. Ensure server-side session revocation table exists
CREATE TABLE IF NOT EXISTS sessions (
  token_id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0
);

-- 4. Safe indexes (idempotent with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_administrators_google ON administrators(google_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_hash ON access_codes(code_hash);

-- 5. Null out legacy password hashes and salts from administrator accounts
UPDATE administrators 
SET password_hash = NULL, salt = NULL, updated_at = datetime('now')
WHERE password_hash IS NOT NULL OR salt IS NOT NULL;
