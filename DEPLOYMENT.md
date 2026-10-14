# CrystalClean — Production Deployment & Security Runbook

This runbook covers the exact sequence for deploying, securing, and maintaining **CrystalClean Hotel Amenities** on Cloudflare Workers, Cloudflare D1, and Google OAuth 2.0 SSO.

---

## 1. Architecture & Deployment Identity

- **Runtime**: Cloudflare Workers with Static Assets (`@cloudflare/workers-types`)
- **Worker Project Name**: `cryststalclean`
- **Account ID**: `a6009ab187f587a736ba91e67a27086f`
- **Default Production Hostname**: `https://cryststalclean.crystalclean457-a60.workers.dev` (or your connected custom domain, e.g. `https://crystalclean.in`)
- **Database**: Cloudflare D1 Database `crystalclean-db` (`2acab671-cf07-429f-bb04-dbf3f2ad7ae9`)
- **Authentication**: Google OAuth 2.0 SSO Only (No passwords or self-service password resets)

---

## 2. Environment Variables & Secrets Reference

All secrets are encrypted at rest by Cloudflare. Never commit secrets to Git.

| Variable Name | Type | Scope | How to Set | Description |
| :--- | :---: | :---: | :--- | :--- |
| `APP_BASE_URL` | Public | Worker | `wrangler.toml [vars]` | Canonical site origin without trailing slash (e.g. `https://cryststalclean.crystalclean457-a60.workers.dev` or `https://crystalclean.in`) |
| `GOOGLE_CLIENT_ID` | Public | Worker / Frontend | `wrangler.toml [vars]` | Google OAuth 2.0 Web Application Client ID |
| `BUSINESS_WHATSAPP` | Public | Worker | `wrangler.toml [vars]` | WhatsApp recipient number (e.g. `919149953610`) |
| `ENVIRONMENT` | Public | Worker | `wrangler.toml [vars]` | Runtime environment (`production` or `development`) |
| `VITE_TURNSTILE_SITE_KEY` | Public | Frontend | `.env` / Build env | Cloudflare Turnstile public site key for frontend widget rendering |
| `JWT_SECRET` | **Secret** | Worker | `wrangler secret put JWT_SECRET` | 64+ character random cryptographic key for HMAC-SHA256 session tokens |
| `GOOGLE_CLIENT_SECRET` | **Secret** | Worker | `wrangler secret put GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret |
| `ADMIN_EMAILS` | **Secret** | Worker | `wrangler secret put ADMIN_EMAILS` | Comma-separated allowlist of authorized administrator Google accounts |
| `TURNSTILE_SECRET` | **Secret** | Worker | `wrangler secret put TURNSTILE_SECRET` | Cloudflare Turnstile secret key for server-side token verification |

---

## 3. First-Time Google Login Setup

Follow these steps in strict sequence to configure Google OAuth 2.0 SSO from scratch:

### 1. Apply D1 Migrations
Ensure the remote database schema is up-to-date with administrator tables:
```bash
npx wrangler d1 migrations apply crystalclean-db --remote
```

### 2. Set Public Variables in `wrangler.toml`
Verify that `wrangler.toml` has the public variables under `[vars]`:
- `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Web Client ID.
- `APP_BASE_URL`: The exact canonical public site URL with **no trailing slash** (e.g. `https://cryststalclean.crystalclean457-a60.workers.dev`).

### 3. Provision Cloudflare Secrets
Run `npx wrangler secret put` for each required secret (paste values interactively when prompted; never write them to files):
```bash
# 1. 64+ character random string for signing JWT admin session tokens
npx wrangler secret put JWT_SECRET

# 2. Google OAuth 2.0 Client Secret from Google Cloud Console
npx wrangler secret put GOOGLE_CLIENT_SECRET

# 3. Comma-separated allowlist of admin Gmail addresses (fail-closed if missing)
npx wrangler secret put ADMIN_EMAILS

# 4. Cloudflare Turnstile secret key for anti-bot validation
npx wrangler secret put TURNSTILE_SECRET
```

### 4. Configure Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Select your Web Application OAuth 2.0 Client.
3. Under **Authorized redirect URIs**, add the exact callback URL:
   ```text
   https://cryststalclean.crystalclean457-a60.workers.dev/api/auth/google/callback
   ```
   *(If using a custom domain, add `https://crystalclean.in/api/auth/google/callback`)*
4. Navigate to **OAuth consent screen** -> **Test users**.
5. Add your admin Gmail address (e.g. `crystalclean457@gmail.com`) as an authorized test user.
6. Under **Credentials**, disable any retired/compromised client secrets.

### 5. Build and Deploy
Build the production assets and deploy the worker:
```bash
npm run build
npx wrangler deploy
```

### 6. Test Sign-In
1. Navigate to `https://cryststalclean.crystalclean457-a60.workers.dev/admin/login` (or `/admin`).
2. Click **Continue with Google**.
3. Authenticate with your authorized admin Google account.
4. Verify you are redirected to the admin dashboard (`/admin/dashboard`).
5. After logging in, verify worker configuration booleans at `GET /api/admin/config-check`:
   ```bash
   curl -b "cc_admin_session=<YOUR_SESSION_COOKIE>" https://cryststalclean.crystalclean457-a60.workers.dev/api/admin/config-check
   ```
   All required keys should return `true`.

---

## 4. OAuth Troubleshooting Guide

