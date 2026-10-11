# CrystalClean — Hotel Amenities & Hospitality Supply

Production-ready B2B hotel amenities supply web application built for Google Antigravity, Cloudflare deployment, and direct WhatsApp ordering.

---

## 🌟 Business Overview

CrystalClean supplies high-grade hotel amenities, botanical toiletries, biodegradable dental accessories, and room essentials to hotels, resorts, guest houses, and bulk buyers across India.

- **Business WhatsApp Hotline**: `+91 91499 53610`
- **Zero Public Pricing**: By design, no product prices, discounts, taxes, or currency totals are displayed on the website. Commercial quotations with volume discount tiers are tailored directly for clients upon verified access code submission.
- **Customer Access Code System**: Public visitors can freely explore the catalog and configure requirements. A verified Customer Access Code is required to submit an inquiry or bulk quote, mitigating spam and safeguarding wholesale trade privacy.
- **WhatsApp Ordering Handoff**: Every requirement submission is safely persisted in the Cloudflare D1 database with a unique reference number (`CC-ORD-YYYYMMDD-XXXX`) before redirecting to WhatsApp with a pre-encoded message (with NO prices).

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Cloudflare Workers with TypeScript (serving `/api/*` and static assets).
- **Database**: Cloudflare D1 (SQLite distributed database with schema migrations).
- **Authentication**:
  - Email & Password with WebCrypto PBKDF2 (100,000 iterations) & HMAC-SHA256 JWT sessions.
  - "Continue with Google" OAuth 2.0 / OpenID Connect with strict server-side Admin Allowlist verification.
- **Deployment**: Cloudflare Workers with Static Assets (`assets = { directory = "./dist" }`).
- **SEO & Compliance**: Robots.txt, XML Sitemap, Open Graph, Web Accessibility (ARIA & semantic HTML).

---

## 🚀 Quickstart (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

- **Demo Customer Access Codes**: `CC-HOTEL-2026` or `CRYSTAL-VIP`
- **Admin Portal**: `http://localhost:5173/admin/login`
  - Email: `admin@crystalclean.in`
  - Password: `CrystalCleanAdmin2026!`

---

## 🧪 Automated Acceptance Tests

To verify business logic, no-pricing compliance, access code consumption, and allowlist rules:

```bash
npm test
```

---

## 📁 Project Structure

```
├── dist/                      # Production build output
├── migrations/                # Cloudflare D1 SQL migrations
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── public/                    # Favicon, SVG logos, robots.txt, sitemap.xml
│   ├── favicon.svg
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── common/            # AccessCodeModal, WhatsAppButton
│   │   └── layout/            # Navbar, Footer
│   ├── context/               # CartContext, AuthContext
│   ├── pages/                 # Home, Products, Categories, ProductDetail,
│   │   │                      # Cart, BulkQuote, Confirmation, About, Contact,
│   │   │                      # Privacy, Terms, NotFound
│   │   └── admin/             # AdminLoginPage, AdminDashboardPage
│   ├── types/                 # Application TypeScript interfaces
│   ├── App.tsx                # Main router & layout wrapper
│   └── index.css              # Tailwind & luxury design tokens
├── tests/                     # Node.js acceptance test suite
│   └── acceptance.test.mjs
├── worker/                    # Cloudflare Worker backend
│   ├── auth.ts                # PBKDF2 hashing, JWT, Google OAuth, Allowlist
│   ├── db.ts                  # D1 queries, atomic access codes, order workflow
│   ├── index.ts               # Worker API router & static asset fallback
│   ├── types.ts               # Worker environment & database types
│   └── whatsapp.ts            # WhatsApp click-to-chat URL generator (no prices)
├── DEPLOYMENT.md              # Complete Cloudflare & Google OAuth deployment guide
├── wrangler.toml              # Cloudflare Workers & D1 configuration
└── vite.config.ts             # Vite bundler & self-contained dev API middleware
```

---

## 🛡️ Order Status Lifecycle Workflow

The admin dashboard supports a 10-stage lifecycle workflow with audit timestamps and admin notes:
1. `New Inquiry`
2. `Contacted`
3. `Quotation Shared`
4. `Awaiting Customer Confirmation`
5. `Confirmed`
6. `Preparing Order`
7. `Ready to Ship`
8. `Shipped`
9. `Delivered`
10. `Cancelled`

---

## 📌 Assumptions

1. **Logo Spellings**: The uploaded logo file at `public/logo.png` spells the brand "CRYSTSTAL CLEAN". As instructed, all public site headings, metadata, page titles, and schema code use the correct spelling **CrystalClean**. The logo is isolated to `public/logo.png` so replacing this single file updates the mark site-wide.
2. **Product Draft Status**: All 26 seeded products from Section 4A are stored as `DRAFT` (`is_active = 0`). They remain completely hidden from the public website, XML sitemaps, and search engines until the business owner reviews and clicks "Publish" in the Admin Dashboard.
3. **No-Pricing Policy**: Public pages, carts, WhatsApp handoffs, and notifications omit all prices, currency signs, taxes, or discounts. Commercial quotations are negotiated one-on-one via WhatsApp or phone.
4. **Access Code Protection**: Customer access codes enforce rate limits, expiration dates, and atomic usage caps for web submissions. A note on the site clarifies that customers may still message the WhatsApp hotline directly.
5. **Image Upload Pipeline**: Supports direct upload to Cloudflare R2 (`/api/upload`) with fallback to image URLs or locally served assets in `public/`.
6. **Custom Logo Availability**: Enabled by default on Non-Woven Carry Bags, Printed Paper Coasters, and Hygienic Paper-Wrapped Glasses. Kept off by default on mini toiletries pending confirmation from the owner.

---

## 🖼️ How to Replace Placeholder Images via Admin Dashboard

1. Log in to the Admin Dashboard at `/admin/login`.
2. Navigate to the **Products** tab.
3. Locate the draft product you want to update (e.g., *Non-Woven Carry Bag*, *Disposable Terry Slippers*, or *Embossed Tissue Roll*).
4. Click the **Edit** (pencil) icon.
5. Under **Image URL**, either:
   - Click **Choose File** under **Or Upload Image to Cloudflare R2** to upload your photograph directly from your computer, OR
   - Paste the direct HTTPS URL of your uploaded image.
6. Click **Save Product**.
7. Click the **Preview** (eye) icon to verify how the product card appears on the neutral off-white background.
8. When satisfied, click **Publish** to make the product live on the public website.

---

## 📖 Deployment Documentation

For step-by-step instructions on deploying to Cloudflare Workers, configuring Cloudflare D1, setting up Google OAuth, and connecting your custom domain, refer to [DEPLOYMENT.md](file:///c:/Users/harsh/OneDrive/Desktop/cryststalclean/DEPLOYMENT.md).

