// WebCrypto Security and Authentication Utilities for Cloudflare Workers (Google-Only Auth)
import { Env, AdminUser } from './types';

// Constant-time string comparison to prevent timing attacks
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Compute SHA-256 hash formatted as hex string
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// HMAC-SHA256 JWT Implementation (No external NPM package needed)
function base64UrlEncode(str: string): string {
  const b64 = btoa(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  return atob(b64);
}

// Create 8-hour Max JWT Token pinned to HS256
export async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // Maximum 8 hours expiration
  }));

  const data = `${encodedHeader}.${encodedPayload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const encodedSig = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${encodedSig}`;
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSig] = parts;

    // Pin algorithm strictly to HS256
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null;
    }

    const data = `${encodedHeader}.${encodedPayload}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature
    const sigStr = base64UrlDecode(encodedSig);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    // WebCrypto crypto.subtle.verify executes constant-time comparison
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Check admin allowlist from environment variables (Fail-closed: strictly requires non-empty ADMIN_EMAILS)
export function isEmailAllowed(email: string, env: Env): boolean {
  if (!email || !env.ADMIN_EMAILS) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;
  
  const allowedEmails = env.ADMIN_EMAILS
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) {
    return false; // Deny by default if ADMIN_EMAILS is empty or contains only whitespace/commas
  }

  return allowedEmails.includes(cleanEmail);
}

// Extract current authenticated admin user from request
export async function authenticateAdmin(request: Request, env: Env): Promise<AdminUser | null> {
  if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) {
    return null;
  }
  const secret = env.JWT_SECRET.trim();
  
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check Cookie header fallback
  if (!token) {
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/cc_admin_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) return null;

  const payload = await verifyJWT(token, secret);
  if (!payload || !payload.email) return null;

  const email = String(payload.email);
  if (!isEmailAllowed(email, env)) {
    return null;
  }

  // Check if session exists and is active in database (strict server-side revocation)
  if (payload.jti && env.DB) {
    try {
      const session = await env.DB
        .prepare('SELECT revoked, expires_at FROM sessions WHERE token_id = ?')
        .bind(payload.jti)
        .first<{ revoked: number; expires_at: string }>();

      if (!session) {
        return null; // Session record was purged or does not exist
      }
      if (session.revoked === 1) {
        return null; // Session has been revoked (e.g. via logout or emergency revoke)
      }
      if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
        return null; // Session expired
      }
    } catch {
      return null; // Fail closed if session check encounters error
    }
  }

  return {
    id: String(payload.sub || payload.id || ''),
    email,
    name: String(payload.name || 'Administrator'),
    role: 'admin'
  };
}
