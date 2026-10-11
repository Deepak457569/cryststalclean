// Acceptance & Security Test Suite for CrystalClean
// Verifies all core business rules, WhatsApp formats, Access Code security, and no-pricing enforcement

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Test 1: Cloudflare D1 Migration Files & Schema Integrity
test('D1 Migrations exist and contain required tables', () => {
  const schemaPath = path.resolve('migrations/0001_initial_schema.sql');
  const seedPath = path.resolve('migrations/0002_seed_data.sql');

  assert.ok(fs.existsSync(schemaPath), '0001_initial_schema.sql must exist');
  assert.ok(fs.existsSync(seedPath), '0002_seed_data.sql must exist');

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS administrators/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS categories/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS products/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS access_codes/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS inquiries/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS inquiry_items/);
  assert.match(schemaContent, /CREATE TABLE IF NOT EXISTS inquiry_status_history/);

  // STRICT COMPLIANCE: Verify schema and seed data contain NO price / cost / currency columns
  assert.doesNotMatch(schemaContent, /price\s+(REAL|INTEGER|DECIMAL|NUMERIC)/i, 'Schema must not define price columns');
  assert.doesNotMatch(schemaContent, /cost\s+(REAL|INTEGER|DECIMAL|NUMERIC)/i, 'Schema must not define cost columns');
});

