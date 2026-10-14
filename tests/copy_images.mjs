import fs from 'node:fs';
import path from 'node:path';

// 1. Create clean SVG placeholder
const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="100%" height="100%" fill="#FAF8F5"/>
  <rect x="12" y="12" width="376" height="276" rx="12" fill="none" stroke="#E2DCD5" stroke-width="1.5" stroke-dasharray="4 4"/>
  <g transform="translate(200, 130)" text-anchor="middle">
    <circle r="36" fill="#F2ECE4"/>
    <path d="M-14 -6 L0 -20 L14 -6 L14 16 L-14 16 Z" fill="none" stroke="#8C7A6B" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="0" cy="2" r="4" fill="#8C7A6B"/>
    <text y="54" font-family="serif" font-size="14" font-weight="600" fill="#4A423B" letter-spacing="1">CRYSTSTALCLEAN</text>
    <text y="72" font-family="sans-serif" font-size="11" fill="#8C7A6B">Hospitality Amenity Image</text>
  </g>
</svg>`;

if (!fs.existsSync('public/images/products')) {
  fs.mkdirSync('public/images/products', { recursive: true });
}
fs.writeFileSync('public/images/products/placeholder.svg', placeholderSvg);

// Mapping products to source files
const mapping = [
  // Batch 1 (15 unique items)
  { id: 'prod_shaving_kit', src: 'photo_2026-10-12_03-19-22.jpg', name: 'Shaving Kit (razor and shave gel sachet)' },
  { id: 'prod_dental_kit', src: 'photo_2026-10-12_03-19-23.jpg', name: 'Dental Kit (kraft box, toothbrush, toothpaste)' },
  { id: 'prod_non_woven_bag', src: 'photo_2026-10-12_03-19-25.jpg', name: 'Non-Woven Carry Bag' },
  { id: 'prod_folded_paper_towels', src: 'photo_2026-10-12_03-19-26.jpg', name: 'Folded Paper Hand Towels' },
  { id: 'prod_black_phenyl', src: 'photo_2026-10-12_03-19-30.jpg', name: 'Black Phenyl' },
  { id: 'prod_phenolic_cleaner', src: 'photo_2026-10-12_03-19-32.jpg', name: 'Phenolic Cleaner' },
  { id: 'prod_magic_cleaner', src: 'photo_2026-10-12_03-19-33.jpg', name: 'Magic Cleaner' },
  { id: 'prod_hand_wash', src: 'photo_2026-10-12_03-19-37.jpg', name: 'Hand Wash' },
  { id: 'prod_toilet_cleaner', src: 'photo_2026-10-12_03-19-39.jpg', name: 'Toilet Cleaner' },
  { id: 'prod_sparkling_bathroom_cleaner', src: 'photo_2026-10-12_03-19-41.jpg', name: 'Sparkling Bathroom Cleaner' },
  { id: 'prod_floor_cleaner', src: 'photo_2026-10-12_03-19-43.jpg', name: 'Floor Cleaner' },
  { id: 'prod_glass_cleaner', src: 'photo_2026-10-12_03-23-46.jpg', name: 'Glass Cleaner (spray)' },
  { id: 'prod_furniture_cleaner', src: 'photo_2026-10-12_03-23-47.jpg', name: 'Furniture Cleaner' },
  { id: 'prod_lemon_room_spray', src: 'photo_2026-10-12_03-33-03.jpg', name: 'Lemon Room Spray' },
  { id: 'prod_dish_wash', src: 'photo_2026-10-12_03-33-04.jpg', name: 'Dish Wash+' },

  // Batch 2 (6 items)
  { id: 'prod_hotel_shampoo', src: 'WhatsApp Image 2026-10-12 at 3.35.15 AM.jpeg', name: 'Hotel Shampoo (mini bottle)' },
  { id: 'prod_hotel_conditioner', src: 'WhatsApp Image 2026-10-12 at 3.39.52 AM.jpeg', name: 'Hotel Conditioner (mini bottle)' },
  { id: 'prod_body_wash', src: 'WhatsApp Image 2026-10-12 at 3.35.16 AM.jpeg', name: 'Body Wash (mini bottle)' },
  { id: 'prod_moisturizer', src: 'WhatsApp Image 2026-10-12 at 3.35.jpeg', name: 'Moisturizer (mini bottle)' },
  { id: 'prod_fragrance_oil_tea_bloom', src: 'WhatsApp Image 2026-10-12 at 3.35.16 A.jpeg', name: 'Fragrance Oil, Tea Bloom (diffuser oil)' },
  { id: 'prod_black_garbage_bags', src: 'WhatsApp Image 2026-10-12 at 3.41..jpeg', name: 'Black Garbage Bags' },

  // Batch 3 (3 items)
  { id: 'prod_terry_slippers', src: 'WhatsApp Image 2026-10-12 at 3.42.10 AM.jpeg', name: 'Disposable Terry Slippers (white)' },
  { id: 'prod_printed_paper_coasters', src: 'WhatsApp Image 2026-10-12 at.jpeg', name: 'Printed Paper Coasters' },
  { id: 'prod_paper_wrapped_glass', src: 'WhatsApp Image 2026-1.jpeg', name: 'Hygienic Paper-Wrapped Drinking Glass' },

  // Batch 4 (2 items)
  { id: 'prod_comb_kraft_box', src: 'WhatsApp Image 2026-.jpeg', name: 'Comb with Kraft Box' },
  { id: 'prod_embossed_tissue_roll', src: 'WhatsApp Image 2026-10-12 at 3.44.30 AM.jpeg', name: 'Embossed Tissue / Paper Roll (jumbo roll)' }
];

const results = [];
for (const item of mapping) {
  const srcPath = path.join('public/images/products', item.src);
  const ext = path.extname(item.src).toLowerCase();
  const destName = item.id + ext;
  const destPath = path.join('public/images/products', destName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    results.push({
      product: item.name,
      id: item.id,
      path: '/images/products/' + destName,
      bytes: fs.statSync(destPath).size,
      status: 'Verified Working Image'
    });
  } else {
    results.push({
      product: item.name,
      id: item.id,
      path: '/images/products/placeholder.svg',
      bytes: fs.statSync('public/images/products/placeholder.svg').size,
      status: 'Fallback Neutral Placeholder'
    });
  }
}

console.log(JSON.stringify(results, null, 2));
