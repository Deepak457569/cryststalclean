import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Layers, ShieldCheck, Sparkles, MessageCircle, Package } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-charcoal-800 font-serif">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Product not found</h2>
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-champagne-700 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
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

  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(product.specs_json || '{}');
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

    setToastMessage(`Added ${quantity} units of ${product.name} to requirements!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-champagne-500/50 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-800 hover:text-charcoal-950 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>

      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-cream-200 shadow-md p-6 flex items-center justify-center">
            <img
              src={activeImage}
              alt={product.name}
              onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
              className="w-full h-full object-contain"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F5] p-1 flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                    activeImage === imgUrl ? 'border-champagne-500 scale-95 shadow-md' : 'border-cream-200 opacity-75'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} Thumbnail ${i + 1}`}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications & Add to Cart Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 bg-champagne-100 text-champagne-800 text-[11px] font-semibold tracking-wider uppercase rounded-md">
                {product.category_name || 'Hospitality Amenity'}
              </span>
              {(product.is_customizable === 1 || String(specs.customizable_logo) === 'true') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cream-100 border border-champagne-400/80 text-charcoal-900 text-[11px] font-semibold tracking-wide rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
                  Customizable with your logo
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
              {product.name}
            </h1>
            {product.pack_size && (
              <p className="text-xs text-charcoal-800 mt-2 font-medium">
                Standard Packaging: <span className="text-charcoal-900 font-semibold">{product.pack_size}</span>
              </p>
            )}
          </div>

          <p className="text-sm text-charcoal-800 leading-relaxed">
            {product.description}
          </p>

          {/* Trade confidentiality note (STRICT NO PRICING RULE) */}
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-300 text-xs text-charcoal-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-charcoal-900">Protected B2B Trade Pricing</p>
              <p className="text-charcoal-800 mt-0.5">
                Public prices are not shown. Tailored quotations with tiered volume discounts will be prepared when you submit your requirements via WhatsApp.
              </p>
            </div>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                Available Packaging &amp; Bottle Formats:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-3 text-left rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant === v
                        ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-sm'
                        : 'border-cream-300 bg-white text-charcoal-800 hover:border-charcoal-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
              Units Required:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-cream-300 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(10, quantity - 50))}
                  className="px-4 py-3 text-sm font-bold text-charcoal-800 hover:bg-cream-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-sm font-semibold py-3 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 50)}
                  className="px-4 py-3 text-sm font-bold text-charcoal-800 hover:bg-cream-100"
                >
                  +
                </button>
              </div>

              {/* Quick increment buttons */}
              <div className="flex items-center gap-2">
                {[100, 250, 500].map((quickQty) => (
                  <button
                    key={quickQty}
                    type="button"
                    onClick={() => setQuantity(quickQty)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-cream-300"
                  >
                    {quickQty} units
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAdd}
              className="flex-1 py-4 px-6 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-luxury hover:shadow-luxury-hover flex items-center justify-center gap-2.5"
            >
              <Layers className="w-4 h-4 text-champagne-400" />
              <span>Add to Requirements Cart</span>
            </button>
            <button
              onClick={() => {
                handleAdd();
                navigate('/cart');
              }}
              className="py-4 px-6 bg-champagne-100 hover:bg-champagne-200 text-charcoal-900 font-semibold rounded-xl text-sm transition-all border border-champagne-300"
            >
              View Cart &amp; Submit
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Accordion / Table */}
      {Object.keys(specs).length > 0 && (
        <div className="bg-white rounded-2xl p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-champagne-600" />
            <h3 className="font-serif text-2xl font-bold text-charcoal-900">Hospitality Specifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="p-4 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[11px] uppercase tracking-wider text-charcoal-800 font-semibold block">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold text-charcoal-900 text-sm mt-0.5 block">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
