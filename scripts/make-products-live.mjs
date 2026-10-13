import fs from 'fs';
import path from 'path';

// 1. Update migrations/0002_seed_data.sql
const seedPath = path.resolve('migrations/0002_seed_data.sql');
let seedContent = fs.readFileSync(seedPath, 'utf8');

seedContent = seedContent.replace(
  '-- All 26 Initial Products from Section 4A (Seeded as DRAFT: is_active = 0)',
  '-- All 26 Initial Products from Section 4A (Seeded as LIVE: is_active = 1)'
);

// Replace the last 0 in the tuple (is_active) with 1
// Each product ends with:
//   <is_customizable: 0 or 1>,
//   0
// )
// or ); for the last one
seedContent = seedContent.replace(/,\s*\n\s*0\s*\n\s*\)/g, ',\n  1\n)');
seedContent = seedContent.replace(/,\s*\n\s*0\s*\n\s*\);/g, ',\n  1\n);');

fs.writeFileSync(seedPath, seedContent, 'utf8');
console.log('Updated migrations/0002_seed_data.sql');

// 2. Update migrations/0003_fix_product_images.sql
const mig0003Path = path.resolve('migrations/0003_fix_product_images.sql');
let mig0003Content = fs.readFileSync(mig0003Path, 'utf8');
if (!mig0003Content.includes('UPDATE products SET is_active = 1;')) {
  mig0003Content += '\n-- Ensure all existing products are LIVE\nUPDATE products SET is_active = 1;\n';
  fs.writeFileSync(mig0003Path, mig0003Content, 'utf8');
  console.log('Updated migrations/0003_fix_product_images.sql');
}

// 3. Update vite.config.ts
const vitePath = path.resolve('vite.config.ts');
let viteContent = fs.readFileSync(vitePath, 'utf8');

// Replace is_active: 0 with is_active: 1 in the products array
// The products array starts around "let products: any[] = [" and ends before "let accessCodes"
const productsArrayStart = viteContent.indexOf('let products: any[] = [');
const productsArrayEnd = viteContent.indexOf('let accessCodes = [');

if (productsArrayStart !== -1 && productsArrayEnd !== -1) {
  let productsPart = viteContent.substring(productsArrayStart, productsArrayEnd);
  const countReplaced = (productsPart.match(/is_active:\s*0/g) || []).length;
  productsPart = productsPart.replace(/is_active:\s*0/g, 'is_active: 1');
  viteContent = viteContent.substring(0, productsArrayStart) + productsPart + viteContent.substring(productsArrayEnd);
  console.log(`Replaced ${countReplaced} occurrences of is_active: 0 in vite.config.ts products array`);
}

// In POST /api/products handler, default is_active to 1 if omitted
viteContent = viteContent.replace(
  'is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 0,',
  'is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,'
);

fs.writeFileSync(vitePath, viteContent, 'utf8');
console.log('Updated vite.config.ts');

// 4. Update tests/acceptance.test.mjs
const testPath = path.resolve('tests/acceptance.test.mjs');
let testContent = fs.readFileSync(testPath, 'utf8');

testContent = testContent.replace(
  /\/\/ Verify ALL 26 seeded products end with is_active = 0[\s\S]*?assert\.strictEqual\(draftEndingMatches\.length,\s*26,\s*'All 26 products must end with is_active = 0 \(DRAFT\)'\);/,
  `// Verify ALL 26 seeded products end with is_active = 1 (LIVE)
  const liveEndingMatches = seedSql.match(/,\\s*1\\s*\\n\\s*\\)/g) || [];
  assert.strictEqual(liveEndingMatches.length, 26, 'All 26 products must end with is_active = 1 (LIVE)');`
);

fs.writeFileSync(testPath, testContent, 'utf8');
console.log('Updated tests/acceptance.test.mjs');

// 5. Update src/pages/admin/AdminDashboardPage.tsx
const adminPagePath = path.resolve('src/pages/admin/AdminDashboardPage.tsx');
let adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
adminPageContent = adminPageContent.replace(
  /pack_size:\s*'To be confirmed',\s*is_active:\s*0,/,
  "pack_size: 'To be confirmed',\n                      is_active: 1,"
);
fs.writeFileSync(adminPagePath, adminPageContent, 'utf8');
console.log('Updated src/pages/admin/AdminDashboardPage.tsx');
