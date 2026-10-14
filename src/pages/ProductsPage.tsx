import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Layers, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { previewDrafts, setPreviewDrafts, adminUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (searchTerm) params.set('q', searchTerm);
        if (previewDrafts || searchParams.get('preview') === 'drafts') {
          params.set('preview', 'drafts');
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const prods: Product[] = data.products || [];
          setProducts(prods);

          // initialize selectors
          const initialVars: Record<string, string> = {};
          const initialQtys: Record<string, number> = {};
          prods.forEach((p) => {
            try {
              const vars = JSON.parse(p.variants_json || '[]');
              if (vars.length > 0) initialVars[p.id] = vars[0];
            } catch {}
            initialQtys[p.id] = 100;
          });
          setSelectedVariants((prev) => ({ ...initialVars, ...prev }));
          setQuantities((prev) => ({ ...initialQtys, ...prev }));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, previewDrafts, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('q', searchTerm);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId) {
      searchParams.set('category', catId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (product: Product) => {
    const variant = selectedVariants[product.id] || null;
    const qty = quantities[product.id] || 100;

    addToCart({
      productId: product.id,
      productName: product.name,
      variant,
      packSize: product.pack_size,
      quantity: qty,
      imageUrl: product.image_url,
    });

    setToastMessage(`Added ${qty} units of ${product.name} to requirements cart`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-champagne-500/50 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Hospitality Supply</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">Product Catalog</h1>
          <p className="text-sm text-charcoal-800 mt-1 max-w-xl">
            Configure amenities, bottles, and bespoke packaging for your property. Wholesale pricing is shared directly through verified customer access codes.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search toiletries, slippers, kits..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-champagne-500"
          />
          <Search className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-charcoal-900 text-white shadow-sm'
              : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
          }`}
        >
          All Amenities ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-24 text-charcoal-800 font-serif">
          Filtering amenities catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-champagne-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-charcoal-900">No amenities found</h3>
          <p className="text-sm text-charcoal-800 max-w-md mx-auto">
            Try adjusting your search query or selecting a different category from the filters above.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-charcoal-900 text-xs font-semibold rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            let variants: string[] = [];
            try {
              variants = JSON.parse(product.variants_json || '[]');
            } catch {}

            const currentVariant = selectedVariants[product.id] || (variants[0] || '');
            const currentQty = quantities[product.id] || 100;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-cream-200 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <Link to={`/product/${product.id}`} className="aspect-[4/3] overflow-hidden bg-[#FAF8F5] relative block border-b border-cream-200 p-4 flex items-center justify-center">
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

                {/* Body */}
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

                  {/* Variant Selection */}
                  {variants.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                        Select Variant / Packaging:
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

                  {/* Quantity & Add Action */}
                  <div className="pt-2 border-t border-cream-200">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                        Required Units:
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
    </div>
  );
};
