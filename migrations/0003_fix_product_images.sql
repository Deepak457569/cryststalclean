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
