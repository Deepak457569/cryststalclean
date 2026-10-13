// WebCrypto Security and Authentication Utilities for Cloudflare Workers
import { Env, AdminUser } from './types';

// Password hashing using WebCrypto PBKDF2 with SHA-256
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const hash = await pbkdf2(password, salt);
  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computedHash = await pbkdf2(password, salt);
  return computedHash === hash;
}

async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );

  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
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

export async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
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

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Check admin allowlist
export function isEmailAllowed(email: string, env: Env): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const allowlistStr = env.ADMIN_ALLOWLIST || env.INITIAL_ADMIN_EMAIL || '';
  const allowedEmails = allowlistStr
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  // If no allowlist is configured, fallback to initial admin email
  if (allowedEmails.length === 0 && env.INITIAL_ADMIN_EMAIL) {
    return cleanEmail === env.INITIAL_ADMIN_EMAIL.trim().toLowerCase();
  }

  return allowedEmails.includes(cleanEmail);
}

// Extract current authenticated admin user from request
export async function authenticateAdmin(request: Request, env: Env): Promise<AdminUser | null> {
  const secret = env.JWT_SECRET || 'crystalclean-jwt-secret-default-key';
  
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

  // Check if session has been revoked in database
  if (payload.jti && env.DB) {
    try {
      const session = await env.DB.prepare('SELECT revoked, expires_at FROM sessions WHERE token_id = ?').bind(payload.jti).first<{ revoked: number; expires_at: string }>();
      if (session) {
        if (session.revoked === 1) return null;
        if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) return null;
      }
    } catch {
      // Fallback if table is not yet initialized
    }
  }

  return {
    id: String(payload.sub || payload.id || ''),
    email,
    name: String(payload.name || 'Administrator'),
    role: 'admin'
  };
}
