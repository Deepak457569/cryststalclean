import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Phone, Mail, MapPin, Key } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-950 text-cream-100 border-t border-charcoal-800 transition-colors">
      {/* WhatsApp Trade Hotline Banner */}
      <div className="bg-charcoal-900 border-b border-charcoal-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-whatsapp-600/20 border border-whatsapp-500/40 flex items-center justify-center text-whatsapp-500">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-white text-base">Direct Hospitality Order Desk</p>
              <p className="text-xs text-cream-300">Quick inquiries, availability checks &amp; customized branding quotations.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919149953610"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-whatsapp-600 hover:bg-whatsapp-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-whatsapp-600/10"
          >
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            <span>Chat on WhatsApp: +91 91499 53610</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border border-champagne-500/50 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="CryststalClean Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-widest text-white block">
                  CRYSTSTALCLEAN
                </span>
                <span className="text-[9px] tracking-[0.25em] font-semibold text-champagne-300 block uppercase">
                  Hotel Amenities &amp; Hospitality
                </span>
              </div>
            </Link>
            <p className="text-sm text-cream-300/80 leading-relaxed max-w-sm">
              Supplying high-end guest amenities, botanical personal care liquids, biodegradable dental accessories, and luxury room essentials to hotels, resorts, and hospitality chains nationwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-champagne-300/90 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Wholesale Hospitality Trade Supply Only</span>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-4 text-champagne-300">
              Amenities
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-300/80">
              <li><Link to="/products?category=cat_toiletries" className="hover:text-white transition-colors">Hotel Toiletries</Link></li>
              <li><Link to="/products?category=cat_shampoo" className="hover:text-white transition-colors">Shampoo &amp; Conditioner</Link></li>
              <li><Link to="/products?category=cat_soap" className="hover:text-white transition-colors">Soaps &amp; Bath Bars</Link></li>
              <li><Link to="/products?category=cat_dental" className="hover:text-white transition-colors">Dental Care Kits</Link></li>
              <li><Link to="/products?category=cat_shaving" className="hover:text-white transition-colors">Shaving &amp; Grooming</Link></li>
              <li><Link to="/products?category=cat_essentials" className="hover:text-white transition-colors">Guest Slippers &amp; Essentials</Link></li>
              <li><Link to="/products?category=cat_bulk" className="hover:text-white transition-colors">5-Litre Gallon Bulk Refills</Link></li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-4 text-champagne-300">
              Procurement
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-300/80">
              <li><Link to="/products" className="hover:text-white transition-colors">Explore All Products</Link></li>
              <li><Link to="/quote" className="hover:text-white transition-colors">Request Bulk Quotation</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Requirements Cart</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About CryststalClean</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Order Desk</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5"><Key className="w-3 h-3 text-champagne-500" /> Authorized Admin</Link></li>
            </ul>
          </div>

          {/* Corporate Desk */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-4 text-champagne-300">
              Supply Desk
            </h4>
            <ul className="space-y-3 text-xs text-cream-300/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-champagne-500 flex-shrink-0 mt-0.5" />
                <span>Hospitality Supply Center, Sector 18, Gurugram &amp; New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-whatsapp-500 flex-shrink-0" />
                <a href="tel:+919149953610" className="hover:text-white">+91 91499 53610</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-champagne-500 flex-shrink-0" />
                <a href="mailto:orders@crystalclean.in" className="hover:text-white">orders@crystalclean.in</a>
              </li>
              <li className="pt-2">
                <span className="inline-block bg-charcoal-900 border border-charcoal-800 text-[11px] text-cream-200 px-3 py-1.5 rounded-lg">
                  Nationwide Dispatch Across India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Access Code & Pricing Notice */}
        <div className="mt-12 pt-8 border-t border-charcoal-900">
          <div className="bg-charcoal-900/60 border border-charcoal-800/80 rounded-xl p-4 text-xs text-cream-300/70 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>
              <strong className="text-white">Confidential B2B Wholesale Policy:</strong> CryststalClean does not display public prices, discounts, or consumer checkouts. Tailored commercial quotations and bulk quantity discounts are shared directly with verified hotel partners upon access-code validation.
            </p>
            <div className="flex items-center gap-6 flex-shrink-0 text-xs">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Supply</Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-xs text-cream-300/50">
          &copy; {new Date().getFullYear()} CryststalClean Hotel Amenities &amp; Hospitality Supply. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
