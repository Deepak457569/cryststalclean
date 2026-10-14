import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { previewDrafts } = useAuth();
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

    setToastMessage(`Added ${product.name} to requirements`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded text-sm flex items-center gap-2 border border-mist shadow-sm"
        >
          <Check className="w-4 h-4 text-teal" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-mist">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Catalog
          </h1>
          <p className="text-sm text-slate mt-1">
            Browse hotel amenities, personal care products, and room essentials.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-mist rounded text-sm text-ink placeholder-slate focus:outline-none focus:border-slate"
          />
          <Search className="w-4 h-4 text-slate absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-mist scrollbar-none">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-ink text-white'
              : 'bg-white text-slate hover:text-ink border border-mist'
          }`}
        >
          All ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-ink text-white'
                : 'bg-white text-slate hover:text-ink border border-mist'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid: 4-col desktop, 2-col tablet, 1-2 col mobile */}
      {loading ? (
        <div className="text-center py-20 text-slate text-sm">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-mist rounded p-8 space-y-3">
          <p className="text-base font-medium text-ink">No products found</p>
          <p className="text-sm text-slate">
            Try adjusting your search query or choosing another category.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="px-4 py-2 bg-white border border-mist hover:border-slate text-xs font-medium text-ink rounded transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      <h2 className="font-medium text-sm text-ink hover:text-teal transition-colors line-clamp-2">
                        {product.name}
                      </h2>
                    </Link>

                    {product.pack_size && (
                      <p className="text-xs text-slate">
                        Packaging: {product.pack_size}
                      </p>
                    )}

                    {product.description && (
                      <p className="text-xs text-slate line-clamp-2 leading-relaxed">
                        {product.description}
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

                <div className="p-4 pt-0 space-y-2 border-t border-mist mt-3">
                  <div className="flex items-center justify-between text-xs text-slate pt-2">
                    <span>Units</span>
                    <div className="flex items-center border border-mist rounded bg-porcelain">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantities({
                            ...quantities,
                            [product.id]: Math.max(10, currentQty - 50),
                          })
                        }
                        className="px-2 py-0.5 text-xs text-slate hover:text-ink"
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
                        className="w-12 text-center text-xs bg-transparent border-x border-mist py-0.5 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantities({
                            ...quantities,
                            [product.id]: currentQty + 50,
                          })
                        }
                        className="px-2 py-0.5 text-xs text-slate hover:text-ink"
                      >
                        +
                      </button>
                    </div>
                  </div>

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
      )}
    </div>
  );
};
