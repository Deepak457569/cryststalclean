-- Seed Data for CrystalClean Hotel Amenities
-- No prices, purely product specs, categories, packaging units, and initial settings

INSERT OR IGNORE INTO business_settings (key, value) VALUES 
('whatsapp_number', '919149953610'),
('business_name', 'CrystalClean Hotel Amenities'),
('contact_email', 'orders@crystalclean.in'),
('contact_phone', '+91 91499 53610'),
('address', 'Hospitality Business District, Sector 18, Gurugram, HR & New Delhi'),
('admin_allowlist', 'admin@crystalclean.in,owner@crystalclean.in');

-- Categories
INSERT OR IGNORE INTO categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
('cat_toiletries', 'Hotel Toiletries', 'hotel-toiletries', 'Signature luxury body wash, rich moisturizing lotions, and hotel bathroom sets tailored for high-end hospitality.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', 1, 1),
('cat_shampoo', 'Shampoo and Conditioner', 'shampoo-and-conditioner', 'Botanical infusions, paraben-free shampoos, and deep conditioning salon blends formulated for guest hair wellness.', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80', 2, 1),
('cat_soap', 'Soap and Bath Products', 'soap-and-bath-products', 'French-milled luxury vegetable soaps, glycerin bath bars, and relaxing aromatic bath crystals.', 'https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80', 3, 1),
('cat_dental', 'Dental Kits', 'dental-kits', 'Biodegradable bamboo toothbrushes, ergonomic soft bristles, and premium mint gel toothpaste travel kits.', 'https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80', 4, 1),
('cat_shaving', 'Shaving and Grooming Kits', 'shaving-and-grooming-kits', 'Precision dual and triple blade razors, organic aloe vera shaving creams, and boxed grooming vanity sets.', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', 5, 1),
('cat_essentials', 'Guest Essentials', 'guest-essentials', 'Plush coral velvet hotel slippers, satin eye masks, shoe shine cloths, and sewing vanity packets.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 6, 1),
('cat_accessories', 'Room Accessories', 'room-accessories', 'Handcrafted resin amenity trays, coaster sets, leatherette hospitality folders, and branded luggage racks.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 7, 1),
('cat_bulk', 'Bulk Hospitality Supplies', 'bulk-hospitality-supplies', '5-Litre institutional gallon refills, bulk dispenser stations, and high-volume eco pump dispensers.', 'https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80', 8, 1);

-- Luxury Products (Zero pricing, comprehensive B2B specifications)
INSERT OR IGNORE INTO products (id, name, slug, description, category_id, image_url, gallery_json, variants_json, pack_size, specs_json, is_featured, is_active) VALUES
(
  'prod_argan_shampoo',
  'Signature Moroccan Argan Oil Shampoo',
  'moroccan-argan-oil-shampoo',
  'Ultra-nourishing botanical hotel shampoo infused with pure Moroccan Argan Oil and Vitamin E. Formulated specifically to leave guest hair silky, manageable, and gently fragranced with Mediterranean citrus notes.',
  'cat_shampoo',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"]',
  '["30 ml Frosted Bottle", "50 ml Luxury Tube", "100 ml Pump Dispenser"]',
  'Case of 200 Units',
  '{"fragrance": "Mediterranean Bergamot & Amber", "packaging": "Recyclable PET bottle with matte gold cap", "paraben_free": "Yes", "suitable_for": "All Hair Types"}',
  1,
  1
),
(
  'prod_silk_conditioner',
  'Silk Protein Hydrating Conditioner',
  'silk-protein-hydrating-conditioner',
  'Deeply hydrating hotel conditioner formulated with hydrolyzed silk proteins and sweet almond extract. Restores moisture balance and detangles effortlessly after swimming or travel.',
  'cat_shampoo',
  'https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80"]',
  '["30 ml Frosted Bottle", "50 ml Luxury Tube", "100 ml Pump Dispenser"]',
  'Case of 200 Units',
  '{"fragrance": "White Tea & Thyme", "packaging": "Biodegradable Wheat Straw / PCR Plastic", "dermatologist_tested": "Yes"}',
  1,
  1
),
(
  'prod_botanical_bodywash',
  'Botanical Green Tea & Aloe Body Wash',
  'botanical-green-tea-aloe-body-wash',
  'Invigorating hotel body wash enriched with antioxidant-rich green tea extract and organic aloe vera juice. Produces a lush, creamy lather that leaves skin refreshed and hydrated.',
  'cat_toiletries',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"]',
  '["30 ml Recycled Bottle", "50 ml Aluminum Cap Bottle", "300 ml Wall Dispenser"]',
  'Case of 250 Units',
  '{"fragrance": "Green Tea & Lemongrass", "ph_balanced": "5.5 Balanced", "sulfate_free": "Yes"}',
  1,
  1
),
(
  'prod_luxury_lotion',
  'Velvet Touch Shea Butter Body Lotion',
  'velvet-touch-shea-butter-body-lotion',
  'Fast-absorbing luxury body lotion with African unrefined shea butter, jojoba oil, and soothing chamomile. Provides 24-hour hydration without greasy residue.',
  'cat_toiletries',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"]',
  '["30 ml Tube", "50 ml Soft-Squeeze Bottle", "300 ml Hotel Wall Pump"]',
  'Case of 250 Units',
  '{"fragrance": "Warm Vanilla & Sandalwood", "texture": "Lightweight Cream", "cruelty_free": "Yes"}',
  1,
  1
),
(
  'prod_glycerin_soap',
  'Amber Honey Glycerin Bath Bar',
  'amber-honey-glycerin-bath-bar',
  'Translucent vegetable glycerin bath soap bar infused with raw honey and botanical extracts. Ultra-gentle on sensitive skin and packaged in moisture-barrier gold foil or recycled kraft box.',
  'cat_soap',
  'https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80"]',
  '["20g Guest Size (Pleat Wrap)", "35g Square Bar (Kraft Box)", "50g Luxury Embossed Bar"]',
  'Carton of 500 Pieces',
  '{"fragrance": "Wild Honey & Blossom", "packaging": "Eco Pleat Wrap / Embossed Box", "weight_options": "20g / 35g / 50g"}',
  1,
  1
),
(
  'prod_milled_soap',
  'Triple-Milled French Luxury Soap',
  'triple-milled-french-luxury-soap',
  'Dense, long-lasting triple-milled white soap with nourishing olive oil and coconut butter. Does not soften or crack in damp hotel bathrooms.',
  'cat_soap',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"]',
  '["25g Flow Pack", "40g Premium Hard Box"]',
  'Carton of 400 Pieces',
  '{"process": "French Triple Milled", "fragrance": "Lavender & White Musk"}',
  0,
  1
),
(
  'prod_bamboo_dental',
  'Eco Bamboo Dental Care Kit',
  'eco-bamboo-dental-care-kit',
  'Sustainably harvested biodegradable bamboo handle toothbrush with Dupont soft charcoal-infused bristles. Comes paired with a 15g herbal mint gel toothpaste in an eco kraft paper carton.',
  'cat_dental',
  'https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80"]',
  '["Standard Bamboo Kit", "Premium Embossed Hotel Edition"]',
  'Box of 200 Kits',
  '{"bristles": "Soft Dupont Charcoal", "handle": "100% Biodegradable Moso Bamboo", "toothpaste": "15g Herbal Gel"}',
  1,
  1
),
(
  'prod_shaving_kit',
  'Ergonomic Shaving & Grooming Kit',
  'ergonomic-shaving-grooming-kit',
  'Double-blade precision swivel razor with lubricating aloe strip, paired with a 20ml soothing shaving foam tube in waterproof luxury packaging.',
  'cat_shaving',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"]',
  '["Twin Blade Kit", "Triple Blade Heavyweight Kit"]',
  'Box of 200 Kits',
  '{"razor": "Ergonomic Rubber Grip Handle", "cream": "20ml Aloe & Menthol Cream"}',
  0,
  1
),
(
  'prod_hotel_slippers',
  'Plush Closed-Toe Hotel Velvet Slippers',
  'plush-closed-toe-hotel-velvet-slippers',
  'High-density 5mm anti-skid EVA sole with ultra-soft coral fleece upper. Designed for 4-star and 5-star guest room comfort with customizable hotel crest embroidery option.',
  'cat_essentials',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"]',
  '["Standard Unisex (28 cm)", "Extra Comfort Luxury Thick Sole (30 cm)"]',
  'Carton of 100 Pairs',
  '{"sole": "5mm Waterproof Textured EVA", "material": "High Density Coral Fleece", "packaging": "Biodegradable Poly / Fabric Pouch"}',
  1,
  1
),
(
  'prod_resin_tray',
  'Luxury Resin & Stone Amenity Tray',
  'luxury-resin-stone-amenity-tray',
  'Contemporary matte black resin bathroom vanity tray with raised splash borders. Waterproof, heat resistant, easy to sanitize, and engineered for luxury hospitality durability.',
  'cat_accessories',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"]',
  '["Rectangular (25 x 15 cm)", "Two-Tier Vanity Set"]',
  'Case of 24 Units',
  '{"finish": "Matte Onyx Black / Polished White Marble Finish", "washable": "100% Water & Chemical Resistant"}',
  0,
  1
),
(
  'prod_bulk_shampoo_refill',
  '5-Litre Gallon Commercial Shampoo Refill',
  '5-litre-gallon-commercial-shampoo-refill',
  'High-capacity institutional 5-litre refill container for eco-friendly wall-mounted guest dispensers. Cost-effective, eliminates single-use plastics, and delivers a consistent 5-star hair care experience.',
  'cat_bulk',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
  '["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"]',
  '["5 Litre Can", "Case of 4 x 5 Litre Cans (20L total)"]',
  '5 Litre Can / Case of 4',
  '{"viscosity": "Dispenser Optimized", "fragrance": "Signature Citrus Blossom", "dilution": "Ready to Use"}',
  1,
  1
);

-- Seed Demo Access Code for Testing & Verification
INSERT OR IGNORE INTO access_codes (id, code, client_name, contact_name, contact_phone, max_uses, used_count, expires_at, status) VALUES
('code_demo_01', 'CC-HOTEL-2026', 'The Grand Heritage Hotel & Resorts', 'Mr. Vikram Singhania', '+91 98765 43210', 100, 2, '2028-12-31T23:59:59Z', 'active'),
('code_demo_02', 'CRYSTAL-VIP', 'Oberoi Luxury Suites', 'Ms. Ananya Sharma', '+91 98111 22334', 50, 0, '2027-12-31T23:59:59Z', 'active');
