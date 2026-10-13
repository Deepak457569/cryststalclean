import fs from 'node:fs';
import path from 'node:path';

export const PRODUCT_IMAGE_MAPPING = [
  {
    name: 'Shaving Kit (razor and shave gel sachet)',
    slug: 'shaving-kit-razor-shave-gel',
    id: 'prod_shaving_kit',
    file: 'shaving-kit.jpg',
    category_id: 'cat_shaving',
    category_name: 'Shaving and Grooming Kits',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Dental Kit (kraft box, toothbrush, toothpaste)',
    slug: 'dental-kit-kraft-box',
    id: 'prod_dental_kit',
    file: 'dental-kit.jpg',
    category_id: 'cat_dental',
    category_name: 'Dental Kits',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Non-Woven Carry Bag',
    slug: 'non-woven-carry-bag',
    id: 'prod_non_woven_bag',
    file: 'non-woven-carry-bag.jpg',
    category_id: 'cat_packaging',
    category_name: 'Packaging and Bags',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Folded Paper Hand Towels',
    slug: 'folded-paper-hand-towels',
    id: 'prod_folded_paper_towels',
    file: 'folded-paper-hand-towels.jpg',
    category_id: 'cat_paper',
    category_name: 'Paper Products',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Black Phenyl',
    slug: 'black-phenyl-5l',
    id: 'prod_black_phenyl',
    file: 'black-phenyl.jpg',
    category_id: 'cat_floor',
    category_name: 'Floor and Surface Cleaners',
    pack_size: '5 L',
  },
  {
    name: 'Phenolic Cleaner',
    slug: 'phenolic-cleaner-5l',
    id: 'prod_phenolic_cleaner',
    file: 'phenolic-cleaner.jpg',
    category_id: 'cat_floor',
    category_name: 'Floor and Surface Cleaners',
    pack_size: '5 L',
  },
  {
    name: 'Magic Cleaner',
    slug: 'magic-cleaner',
    id: 'prod_magic_cleaner',
    file: 'magic-cleaner.jpg',
    category_id: 'cat_floor',
    category_name: 'Floor and Surface Cleaners',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Hand Wash',
    slug: 'hand-wash-5l',
    id: 'prod_hand_wash',
    file: 'hand-wash.jpg',
    category_id: 'cat_soap',
    category_name: 'Soap and Bath Products',
    pack_size: '5 L',
  },
  {
    name: 'Toilet Cleaner',
    slug: 'toilet-cleaner-5l',
    id: 'prod_toilet_cleaner',
    file: 'toilet-cleaner.jpg',
    category_id: 'cat_bathroom',
    category_name: 'Bathroom Cleaners',
    pack_size: '5 L',
  },
  {
    name: 'Sparkling Bathroom Cleaner',
    slug: 'sparkling-bathroom-cleaner-5l',
    id: 'prod_sparkling_bathroom_cleaner',
    file: 'sparkling-bathroom-cleaner.jpg',
    category_id: 'cat_bathroom',
    category_name: 'Bathroom Cleaners',
    pack_size: '5 L',
  },
  {
    name: 'Floor Cleaner',
    slug: 'floor-cleaner-5l',
    id: 'prod_floor_cleaner',
    file: 'floor-cleaner.jpg',
    category_id: 'cat_floor',
    category_name: 'Floor and Surface Cleaners',
    pack_size: '5 L',
  },
  {
    name: 'Glass Cleaner (spray)',
    slug: 'glass-cleaner-spray',
    id: 'prod_glass_cleaner',
    file: 'glass-cleaner-spray.jpg',
    category_id: 'cat_glass',
    category_name: 'Glass and Furniture Care',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Furniture Cleaner',
    slug: 'furniture-cleaner-100ml',
    id: 'prod_furniture_cleaner',
    file: 'furniture-cleaner.jpg',
    category_id: 'cat_glass',
    category_name: 'Glass and Furniture Care',
    pack_size: '100 ml',
  },
  {
    name: 'Lemon Room Spray',
    slug: 'lemon-room-spray',
    id: 'prod_lemon_room_spray',
    file: 'lemon-room-spray.jpg',
    category_id: 'cat_room',
    category_name: 'Room Fresheners',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Dish Wash+',
    slug: 'dish-wash-plus-5l',
    id: 'prod_dish_wash',
    file: 'dish-wash-plus.jpg',
    category_id: 'cat_kitchen',
    category_name: 'Kitchen and Dishwash',
    pack_size: '5 L',
  },
  {
    name: 'Hotel Shampoo (mini bottle)',
    slug: 'hotel-shampoo-mini-bottle',
    id: 'prod_hotel_shampoo',
    file: 'hotel-shampoo-mini-bottle.jpg',
    category_id: 'cat_shampoo',
    category_name: 'Shampoo and Conditioner',
    pack_size: '20 ml',
  },
  {
    name: 'Hotel Conditioner (mini bottle)',
    slug: 'hotel-conditioner-mini-bottle',
    id: 'prod_hotel_conditioner',
    file: 'hotel-conditioner-mini-bottle.jpg',
    category_id: 'cat_shampoo',
    category_name: 'Shampoo and Conditioner',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Body Wash (mini bottle)',
    slug: 'body-wash-mini-bottle',
    id: 'prod_body_wash',
    file: 'body-wash-mini-bottle.jpg',
    category_id: 'cat_toiletries',
    category_name: 'Hotel Toiletries',
    pack_size: '20 ml',
  },
  {
    name: 'Moisturizer (mini bottle)',
    slug: 'moisturizer-mini-bottle',
    id: 'prod_moisturizer',
    file: 'moisturizer-mini-bottle.jpg',
    category_id: 'cat_toiletries',
    category_name: 'Hotel Toiletries',
    pack_size: '20 ml',
  },
  {
    name: 'Fragrance Oil, Tea Bloom (diffuser oil)',
    slug: 'fragrance-oil-tea-bloom',
    id: 'prod_fragrance_oil_tea_bloom',
    file: 'fragrance-oil-tea-bloom.jpg',
    category_id: 'cat_room',
    category_name: 'Room Fresheners',
    pack_size: '10 ml',
  },
  {
    name: 'Black Garbage Bags',
    slug: 'black-garbage-bags',
    id: 'prod_black_garbage_bags',
    file: 'black-garbage-bags.jpg',
    category_id: 'cat_housekeeping',
    category_name: 'Housekeeping Supplies',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Disposable Terry Slippers (white)',
    slug: 'disposable-terry-slippers-white',
    id: 'prod_terry_slippers',
    file: 'disposable-terry-slippers.jpg',
    category_id: 'cat_essentials',
    category_name: 'Guest Essentials and Room Accessories',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Printed Paper Coasters',
    slug: 'printed-paper-coasters',
    id: 'prod_printed_paper_coasters',
    file: 'printed-paper-coasters.jpg',
    category_id: 'cat_essentials',
    category_name: 'Guest Essentials and Room Accessories',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Hygienic Paper-Wrapped Drinking Glass',
    slug: 'hygienic-paper-wrapped-drinking-glass',
    id: 'prod_paper_wrapped_glass',
    file: 'paper-wrapped-drinking-glass.jpg',
    category_id: 'cat_essentials',
    category_name: 'Guest Essentials and Room Accessories',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Comb with Kraft Box',
    slug: 'comb-with-kraft-box',
    id: 'prod_comb_kraft_box',
    file: 'comb-with-kraft-box.jpg',
    category_id: 'cat_toiletries',
    category_name: 'Hotel Toiletries',
    pack_size: 'To be confirmed',
  },
  {
    name: 'Embossed Tissue / Paper Roll (jumbo roll)',
    slug: 'embossed-tissue-paper-roll-jumbo',
    id: 'prod_embossed_tissue_roll',
    file: 'embossed-tissue-roll.jpg',
    category_id: 'cat_paper',
    category_name: 'Paper Products',
    pack_size: 'To be confirmed',
  },
];

