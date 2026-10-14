import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Hospitality Supply</span>
        <h1 className="font-serif text-4xl font-bold text-charcoal-900">Amenity Categories</h1>
        <p className="text-sm text-charcoal-800 leading-relaxed">
          From luxury organic shampoos and hand-crafted bath bars to plush velvet slippers and eco-friendly dental kits, explore our full catalog of wholesale hospitality collections.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-charcoal-800 font-serif">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F5] relative p-4 flex items-center justify-center border-b border-cream-200">
                <img
                  src={cat.image_url || '/products/placeholder.svg'}
                  alt={cat.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900 group-hover:text-champagne-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-charcoal-800 mt-2 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-semibold text-champagne-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Explore Amenities
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
