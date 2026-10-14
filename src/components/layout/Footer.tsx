import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-mist mt-auto text-sm text-slate">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-semibold text-ink text-base tracking-tight block">
              CryststalClean
            </span>
            <p className="text-slate text-sm max-w-md leading-relaxed">
              B2B supplier of guest amenities and room essentials for hotels and resorts in India.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-teal font-medium transition-colors"
              >
                WhatsApp +91 91499 53610
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-ink text-sm mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-slate hover:text-ink transition-colors">
                  Catalog
                </Link>
              </li>
              <li>
                <Link to="/quote" className="text-slate hover:text-ink transition-colors">
                  Bulk quotation
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate hover:text-ink transition-colors">
                  Requirements
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate hover:text-ink transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate hover:text-ink transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Policy & Admin */}
          <div>
            <h3 className="font-semibold text-ink text-sm mb-3">Policy</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate block">B2B wholesale supply only</span>
              </li>
              <li>
                <span className="text-slate block">Direct WhatsApp quotation</span>
              </li>
              <li className="pt-2">
                <Link to="/admin" className="text-slate hover:text-ink transition-colors text-xs">
                  Admin portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-mist flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
          <p>&copy; {new Date().getFullYear()} CryststalClean. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
