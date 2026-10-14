import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const defaultMessage = encodeURIComponent(
    'Hello CryststalClean,\n\nI would like to inquire about hotel amenities and wholesale supply options for our property.\n\nThank you.'
  );
  const waUrl = `https://wa.me/919149953610?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Procurement Chat"
        className="flex items-center gap-3 bg-whatsapp-600 hover:bg-whatsapp-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 border-2 border-white/40"
      >
        <MessageCircle className="w-6 h-6 fill-white stroke-none" />
        <span className="font-semibold text-sm tracking-wide hidden sm:inline">WhatsApp Order Desk</span>
      </a>
      <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-charcoal-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap border border-charcoal-800">
          +91 91499 53610 (Direct B2B Hotline)
        </div>
      </div>
    </div>
  );
};
