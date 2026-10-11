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
              <div className="aspect-[4/3] overflow-hidden bg-cream-100 relative">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal-950/20 group-hover:bg-charcoal-950/10 transition-colors"></div>
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
