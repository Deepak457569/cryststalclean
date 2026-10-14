import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-mist">
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
          Categories
        </h1>
        <p className="text-sm text-slate mt-1 max-w-xl">
          Browse hospitality supplies by product collection.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate text-sm">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
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
                <h2 className="font-medium text-xs sm:text-sm text-ink group-hover:text-teal transition-colors line-clamp-2">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs text-slate line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                )}
                <div className="mt-3 pt-2 border-t border-mist flex items-center justify-between text-xs text-teal">
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
