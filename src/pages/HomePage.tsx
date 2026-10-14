import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';

const FALLBACK_CATEGORIES: Partial<Category>[] = [
  { id: 'cat_shampoo', name: 'Shampoo and Conditioner', image_url: '/products/hotel-conditioner-mini-bottle.jpg' },
  { id: 'cat_toiletries', name: 'Hotel Toiletries', image_url: '/products/comb-with-kraft-box.jpg' },
  { id: 'cat_dental', name: 'Dental Kits', image_url: '/products/dental-kit.jpg' },
  { id: 'cat_shaving', name: 'Shaving and Grooming Kits', image_url: '/products/shaving-kit.jpg' },
  { id: 'cat_soap', name: 'Soap and Bath Products', image_url: '/products/hand-wash.jpg' },
  { id: 'cat_bathroom', name: 'Bathroom Cleaners', image_url: '/products/toilet-cleaner.jpg' },
  { id: 'cat_floor', name: 'Floor and Surface Cleaners', image_url: '/products/floor-cleaner.jpg' },
  { id: 'cat_glass', name: 'Glass and Furniture Care', image_url: '/products/glass-cleaner-spray.jpg' },
  { id: 'cat_kitchen', name: 'Kitchen and Dishwash', image_url: '/products/dish-wash-plus.jpg' },
  { id: 'cat_room', name: 'Room Fresheners', image_url: '/products/lemon-room-spray.jpg' },
  { id: 'cat_essentials', name: 'Guest Essentials and Room Accessories', image_url: '/products/disposable-terry-slippers.jpg' },
  { id: 'cat_paper', name: 'Paper Products', image_url: '/products/folded-paper-hand-towels.jpg' },
  { id: 'cat_packaging', name: 'Packaging and Bags', image_url: '/products/non-woven-carry-bag.jpg' },
  { id: 'cat_housekeeping', name: 'Housekeeping Supplies', image_url: '/products/black-garbage-bags.jpg' },
  { id: 'cat_bulk', name: 'Bulk Hospitality Supplies', image_url: '/products/embossed-tissue-roll.jpg' },
];

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?featured=1')
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.categories && catData.categories.length > 0) {
            setCategories(catData.categories);
          }
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const prods: Product[] = prodData.products || [];
          setFeaturedProducts(prods);

          const initialVars: Record<string, string> = {};
          prods.forEach(p => {
            try {
              const vars = JSON.parse(p.variants_json || '[]');
              if (vars.length > 0) initialVars[p.id] = vars[0];
            } catch {}
          });
          setSelectedVariants(initialVars);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayCategories = categories.length > 0 ? categories : (FALLBACK_CATEGORIES as Category[]);

  const handleAddToCart = (product: Product) => {
    const variant = selectedVariants[product.id] || null;

    addToCart({
      productId: product.id,
      productName: product.name,
      variant,
      packSize: product.pack_size,
      quantity: 100,
      imageUrl: product.image_url,
    });

    setAddedNotice(`Added ${product.name} to requirements`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Toast notification */}
      {addedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded text-sm flex items-center gap-2 border border-mist shadow-sm"
        >
          <Check className="w-4 h-4 text-teal" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-8 sm:pt-14">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink tracking-tight leading-tight mb-4">
              Luxury hotel amenities and room essentials.
            </h1>
            <p className="text-base sm:text-lg text-slate leading-relaxed mb-6">
              B2B supplier of guest amenities, dental kits, toiletries, and room essentials for hotels and resorts in India.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="px-5 py-3 bg-ink hover:bg-slate text-white text-sm font-medium rounded transition-colors"
              >
                Browse the catalog
              </Link>
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-white border border-mist hover:border-slate text-ink text-sm font-medium rounded transition-colors"
              >
                WhatsApp +91 91499 53610
              </a>
            </div>
          </div>

          {/* The One Bold Element: 16:9 hero image, real photo from public/products/, optimized WebP, not lazy-loaded */}
          <div className="overflow-hidden rounded border border-mist bg-porcelain">
            <img
              src="/products/hero-amenities.webp"
              alt="CryststalClean hotel amenities collection"
              width={1200}
              height={675}
              loading="eager"
              className="w-full aspect-[16/9] object-cover block"
            />
          </div>
        </div>
      </section>

      {/* 15 Real Categories Grid */}
      <section>
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-mist">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                Categories
              </h2>
              <p className="text-sm text-slate mt-1">
                Browse our fifteen hospitality supply collections.
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm text-teal hover:underline inline-flex items-center gap-1"
            >
              <span>View catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group block bg-white border border-mist hover:border-slate rounded overflow-hidden transition-colors"
              >
                <div className="aspect-[4/5] bg-porcelain overflow-hidden">
                  <img
                    src={cat.image_url || '/products/placeholder.svg'}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/products/placeholder.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-xs sm:text-sm text-ink group-hover:text-teal transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (Real data only, no prices) */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-mist">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                  Featured products
                </h2>
                <p className="text-sm text-slate mt-1">
                  Add items directly to your requirements list.
                </p>
              </div>
              <Link
                to="/products"
                className="text-sm text-teal hover:underline inline-flex items-center gap-1"
              >
                <span>All products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => {
                let variants: string[] = [];
                try {
                  variants = JSON.parse(product.variants_json || '[]');
                } catch {}

                const currentVariant = selectedVariants[product.id] || (variants[0] || '');

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-mist rounded flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <Link
                        to={`/product/${product.id}`}
                        className="aspect-[4/5] bg-porcelain block overflow-hidden border-b border-mist"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/placeholder.svg';
                          }}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="p-4 space-y-2">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-medium text-sm text-ink hover:text-teal transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        {product.pack_size && (
                          <p className="text-xs text-slate">
                            Packaging: {product.pack_size}
                          </p>
                        )}
                        {variants.length > 0 && (
                          <div className="pt-1">
                            <select
                              value={currentVariant}
                              onChange={(e) =>
                                setSelectedVariants({
                                  ...selectedVariants,
                                  [product.id]: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 bg-porcelain border border-mist rounded text-xs text-ink focus:outline-none"
                            >
                              {variants.map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 px-3 bg-white border border-mist hover:border-slate text-xs font-medium text-ink rounded transition-colors"
                      >
                        Add to requirements
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Direct Contact Banner */}
      <section>
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-mist rounded p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-xl font-semibold text-ink tracking-tight">
                Direct wholesale inquiries
              </h2>
              <p className="text-sm text-slate leading-relaxed">
                Send your list of requirements or custom branding requests directly to our supply team via WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-ink hover:bg-slate text-white text-sm font-medium rounded transition-colors"
              >
                WhatsApp +91 91499 53610
              </a>
              <Link
                to="/quote"
                className="px-5 py-2.5 bg-white border border-mist hover:border-slate text-ink text-sm font-medium rounded transition-colors"
              >
                Bulk quotation form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
