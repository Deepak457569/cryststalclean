import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// In-Memory Dev API Server for seamless local Vite development
function devApiPlugin(): Plugin {
  // Initial dev state mirrors D1 seed data
  let categories = [
    {
      id: 'cat_toiletries',
      name: 'Hotel Toiletries',
      slug: 'hotel-toiletries',
      description: 'Signature luxury body wash, rich moisturizing lotions, and hotel bathroom sets tailored for high-end hospitality.',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      sort_order: 1,
      is_active: 1
    },
    {
      id: 'cat_shampoo',
      name: 'Shampoo and Conditioner',
      slug: 'shampoo-and-conditioner',
      description: 'Botanical infusions, paraben-free shampoos, and deep conditioning salon blends formulated for guest hair wellness.',
      image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      sort_order: 2,
      is_active: 1
    },
    {
      id: 'cat_soap',
      name: 'Soap and Bath Products',
      slug: 'soap-and-bath-products',
      description: 'French-milled luxury vegetable soaps, glycerin bath bars, and relaxing aromatic bath crystals.',
      image_url: 'https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80',
      sort_order: 3,
      is_active: 1
    },
    {
      id: 'cat_dental',
      name: 'Dental Kits',
      slug: 'dental-kits',
      description: 'Biodegradable bamboo toothbrushes, ergonomic soft bristles, and premium mint gel toothpaste travel kits.',
      image_url: 'https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80',
      sort_order: 4,
      is_active: 1
    },
    {
      id: 'cat_shaving',
      name: 'Shaving and Grooming Kits',
      slug: 'shaving-and-grooming-kits',
      description: 'Precision dual and triple blade razors, organic aloe vera shaving creams, and boxed grooming vanity sets.',
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      sort_order: 5,
      is_active: 1
    },
    {
      id: 'cat_essentials',
      name: 'Guest Essentials',
      slug: 'guest-essentials',
      description: 'Plush coral velvet hotel slippers, satin eye masks, shoe shine cloths, and sewing vanity packets.',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      sort_order: 6,
      is_active: 1
    },
    {
      id: 'cat_accessories',
      name: 'Room Accessories',
      slug: 'room-accessories',
      description: 'Handcrafted resin amenity trays, coaster sets, leatherette hospitality folders, and branded luggage racks.',
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      sort_order: 7,
      is_active: 1
    },
    {
      id: 'cat_bulk',
      name: 'Bulk Hospitality Supplies',
      slug: 'bulk-hospitality-supplies',
      description: '5-Litre institutional gallon refills, bulk dispenser stations, and high-volume eco pump dispensers.',
      image_url: 'https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80',
      sort_order: 8,
      is_active: 1
    }
  ];

  let products = [
    {
      id: 'prod_argan_shampoo',
      name: 'Signature Moroccan Argan Oil Shampoo',
      slug: 'moroccan-argan-oil-shampoo',
      description: 'Ultra-nourishing botanical hotel shampoo infused with pure Moroccan Argan Oil and Vitamin E. Formulated specifically to leave guest hair silky, manageable, and gently fragranced with Mediterranean citrus notes.',
      category_id: 'cat_shampoo',
      category_name: 'Shampoo and Conditioner',
      image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['30 ml Frosted Bottle', '50 ml Luxury Tube', '100 ml Pump Dispenser']),
      pack_size: 'Case of 200 Units',
      specs_json: JSON.stringify({ fragrance: 'Mediterranean Bergamot & Amber', packaging: 'Recyclable PET bottle with matte gold cap', paraben_free: 'Yes', suitable_for: 'All Hair Types' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_silk_conditioner',
      name: 'Silk Protein Hydrating Conditioner',
      slug: 'silk-protein-hydrating-conditioner',
      description: 'Deeply hydrating hotel conditioner formulated with hydrolyzed silk proteins and sweet almond extract. Restores moisture balance and detangles effortlessly after swimming or travel.',
      category_id: 'cat_shampoo',
      category_name: 'Shampoo and Conditioner',
      image_url: 'https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1608248597359-5f28f0942526?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['30 ml Frosted Bottle', '50 ml Luxury Tube', '100 ml Pump Dispenser']),
      pack_size: 'Case of 200 Units',
      specs_json: JSON.stringify({ fragrance: 'White Tea & Thyme', packaging: 'Biodegradable Wheat Straw / PCR Plastic', dermatologist_tested: 'Yes' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_botanical_bodywash',
      name: 'Botanical Green Tea & Aloe Body Wash',
      slug: 'botanical-green-tea-aloe-body-wash',
      description: 'Invigorating hotel body wash enriched with antioxidant-rich green tea extract and organic aloe vera juice. Produces a lush, creamy lather that leaves skin refreshed and hydrated.',
      category_id: 'cat_toiletries',
      category_name: 'Hotel Toiletries',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['30 ml Recycled Bottle', '50 ml Aluminum Cap Bottle', '300 ml Wall Dispenser']),
      pack_size: 'Case of 250 Units',
      specs_json: JSON.stringify({ fragrance: 'Green Tea & Lemongrass', ph_balanced: '5.5 Balanced', sulfate_free: 'Yes' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_luxury_lotion',
      name: 'Velvet Touch Shea Butter Body Lotion',
      slug: 'velvet-touch-shea-butter-body-lotion',
      description: 'Fast-absorbing luxury body lotion with African unrefined shea butter, jojoba oil, and soothing chamomile. Provides 24-hour hydration without greasy residue.',
      category_id: 'cat_toiletries',
      category_name: 'Hotel Toiletries',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['30 ml Tube', '50 ml Soft-Squeeze Bottle', '300 ml Hotel Wall Pump']),
      pack_size: 'Case of 250 Units',
      specs_json: JSON.stringify({ fragrance: 'Warm Vanilla & Sandalwood', texture: 'Lightweight Cream', cruelty_free: 'Yes' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_glycerin_soap',
      name: 'Amber Honey Glycerin Bath Bar',
      slug: 'amber-honey-glycerin-bath-bar',
      description: 'Translucent vegetable glycerin bath soap bar infused with raw honey and botanical extracts. Ultra-gentle on sensitive skin and packaged in moisture-barrier gold foil or recycled kraft box.',
      category_id: 'cat_soap',
      category_name: 'Soap and Bath Products',
      image_url: 'https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1607006314644-8e3b1c8c50e2?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['20g Guest Size (Pleat Wrap)', '35g Square Bar (Kraft Box)', '50g Luxury Embossed Bar']),
      pack_size: 'Carton of 500 Pieces',
      specs_json: JSON.stringify({ fragrance: 'Wild Honey & Blossom', packaging: 'Eco Pleat Wrap / Embossed Box', weight_options: '20g / 35g / 50g' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_milled_soap',
      name: 'Triple-Milled French Luxury Soap',
      slug: 'triple-milled-french-luxury-soap',
      description: 'Dense, long-lasting triple-milled white soap with nourishing olive oil and coconut butter. Does not soften or crack in damp hotel bathrooms.',
      category_id: 'cat_soap',
      category_name: 'Soap and Bath Products',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['25g Flow Pack', '40g Premium Hard Box']),
      pack_size: 'Carton of 400 Pieces',
      specs_json: JSON.stringify({ process: 'French Triple Milled', fragrance: 'Lavender & White Musk' }),
      is_featured: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_bamboo_dental',
      name: 'Eco Bamboo Dental Care Kit',
      slug: 'eco-bamboo-dental-care-kit',
      description: 'Sustainably harvested biodegradable bamboo handle toothbrush with Dupont soft charcoal-infused bristles. Comes paired with a 15g herbal mint gel toothpaste in an eco kraft paper carton.',
      category_id: 'cat_dental',
      category_name: 'Dental Kits',
      image_url: 'https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1559591937-e62fb330bc1f?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['Standard Bamboo Kit', 'Premium Embossed Hotel Edition']),
      pack_size: 'Box of 200 Kits',
      specs_json: JSON.stringify({ bristles: 'Soft Dupont Charcoal', handle: '100% Biodegradable Moso Bamboo', toothpaste: '15g Herbal Gel' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_shaving_kit',
      name: 'Ergonomic Shaving & Grooming Kit',
      slug: 'ergonomic-shaving-grooming-kit',
      description: 'Double-blade precision swivel razor with lubricating aloe strip, paired with a 20ml soothing shaving foam tube in waterproof luxury packaging.',
      category_id: 'cat_shaving',
      category_name: 'Shaving and Grooming Kits',
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['Twin Blade Kit', 'Triple Blade Heavyweight Kit']),
      pack_size: 'Box of 200 Kits',
      specs_json: JSON.stringify({ razor: 'Ergonomic Rubber Grip Handle', cream: '20ml Aloe & Menthol Cream' }),
      is_featured: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_hotel_slippers',
      name: 'Plush Closed-Toe Hotel Velvet Slippers',
      slug: 'plush-closed-toe-hotel-velvet-slippers',
      description: 'High-density 5mm anti-skid EVA sole with ultra-soft coral fleece upper. Designed for 4-star and 5-star guest room comfort with customizable hotel crest embroidery option.',
      category_id: 'cat_essentials',
      category_name: 'Guest Essentials',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['Standard Unisex (28 cm)', 'Extra Comfort Luxury Thick Sole (30 cm)']),
      pack_size: 'Carton of 100 Pairs',
      specs_json: JSON.stringify({ sole: '5mm Waterproof Textured EVA', material: 'High Density Coral Fleece', packaging: 'Biodegradable Poly / Fabric Pouch' }),
      is_featured: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_resin_tray',
      name: 'Luxury Resin & Stone Amenity Tray',
      slug: 'luxury-resin-stone-amenity-tray',
      description: 'Contemporary matte black resin bathroom vanity tray with raised splash borders. Waterproof, heat resistant, easy to sanitize, and engineered for luxury hospitality durability.',
      category_id: 'cat_accessories',
      category_name: 'Room Accessories',
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['Rectangular (25 x 15 cm)', 'Two-Tier Vanity Set']),
      pack_size: 'Case of 24 Units',
      specs_json: JSON.stringify({ finish: 'Matte Onyx Black / Polished White Marble Finish', washable: '100% Water & Chemical Resistant' }),
      is_featured: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_bulk_shampoo_refill',
      name: '5-Litre Gallon Commercial Shampoo Refill',
      slug: '5-litre-gallon-commercial-shampoo-refill',
      description: 'High-capacity institutional 5-litre refill container for eco-friendly wall-mounted guest dispensers. Cost-effective, eliminates single-use plastics, and delivers a consistent 5-star hair care experience.',
      category_id: 'cat_bulk',
      category_name: 'Bulk Hospitality Supplies',
      image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      gallery_json: JSON.stringify(['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80']),
      variants_json: JSON.stringify(['5 Litre Can', 'Case of 4 x 5 Litre Cans (20L total)']),
      pack_size: '5 Litre Can / Case of 4',
      specs_json: JSON.stringify({ viscosity: 'Dispenser Optimized', fragrance: 'Signature Citrus Blossom', dilution: 'Ready to Use' }),
      is_featured: 1,
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
        if (pathname === '/api/auth/login' && method === 'POST') {
          const body = await readBody();
          const email = (body.email || '').trim().toLowerCase();
          const password = body.password || '';

          // Allow default admin
          if (email === 'admin@crystalclean.in' && (password === 'CrystalCleanAdmin2026!' || password.length >= 6)) {
            const token = 'dev_mock_token_' + Date.now();
            res.setHeader('Set-Cookie', `cc_admin_session=${token}; Path=/; HttpOnly`);
            return json({
              success: true,
              token,
              user: { id: 'admin_1', email, name: 'CrystalClean Executive', role: 'admin' }
            });
          }
          return json({ error: 'Invalid email or password' }, 401);
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

          let list = [...products];
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
