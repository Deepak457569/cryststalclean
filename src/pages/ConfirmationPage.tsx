import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';

export const ConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();
  const state = (location.state as any) || {};

  const displayRef = reference || state.reference || 'CC-ORD-CONFIRMED';
  const whatsappUrl = state.whatsappUrl || `https://wa.me/919149953610?text=${encodeURIComponent(
    `Hello CryststalClean, following up on inquiry reference: ${displayRef}`
  )}`;

  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(displayRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8 animate-fade-in">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">
          Inquiry Successfully Recorded
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Thank You for Your Requirements
        </h1>
        <p className="text-sm text-charcoal-800 max-w-lg mx-auto leading-relaxed">
          Your product requirements have been saved to the CryststalClean procurement system. Please connect with our order desk via WhatsApp to finalize pricing, bulk tiers, and shipping schedules.
        </p>
      </div>

      {/* Reference Number Card */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6 md:p-8 shadow-luxury max-w-lg mx-auto text-center space-y-4">
        <p className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
          Your Unique Inquiry Reference
        </p>
        
        <div className="inline-flex items-center gap-3 bg-cream-50 px-5 py-3 rounded-xl border border-cream-300 font-mono text-lg font-bold text-charcoal-900">
          <span>{displayRef}</span>
          <button
            onClick={copyRef}
            className="p-1.5 hover:bg-cream-200 rounded-lg transition-colors text-charcoal-800"
            title="Copy Reference"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {copied && (
          <p className="text-xs text-emerald-600 font-medium animate-fade-in">Reference copied to clipboard!</p>
        )}

        {state.companyName && (
          <p className="text-xs text-charcoal-800">
            Registered for: <strong className="text-charcoal-900">{state.companyName}</strong>
          </p>
        )}
      </div>

      {/* WhatsApp Handoff CTA */}
      <div className="space-y-4 max-w-lg mx-auto">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-whatsapp-600/20"
        >
          <MessageCircle className="w-5 h-5 fill-white stroke-none" />
          <span>Open WhatsApp With Prepared Inquiry</span>
        </a>

        <p className="text-xs text-charcoal-800 leading-relaxed">
          If your WhatsApp window did not open automatically, click the button above to start your direct chat with our procurement team (+91 91499 53610).
        </p>
      </div>

      {/* Return home */}
      <div className="pt-6 border-t border-cream-200 flex justify-center gap-6 text-xs font-semibold">
        <Link to="/" className="text-charcoal-800 hover:text-charcoal-950">
          Return to Homepage
        </Link>
        <span className="text-cream-300">|</span>
        <Link to="/products" className="text-champagne-700 hover:text-charcoal-950 flex items-center gap-1">
          <span>Browse More Amenities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
