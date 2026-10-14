import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2, 
  MessageCircle, Leaf, Award, PackageCheck, Layers, Key
} from 'lucide-react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { AccessCodeModal } from '../components/common/AccessCodeModal';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [codeModalOpen, setCodeModalOpen] = useState(false);
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
          setCategories(catData.categories || []);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const prods: Product[] = prodData.products || [];
          setFeaturedProducts(prods);

          // Initialize variant & quantity selectors
          const initialVars: Record<string, string> = {};
          const initialQtys: Record<string, number> = {};
          prods.forEach(p => {
            try {
              const vars = JSON.parse(p.variants_json || '[]');
              if (vars.length > 0) initialVars[p.id] = vars[0];
            } catch {}
            initialQtys[p.id] = 100; // default B2B quantity unit
          });
          setSelectedVariants(initialVars);
          setQuantities(initialQtys);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    const variant = selectedVariants[product.id] || null;
    const qty = quantities[product.id] || 50;

    addToCart({
      productId: product.id,
      productName: product.name,
      variant,
      packSize: product.pack_size,
      quantity: qty,
      imageUrl: product.image_url,
    });

    setAddedNotice(`Added ${qty} units of ${product.name} to your requirements cart!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Toast notification */}
      {addedNotice && (
        <div className="fixed top-24 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-champagne-500/50 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100/70 via-cream-50 to-white pt-6 sm:pt-10 pb-16 sm:pb-20 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Official Banner Showcase */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-cream-300/80 bg-[#FAF8F5] mb-8 group">
            <img
              src="/crystalclean-banner.png"
              alt="CryststalClean - Quality Hospitality Supplies. Exceptional Guest Experiences."
              className="w-full h-auto object-contain block mx-auto transition-transform duration-700 group-hover:scale-[1.008]"
            />
            {/* Overlay badge on larger screens */}
            <div className="hidden sm:flex absolute top-5 right-5 bg-charcoal-900/90 backdrop-blur-md text-white border border-champagne-400/40 px-4 py-2 rounded-full items-center gap-2 shadow-xl">
              <Award className="w-4 h-4 text-champagne-400" />
              <span className="text-xs font-semibold tracking-wide">5-Star Hospitality Standard</span>
            </div>
            
            {/* Brand crest badge on bottom-left */}
            <div className="hidden md:flex absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-champagne-300/70 py-1.5 px-3 rounded-xl items-center gap-2 shadow-lg">
              <img src="/logo.png" alt="CryststalClean Crest" className="w-8 h-8 object-contain" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-champagne-700 block leading-none">Bespoke Amenities</span>
                <span className="text-xs font-serif font-bold text-charcoal-900 block leading-tight">CryststalClean® Trade Supply</span>
              </div>
            </div>
          </div>

          {/* Interactive B2B Action Bar */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-luxury flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne-100 border border-champagne-300 text-champagne-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
                Wholesale Hotel Supply Partner
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
                Quality Hospitality Supplies. Exceptional Guest Experiences.
              </h1>
              <p className="text-sm sm:text-base text-charcoal-800 leading-relaxed pt-1">
                Supplying premium guest amenities, luxury toiletries, biodegradable dental sets, and institutional housekeeping cleaning formulations to hotels, resorts, and bulk buyers across India.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-800 pt-1">
                <Key className="w-4 h-4 text-champagne-600 flex-shrink-0" />
                <span>Customer access code required for quote submission.</span>
                <button
                  onClick={() => setCodeModalOpen(true)}
                  className="underline text-champagne-700 font-semibold hover:text-charcoal-950 ml-1"
                >
                  Verify or request access code
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-sm transition-all shadow-luxury hover:shadow-luxury-hover"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 text-champagne-400" />
              </Link>
              <Link
                to="/bulk-quote"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-cream-100 text-charcoal-900 font-medium rounded-xl text-sm transition-all border border-cream-300 shadow-sm"
              >
                <span>Request Bulk Quotation</span>
              </Link>
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>WhatsApp Order Desk</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST HIGHLIGHTS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-cream-200 shadow-luxury">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-champagne-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-900 text-sm">Protected Trade Supply</h4>
              <p className="text-xs text-charcoal-800 mt-0.5">Confidential wholesale pricing for verified hotels.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-champagne-600 flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-900 text-sm">Eco-Conscious Materials</h4>
              <p className="text-xs text-charcoal-800 mt-0.5">Bamboo, wheat-straw &amp; biodegradable options.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-champagne-600 flex-shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-900 text-sm">Nationwide Dispatch</h4>
              <p className="text-xs text-charcoal-800 mt-0.5">Reliable dispatches to properties across India.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-champagne-600 flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-whatsapp-600" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-900 text-sm">WhatsApp Ordering</h4>
              <p className="text-xs text-charcoal-800 mt-0.5">Quick quotations at +91 91499 53610.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Hospitality Catalog</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">Featured Categories</h2>
          </div>
          <Link
            to="/categories"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-700 hover:text-charcoal-950 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F5] relative p-4 flex items-center justify-center border-b border-cream-200">
                <img
                  src={cat.image_url || '/products/placeholder.svg'}
                  alt={cat.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-champagne-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-charcoal-800 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-semibold text-champagne-700">
                  <span>Browse Products</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS (WITH SELECTION & REQUIREMENTS ADDITION, ZERO PRICES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">Curated Amenities</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">Recommended Guest Products</h2>
            <p className="text-sm text-charcoal-800 mt-1">
              Select variants and required quantities to add directly to your inquiry requirements cart.
            </p>
          </div>
          <Link
            to="/products"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-700 hover:text-charcoal-950 transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-charcoal-800 font-serif">Loading amenities collection...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              let variants: string[] = [];
              try {
                variants = JSON.parse(product.variants_json || '[]');
              } catch {}

              const currentVariant = selectedVariants[product.id] || (variants[0] || '');
              const currentQty = quantities[product.id] || 100;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-cream-200 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product.id}`} className="aspect-[4/3] overflow-hidden bg-[#FAF8F5] relative group block border-b border-cream-200 p-4 flex items-center justify-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 bg-charcoal-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {product.pack_size || 'To be confirmed'}
                    </span>
                    {product.is_customizable === 1 && (
                      <span className="absolute top-3 left-3 bg-white/95 text-champagne-800 border border-champagne-400 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-champagne-600" />
                        Custom Logo
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/95 text-charcoal-900 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm border border-cream-200">
                      {product.category_name || categories.find((c) => c.id === product.category_id)?.name || 'Amenity'}
                    </span>
                  </Link>

                  {/* Product Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-serif font-bold text-lg text-charcoal-900 hover:text-champagne-700 transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-charcoal-800 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Variant Selector */}
                    {variants.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                          Variant / Size
                        </label>
                        <select
                          value={currentVariant}
                          onChange={(e) =>
                            setSelectedVariants({ ...selectedVariants, [product.id]: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-champagne-500 font-medium"
                        >
                          {variants.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity Selector & Add Button */}
                    <div className="pt-2 border-t border-cream-200">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                          Units Required:
                        </span>
                        <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [product.id]: Math.max(10, currentQty - 50),
                              })
                            }
                            className="px-2.5 py-1 text-xs text-charcoal-800 hover:text-charcoal-950 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) =>
                              setQuantities({
                                ...quantities,
                                [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-16 text-center text-xs font-semibold bg-transparent border-x border-cream-300 py-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [product.id]: currentQty + 50,
                              })
                            }
                            className="px-2.5 py-1 text-xs text-charcoal-800 hover:text-charcoal-950 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2.5 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Layers className="w-3.5 h-3.5 text-champagne-400" />
                        <span>Add to Requirements Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SIMPLE 3-STEP PROCUREMENT PROCESS */}
      <section className="bg-charcoal-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-charcoal-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-champagne-400">Streamlined B2B Workflow</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-1">How Hospitality Ordering Works</h2>
            <p className="text-sm text-cream-300/80 mt-2">
              We eliminated complicated consumer checkout gates in favor of direct wholesale procurement tailored to your hotel's exact batch size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-charcoal-900 border border-charcoal-800 p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-champagne-500/20 border border-champagne-500/40 text-champagne-300 flex items-center justify-center font-serif text-xl font-bold">
                1
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Select Products &amp; Volumes</h3>
              <p className="text-xs text-cream-300/80 leading-relaxed">
                Browse our product catalog, select your required packaging sizes, formulations, and batch quantities without public pricing barriers.
              </p>
            </div>

            <div className="bg-charcoal-900 border border-charcoal-800 p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-champagne-500/20 border border-champagne-500/40 text-champagne-300 flex items-center justify-center font-serif text-xl font-bold">
                2
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Enter Verified Access Code</h3>
              <p className="text-xs text-cream-300/80 leading-relaxed">
                Provide your hotel's authorized access code to submit the inquiry. Our server verifies and records your requirements in our system with a unique reference number.
              </p>
            </div>

            <div className="bg-charcoal-900 border border-charcoal-800 p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-whatsapp-600/20 border border-whatsapp-500/40 text-whatsapp-500 flex items-center justify-center font-serif text-xl font-bold">
                3
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Direct WhatsApp Handoff</h3>
              <p className="text-xs text-cream-300/80 leading-relaxed">
                Get redirected to our official WhatsApp order desk (+91 91499 53610) with your prepared requirement list for personalized quotation and dispatch scheduling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-cream-100 via-white to-champagne-100 rounded-3xl p-8 sm:p-12 border border-champagne-300 shadow-luxury flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <span className="text-xs uppercase tracking-wider font-semibold text-champagne-700">Need Custom Hotel Logo Printing?</span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">Talk Directly with our Amenities Specialist</h2>
            <p className="text-sm text-charcoal-800 leading-relaxed">
              We offer bespoke labeling, luxury fragrance tailoring, and volume contract supply for hotel properties across India. Connect with us on WhatsApp for rapid responses.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <a
              href="https://wa.me/919149953610"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-whatsapp-600/20"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Connect on WhatsApp: +91 91499 53610</span>
            </a>
            <Link
              to="/quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Request Bulk Quotation
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AccessCodeModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} />
    </div>
  );
};
