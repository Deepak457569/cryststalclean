import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Shield, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { previewDrafts, setPreviewDrafts } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Catalog', path: '/products' },
    { label: 'Bulk quotation', path: '/quote' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {previewDrafts && (
        <div className="bg-ink text-white px-4 py-2 text-xs flex items-center justify-between border-b border-mist">
          <div className="max-w-content mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal" />
              <span>Admin preview active: unpublished drafts visible.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-teal hover:underline">Admin dashboard</Link>
              <button
                onClick={() => setPreviewDrafts(false)}
                className="text-slate hover:text-white"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <span className="font-semibold text-lg tracking-tight text-ink">
                CryststalClean
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors py-1 ${
                    isActive(link.path)
                      ? 'text-teal font-semibold'
                      : 'text-slate hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate hover:text-ink transition-colors"
              >
                WhatsApp +91 91499 53610
              </a>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-sm text-ink hover:text-teal transition-colors"
                aria-label="Requirements cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Requirements ({itemCount})</span>
              </Link>

              <Link
                to="/admin"
                title="Admin portal"
                className="text-slate hover:text-ink p-1"
                aria-label="Admin portal"
              >
                <Shield className="w-4 h-4" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-ink"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-mist px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-1.5 text-sm ${
                  isActive(link.path) ? 'text-teal font-semibold' : 'text-slate'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-mist">
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-1.5 text-sm text-slate hover:text-ink"
              >
                WhatsApp +91 91499 53610
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
