import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <Link
        to="/quote"
        aria-label="Request Bulk Quotation"
        className="flex items-center gap-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 border-2 border-champagne-400/40"
      >
        <FileText className="w-5 h-5 text-champagne-300" />
        <span className="font-semibold text-xs tracking-wider uppercase hidden sm:inline">Request Bulk Quote</span>
      </Link>
    </div>
  );
};
