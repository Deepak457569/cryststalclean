# CrystalClean — Cloudflare Deployment & Administration Guide

This guide covers complete local development, Cloudflare D1 database setup, Google OAuth 2.0 configuration, custom domain attachment, and production deployment for **CrystalClean Hotel Amenities**.

---

## 1. Prerequisites

- **Node.js**: v18+ (v22 LTS recommended)
- **Cloudflare Account**: [dash.cloudflare.com](https://dash.cloudflare.com)
- **Google Cloud Console Account**: For Google OAuth 2.0 Client ID & Secret
- **Wrangler CLI**: Included in project devDependencies (`npx wrangler`)

---

## 2. Local Development

CrystalClean includes a self-contained local development environment with an embedded mock API server that mirrors Cloudflare Workers and D1.

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173`:
- **Public Website**: Browse amenities, filter by category, configure quantity units.
- **Requirements Cart**: Test cart persistence, access code verification, and prepared WhatsApp handoff to `+91 91499 53610`.
- **Admin Panel**: Visit `http://localhost:5173/admin/login` (Google SSO Authentication via configured `ADMIN_EMAILS`)

Run acceptance test suite:
```bash
npm test
```

---

## 3. Cloudflare D1 Database Setup

### Step 3.1: Log in to Cloudflare CLI
```bash
npx wrangler login
```

### Step 3.2: Create the D1 Database
```bash
npx wrangler d1 create crystalclean-db
```

Wrangler will output configuration details containing your `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "crystalclean-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` and paste it into your `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "crystalclean-db"
database_id = "YOUR_D1_DATABASE_UUID_HERE"
```

### Step 3.3: Run Database Migrations on Cloudflare D1
Execute the initial schema and luxury amenities catalog seed data:
```bash
# 1. Create tables
npx wrangler d1 execute crystalclean-db --remote --file=./migrations/0001_initial_schema.sql

# 2. Seed luxury product catalog & demo access codes
npx wrangler d1 execute crystalclean-db --remote --file=./migrations/0002_seed_data.sql
```

---

## 4. Google OAuth 2.0 Configuration

To enable **"Continue with Google"** on `/admin/login`:

### Step 4.1: Create OAuth Credentials in Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID**.
3. Application Type: **Web application**.
4. Name: `CrystalClean Admin Portal`.
5. **Authorized JavaScript origins**:
   - Local: `http://localhost:5173`
   - Production: `https://your-custom-domain.com` (e.g., `https://crystalclean.in`)
6. **Authorized redirect URIs**:
   - Local: `http://localhost:5173/api/auth/google/callback`
   - Production: `https://your-custom-domain.com/api/auth/google/callback`
7. Click **Create** and note your **Client ID** and **Client Secret**.

### Step 4.2: Admin Allowlist Security Policy
A Google account does **NOT** automatically grant admin access. The server validates that the Google-verified email address exists in the configured allowlist.

In `wrangler.toml`:
```toml
[vars]
ADMIN_ALLOWLIST = "your-email@yourdomain.com,owner@crystalclean.in"
INITIAL_ADMIN_EMAIL = "your-email@yourdomain.com"
```

---

## 5. Cloudflare Secret Management

Store sensitive credentials securely using Wrangler secrets (never commit them to Git):

```bash
# 1. JWT signing secret for admin sessions
npx wrangler secret put JWT_SECRET
# Enter a random 32+ character string

# 2. Google OAuth Client ID
npx wrangler secret put GOOGLE_CLIENT_ID
# Enter your Google client ID

# 3. Google OAuth Client Secret
npx wrangler secret put GOOGLE_CLIENT_SECRET
# Enter your Google client secret

# 4. (Optional) Initial admin password
npx wrangler secret put INITIAL_ADMIN_PASSWORD
# Enter strong password for email/password login
```

---

## 6. Production Build & Deployment

Build the frontend static bundle and deploy the unified Cloudflare Worker:

```bash
# Build production bundle
npm run build

# Deploy to Cloudflare Workers with Static Assets
npm run deploy
```

Wrangler will output your live Workers URL (e.g., `https://crystalclean.<your-subdomain>.workers.dev`).

---

## 7. Connecting Your Custom Domain

1. Go to **Cloudflare Dashboard** -> Select your domain zone.
2. In the left navigation, go to **Workers & Pages** -> Click **crystalclean**.
3. Go to the **Settings** tab -> **Domains & Routes**.
4. Click **Add** -> Select **Custom Domain**.
5. Enter your domain (e.g., `crystalclean.in` or `www.crystalclean.in`).
6. Cloudflare automatically issues an SSL certificate and routes all traffic to the Worker.

Verify HTTPS:
- Visit `https://your-custom-domain.com`
- Check that the SSL lock is active.

---

## 8. Database Backups & Recovery

Cloudflare D1 provides automated snapshotting and manual export:

```bash
# Create a manual export of your production database
npx wrangler d1 export crystalclean-db --remote --output=./backup_$(date +%Y%m%d).sql

# Restoring from backup if ever needed:
# npx wrangler d1 execute crystalclean-db --remote --file=./backup_YYYYMMDD.sql
```

---

## 9. Customer Access Code Management

- Access codes are managed through the secure admin portal at `/admin`.
- Codes can be generated randomly or created manually for specific hotels (e.g. `CC-OBER-2026`).
- Set custom inquiry limits (e.g. 50 inquiries) and expiry dates.
- Codes can be revoked or reactivated with one click without code changes.
