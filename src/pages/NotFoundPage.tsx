import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-champagne-600 mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-champagne-700">404 Error</span>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
        Page Not Found
      </h1>
      <p className="text-sm text-charcoal-800 leading-relaxed max-w-md mx-auto">
        The amenity page or resource you are looking for does not exist or may have been relocated.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-champagne-400" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
