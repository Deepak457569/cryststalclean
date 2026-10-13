import fs from 'node:fs';
import { PRODUCT_IMAGE_MAPPING, CATEGORY_IMAGE_MAPPING } from './update-images.mjs';

let viteContent = fs.readFileSync('vite.config.ts', 'utf8');

// 1. Replace category images
for (const [catId, imgPath] of Object.entries(CATEGORY_IMAGE_MAPPING)) {
  const catRegex = new RegExp(`(id:\\s*'${catId}'[\\s\\S]*?image_url:\\s*)'[^']+'`, 'g');
  viteContent = viteContent.replace(catRegex, `$1'${imgPath}'`);
}

// 2. Replace product image_url and gallery_json for each product
for (const p of PRODUCT_IMAGE_MAPPING) {
  const pRegex = new RegExp(`(id:\\s*'${p.id}'[\\s\\S]*?image_url:\\s*)'[^']+'([\\s\\S]*?gallery_json:\\s*)JSON\\.stringify\\(\\[[^\\)]+\\]\\)`, 'g');
  viteContent = viteContent.replace(pRegex, `$1'/products/${p.file}'$2JSON.stringify(['/products/${p.file}'])`);

  // Ensure pack_size is verified
  const packRegex = new RegExp(`(id:\\s*'${p.id}'[\\s\\S]*?pack_size:\\s*)'[^']+'`, 'g');
  viteContent = viteContent.replace(packRegex, `$1'${p.pack_size}'`);
}

// 3. Update preview mode in /api/products
const oldApiProducts = `        if (pathname === '/api/products' && method === 'GET') {
          const catId = url.searchParams.get('category');
          const search = url.searchParams.get('q')?.toLowerCase();
          const featured = url.searchParams.get('featured') === '1';
          const activeOnly = url.searchParams.get('active_only') !== '0';

          let list = [...products];
          if (activeOnly) list = list.filter(p => p.is_active === 1);`;

const newApiProducts = `        if (pathname === '/api/products' && method === 'GET') {
          const catId = url.searchParams.get('category');
          const search = url.searchParams.get('q')?.toLowerCase();
          const featured = url.searchParams.get('featured') === '1';
          const preview = url.searchParams.get('preview') === 'drafts';
          const auth = req.headers['authorization'];
          const cookie = req.headers['cookie'];
          const isAdmin = !!(auth?.includes('Bearer') || cookie?.includes('cc_admin_session'));
          const activeOnly = (!isAdmin && !preview) && url.searchParams.get('active_only') !== '0';

          let list = [...products];
          if (activeOnly) list = list.filter(p => p.is_active === 1);`;

if (viteContent.includes(oldApiProducts)) {
  viteContent = viteContent.replace(oldApiProducts, newApiProducts);
  console.log('Updated /api/products handler with admin & preview support.');
}

fs.writeFileSync('vite.config.ts', viteContent);
console.log('Successfully patched vite.config.ts with verified product and category image mappings.');
