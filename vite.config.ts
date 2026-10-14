import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// In-Memory Dev API Server for seamless local Vite development
function devApiPlugin(): Plugin {
  // Initial dev state mirrors D1 seed data
  let categories = [
    {
      id: 'cat_shampoo',
      name: 'Shampoo and Conditioner',
      slug: 'shampoo-and-conditioner',
      description: 'Guest hair care amenities, conditioning blends, and refillable mini bottles for luxury hospitality.',
      image_url: '/products/hotel-conditioner-mini-bottle.jpg',
      sort_order: 1,
      is_active: 1
    },
    {
      id: 'cat_toiletries',
      name: 'Hotel Toiletries',
      slug: 'hotel-toiletries',
      description: 'Individual mini guest amenities including body washes, nourishing lotions, and vanity accessories.',
      image_url: '/products/comb-with-kraft-box.jpg',
      sort_order: 2,
      is_active: 1
    },
    {
      id: 'cat_dental',
      name: 'Dental Kits',
      slug: 'dental-kits',
      description: 'Hygienic dental care travel sets in eco-friendly kraft packaging with soft-bristle brushes.',
      image_url: '/products/dental-kit.jpg',
      sort_order: 3,
      is_active: 1
    },
    {
      id: 'cat_shaving',
      name: 'Shaving and Grooming Kits',
      slug: 'shaving-and-grooming-kits',
      description: 'Single and twin blade guest razors paired with soothing shaving sachets in water-resistant sleeves.',
      image_url: '/products/shaving-kit.jpg',
      sort_order: 4,
      is_active: 1
    },
    {
      id: 'cat_soap',
      name: 'Soap and Bath Products',
      slug: 'soap-and-bath-products',
      description: 'Gentle guest bath soaps, vegetable glycerin bars, and liquid hand wash bulk refills.',
      image_url: '/products/hand-wash.jpg',
      sort_order: 5,
      is_active: 1
    },
    {
      id: 'cat_bathroom',
      name: 'Bathroom Cleaners',
      slug: 'bathroom-cleaners',
      description: 'Institutional descalers, toilet bowl disinfectants, and sanitary ware surface cleaners.',
      image_url: '/products/toilet-cleaner.jpg',
      sort_order: 6,
      is_active: 1
    },
    {
      id: 'cat_floor',
      name: 'Floor and Surface Cleaners',
      slug: 'floor-and-surface-cleaners',
      description: 'High-performance commercial floor disinfectants, phenolic cleaners, and black phenyl concentrates.',
      image_url: '/products/floor-cleaner.jpg',
      sort_order: 7,
      is_active: 1
    },
    {
      id: 'cat_glass',
      name: 'Glass and Furniture Care',
      slug: 'glass-and-furniture-care',
      description: 'Streak-free window and mirror sprays, wood polish, and laminate surface cleaners.',
      image_url: '/products/glass-cleaner-spray.jpg',
      sort_order: 8,
      is_active: 1
    },
    {
      id: 'cat_kitchen',
      name: 'Kitchen and Dishwash',
      slug: 'kitchen-and-dishwash',
      description: 'Commercial dishwashing concentrates and food-safe grease-cutting kitchen formulations.',
      image_url: '/products/dish-wash-plus.jpg',
      sort_order: 9,
      is_active: 1
    },
    {
      id: 'cat_room',
      name: 'Room Fresheners',
      slug: 'room-fresheners',
      description: 'Ambient room freshener sprays, floral mists, and long-lasting diffuser fragrance oils.',
      image_url: '/products/lemon-room-spray.jpg',
      sort_order: 10,
      is_active: 1
    },
    {
      id: 'cat_essentials',
      name: 'Guest Essentials and Room Accessories',
      slug: 'guest-essentials-and-room-accessories',
      description: 'Disposable hotel slippers, absorbent paper coasters, and hygienic drinking glass wraps.',
      image_url: '/products/disposable-terry-slippers.jpg',
      sort_order: 11,
      is_active: 1
    },
    {
      id: 'cat_paper',
      name: 'Paper Products',
      slug: 'paper-products',
      description: 'Embossed washroom tissue jumbo rolls and interleaved folded paper hand towels.',
      image_url: '/products/folded-paper-hand-towels.jpg',
      sort_order: 12,
      is_active: 1
    },
    {
      id: 'cat_packaging',
      name: 'Packaging and Bags',
      slug: 'packaging-and-bags',
      description: 'Customizable non-woven carry bags and retail packaging for hospitality groups.',
      image_url: '/products/non-woven-carry-bag.jpg',
      sort_order: 13,
      is_active: 1
    },
    {
      id: 'cat_housekeeping',
      name: 'Housekeeping Supplies',
      slug: 'housekeeping-supplies',
      description: 'Commercial garbage bags, heavy-duty bin liners, and housekeeping utility supplies.',
      image_url: '/products/black-garbage-bags.jpg',
      sort_order: 14,
      is_active: 1
    },
    {
      id: 'cat_bulk',
      name: 'Bulk Hospitality Supplies',
      slug: 'bulk-hospitality-supplies',
      description: '5-Litre institutional gallon containers and bulk dispenser supply solutions.',
      image_url: '/products/embossed-tissue-roll.jpg',
      sort_order: 15,
      is_active: 1
    }
  ];

  let products = [
    {
      id: 'prod_shaving_kit',
      name: 'Shaving Kit (razor and shave gel sachet)',
      slug: 'shaving-kit-razor-shave-gel',
      description: 'Compact guest shaving set featuring a razor paired with a soothing shaving gel sachet for single-use hospitality vanity kits.',
      category_id: 'cat_shaving',
      category_name: 'Shaving and Grooming Kits',
      image_url: '/products/shaving-kit.jpg',
      gallery_json: JSON.stringify(['/products/shaving-kit.jpg']),
      variants_json: JSON.stringify(['Twin-Blade Razor & Shave Gel Sachet']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ components: 'Razor with lubricating strip, Shaving gel sachet', packaging: 'Sealed moisture-resistant sleeve' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_dental_kit',
      name: 'Dental Kit (kraft box, toothbrush, toothpaste)',
      slug: 'dental-kit-kraft-box',
      description: 'Complete guest dental kit containing an individually sleeved toothbrush and travel-size mint toothpaste enclosed in an eco-friendly kraft carton.',
      category_id: 'cat_dental',
      category_name: 'Dental Kits',
      image_url: '/products/dental-kit.jpg',
      gallery_json: JSON.stringify(['/products/dental-kit.jpg']),
      variants_json: JSON.stringify(['Toothbrush & Toothpaste in Kraft Box']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ components: 'Soft bristle toothbrush, Toothpaste tube', packaging: 'Recycled kraft paper carton' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_non_woven_bag',
      name: 'Non-Woven Carry Bag',
      slug: 'non-woven-carry-bag',
      description: 'Durable non-woven fabric shopping and laundry carry bag with reinforced handles, designed for hotel guest amenities and retail packaging.',
      category_id: 'cat_packaging',
      category_name: 'Packaging and Bags',
      image_url: '/products/non-woven-carry-bag.jpg',
      gallery_json: JSON.stringify(['/products/non-woven-carry-bag.jpg']),
      variants_json: JSON.stringify(['12" x 18" x 6" (D-Cut / Loop Handle)']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ dimensions: '12" x 18" x 6"', material: 'Non-Woven Polypropylene', customizable_logo: true }),
      is_featured: 0,
      is_customizable: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_folded_paper_towels',
      name: 'Folded Paper Hand Towels',
      slug: 'folded-paper-hand-towels',
      description: 'Absorbent interleaved folded paper towels for washroom and housekeeping dispensers, offering clean one-at-a-time towel dispensing.',
      category_id: 'cat_paper',
      category_name: 'Paper Products',
      image_url: '/products/folded-paper-hand-towels.jpg',
      gallery_json: JSON.stringify(['/products/folded-paper-hand-towels.jpg']),
      variants_json: JSON.stringify(['M-Fold / V-Fold Interleaved Paper Towels']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ fold_type: 'Interleaved M-Fold', material: 'Virgin / recycled pulp blend' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_black_phenyl',
      name: 'Black Phenyl',
      slug: 'black-phenyl-5l',
      description: 'Heavy-duty institutional black disinfectant phenyl formulated for deep floor sanitization and odor control in commercial facilities.',
      category_id: 'cat_floor',
      category_name: 'Floor and Surface Cleaners',
      image_url: '/products/black-phenyl.jpg',
      gallery_json: JSON.stringify(['/products/black-phenyl.jpg']),
      variants_json: JSON.stringify(['5 Litre Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', formulation: 'Commercial grade disinfectant fluid', dilution: 'Water soluble emulsion' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_phenolic_cleaner',
      name: 'Phenolic Cleaner',
      slug: 'phenolic-cleaner-5l',
      description: 'Commercial-grade phenolic floor cleaner and surface deodorizer packaged in an institutional 5-litre container.',
      category_id: 'cat_floor',
      category_name: 'Floor and Surface Cleaners',
      image_url: '/products/phenolic-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/phenolic-cleaner.jpg']),
      variants_json: JSON.stringify(['5 Litre Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', surface_application: 'Ceramic, mosaic, concrete and marble floors' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_magic_cleaner',
      name: 'Magic Cleaner',
      slug: 'magic-cleaner',
      description: 'Multi-purpose concentrated surface cleaning liquid engineered for tough stains and routine housekeeping maintenance.',
      category_id: 'cat_floor',
      category_name: 'Floor and Surface Cleaners',
      image_url: '/products/magic-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/magic-cleaner.jpg']),
      variants_json: JSON.stringify(['Concentrated Surface Formulation']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ application: 'Hard surfaces, counters, tiles, and fixtures' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_hand_wash',
      name: 'Hand Wash',
      slug: 'hand-wash-5l',
      description: 'Gentle moisturizing liquid hand wash refill formulated for high-traffic hotel and restaurant washroom dispensers.',
      category_id: 'cat_soap',
      category_name: 'Soap and Bath Products',
      image_url: '/products/hand-wash.jpg',
      gallery_json: JSON.stringify(['/products/hand-wash.jpg']),
      variants_json: JSON.stringify(['5 Litre Refill Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', skin_feel: 'Moisturizing lather, dispenser compatible' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_toilet_cleaner',
      name: 'Toilet Cleaner',
      slug: 'toilet-cleaner-5l',
      description: 'Institutional-strength toilet and urinal bowl cleaner with a thick clinging formula that dissolves limescale and mineral deposits.',
      category_id: 'cat_bathroom',
      category_name: 'Bathroom Cleaners',
      image_url: '/products/toilet-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/toilet-cleaner.jpg']),
      variants_json: JSON.stringify(['5 Litre Institutional Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', viscosity: 'Thick clinging formula for angled rims' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_sparkling_bathroom_cleaner',
      name: 'Sparkling Bathroom Cleaner',
      slug: 'sparkling-bathroom-cleaner-5l',
      description: 'Comprehensive bathroom and tile cleaner designed to remove soap scum, hard water stains, and grime from bathroom fixtures.',
      category_id: 'cat_bathroom',
      category_name: 'Bathroom Cleaners',
      image_url: '/products/sparkling-bathroom-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/sparkling-bathroom-cleaner.jpg']),
      variants_json: JSON.stringify(['5 Litre Container']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', surfaces: 'Glazed tiles, basins, tubs, taps, shower partitions' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_floor_cleaner',
      name: 'Floor Cleaner',
      slug: 'floor-cleaner-5l',
      description: 'Daily maintenance floor cleaner concentrate delivering a fresh scent and clean finish on guest room and lobby floors.',
      category_id: 'cat_floor',
      category_name: 'Floor and Surface Cleaners',
      image_url: '/products/floor-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/floor-cleaner.jpg']),
      variants_json: JSON.stringify(['5 Litre Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', residue: 'No sticky film, quick drying formula' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_glass_cleaner',
      name: 'Glass Cleaner (spray)',
      slug: 'glass-cleaner-spray',
      description: 'Fast-evaporating glass and window cleaner spray providing streak-free clarity on mirrors, glass partitions, and display cases.',
      category_id: 'cat_glass',
      category_name: 'Glass and Furniture Care',
      image_url: '/products/glass-cleaner-spray.jpg',
      gallery_json: JSON.stringify(['/products/glass-cleaner-spray.jpg']),
      variants_json: JSON.stringify(['Trigger Spray Bottle']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ finish: 'Streak-free shine', safe_on: 'Mirrors, windshields, glass fixtures' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_furniture_cleaner',
      name: 'Furniture Cleaner',
      slug: 'furniture-cleaner-100ml',
      description: 'Conditioning spray polish for treated wood, veneer, leatherette, and laminated furniture surfaces in hotel guest rooms.',
      category_id: 'cat_glass',
      category_name: 'Glass and Furniture Care',
      image_url: '/products/furniture-cleaner.jpg',
      gallery_json: JSON.stringify(['/products/furniture-cleaner.jpg']),
      variants_json: JSON.stringify(['100 ml Bottle']),
      pack_size: '100 ml',
      specs_json: JSON.stringify({ volume: '100 ml', application: 'Polished wood, veneer, laminate surfaces' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_lemon_room_spray',
      name: 'Lemon Room Spray',
      slug: 'lemon-room-spray',
      description: 'Invigorating lemon citrus room spray for quick turnaround housekeeping and guest room atmosphere refreshment.',
      category_id: 'cat_room',
      category_name: 'Room Fresheners',
      image_url: '/products/lemon-room-spray.jpg',
      gallery_json: JSON.stringify(['/products/lemon-room-spray.jpg']),
      variants_json: JSON.stringify(['Aerosol / Trigger Room Mist']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ scent: 'Lemon Zest', format: 'Spray Mist' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_dish_wash',
      name: 'Dish Wash+',
      slug: 'dish-wash-plus-5l',
      description: 'Institutional grease-cutting liquid dishwash concentrate for banquet kitchens, room service pantry, and restaurant cutlery.',
      category_id: 'cat_kitchen',
      category_name: 'Kitchen and Dishwash',
      image_url: '/products/dish-wash-plus.jpg',
      gallery_json: JSON.stringify(['/products/dish-wash-plus.jpg']),
      variants_json: JSON.stringify(['5 Litre Refill Can']),
      pack_size: '5 L',
      specs_json: JSON.stringify({ volume: '5 L', rinse_profile: 'Fast grease-stripping with clean water rinse' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_hotel_shampoo',
      name: 'Hotel Shampoo (mini bottle)',
      slug: 'hotel-shampoo-mini-bottle',
      description: 'Refreshing hotel guest shampoo formulated for daily hair washing, packaged in a compact 20 ml travel amenity bottle.',
      category_id: 'cat_shampoo',
      category_name: 'Shampoo and Conditioner',
      image_url: '/products/hotel-shampoo-mini-bottle.jpg',
      gallery_json: JSON.stringify(['/products/hotel-shampoo-mini-bottle.jpg']),
      variants_json: JSON.stringify(['20 ml Mini Bottle']),
      pack_size: '20 ml',
      specs_json: JSON.stringify({ volume: '20 ml', cap: 'Ribbed screw cap', customizable_logo: false }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_hotel_conditioner',
      name: 'Hotel Conditioner (mini bottle)',
      slug: 'hotel-conditioner-mini-bottle',
      description: 'Lightweight nourishing guest conditioner that softens and detangles hair, packaged in a minimalist hotel amenity bottle.',
      category_id: 'cat_shampoo',
      category_name: 'Shampoo and Conditioner',
      image_url: '/products/hotel-conditioner-mini-bottle.jpg',
      gallery_json: JSON.stringify(['/products/hotel-conditioner-mini-bottle.jpg']),
      variants_json: JSON.stringify(['Mini Hospitality Bottle']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ packaging: 'Squeeze amenity bottle', customizable_logo: false }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_body_wash',
      name: 'Body Wash (mini bottle)',
      slug: 'body-wash-mini-bottle',
      description: 'Invigorating aquatic body wash for guest bathrooms, packaged in a single-stay 20 ml hospitality bottle.',
      category_id: 'cat_toiletries',
      category_name: 'Hotel Toiletries',
      image_url: '/products/body-wash-mini-bottle.jpg',
      gallery_json: JSON.stringify(['/products/body-wash-mini-bottle.jpg']),
      variants_json: JSON.stringify(['20 ml Mini Bottle']),
      pack_size: '20 ml',
      specs_json: JSON.stringify({ volume: '20 ml', lather: 'Rich cleansing foam', customizable_logo: false }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_moisturizer',
      name: 'Moisturizer (mini bottle)',
      slug: 'moisturizer-mini-bottle',
      description: 'Smooth hydrating body moisturizer designed to restore skin balance after travel, packaged in a 20 ml guest bottle.',
      category_id: 'cat_toiletries',
      category_name: 'Hotel Toiletries',
      image_url: '/products/moisturizer-mini-bottle.jpg',
      gallery_json: JSON.stringify(['/products/moisturizer-mini-bottle.jpg']),
      variants_json: JSON.stringify(['20 ml Mini Bottle']),
      pack_size: '20 ml',
      specs_json: JSON.stringify({ volume: '20 ml', absorption: 'Fast absorbing non-greasy lotion', customizable_logo: false }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_fragrance_oil_tea_bloom',
      name: 'Fragrance Oil, Tea Bloom (diffuser oil)',
      slug: 'fragrance-oil-tea-bloom',
      description: 'Concentrated tea bloom aroma diffuser oil in an amber bottle for hotel lobbies, elevator corridors, and guest suite diffusers.',
      category_id: 'cat_room',
      category_name: 'Room Fresheners',
      image_url: '/products/fragrance-oil-tea-bloom.jpg',
      gallery_json: JSON.stringify(['/products/fragrance-oil-tea-bloom.jpg']),
      variants_json: JSON.stringify(['10 ml Amber Dropper Bottle']),
      pack_size: '10 ml',
      specs_json: JSON.stringify({ volume: '10 ml', fragrance_profile: 'Tea Bloom floral blend', usage: 'Ultrasonic & reed diffusers' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_black_garbage_bags',
      name: 'Black Garbage Bags',
      slug: 'black-garbage-bags',
      description: 'Durable tear-resistant black waste bags for hotel guest room dustbins and housekeeping trolley collection.',
      category_id: 'cat_housekeeping',
      category_name: 'Housekeeping Supplies',
      image_url: '/products/black-garbage-bags.jpg',
      gallery_json: JSON.stringify(['/products/black-garbage-bags.jpg']),
      variants_json: JSON.stringify(['Standard Housekeeping Roll']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ material: 'High density polyethylene', color: 'Black' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_terry_slippers',
      name: 'Disposable Terry Slippers (white)',
      slug: 'disposable-terry-slippers-white',
      description: 'Unisex closed-toe white terry cloth guest room slippers with a textured anti-slip sole for hotel bedrooms and spas.',
      category_id: 'cat_essentials',
      category_name: 'Guest Essentials and Room Accessories',
      image_url: '/products/disposable-terry-slippers.jpg',
      gallery_json: JSON.stringify(['/products/disposable-terry-slippers.jpg']),
      variants_json: JSON.stringify(['Unisex Closed-Toe Terry Slipper']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ upper: 'Soft white terry cloth', sole: 'Textured anti-skid EVA', style: 'Closed toe' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_printed_paper_coasters',
      name: 'Printed Paper Coasters',
      slug: 'printed-paper-coasters',
      description: 'Absorbent multi-ply beverage coasters for hotel guest room bedside tables, banquet counters, and in-room dining.',
      category_id: 'cat_essentials',
      category_name: 'Guest Essentials and Room Accessories',
      image_url: '/products/printed-paper-coasters.jpg',
      gallery_json: JSON.stringify(['/products/printed-paper-coasters.jpg']),
      variants_json: JSON.stringify(['Hospitality Beverage Coaster']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ material: 'Absorbent multi-ply coaster board', customizable_logo: true }),
      is_featured: 0,
      is_customizable: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_paper_wrapped_glass',
      name: 'Hygienic Paper-Wrapped Drinking Glass',
      slug: 'hygienic-paper-wrapped-drinking-glass',
      description: 'Sanitary paper sleeve-wrapped drinking glass offering visible hygiene reassurance for hotel vanity setups and minibars.',
      category_id: 'cat_essentials',
      category_name: 'Guest Essentials and Room Accessories',
      image_url: '/products/paper-wrapped-drinking-glass.jpg',
      gallery_json: JSON.stringify(['/products/paper-wrapped-drinking-glass.jpg']),
      variants_json: JSON.stringify(['Sanitized Tumbler with Printed Paper Sleeve']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ hygiene_seal: 'Protective paper sleeve wrap', customizable_logo: true }),
      is_featured: 0,
      is_customizable: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_comb_kraft_box',
      name: 'Comb with Kraft Box',
      slug: 'comb-with-kraft-box',
      description: 'Neutral white pocket grooming comb individually packaged in an earth-toned biodegradable kraft paper carton.',
      category_id: 'cat_toiletries',
      category_name: 'Hotel Toiletries',
      image_url: '/products/comb-with-kraft-box.jpg',
      gallery_json: JSON.stringify(['/products/comb-with-kraft-box.jpg']),
      variants_json: JSON.stringify(['Pocket Comb in Kraft Box']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ color: 'Neutral white', packaging: 'Biodegradable kraft carton' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_embossed_tissue_roll',
      name: 'Embossed Tissue / Paper Roll (jumbo roll)',
      slug: 'embossed-tissue-paper-roll-jumbo',
      description: 'High-capacity embossed washroom paper roll designed for commercial high-traffic washroom dispensers.',
      category_id: 'cat_paper',
      category_name: 'Paper Products',
      image_url: '/products/embossed-tissue-roll.jpg',
      gallery_json: JSON.stringify(['/products/embossed-tissue-roll.jpg']),
      variants_json: JSON.stringify(['Jumbo Washroom Roll']),
      pack_size: 'To be confirmed',
      specs_json: JSON.stringify({ format: 'Jumbo washroom dispenser roll', texture: 'Embossed absorbent pulp' }),
      is_featured: 0,
      is_customizable: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  let accessCodes = [
    {
      id: 'code_demo_01',
      code: 'CC-HOTEL-2026',
      client_name: 'The Grand Heritage Hotel & Resorts',
      contact_name: 'Mr. Vikram Singhania',
      contact_phone: '+91 98765 43210',
      max_uses: 100,
      used_count: 2,
      expires_at: '2028-12-31T23:59:59Z',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'code_demo_02',
      code: 'CRYSTAL-VIP',
      client_name: 'Oberoi Luxury Suites',
      contact_name: 'Ms. Ananya Sharma',
      contact_phone: '+91 98111 22334',
      max_uses: 50,
      used_count: 0,
      expires_at: '2027-12-31T23:59:59Z',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  let inquiries: any[] = [];
  let inquiryHistory: Record<string, any[]> = {};

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;
        const method = req.method;

        // Helper to read JSON body
        const readBody = async (): Promise<any> => {
          if ((req as any).body) return (req as any).body;
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const data = Buffer.concat(chunks).toString('utf8');
          try {
            return JSON.parse(data || '{}');
          } catch {
            return {};
          }
        };

        const json = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // --- AUTH ---
        // --- AUTH (Google-only) ---
        if (pathname === '/api/auth/google' && method === 'GET') {
          res.statusCode = 302;
          res.setHeader('Location', '/api/auth/google/callback?code=mock_code_dev&state=mock_state');
          res.end();
          return;
        }
        if (pathname === '/api/auth/google/callback' && method === 'GET') {
          const token = 'dev_mock_token_' + Date.now();
          res.setHeader('Set-Cookie', `cc_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
          res.statusCode = 302;
          res.setHeader('Location', '/admin');
          res.end();
          return;
        }

        if (pathname === '/api/auth/me' && method === 'GET') {
          const auth = req.headers['authorization'];
          const cookie = req.headers['cookie'];
          if (auth?.includes('Bearer') || cookie?.includes('cc_admin_session')) {
            return json({
              authenticated: true,
              user: { id: 'admin_1', email: 'admin@crystalclean.in', name: 'CrystalClean Executive', role: 'admin' }
            });
          }
          return json({ error: 'Unauthorized' }, 401);
        }

        if (pathname === '/api/auth/logout' && method === 'POST') {
          res.setHeader('Set-Cookie', `cc_admin_session=; Path=/; Max-Age=0`);
          return json({ success: true });
        }

        // --- CATEGORIES ---
        if (pathname === '/api/categories' && method === 'GET') {
          return json({ categories });
        }
        if (pathname === '/api/categories' && method === 'POST') {
          const body = await readBody();
          const newCat = {
            id: 'cat_' + Date.now(),
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: body.description || '',
            image_url: body.image_url || null,
            sort_order: categories.length + 1,
            is_active: 1
          };
          categories.push(newCat);
          return json({ category: newCat, success: true }, 201);
        }
        if (pathname.startsWith('/api/categories/') && method === 'PUT') {
          const id = pathname.replace('/api/categories/', '');
          const body = await readBody();
          const index = categories.findIndex(c => c.id === id);
          if (index !== -1) {
            categories[index] = { ...categories[index], ...body };
            return json({ category: categories[index], success: true });
          }
          return json({ error: 'Category not found' }, 404);
        }
        if (pathname.startsWith('/api/categories/') && method === 'DELETE') {
          const id = pathname.replace('/api/categories/', '');
          categories = categories.filter(c => c.id !== id);
          return json({ success: true });
        }

        // --- PRODUCTS ---
        if (pathname === '/api/products' && method === 'GET') {
          const catId = url.searchParams.get('category');
          const search = url.searchParams.get('q')?.toLowerCase();
          const featured = url.searchParams.get('featured') === '1';
          const preview = url.searchParams.get('preview') === 'drafts';
          const auth = req.headers['authorization'];
          const cookie = req.headers['cookie'];
          const isAdmin = !!(auth?.includes('Bearer') || cookie?.includes('cc_admin_session'));
          const activeOnly = (!isAdmin && !preview) && url.searchParams.get('active_only') !== '0';

          let list = [...products];
          if (activeOnly) list = list.filter(p => p.is_active === 1);
          if (featured) list = list.filter(p => p.is_featured === 1);
          if (catId) list = list.filter(p => p.category_id === catId || p.slug === catId);
          if (search) {
            list = list.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
          }
          return json({ products: list });
        }

        if (pathname.startsWith('/api/products/') && method === 'GET') {
          const id = pathname.replace('/api/products/', '');
          const prod = products.find(p => p.id === id || p.slug === id);
          if (!prod) return json({ error: 'Product not found' }, 404);
          return json({ product: prod });
        }

        if (pathname === '/api/products' && method === 'POST') {
          const body = await readBody();
          const cat = categories.find(c => c.id === body.category_id);
          const newProd = {
            id: 'prod_' + Date.now(),
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: body.description || '',
            category_id: body.category_id,
            category_name: cat ? cat.name : '',
            image_url: body.image_url,
            gallery_json: JSON.stringify(body.gallery || [body.image_url]),
            variants_json: JSON.stringify(body.variants || []),
            pack_size: body.pack_size || null,
            specs_json: JSON.stringify(body.specs || {}),
            is_featured: body.is_featured ? 1 : 0,
            is_customizable: body.is_customizable ? 1 : 0,
            is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
            created_at: new Date().toISOString()
          };
          products.unshift(newProd);
          return json({ product: newProd, success: true }, 201);
        }

        if (pathname.startsWith('/api/products/') && method === 'PUT') {
          const id = pathname.replace('/api/products/', '');
          const body = await readBody();
          const index = products.findIndex(p => p.id === id);
          if (index !== -1) {
            const cat = categories.find(c => c.id === body.category_id);
            products[index] = {
              ...products[index],
              ...body,
              category_name: cat ? cat.name : products[index].category_name,
              gallery_json: body.gallery ? JSON.stringify(body.gallery) : products[index].gallery_json,
              variants_json: body.variants ? JSON.stringify(body.variants) : products[index].variants_json,
              specs_json: body.specs ? JSON.stringify(body.specs) : products[index].specs_json,
            };
            return json({ product: products[index], success: true });
          }
          return json({ error: 'Product not found' }, 404);
        }

        if (pathname.startsWith('/api/products/') && method === 'DELETE') {
          const id = pathname.replace('/api/products/', '');
          products = products.filter(p => p.id !== id);
          return json({ success: true });
        }

        // --- ACCESS CODES ---
        if (pathname === '/api/access-codes/verify' && method === 'POST') {
          const body = await readBody();
          const cleanCode = (body.code || '').trim().toUpperCase();
          const codeObj = accessCodes.find(c => c.code === cleanCode);

          if (!codeObj) {
            return json({ valid: false, message: 'Invalid access code' });
          }
          if (codeObj.status === 'revoked') {
            return json({ valid: false, message: 'Access code has been revoked' });
          }
          if (codeObj.used_count >= codeObj.max_uses) {
            return json({ valid: false, message: 'Inquiry limit reached for this code' });
          }

          return json({
            valid: true,
            client_name: codeObj.client_name,
            remaining_uses: Math.max(0, codeObj.max_uses - codeObj.used_count)
          });
        }

        if (pathname === '/api/access-codes' && method === 'GET') {
          return json({ codes: accessCodes });
        }

        if (pathname === '/api/access-codes' && method === 'POST') {
          const body = await readBody();
          const codeVal = (body.code || 'CC-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
          const newCode = {
            id: 'code_' + Date.now(),
            code: codeVal,
            client_name: body.client_name,
            contact_name: body.contact_name || null,
            contact_phone: body.contact_phone || null,
            max_uses: body.max_uses || 50,
            used_count: 0,
            expires_at: body.expires_at || null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          accessCodes.unshift(newCode);
          return json({ code: newCode, success: true }, 201);
        }

        if (pathname.startsWith('/api/access-codes/') && method === 'PATCH') {
          const id = pathname.replace('/api/access-codes/', '');
          const body = await readBody();
          const index = accessCodes.findIndex(c => c.id === id);
          if (index !== -1) {
            accessCodes[index] = { ...accessCodes[index], ...body, updated_at: new Date().toISOString() };
            return json({ code: accessCodes[index], success: true });
          }
          return json({ error: 'Code not found' }, 404);
        }

        if (pathname.startsWith('/api/access-codes/') && method === 'DELETE') {
          const id = pathname.replace('/api/access-codes/', '');
          accessCodes = accessCodes.filter(c => c.id !== id);
          return json({ success: true });
        }

        // --- INQUIRIES & WHATSAPP ---
        if (pathname === '/api/inquiries' && method === 'POST') {
          const body = await readBody();
          const codeStr = (body.access_code || '').trim().toUpperCase();
          const codeObj = accessCodes.find(c => c.code === codeStr);

          if (!codeObj || codeObj.status !== 'active' || codeObj.used_count >= codeObj.max_uses) {
            return json({ error: 'A valid, active access code is required to submit an inquiry.' }, 403);
          }

          // Atomic increment
          codeObj.used_count += 1;
          if (codeObj.used_count >= codeObj.max_uses) {
            codeObj.status = 'exhausted';
          }

          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
          const reference = `CC-ORD-${y}${m}${d}-${randHex}`;

          const newInquiry = {
            id: 'inq_' + Date.now(),
            reference,
            inquiry_type: body.inquiry_type || 'cart',
            customer_name: body.customer_name,
            company_name: body.company_name,
            contact_phone: body.contact_phone,
            contact_email: body.contact_email || null,
            delivery_city: body.delivery_city,
            expected_date: body.expected_date || null,
            notes: body.notes || null,
            access_code_id: codeObj.id,
            access_code_value: codeObj.code,
            status: 'New Inquiry',
            admin_notes: null,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            items: (body.items || []).map((it: any, idx: number) => ({
              id: 'item_' + Date.now() + '_' + idx,
              product_name_snapshot: it.product_name,
              variant_snapshot: it.variant || null,
              pack_size_snapshot: it.pack_size || null,
              quantity: it.quantity || 1
            }))
          };

          inquiries.unshift(newInquiry);
          inquiryHistory[newInquiry.id] = [{
            id: 'hist_' + Date.now(),
            from_status: null,
            to_status: 'New Inquiry',
            note: 'Initial inquiry submission via website',
            changed_by: 'Customer',
            changed_at: now.toISOString()
          }];

          // Prepare WhatsApp link with NO prices
          let productListStr = '';
          (body.items || []).forEach((it: any, i: number) => {
            const varPart = it.variant ? ` — ${it.variant}` : '';
            const packPart = it.pack_size ? ` (${it.pack_size})` : '';
            productListStr += `${i + 1}. ${it.product_name}${varPart}${packPart} — Quantity: ${it.quantity} units\n`;
          });

          const notesPart = body.notes ? `\nAdditional Notes: ${body.notes.trim()}` : '';
          const msg = [
            `Hello CrystalClean,`,
            ``,
            `I would like to inquire about these hotel amenities.`,
            ``,
            `Inquiry Reference: ${reference}`,
            `Customer Verification: Verified Access Code`,
            ``,
            `Products requested:`,
            productListStr.trim(),
            ``,
            `Hotel/Company: ${body.company_name}`,
            `Contact Person: ${body.customer_name}`,
            `Delivery City: ${body.delivery_city}${notesPart}`,
            ``,
            `Please share your pricing, bulk discounts, product availability, and delivery details.`,
            ``,
            `Thank you.`
          ].join('\n');

          const waUrl = `https://wa.me/919149953610?text=${encodeURIComponent(msg)}`;

          return json({
            success: true,
            reference,
            inquiry_id: newInquiry.id,
            whatsapp_url: waUrl,
            prepared_message: msg
          }, 201);
        }

        if (pathname === '/api/inquiries' && method === 'GET') {
          return json({ inquiries });
        }

        if (pathname.startsWith('/api/inquiries/') && method === 'GET') {
          const id = pathname.replace('/api/inquiries/', '');
          const inq = inquiries.find(i => i.id === id || i.reference === id);
          if (!inq) return json({ error: 'Inquiry not found' }, 404);
          return json({ inquiry: inq, history: inquiryHistory[inq.id] || [] });
        }

        if (pathname.match(/^\/api\/inquiries\/[^\/]+\/status$/) && method === 'PATCH') {
          const id = pathname.split('/')[3];
          const body = await readBody();
          const inq = inquiries.find(i => i.id === id);
          if (!inq) return json({ error: 'Inquiry not found' }, 404);

          const oldStatus = inq.status;
          inq.status = body.status;
          inq.updated_at = new Date().toISOString();

          if (!inquiryHistory[inq.id]) inquiryHistory[inq.id] = [];
          inquiryHistory[inq.id].unshift({
            id: 'hist_' + Date.now(),
            from_status: oldStatus,
            to_status: body.status,
            note: body.note || null,
            changed_by: 'admin@crystalclean.in',
            changed_at: new Date().toISOString()
          });

          return json({ success: true, status: body.status });
        }

        if (pathname.match(/^\/api\/inquiries\/[^\/]+\/notes$/) && method === 'PATCH') {
          const id = pathname.split('/')[3];
          const body = await readBody();
          const inq = inquiries.find(i => i.id === id);
          if (!inq) return json({ error: 'Inquiry not found' }, 404);
          inq.admin_notes = body.admin_notes;
          return json({ success: true });
        }

        // --- ADMIN STATS ---
        if (pathname === '/api/admin/stats' && method === 'GET') {
          const statusCounts: Record<string, number> = {
            'New Inquiry': 0,
            'Contacted': 0,
            'Quotation Shared': 0,
            'Awaiting Customer Confirmation': 0,
            'Confirmed': 0,
            'Preparing Order': 0,
            'Ready to Ship': 0,
            'Shipped': 0,
            'Delivered': 0,
            'Cancelled': 0
          };
          inquiries.forEach(i => {
            if (statusCounts[i.status] !== undefined) statusCounts[i.status]++;
          });
          return json({
            stats: {
              totalInquiries: inquiries.length,
              statusCounts,
              activeProductsCount: products.filter(p => p.is_active).length,
              activeCodesCount: accessCodes.filter(c => c.status === 'active').length
            }
          });
        }

        return next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