| Error Message / Symptom | Likely Cause | Exact Fix |
| :--- | :--- | :--- |
| `{"error":"Google sign-in is not available."}` / `"Google OAuth is not configured on this server."` | One or more required environment variables (`GOOGLE_CLIENT_ID`, `APP_BASE_URL`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, or `ADMIN_EMAILS`) are missing from Cloudflare. | 1. Check Cloudflare Worker Logs (Workers & Pages -> cryststalclean -> Logs) for the `[Google OAuth Error] Missing required environment variables: ...` log line.<br>2. Verify `[vars]` in `wrangler.toml` has `GOOGLE_CLIENT_ID` and `APP_BASE_URL`.<br>3. Run `npx wrangler secret put` for any missing secret.<br>4. Re-deploy with `npx wrangler deploy`. |
| `redirect_uri_mismatch` (Google 400 error page) | The redirect URI sent by the worker does not match the URIs registered in Google Cloud Console. | In Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs, add the exact URI: `https://cryststalclean.crystalclean457-a60.workers.dev/api/auth/google/callback` (or your custom domain equivalent). Ensure `APP_BASE_URL` in `wrangler.toml` has no trailing slash. |
| `Access blocked: CrystalClean has not completed the Google verification process` / `Error 403: access_denied` | OAuth consent screen is in "Testing" publishing status and the signing-in Google account is not added as a test user. | Go to Google Cloud Console -> APIs & Services -> OAuth consent screen -> **Audience / Test users**. Click **Add Users** and add your Gmail address. Click Save. |
| `401 Unauthorized` / `Access denied: email not authorized` (redirects back to `/admin/login?error=unauthorized_email`) | Google authentication succeeded, but the email address is not in the `ADMIN_EMAILS` allowlist or `email_verified` is false. | Run `npx wrangler secret put ADMIN_EMAILS` and supply a comma-separated list that includes your exact lowercase Google email address (e.g. `crystalclean457@gmail.com`). |

---

## 5. Production Maintenance & Runbook Commands

Follow these steps in strict numerical order:

### Step 1: Set Public Configuration & Sensitive Secrets

1. Verify `wrangler.toml` contains your active `APP_BASE_URL` and `GOOGLE_CLIENT_ID` under `[vars]`.
2. Provision production secrets into Cloudflare:
   ```bash
   # 1. JWT Secret (64+ characters)
   npx wrangler secret put JWT_SECRET

   # 2. Rotated Google OAuth Client Secret
   npx wrangler secret put GOOGLE_CLIENT_SECRET

   # 3. Comma-separated admin Gmail allowlist (fail-closed if missing)
   npx wrangler secret put ADMIN_EMAILS

   # 4. Cloudflare Turnstile Secret Key
   npx wrangler secret put TURNSTILE_SECRET
   ```

### Step 2: Apply D1 Database Migrations

Apply safe, idempotent migrations to your remote D1 database:
```bash
npx wrangler d1 migrations apply crystalclean-db --remote
```

### Step 3: Verify Database & Clean Sessions

Before going live, verify the database schema and purge stale sessions or legacy password hashes:

```bash
# 1. Check administrators table without exposing hashes:
npx wrangler d1 execute crystalclean-db --remote --command="SELECT id, email, role, name, (password_hash IS NOT NULL) AS has_password, updated_at FROM administrators;"

# 2. List sessions table without exposing tokens:
npx wrangler d1 execute crystalclean-db --remote --command="SELECT token_id, admin_id, expires_at, revoked, created_at FROM sessions;"

# 3. Purge all existing sessions (forces fresh Google SSO login):
npx wrangler d1 execute crystalclean-db --remote --command="DELETE FROM sessions; UPDATE administrators SET password_hash = NULL, salt = NULL WHERE password_hash IS NOT NULL OR salt IS NOT NULL;"
```

### Step 4: Configure Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Select your OAuth 2.0 Client ID.
3. Under **Authorized redirect URIs**, add your exact production callback URL:
   ```text
   https://cryststalclean.crystalclean457-a60.workers.dev/api/auth/google/callback
   ```
   *(If using a custom domain like `https://crystalclean.in`, add `https://crystalclean.in/api/auth/google/callback`)*
4. Under **OAuth consent screen** -> **Test users**, ensure each authorized admin email is added.
5. If rotating credentials, create a new secret under **Credentials**, run `npx wrangler secret put GOOGLE_CLIENT_SECRET`, then disable the retired secret.

### Step 5: Build and Deploy

```bash
# 1. Build client bundle and run TypeScript typecheck
npm run build

# 2. Deploy Cloudflare Worker and Static Assets
npx wrangler deploy
```

### Step 6: Execute Live Smoke Test

Run the automated live smoke test script to verify all security controls in production:
```powershell
.\scripts\smoke-test.ps1 -SiteUrl "https://cryststalclean.crystalclean457-a60.workers.dev"
```

Verify that all checks output `[ PASS ]`:
- Admin routes return 401 without session
- Mutating routes reject cross-origin requests
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are present
- Draft products are protected from public viewing
- Rate limiting triggers HTTP 429 with Retry-After header
- Sensitive configuration files (`/.env`, `/wrangler.toml`) are blocked
- `robots.txt` disallows `/admin` and `/api`

---

## 4. Rollback Plan

If unexpected regressions occur after a deployment:

### Worker Rollback
To instantly roll back to the previously active Cloudflare Worker version without rebuilding:
```bash
# List recent deployment versions
npx wrangler deployments list

# Roll back to the previous deployment ID
npx wrangler rollback [DEPLOYMENT_ID]
```

### Database Backup & Restore
Before performing major database updates or schema adjustments:
```bash
# Export remote database to local backup file:
npx wrangler d1 export crystalclean-db --remote --output=./backup_$(date +%Y%m%d).sql

# Restore remote database from backup:
# npx wrangler d1 execute crystalclean-db --remote --file=./backup_YYYYMMDD.sql
```