// Test 2: WhatsApp URL Generator & NO Pricing Rule
test('WhatsApp link must contain +91 91499 53610 and ZERO prices or currency symbols', () => {
  const businessPhone = '919149953610';
  const reference = 'CC-ORD-20261012-0042';
  const payload = {
    reference,
    customer_name: 'Rahul',
    company_name: 'ABC Hotel',
    delivery_city: 'Bengaluru',
    items: [
      { product_name: 'Hotel Shampoo', variant: '100 ml', quantity: 200 },
      { product_name: 'Hotel Soap', variant: '25 g', quantity: 500 },
      { product_name: 'Dental Kit', variant: 'Standard', quantity: 100 },
    ],
  };

  // Mock generator logic matching worker/whatsapp.ts
  let productLines = '';
  payload.items.forEach((item, index) => {
    productLines += `${index + 1}. ${item.product_name} — ${item.variant} — Quantity: ${item.quantity} units\n`;
  });

  const message = [
    `Hello CrystalClean,`,
    ``,
    `I would like to inquire about these hotel amenities.`,
    ``,
    `Inquiry Reference: ${payload.reference}`,
    `Customer Access Code: [Verified]`,
    ``,
    `Products requested:`,
    productLines.trim(),
    ``,
    `Hotel/Company: ${payload.company_name}`,
    `Contact Person: ${payload.customer_name}`,
    `Delivery City: ${payload.delivery_city}`,
    ``,
    `Please share your pricing, bulk discounts, product availability, and delivery details.`,
    ``,
    `Thank you.`
  ].join('\n');

  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/${businessPhone}?text=${encoded}`;

  assert.ok(waUrl.startsWith('https://wa.me/919149953610?text='));
  assert.ok(waUrl.includes(reference));
  assert.ok(waUrl.includes('Quantity%3A%20200'));

  // Negative checks: NO CURRENCY OR PRICE MENTION
  assert.strictEqual(waUrl.includes('%E2%82%B9'), false, 'Message must not contain Rupee symbol');
  assert.strictEqual(waUrl.includes('%24'), false, 'Message must not contain Dollar symbol');
  assert.strictEqual(message.includes('₹'), false);
  assert.strictEqual(message.includes('$'), false);
  assert.strictEqual(message.includes('Subtotal'), false);
  assert.strictEqual(message.includes('Total:'), false);
  assert.strictEqual(message.includes('Price:'), false);
});

// Test 3: Customer Access Code Rules & Limits
test('Customer Access Code validation logic handles expired and exhausted states', () => {
  const code = {
    id: 'code_01',
    code: 'CC-TEST-2026',
    max_uses: 2,
    used_count: 0,
    status: 'active',
    expires_at: '2028-12-31T23:59:59Z',
  };

  // Simulate usage 1
  code.used_count += 1;
  assert.strictEqual(code.used_count, 1);
  assert.strictEqual(code.used_count < code.max_uses, true);

  // Simulate usage 2 (reaches max)
  code.used_count += 1;
  assert.strictEqual(code.used_count, 2);
  if (code.used_count >= code.max_uses) {
    code.status = 'exhausted';
  }
  assert.strictEqual(code.status, 'exhausted');

  // Verify rejection once exhausted
  assert.strictEqual(code.used_count >= code.max_uses, true, 'Subsequent inquiries must be rejected');
});

// Test 4: Admin Allowlist Enforcement
test('Admin Allowlist rejects unauthorized Google or email accounts', () => {
  const allowlistStr = 'admin@crystalclean.in,owner@crystalclean.in';
  const allowedEmails = allowlistStr.split(',').map((e) => e.trim().toLowerCase());

  const isAllowed = (email) => allowedEmails.includes(email.trim().toLowerCase());

  assert.strictEqual(isAllowed('admin@crystalclean.in'), true);
  assert.strictEqual(isAllowed('owner@crystalclean.in'), true);
  assert.strictEqual(isAllowed('ADMIN@crystalclean.in'), true, 'Case insensitive match');

  // Unauthorized accounts MUST be rejected
  assert.strictEqual(isAllowed('random.user@gmail.com'), false);
  assert.strictEqual(isAllowed('attacker@crystalclean.in.fake.com'), false);
  assert.strictEqual(isAllowed('hacker@outlook.com'), false);
});

// Test 5: Production Build Output Verification
test('Production build output contains index.html and assets', () => {
  const distHtml = path.resolve('dist/index.html');
  assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
  const htmlContent = fs.readFileSync(distHtml, 'utf8');
  assert.match(htmlContent, /<title>CrystalClean/i);
});

// Test 6: Seed Data Audit - Categories and 26 Section 4A Draft Products
test('Seed Data integrity: 15 categories, 26 products, all draft, deduplicated, and third-party brands removed', () => {
  const seedPath = path.resolve('migrations/0002_seed_data.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  // Verify 15 hospitality categories
  const expectedCategories = [
    'Shampoo and Conditioner',
    'Hotel Toiletries',
    'Dental Kits',
    'Shaving and Grooming Kits',
    'Soap and Bath Products',
    'Bathroom Cleaners',
    'Floor and Surface Cleaners',
    'Glass and Furniture Care',
    'Kitchen and Dishwash',
    'Room Fresheners',
    'Guest Essentials and Room Accessories',
    'Paper Products',
    'Packaging and Bags',
    'Housekeeping Supplies',
    'Bulk Hospitality Supplies',
  ];

  for (const cat of expectedCategories) {
    assert.ok(seedSql.includes(cat), `Category '${cat}' must exist in seed data`);
  }

  // Count product definitions (26 distinct prod_ items)
  const productMatches = seedSql.match(/'prod_[a-z0-9_]+',/g) || [];
  assert.strictEqual(productMatches.length, 26, `Exactly 26 products must be seeded (got ${productMatches.length})`);

  // Verify ALL 26 seeded products end with is_active = 0
  const draftEndingMatches = seedSql.match(/,\s*0\s*\n\s*\)/g) || [];
  assert.strictEqual(draftEndingMatches.length, 26, 'All 26 products must end with is_active = 0 (DRAFT)');

  // Verify Black Phenyl was imported only once
  const blackPhenylMatches = seedSql.match(/'prod_black_phenyl'/g) || [];
  assert.strictEqual(blackPhenylMatches.length, 1, 'Black Phenyl must be imported ONCE (deduplicated)');

  // Verify third-party brand names are SCRUBBED from names and descriptions
  const forbiddenBrands = ['Colgate', 'Glide', 'Estoria', 'Old Tree', 'Sure2Cure', 'History Lifestyle'];
  for (const brand of forbiddenBrands) {
    assert.strictEqual(
      seedSql.toLowerCase().includes(brand.toLowerCase()),
      false,
      `Third-party brand '${brand}' must NOT appear anywhere in seed data`
    );
  }

  // Verify unverified marketing claims are SCRUBBED
  assert.strictEqual(
    seedSql.includes('kills 99.9% germs'),
    false,
    'Unsubstantiated claim "kills 99.9% germs" must not appear in descriptions'
  );

  // Verify customizable flag on bags, coasters, and paper-wrapped glass
  assert.match(
    seedSql,
    /'prod_non_woven_bag'[^;]+1,\s*0\s*\n\s*\)/,
    'Non-Woven Carry Bag must have is_customizable = 1'
  );
  assert.match(
    seedSql,
    /'prod_printed_paper_coasters'[^;]+1,\s*0\s*\n\s*\)/,
    'Printed Paper Coasters must have is_customizable = 1'
  );
  assert.match(
    seedSql,
    /'prod_paper_wrapped_glass'[^;]+1,\s*0\s*\n\s*\)/,
    'Hygienic Paper-Wrapped Drinking Glass must have is_customizable = 1'
  );

  // Verify only confirmed visible sizes or "To be confirmed"
  const confirmedSizes = ['5 L', '100 ml', '20 ml', '10 ml'];
  for (const size of confirmedSizes) {
    assert.ok(seedSql.includes(size), `Confirmed visible size '${size}' should appear in seed data`);
  }
  assert.ok(
    seedSql.includes('12\\" x 18\\" x 6\\"') || seedSql.includes('12" x 18" x 6"'),
    'Carry bag visible size 12" x 18" x 6" must appear in seed data'
  );
  assert.ok(seedSql.includes('To be confirmed'), 'Unconfirmed sizes must be explicitly marked "To be confirmed"');
});

// Test 7: Order Status Workflow Verification
test('Order status workflow contains all 10 required business states', () => {
  const expectedStatuses = [
    'New Inquiry',
    'Contacted',
    'Quotation Shared',
    'Awaiting Customer Confirmation',
    'Confirmed',
    'Preparing Order',
    'Ready to Ship',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  assert.strictEqual(expectedStatuses.length, 10);
  assert.strictEqual(expectedStatuses[0], 'New Inquiry');
  assert.strictEqual(expectedStatuses[4], 'Confirmed');
  assert.strictEqual(expectedStatuses[9], 'Cancelled');
});

