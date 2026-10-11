import fs from 'node:fs';

const extMap = {
  prod_shaving_kit: '.jpg',
  prod_dental_kit: '.jpg',
  prod_non_woven_bag: '.jpg',
  prod_folded_paper_towels: '.jpg',
  prod_black_phenyl: '.jpg',
  prod_phenolic_cleaner: '.jpg',
  prod_magic_cleaner: '.jpg',
  prod_hand_wash: '.jpg',
  prod_toilet_cleaner: '.jpg',
  prod_sparkling_bathroom_cleaner: '.jpg',
  prod_floor_cleaner: '.jpg',
  prod_glass_cleaner: '.jpg',
  prod_furniture_cleaner: '.jpg',
  prod_lemon_room_spray: '.jpg',
  prod_dish_wash: '.jpg',
  prod_hotel_shampoo: '.jpeg',
  prod_hotel_conditioner: '.jpeg',
  prod_body_wash: '.jpeg',
  prod_moisturizer: '.jpeg',
  prod_fragrance_oil_tea_bloom: '.jpeg',
  prod_black_garbage_bags: '.jpeg',
  prod_terry_slippers: '.jpeg',
  prod_printed_paper_coasters: '.jpeg',
  prod_paper_wrapped_glass: '.jpeg',
  prod_comb_kraft_box: '.jpeg',
  prod_embossed_tissue_roll: '.jpeg'
};

// 1. Update migrations/0002_seed_data.sql
let sql = fs.readFileSync('migrations/0002_seed_data.sql', 'utf8');

for (const [id, ext] of Object.entries(extMap)) {
  const imgUrl = `/images/products/${id}${ext}`;
  // Find product block and replace image url
  const idIdx = sql.indexOf(`'${id}',`);
  if (idIdx !== -1) {
    const nextIdx = sql.indexOf('),', idIdx);
    const endBlock = nextIdx !== -1 ? nextIdx : sql.indexOf(');', idIdx);
    let block = sql.substring(idIdx, endBlock);
    
    // Replace unsplash url inside this block
    block = block.replace(/https:\/\/images\.unsplash\.com\/photo-[^']+/g, imgUrl);
    sql = sql.substring(0, idIdx) + block + sql.substring(endBlock);
  }
}

fs.writeFileSync('migrations/0002_seed_data.sql', sql);
console.log('Updated migrations/0002_seed_data.sql with local product images.');

// 2. Update vite.config.ts
let vite = fs.readFileSync('vite.config.ts', 'utf8');
for (const [id, ext] of Object.entries(extMap)) {
  const imgUrl = `/images/products/${id}${ext}`;
  const idIdx = vite.indexOf(`id: '${id}',`);
  if (idIdx !== -1) {
    const endBlock = vite.indexOf('},', idIdx);
    let block = vite.substring(idIdx, endBlock);
    block = block.replace(/image_url: 'https:\/\/images\.unsplash\.com\/photo-[^']+'/g, `image_url: '${imgUrl}'`);
    vite = vite.substring(0, idIdx) + block + vite.substring(endBlock);
  }
}
fs.writeFileSync('vite.config.ts', vite);
console.log('Updated vite.config.ts with local product images.');