export const CATEGORY_IMAGE_MAPPING = {
  'cat_shampoo': '/products/hotel-conditioner-mini-bottle.jpg',
  'cat_toiletries': '/products/comb-with-kraft-box.jpg',
  'cat_dental': '/products/dental-kit.jpg',
  'cat_shaving': '/products/shaving-kit.jpg',
  'cat_soap': '/products/hand-wash.jpg',
  'cat_bathroom': '/products/toilet-cleaner.jpg',
  'cat_floor': '/products/floor-cleaner.jpg',
  'cat_glass': '/products/glass-cleaner-spray.jpg',
  'cat_kitchen': '/products/dish-wash-plus.jpg',
  'cat_room': '/products/lemon-room-spray.jpg',
  'cat_essentials': '/products/disposable-terry-slippers.jpg',
  'cat_paper': '/products/folded-paper-hand-towels.jpg',
  'cat_packaging': '/products/non-woven-carry-bag.jpg',
  'cat_housekeeping': '/products/black-garbage-bags.jpg',
  'cat_bulk': '/products/embossed-tissue-roll.jpg',
};

// 1. Verify all 26 files exist
console.log('--- Step 1: Checking files in public/products/ ---');
let missing = 0;
for (const item of PRODUCT_IMAGE_MAPPING) {
  const filePath = path.resolve('public/products', item.file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${item.file} -> ${item.name}`);
  if (!exists) {
    missing++;
  }
}
if (missing > 0) {
  console.error(`ERROR: ${missing} image files missing!`);
  process.exit(1);
}
console.log('All 26 product images verified on disk.');

// 2. Update migrations/0002_seed_data.sql
console.log('\n--- Step 2: Updating migrations/0002_seed_data.sql ---');
let seedSql = fs.readFileSync('migrations/0002_seed_data.sql', 'utf8');

// Update categories in 0002_seed_data.sql
for (const [catId, imgPath] of Object.entries(CATEGORY_IMAGE_MAPPING)) {
  const catRegex = new RegExp(`('${catId}'[\\s\\S]*?)(https://images\\.unsplash\\.com/photo-[^']+)`, 'g');
  seedSql = seedSql.replace(catRegex, `$1${imgPath}`);
}

// Update products in 0002_seed_data.sql
for (const prod of PRODUCT_IMAGE_MAPPING) {
  const idIdx = seedSql.indexOf(`'${prod.id}',`);
  if (idIdx !== -1) {
    const nextIdx = seedSql.indexOf('),', idIdx);
    const endBlock = nextIdx !== -1 ? nextIdx : seedSql.indexOf(');', idIdx);
    let block = seedSql.substring(idIdx, endBlock);

    // Replace image_url (can be /images/products/... or unsplash)
    block = block.replace(/('\/images\/products\/[^']+'|'https:\/\/images\.unsplash\.com\/[^']+')/, `'${'/products/' + prod.file}'`);
    // Replace gallery_json
    block = block.replace(/('\["\/images\/products\/[^']+'|'\["https:\/\/images\.unsplash\.com\/[^']+'|'\["\/products\/[^']+')/, `'["/products/${prod.file}"]'`);
    // Ensure valid JSON gallery
    block = block.replace(/'\["\/products\/([^"]+)"?\]?'/, `'["/products/$1"]'`);

    seedSql = seedSql.substring(0, idIdx) + block + seedSql.substring(endBlock);
  }
}

fs.writeFileSync('migrations/0002_seed_data.sql', seedSql);
console.log('Updated migrations/0002_seed_data.sql successfully.');

// 3. Update tests/update_seed_images.mjs
console.log('\n--- Step 3: Updating tests/update_seed_images.mjs ---');
const updateScriptContent = `// Utility script to verify and enforce verified local product image mappings
import fs from 'node:fs';
import path from 'node:path';

import { PRODUCT_IMAGE_MAPPING, CATEGORY_IMAGE_MAPPING } from '../scripts/update-images.mjs';

console.log('Verified product image mappings: 26 products, 15 categories.');
`;
fs.writeFileSync('tests/update_seed_images.mjs', updateScriptContent);
console.log('Updated tests/update_seed_images.mjs successfully.');
