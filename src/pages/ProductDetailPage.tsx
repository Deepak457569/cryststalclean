import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const prod: Product = data.product;
          setProduct(prod);
          setActiveImage(prod.image_url);

          try {
            const vars = JSON.parse(prod.variants_json || '[]');
            if (vars.length > 0) setSelectedVariant(vars[0]);
          } catch {}
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-20 text-center text-slate text-sm">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-content mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-base font-medium text-ink">Product not found</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-teal hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </Link>
      </div>
    );
  }

  let gallery: string[] = [product.image_url];
  try {
    const parsed = JSON.parse(product.gallery_json || '[]');
    if (parsed.length > 0) gallery = parsed;
  } catch {}

  let variants: string[] = [];
  try {
    variants = JSON.parse(product.variants_json || '[]');
  } catch {}

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      variant: selectedVariant || null,
      packSize: product.pack_size,
      quantity,
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

      {/* Breadcrumb / Back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to catalog</span>
        </Link>
      </div>

      {/* Main product layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-porcelain rounded border border-mist overflow-hidden">
            <img
              src={activeImage}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/products/placeholder.svg';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded border overflow-hidden flex-shrink-0 transition-colors ${
                    activeImage === imgUrl ? 'border-ink' : 'border-mist'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/products/placeholder.svg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product data: strictly name, description, packaging, variants */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-mist pb-6">
            {product.category_name && (
              <p className="text-xs text-slate">
                {product.category_name}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              {product.name}
            </h1>
            {product.pack_size && (
              <p className="text-sm text-slate">
                Packaging: <span className="text-ink font-medium">{product.pack_size}</span>
              </p>
            )}
          </div>

          {product.description && (
            <div className="prose text-sm text-slate leading-relaxed border-b border-mist pb-6">
              <p>{product.description}</p>
            </div>
          )}

          {/* Variants from database */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate">
                Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      selectedVariant === v
                        ? 'border-ink bg-ink text-white'
                        : 'border-mist bg-white text-ink hover:border-slate'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-mist rounded bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(10, quantity - 50))}
                  className="px-3 py-1.5 text-sm text-slate hover:text-ink font-medium"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center text-sm font-medium py-1.5 border-x border-mist focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 50)}
                  className="px-3 py-1.5 text-sm text-slate hover:text-ink font-medium"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {[100, 250, 500].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="px-2.5 py-1 rounded border border-mist bg-porcelain text-slate hover:text-ink hover:border-slate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to requirements action */}
          <div className="pt-4 border-t border-mist flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-3 px-5 bg-ink hover:bg-slate text-white text-sm font-medium rounded transition-colors"
            >
              Add to requirements
            </button>
            <button
              type="button"
              onClick={() => {
                handleAdd();
                navigate('/cart');
              }}
              className="py-3 px-5 bg-white border border-mist hover:border-slate text-ink text-sm font-medium rounded transition-colors"
            >
              View requirements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
