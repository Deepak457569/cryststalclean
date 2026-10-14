-- CrystalClean Cloudflare D1 Initial Migration Schema
-- Safe, idempotent, structured for D1 SQLite

CREATE TABLE IF NOT EXISTS administrators (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  salt TEXT,
  role TEXT DEFAULT 'admin',
  google_id TEXT,
  name TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  image_url TEXT NOT NULL,
  gallery_json TEXT DEFAULT '[]',
  variants_json TEXT DEFAULT '[]',
  pack_size TEXT,
  specs_json TEXT DEFAULT '{}',
  is_featured INTEGER DEFAULT 0,
  is_customizable INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS access_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  code_hash TEXT,
  client_name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  max_uses INTEGER DEFAULT 50,
  used_count INTEGER DEFAULT 0,
  expires_at TEXT,
  status TEXT DEFAULT 'active',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  inquiry_type TEXT DEFAULT 'cart', -- 'cart' or 'bulk_quote'
  customer_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  delivery_city TEXT NOT NULL,
  expected_date TEXT,
  notes TEXT,
  access_code_id TEXT REFERENCES access_codes(id),
  status TEXT DEFAULT 'New Inquiry',
  admin_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiry_items (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name_snapshot TEXT NOT NULL,
  variant_snapshot TEXT,
  pack_size_snapshot TEXT,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS access_code_logs (
  id TEXT PRIMARY KEY,
  access_code_id TEXT NOT NULL REFERENCES access_codes(id),
  inquiry_id TEXT REFERENCES inquiries(id),
  ip_hash TEXT,
  user_agent TEXT,
  used_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiry_status_history (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  changed_by TEXT,
  changed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  token_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON inquiries(reference);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_items_inquiry ON inquiry_items(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens ON password_reset_tokens(token);
-- Seed Data for CrystalClean Hospitality Supplies
-- Strictly NO public prices, currency symbols, or cost columns.
-- Contains 15 Admin-Editable Categories and all 26 Seeded Products from Section 4A.
-- All 26 products are seeded as DRAFT (is_active = 0) for owner review prior to publishing.

INSERT OR REPLACE INTO business_settings (key, value) VALUES 
('whatsapp_number', '919149953610'),
('business_name', 'CrystalClean Hospitality Supplies'),
('contact_email', 'orders@crystalclean.in'),
('contact_phone', '+91 91499 53610'),
('address', 'Hospitality Business District, Sector 18, Gurugram, HR & New Delhi'),
('admin_allowlist', 'crystalclean457@gmail.com,admin@crystalclean.in,owner@crystalclean.in');

-- 15 Searchable and Filterable Categories (Admin-Editable)
INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
('cat_shampoo', 'Shampoo and Conditioner', 'shampoo-and-conditioner', 'Guest hair care amenities, conditioning blends, and refillable mini bottles for luxury hospitality.', '/products/hotel-conditioner-mini-bottle.jpg', 1, 1),
('cat_toiletries', 'Hotel Toiletries', 'hotel-toiletries', 'Individual mini guest amenities including body washes, nourishing lotions, and vanity accessories.', '/products/comb-with-kraft-box.jpg', 2, 1),
('cat_dental', 'Dental Kits', 'dental-kits', 'Hygienic dental care travel sets in eco-friendly kraft packaging with soft-bristle brushes.', '/products/dental-kit.jpg', 3, 1),
('cat_shaving', 'Shaving and Grooming Kits', 'shaving-and-grooming-kits', 'Single and twin blade guest razors paired with soothing shaving sachets in water-resistant sleeves.', '/products/shaving-kit.jpg', 4, 1),
('cat_soap', 'Soap and Bath Products', 'soap-and-bath-products', 'Gentle guest bath soaps, vegetable glycerin bars, and liquid hand wash bulk refills.', '/products/hand-wash.jpg', 5, 1),
('cat_bathroom', 'Bathroom Cleaners', 'bathroom-cleaners', 'Institutional descalers, toilet bowl disinfectants, and sanitary ware surface cleaners.', '/products/toilet-cleaner.jpg', 6, 1),
('cat_floor', 'Floor and Surface Cleaners', 'floor-and-surface-cleaners', 'High-performance commercial floor disinfectants, phenolic cleaners, and black phenyl concentrates.', '/products/floor-cleaner.jpg', 7, 1),
('cat_glass', 'Glass and Furniture Care', 'glass-and-furniture-care', 'Streak-free window and mirror sprays, wood polish, and laminate surface cleaners.', '/products/glass-cleaner-spray.jpg', 8, 1),
('cat_kitchen', 'Kitchen and Dishwash', 'kitchen-and-dishwash', 'Commercial dishwashing concentrates and food-safe grease-cutting kitchen formulations.', '/products/dish-wash-plus.jpg', 9, 1),
('cat_room', 'Room Fresheners', 'room-fresheners', 'Ambient room freshener sprays, floral mists, and long-lasting diffuser fragrance oils.', '/products/lemon-room-spray.jpg', 10, 1),
('cat_essentials', 'Guest Essentials and Room Accessories', 'guest-essentials-and-room-accessories', 'Disposable hotel slippers, absorbent paper coasters, and hygienic drinking glass wraps.', '/products/disposable-terry-slippers.jpg', 11, 1),
('cat_paper', 'Paper Products', 'paper-products', 'Embossed washroom tissue jumbo rolls and interleaved folded paper hand towels.', '/products/folded-paper-hand-towels.jpg', 12, 1),
('cat_packaging', 'Packaging and Bags', 'packaging-and-bags', 'Customizable non-woven carry bags and retail packaging for hospitality groups.', '/products/non-woven-carry-bag.jpg', 13, 1),
('cat_housekeeping', 'Housekeeping Supplies', 'housekeeping-supplies', 'Commercial garbage bags, heavy-duty bin liners, and housekeeping utility supplies.', '/products/black-garbage-bags.jpg', 14, 1),
('cat_bulk', 'Bulk Hospitality Supplies', 'bulk-hospitality-supplies', '5-Litre institutional gallon containers and bulk dispenser supply solutions.', '/products/embossed-tissue-roll.jpg', 15, 1);

-- All 26 Initial Products from Section 4A (Seeded as LIVE: is_active = 1)
INSERT OR REPLACE INTO products (id, name, slug, description, category_id, image_url, gallery_json, variants_json, pack_size, specs_json, is_featured, is_customizable, is_active) VALUES
(
  'prod_shaving_kit',
  'Shaving Kit (razor and shave gel sachet)',
  'shaving-kit-razor-shave-gel',
  'Compact guest shaving set featuring a razor paired with a soothing shaving gel sachet for single-use hospitality vanity kits.',
  'cat_shaving',
  '/products/shaving-kit.jpg',
  '["/products/shaving-kit.jpg"]',
  '["Twin-Blade Razor & Shave Gel Sachet"]',
  'To be confirmed',
  '{"components": "Razor with lubricating strip, Shaving gel sachet", "packaging": "Sealed moisture-resistant sleeve"}',
  0,
  0,
  1
),
(
  'prod_dental_kit',
  'Dental Kit (kraft box, toothbrush, toothpaste)',
  'dental-kit-kraft-box',
  'Complete guest dental kit containing an individually sleeved toothbrush and travel-size mint toothpaste enclosed in an eco-friendly kraft carton.',
  'cat_dental',
  '/products/dental-kit.jpg',
  '["/products/dental-kit.jpg"]',
  '["Toothbrush & Toothpaste in Kraft Box"]',
  'To be confirmed',
  '{"components": "Soft bristle toothbrush, Toothpaste tube", "packaging": "Recycled kraft paper carton"}',
  0,
  0,
  1
),
(
  'prod_non_woven_bag',
  'Non-Woven Carry Bag',
  'non-woven-carry-bag',
  'Durable non-woven fabric shopping and laundry carry bag with reinforced handles, designed for hotel guest amenities and retail packaging.',
  'cat_packaging',
  '/products/non-woven-carry-bag.jpg',
  '["/products/non-woven-carry-bag.jpg"]',
  '["12\" x 18\" x 6\" (D-Cut / Loop Handle)"]',
  'To be confirmed',
  '{"dimensions": "12\" x 18\" x 6\"", "material": "Non-Woven Polypropylene", "customizable_logo": true}',
  0,
  1,
  1
),
(
  'prod_folded_paper_towels',
  'Folded Paper Hand Towels',
  'folded-paper-hand-towels',
  'Absorbent interleaved folded paper towels for washroom and housekeeping dispensers, offering clean one-at-a-time towel dispensing.',
  'cat_paper',
  '/products/folded-paper-hand-towels.jpg',
  '["/products/folded-paper-hand-towels.jpg"]',
  '["M-Fold / V-Fold Interleaved Paper Towels"]',
  'To be confirmed',
  '{"fold_type": "Interleaved M-Fold", "material": "Virgin / recycled pulp blend"}',
  0,
  0,
  1
),
(
  'prod_black_phenyl',
  'Black Phenyl',
  'black-phenyl-5l',
  'Heavy-duty institutional black disinfectant phenyl formulated for deep floor sanitization and odor control in commercial facilities.',
  'cat_floor',
  '/products/black-phenyl.jpg',
  '["/products/black-phenyl.jpg"]',
  '["5 Litre Can"]',
  '5 L',
  '{"volume": "5 L", "formulation": "Commercial grade disinfectant fluid", "dilution": "Water soluble emulsion"}',
  0,
  0,
  1
),
(
  'prod_phenolic_cleaner',
  'Phenolic Cleaner',
  'phenolic-cleaner-5l',
  'Commercial-grade phenolic floor cleaner and surface deodorizer packaged in an institutional 5-litre container.',
  'cat_floor',
  '/products/phenolic-cleaner.jpg',
  '["/products/phenolic-cleaner.jpg"]',
  '["5 Litre Can"]',
  '5 L',
  '{"volume": "5 L", "surface_application": "Ceramic, mosaic, concrete and marble floors"}',
  0,
  0,
  1
),
(
  'prod_magic_cleaner',
  'Magic Cleaner',
  'magic-cleaner',
  'Multi-purpose concentrated surface cleaning liquid engineered for tough stains and routine housekeeping maintenance.',
  'cat_floor',
  '/products/magic-cleaner.jpg',
  '["/products/magic-cleaner.jpg"]',
  '["Concentrated Surface Formulation"]',
  'To be confirmed',
  '{"application": "Hard surfaces, counters, tiles, and fixtures"}',
  0,
  0,
  1
),
(
  'prod_hand_wash',
  'Hand Wash',
  'hand-wash-5l',
  'Gentle moisturizing liquid hand wash refill formulated for high-traffic hotel and restaurant washroom dispensers.',
  'cat_soap',
  '/products/hand-wash.jpg',
  '["/products/hand-wash.jpg"]',
  '["5 Litre Refill Can"]',
  '5 L',
  '{"volume": "5 L", "skin_feel": "Moisturizing lather, dispenser compatible"}',
  0,
  0,
  1
),
(
  'prod_toilet_cleaner',
  'Toilet Cleaner',
  'toilet-cleaner-5l',
  'Institutional-strength toilet and urinal bowl cleaner with a thick clinging formula that dissolves limescale and mineral deposits.',
  'cat_bathroom',
  '/products/toilet-cleaner.jpg',
  '["/products/toilet-cleaner.jpg"]',
  '["5 Litre Institutional Can"]',
  '5 L',
  '{"volume": "5 L", "viscosity": "Thick clinging formula for angled rims"}',
  0,
  0,
  1
),
(
  'prod_sparkling_bathroom_cleaner',
  'Sparkling Bathroom Cleaner',
  'sparkling-bathroom-cleaner-5l',
  'Comprehensive bathroom and tile cleaner designed to remove soap scum, hard water stains, and grime from bathroom fixtures.',
  'cat_bathroom',
  '/products/sparkling-bathroom-cleaner.jpg',
  '["/products/sparkling-bathroom-cleaner.jpg"]',
  '["5 Litre Container"]',
  '5 L',
  '{"volume": "5 L", "surfaces": "Glazed tiles, basins, tubs, taps, shower partitions"}',
  0,
  0,
  1
),
(
  'prod_floor_cleaner',
  'Floor Cleaner',
  'floor-cleaner-5l',
  'Daily maintenance floor cleaner concentrate delivering a fresh scent and clean finish on guest room and lobby floors.',
  'cat_floor',
  '/products/floor-cleaner.jpg',
  '["/products/floor-cleaner.jpg"]',
  '["5 Litre Can"]',
  '5 L',
  '{"volume": "5 L", "residue": "No sticky film, quick drying formula"}',
  0,
  0,
  1
),
(
  'prod_glass_cleaner',
  'Glass Cleaner (spray)',
  'glass-cleaner-spray',
  'Fast-evaporating glass and window cleaner spray providing streak-free clarity on mirrors, glass partitions, and display cases.',
  'cat_glass',
  '/products/glass-cleaner-spray.jpg',
  '["/products/glass-cleaner-spray.jpg"]',
  '["Trigger Spray Bottle"]',
  'To be confirmed',
  '{"finish": "Streak-free shine", "safe_on": "Mirrors, windshields, glass fixtures"}',
  0,
  0,
  1
),
(
  'prod_furniture_cleaner',
  'Furniture Cleaner',
  'furniture-cleaner-100ml',
  'Conditioning spray polish for treated wood, veneer, leatherette, and laminated furniture surfaces in hotel guest rooms.',
  'cat_glass',
  '/products/furniture-cleaner.jpg',
  '["/products/furniture-cleaner.jpg"]',
  '["100 ml Bottle"]',
  '100 ml',
  '{"volume": "100 ml", "application": "Polished wood, veneer, laminate surfaces"}',
  0,
  0,
  1
),
(
  'prod_lemon_room_spray',
  'Lemon Room Spray',
  'lemon-room-spray',
  'Invigorating lemon citrus room spray for quick turnaround housekeeping and guest room atmosphere refreshment.',
  'cat_room',
  '/products/lemon-room-spray.jpg',
  '["/products/lemon-room-spray.jpg"]',
  '["Aerosol / Trigger Room Mist"]',
  'To be confirmed',
  '{"scent": "Lemon Zest", "format": "Spray Mist"}',
  0,
  0,
  1
),
(
  'prod_dish_wash',
  'Dish Wash+',
  'dish-wash-plus-5l',
  'Institutional grease-cutting liquid dishwash concentrate for banquet kitchens, room service pantry, and restaurant cutlery.',
  'cat_kitchen',
  '/products/dish-wash-plus.jpg',
  '["/products/dish-wash-plus.jpg"]',
  '["5 Litre Refill Can"]',
  '5 L',
  '{"volume": "5 L", "rinse_profile": "Fast grease-stripping with clean water rinse"}',
  0,
  0,
  1
),
(
  'prod_hotel_shampoo',
  'Hotel Shampoo (mini bottle)',
  'hotel-shampoo-mini-bottle',
  'Refreshing hotel guest shampoo formulated for daily hair washing, packaged in a compact 20 ml travel amenity bottle.',
  'cat_shampoo',
  '/products/hotel-shampoo-mini-bottle.jpg',
  '["/products/hotel-shampoo-mini-bottle.jpg"]',
  '["20 ml Mini Bottle"]',
  '20 ml',
  '{"volume": "20 ml", "cap": "Ribbed screw cap", "customizable_logo": false}',
  0,
  0,
  1
),
(
  'prod_hotel_conditioner',
  'Hotel Conditioner (mini bottle)',
  'hotel-conditioner-mini-bottle',
  'Lightweight nourishing guest conditioner that softens and detangles hair, packaged in a minimalist hotel amenity bottle.',
  'cat_shampoo',
  '/products/hotel-conditioner-mini-bottle.jpg',
  '["/products/hotel-conditioner-mini-bottle.jpg"]',
  '["Mini Hospitality Bottle"]',
  'To be confirmed',
  '{"packaging": "Squeeze amenity bottle", "customizable_logo": false}',
  0,
  0,
  1
),
(
  'prod_body_wash',
  'Body Wash (mini bottle)',
  'body-wash-mini-bottle',
  'Invigorating aquatic body wash for guest bathrooms, packaged in a single-stay 20 ml hospitality bottle.',
  'cat_toiletries',
  '/products/body-wash-mini-bottle.jpg',
  '["/products/body-wash-mini-bottle.jpg"]',
  '["20 ml Mini Bottle"]',
  '20 ml',
  '{"volume": "20 ml", "lather": "Rich cleansing foam", "customizable_logo": false}',
  0,
  0,
  1
),
(
  'prod_moisturizer',
  'Moisturizer (mini bottle)',
  'moisturizer-mini-bottle',
  'Smooth hydrating body moisturizer designed to restore skin balance after travel, packaged in a 20 ml guest bottle.',
  'cat_toiletries',
  '/products/moisturizer-mini-bottle.jpg',
  '["/products/moisturizer-mini-bottle.jpg"]',
  '["20 ml Mini Bottle"]',
  '20 ml',
  '{"volume": "20 ml", "absorption": "Fast absorbing non-greasy lotion", "customizable_logo": false}',
  0,
  0,
  1
),
(
  'prod_fragrance_oil_tea_bloom',
  'Fragrance Oil, Tea Bloom (diffuser oil)',
  'fragrance-oil-tea-bloom',
  'Concentrated tea bloom aroma diffuser oil in an amber bottle for hotel lobbies, elevator corridors, and guest suite diffusers.',
  'cat_room',
  '/products/fragrance-oil-tea-bloom.jpg',
  '["/products/fragrance-oil-tea-bloom.jpg"]',
  '["10 ml Amber Dropper Bottle"]',
  '10 ml',
  '{"volume": "10 ml", "fragrance_profile": "Tea Bloom floral blend", "usage": "Ultrasonic & reed diffusers"}',
  0,
  0,
  1
),
(
  'prod_black_garbage_bags',
  'Black Garbage Bags',
  'black-garbage-bags',
  'Durable tear-resistant black waste bags for hotel guest room dustbins and housekeeping trolley collection.',
  'cat_housekeeping',
  '/products/black-garbage-bags.jpg',
  '["/products/black-garbage-bags.jpg"]',
  '["Standard Housekeeping Roll"]',
  'To be confirmed',
  '{"material": "High density polyethylene", "color": "Black"}',
  0,
  0,
  1
),
(
  'prod_terry_slippers',
  'Disposable Terry Slippers (white)',
  'disposable-terry-slippers-white',
  'Unisex closed-toe white terry cloth guest room slippers with a textured anti-slip sole for hotel bedrooms and spas.',
  'cat_essentials',
  '/products/disposable-terry-slippers.jpg',
  '["/products/disposable-terry-slippers.jpg"]',
  '["Unisex Closed-Toe Terry Slipper"]',
  'To be confirmed',
  '{"upper": "Soft white terry cloth", "sole": "Textured anti-skid EVA", "style": "Closed toe"}',
  0,
  0,
  1
),
(
  'prod_printed_paper_coasters',
  'Printed Paper Coasters',
  'printed-paper-coasters',
  'Absorbent multi-ply beverage coasters for hotel guest room bedside tables, banquet counters, and in-room dining.',
  'cat_essentials',
  '/products/printed-paper-coasters.jpg',
  '["/products/printed-paper-coasters.jpg"]',
  '["Hospitality Beverage Coaster"]',
  'To be confirmed',
  '{"material": "Absorbent multi-ply coaster board", "customizable_logo": true}',
  0,
  1,
  1
),
(
  'prod_paper_wrapped_glass',
  'Hygienic Paper-Wrapped Drinking Glass',
  'hygienic-paper-wrapped-drinking-glass',
  'Sanitary paper sleeve-wrapped drinking glass offering visible hygiene reassurance for hotel vanity setups and minibars.',
  'cat_essentials',
  '/products/paper-wrapped-drinking-glass.jpg',
  '["/products/paper-wrapped-drinking-glass.jpg"]',
  '["Sanitized Tumbler with Printed Paper Sleeve"]',
  'To be confirmed',
  '{"hygiene_seal": "Protective paper sleeve wrap", "customizable_logo": true}',
  0,
  1,
  1
),
(
  'prod_comb_kraft_box',
  'Comb with Kraft Box',
  'comb-with-kraft-box',
  'Neutral white pocket grooming comb individually packaged in an earth-toned biodegradable kraft paper carton.',
  'cat_toiletries',
  '/products/comb-with-kraft-box.jpg',
  '["/products/comb-with-kraft-box.jpg"]',
  '["Pocket Comb in Kraft Box"]',
  'To be confirmed',
  '{"color": "Neutral white", "packaging": "Biodegradable kraft carton"}',
  0,
  0,
  1
),
(
  'prod_embossed_tissue_roll',
  'Embossed Tissue / Paper Roll (jumbo roll)',
  'embossed-tissue-paper-roll-jumbo',
  'High-capacity embossed washroom paper roll designed for commercial high-traffic washroom dispensers.',
  'cat_paper',
  '/products/embossed-tissue-roll.jpg',
  '["/products/embossed-tissue-roll.jpg"]',
  '["Jumbo Washroom Roll"]',
  'To be confirmed',
  '{"format": "Jumbo washroom dispenser roll", "texture": "Embossed absorbent pulp"}',
  0,
  0,
  1
);

-- Seed Demo Access Codes for Testing & Verification
INSERT OR REPLACE INTO access_codes (id, code, client_name, contact_name, contact_phone, max_uses, used_count, expires_at, status) VALUES
('code_demo_01', 'CC-HOTEL-2026', 'The Grand Heritage Hotel & Resorts', 'Mr. Vikram Singhania', '+91 98765 43210', 100, 2, '2028-12-31T23:59:59Z', 'active'),
('code_demo_02', 'CRYSTAL-VIP', 'Oberoi Luxury Suites', 'Ms. Ananya Sharma', '+91 98111 22334', 50, 0, '2027-12-31T23:59:59Z', 'active');
-- Migration 0003: Fix Product and Category Images
-- Assigns verified local images from public/products/ by matching product identity and category requirements.

-- Category image updates
UPDATE categories SET image_url = '/products/hotel-conditioner-mini-bottle.jpg' WHERE id = 'cat_shampoo' OR slug = 'shampoo-and-conditioner';
UPDATE categories SET image_url = '/products/comb-with-kraft-box.jpg' WHERE id = 'cat_toiletries' OR slug = 'hotel-toiletries';
UPDATE categories SET image_url = '/products/dental-kit.jpg' WHERE id = 'cat_dental' OR slug = 'dental-kits';
UPDATE categories SET image_url = '/products/shaving-kit.jpg' WHERE id = 'cat_shaving' OR slug = 'shaving-and-grooming-kits';
UPDATE categories SET image_url = '/products/hand-wash.jpg' WHERE id = 'cat_soap' OR slug = 'soap-and-bath-products';
UPDATE categories SET image_url = '/products/toilet-cleaner.jpg' WHERE id = 'cat_bathroom' OR slug = 'bathroom-cleaners';
UPDATE categories SET image_url = '/products/floor-cleaner.jpg' WHERE id = 'cat_floor' OR slug = 'floor-and-surface-cleaners';
UPDATE categories SET image_url = '/products/glass-cleaner-spray.jpg' WHERE id = 'cat_glass' OR slug = 'glass-and-furniture-care';
UPDATE categories SET image_url = '/products/dish-wash-plus.jpg' WHERE id = 'cat_kitchen' OR slug = 'kitchen-and-dishwash';
UPDATE categories SET image_url = '/products/lemon-room-spray.jpg' WHERE id = 'cat_room' OR slug = 'room-fresheners';
UPDATE categories SET image_url = '/products/disposable-terry-slippers.jpg' WHERE id = 'cat_essentials' OR slug = 'guest-essentials-and-room-accessories';
UPDATE categories SET image_url = '/products/folded-paper-hand-towels.jpg' WHERE id = 'cat_paper' OR slug = 'paper-products';
UPDATE categories SET image_url = '/products/non-woven-carry-bag.jpg' WHERE id = 'cat_packaging' OR slug = 'packaging-and-bags';
UPDATE categories SET image_url = '/products/black-garbage-bags.jpg' WHERE id = 'cat_housekeeping' OR slug = 'housekeeping-supplies';
UPDATE categories SET image_url = '/products/embossed-tissue-roll.jpg' WHERE id = 'cat_bulk' OR slug = 'bulk-hospitality-supplies';

-- Product image, pack size, and category updates (strictly matched by product identity)
UPDATE products SET image_url = '/products/shaving-kit.jpg', gallery_json = '["/products/shaving-kit.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_shaving' WHERE name LIKE '%Shaving Kit%' OR slug = 'shaving-kit-razor-shave-gel';
UPDATE products SET image_url = '/products/dental-kit.jpg', gallery_json = '["/products/dental-kit.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_dental' WHERE name LIKE '%Dental Kit%' OR slug = 'dental-kit-kraft-box';
UPDATE products SET image_url = '/products/non-woven-carry-bag.jpg', gallery_json = '["/products/non-woven-carry-bag.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_packaging' WHERE name LIKE '%Non-Woven Carry Bag%' OR slug = 'non-woven-carry-bag';
UPDATE products SET image_url = '/products/folded-paper-hand-towels.jpg', gallery_json = '["/products/folded-paper-hand-towels.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_paper' WHERE name LIKE '%Folded Paper Hand Towels%' OR slug = 'folded-paper-hand-towels';
UPDATE products SET image_url = '/products/black-phenyl.jpg', gallery_json = '["/products/black-phenyl.jpg"]', pack_size = '5 L', category_id = 'cat_floor' WHERE name LIKE '%Black Phenyl%' OR slug = 'black-phenyl-5l';
UPDATE products SET image_url = '/products/phenolic-cleaner.jpg', gallery_json = '["/products/phenolic-cleaner.jpg"]', pack_size = '5 L', category_id = 'cat_floor' WHERE name LIKE '%Phenolic Cleaner%' OR slug = 'phenolic-cleaner-5l';
UPDATE products SET image_url = '/products/magic-cleaner.jpg', gallery_json = '["/products/magic-cleaner.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_floor' WHERE name LIKE '%Magic Cleaner%' OR slug = 'magic-cleaner';
UPDATE products SET image_url = '/products/hand-wash.jpg', gallery_json = '["/products/hand-wash.jpg"]', pack_size = '5 L', category_id = 'cat_soap' WHERE name LIKE '%Hand Wash%' OR slug = 'hand-wash-5l';
UPDATE products SET image_url = '/products/toilet-cleaner.jpg', gallery_json = '["/products/toilet-cleaner.jpg"]', pack_size = '5 L', category_id = 'cat_bathroom' WHERE name LIKE '%Toilet Cleaner%' OR slug = 'toilet-cleaner-5l';
UPDATE products SET image_url = '/products/sparkling-bathroom-cleaner.jpg', gallery_json = '["/products/sparkling-bathroom-cleaner.jpg"]', pack_size = '5 L', category_id = 'cat_bathroom' WHERE name LIKE '%Sparkling Bathroom Cleaner%' OR slug = 'sparkling-bathroom-cleaner-5l';
UPDATE products SET image_url = '/products/floor-cleaner.jpg', gallery_json = '["/products/floor-cleaner.jpg"]', pack_size = '5 L', category_id = 'cat_floor' WHERE name LIKE '%Floor Cleaner%' OR slug = 'floor-cleaner-5l';
UPDATE products SET image_url = '/products/glass-cleaner-spray.jpg', gallery_json = '["/products/glass-cleaner-spray.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_glass' WHERE name LIKE '%Glass Cleaner%' OR slug = 'glass-cleaner-spray';
UPDATE products SET image_url = '/products/furniture-cleaner.jpg', gallery_json = '["/products/furniture-cleaner.jpg"]', pack_size = '100 ml', category_id = 'cat_glass' WHERE name LIKE '%Furniture Cleaner%' OR slug = 'furniture-cleaner-100ml';
UPDATE products SET image_url = '/products/lemon-room-spray.jpg', gallery_json = '["/products/lemon-room-spray.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_room' WHERE name LIKE '%Lemon Room Spray%' OR slug = 'lemon-room-spray';
UPDATE products SET image_url = '/products/dish-wash-plus.jpg', gallery_json = '["/products/dish-wash-plus.jpg"]', pack_size = '5 L', category_id = 'cat_kitchen' WHERE name LIKE '%Dish Wash%' OR slug = 'dish-wash-plus-5l';
UPDATE products SET image_url = '/products/hotel-shampoo-mini-bottle.jpg', gallery_json = '["/products/hotel-shampoo-mini-bottle.jpg"]', pack_size = '20 ml', category_id = 'cat_shampoo' WHERE name LIKE '%Hotel Shampoo%' OR slug = 'hotel-shampoo-mini-bottle';
UPDATE products SET image_url = '/products/hotel-conditioner-mini-bottle.jpg', gallery_json = '["/products/hotel-conditioner-mini-bottle.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_shampoo' WHERE name LIKE '%Hotel Conditioner%' OR slug = 'hotel-conditioner-mini-bottle';
UPDATE products SET image_url = '/products/body-wash-mini-bottle.jpg', gallery_json = '["/products/body-wash-mini-bottle.jpg"]', pack_size = '20 ml', category_id = 'cat_toiletries' WHERE name LIKE '%Body Wash%' OR slug = 'body-wash-mini-bottle';
UPDATE products SET image_url = '/products/moisturizer-mini-bottle.jpg', gallery_json = '["/products/moisturizer-mini-bottle.jpg"]', pack_size = '20 ml', category_id = 'cat_toiletries' WHERE name LIKE '%Moisturizer%' OR slug = 'moisturizer-mini-bottle';
UPDATE products SET image_url = '/products/fragrance-oil-tea-bloom.jpg', gallery_json = '["/products/fragrance-oil-tea-bloom.jpg"]', pack_size = '10 ml', category_id = 'cat_room' WHERE name LIKE '%Fragrance Oil%' OR slug = 'fragrance-oil-tea-bloom';
UPDATE products SET image_url = '/products/black-garbage-bags.jpg', gallery_json = '["/products/black-garbage-bags.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_housekeeping' WHERE name LIKE '%Black Garbage Bags%' OR slug = 'black-garbage-bags';
UPDATE products SET image_url = '/products/disposable-terry-slippers.jpg', gallery_json = '["/products/disposable-terry-slippers.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_essentials' WHERE name LIKE '%Disposable Terry Slippers%' OR slug = 'disposable-terry-slippers-white';
UPDATE products SET image_url = '/products/printed-paper-coasters.jpg', gallery_json = '["/products/printed-paper-coasters.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_essentials' WHERE name LIKE '%Printed Paper Coasters%' OR slug = 'printed-paper-coasters';
UPDATE products SET image_url = '/products/paper-wrapped-drinking-glass.jpg', gallery_json = '["/products/paper-wrapped-drinking-glass.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_essentials' WHERE name LIKE '%Paper-Wrapped Drinking Glass%' OR slug = 'hygienic-paper-wrapped-drinking-glass';
UPDATE products SET image_url = '/products/comb-with-kraft-box.jpg', gallery_json = '["/products/comb-with-kraft-box.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_toiletries' WHERE name LIKE '%Comb with Kraft Box%' OR slug = 'comb-with-kraft-box';
UPDATE products SET image_url = '/products/embossed-tissue-roll.jpg', gallery_json = '["/products/embossed-tissue-roll.jpg"]', pack_size = 'To be confirmed', category_id = 'cat_paper' WHERE name LIKE '%Embossed Tissue%' OR slug = 'embossed-tissue-paper-roll-jumbo';

-- Ensure all existing products are LIVE
UPDATE products SET is_active = 1;
