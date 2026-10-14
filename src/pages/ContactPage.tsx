import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Clock, ShieldCheck, Key, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    hotel: '',
    phone: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleQuickWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = [
      `Hello CryststalClean,`,
      ``,
      `I am reaching out regarding hotel amenities procurement.`,
      `Name: ${formData.name}`,
      `Hotel/Establishment: ${formData.hotel}`,
      `Phone: ${formData.phone}`,
      `Inquiry: ${formData.message}`,
      ``,
      `Thank you.`
    ].join('\n');

    window.open(`https://wa.me/919149953610?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Get in Touch</span>
        <h1 className="font-serif text-4xl font-bold text-charcoal-900">Hospitality Supply Desk</h1>
        <p className="text-sm text-charcoal-800 leading-relaxed">
          Connect directly with our procurement team for wholesale quotes, access code issuance, custom branding samples, and delivery timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-xl text-charcoal-900 border-b border-cream-200 pb-3">
              Direct Contact Channels
            </h2>

            <div className="space-y-4">
              <a
                href="https://wa.me/919149953610"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-2xl bg-whatsapp-600/10 border border-whatsapp-500/30 hover:bg-whatsapp-600/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-whatsapp-600 flex items-center justify-center text-white flex-shrink-0">
                  <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                </div>
                <div>
                  <span className="text-xs font-bold text-whatsapp-700 uppercase tracking-wider block">Official WhatsApp Desk</span>
                  <span className="font-semibold text-charcoal-950 text-base block mt-0.5">+91 91499 53610</span>
                  <span className="text-xs text-charcoal-800 block mt-0.5">Instant quotes, sample dispatch &amp; ordering</span>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-charcoal-900 flex items-center justify-center text-champagne-300 flex-shrink-0 shadow-sm">
                  <Mail className="w-5 h-5 text-champagne-300 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">Official Procurement Email</span>
                  <a href="mailto:orders@crystalclean.in" className="font-semibold text-charcoal-950 text-sm block mt-0.5 hover:underline">
                    orders@crystalclean.in
                  </a>
                  <span className="text-xs text-charcoal-800 block mt-0.5">Formal RFP, tenders &amp; invoice communications</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-charcoal-900 flex items-center justify-center text-champagne-300 flex-shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5 text-champagne-300 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">Distribution Hub</span>
                  <span className="font-semibold text-charcoal-950 text-sm block mt-0.5">
                    Sector 18, Gurugram &amp; New Delhi, India
                  </span>
                  <span className="text-xs text-charcoal-800 block mt-0.5">
                    Express freight delivery to hotels nationwide
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-charcoal-900 flex items-center justify-center text-champagne-300 flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-champagne-300 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">Operating Hours</span>
                  <span className="font-semibold text-charcoal-950 text-sm block mt-0.5">
                    Monday to Saturday: 9:00 AM – 7:30 PM IST
                  </span>
                  <span className="text-xs text-charcoal-800 block mt-0.5">Emergency Sunday hotel dispatches on request</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Inquiry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleQuickWhatsApp}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-luxury space-y-5"
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-champagne-600" />
              <h2 className="font-serif font-bold text-2xl text-charcoal-900">
                Send a Direct Message or Request Access Code
              </h2>
            </div>
            <p className="text-xs text-charcoal-800">
              Submit your property details below to instantly connect with our specialist on WhatsApp with a pre-filled request.
            </p>

            {sent && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Redirecting to WhatsApp (+91 91499 53610)...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Anand Mehra"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Hotel / Establishment Name *
              </label>
              <input
                type="text"
                required
                value={formData.hotel}
                onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                placeholder="e.g. Royal Orchid Hotel &amp; Suites"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Your Inquiry or Access Code Request
              </label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please state your room count, amenity requirements, or request for an authorized Customer Access Code..."
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-whatsapp-600/20 flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Connect on WhatsApp Now</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
