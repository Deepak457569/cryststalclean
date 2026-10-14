-- Migration 0004: Drop Password Auth Tables & Create D1 Rate Limiting Table
-- Safe, idempotent migration for Google-Only Auth and hardened security

DROP TABLE IF EXISTS password_reset_tokens;

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_administrators_google ON administrators(google_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_hash ON access_codes(code_hash);
