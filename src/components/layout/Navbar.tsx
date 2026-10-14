import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Key, Menu, X, Shield, PhoneCall, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { AccessCodeModal } from '../common/AccessCodeModal';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { previewDrafts, setPreviewDrafts } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Product Catalog', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'Bulk Quotation', path: '/quote' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {previewDrafts && (
        <div className="bg-amber-500 text-charcoal-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm z-50 relative">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-charcoal-950 flex-shrink-0" />
              <span>Admin Preview Active: Viewing unpublished draft catalog (Local review enabled).</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin" className="underline hover:text-charcoal-800">Admin Dashboard</Link>
              <button
                onClick={() => setPreviewDrafts(false)}
                className="px-2.5 py-0.5 bg-charcoal-900 text-white rounded-md text-[11px] font-semibold hover:bg-charcoal-800 transition-colors"
              >
                Exit Preview
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 transition-all">
        {/* Top Hospitality Service Bar */}
        <div className="bg-charcoal-900 text-cream-100 text-xs py-1.5 px-4 sm:px-8 border-b border-charcoal-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="flex items-center gap-1.5 font-medium tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne-500 inline-block animate-pulse"></span>
              Official B2B Hospitality Amenities Supply Desk
            </p>
            <div className="flex items-center gap-4 text-[11px] tracking-wider">
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-champagne-300 transition-colors flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3 text-whatsapp-500" />
                WhatsApp: +91 91499 53610
              </a>
              <span className="text-charcoal-800">|</span>
              <button
                onClick={() => setCodeModalOpen(true)}
                className="text-champagne-500 hover:text-champagne-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Key className="w-3 h-3" />
                Access Code Info
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border border-cream-300 shadow-sm group-hover:scale-105 transition-transform p-0.5">
                <img
                  src="/logo.png"
                  alt="CryststalClean Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-charcoal-900 block leading-tight">
                  CRYSTSTALCLEAN
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-champagne-600 block uppercase">
                  Hotel Amenities &amp; Hospitality
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm tracking-wide font-medium py-1.5 px-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'text-charcoal-950 font-semibold bg-champagne-100/70'
                      : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Access Code Indicator */}
              <button
                onClick={() => setCodeModalOpen(true)}
                title="Customer Access Code Status"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider text-charcoal-800 bg-cream-100 hover:bg-champagne-100 rounded-lg border border-cream-200 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-champagne-600" />
                <span>Access Code</span>
              </button>

              {/* Requirements Cart CTA */}
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm group"
              >
                <ShoppingBag className="w-4 h-4 text-champagne-300" />
                <span className="hidden sm:inline">Requirements</span>
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-charcoal-950 bg-champagne-300 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Admin Portal Shortcut */}
              <Link
                to="/admin"
                title="Authorized Admin Portal"
                className="p-2.5 text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-100 rounded-xl transition-colors border border-cream-200"
              >
                <Shield className="w-4 h-4" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-charcoal-900 hover:bg-cream-100 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-cream-300 px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-champagne-100 text-charcoal-950 font-semibold'
                    : 'text-charcoal-800 hover:bg-cream-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCodeModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold bg-cream-100 text-charcoal-800 rounded-lg border border-cream-300"
              >
                <Key className="w-4 h-4 text-champagne-600" />
                Customer Access Code Status
              </button>
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold bg-whatsapp-600 text-white rounded-lg"
              >
                WhatsApp Hotline: +91 91499 53610
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Access Code Explanation Modal */}
      <AccessCodeModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} />
    </>
  );
};
