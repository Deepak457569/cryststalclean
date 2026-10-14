import React, { useState } from 'react';
import { Mail, MapPin, Clock, ShieldCheck, Key, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    hotel: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        inquiry_type: 'bulk_quote',
        customer_name: formData.name.trim(),
        company_name: formData.hotel.trim() || 'Hospitality Client',
        contact_phone: formData.phone.trim(),
        contact_email: formData.email.trim() || undefined,
        delivery_city: formData.city.trim() || 'Pan-India',
        notes: formData.message.trim(),
        items: [
          {
            product_name_snapshot: 'Direct Contact / Procurement Inquiry',
            quantity: 1,
            variant_snapshot: formData.hotel.trim() ? `Property: ${formData.hotel.trim()}` : undefined,
          },
        ],
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please check your details.');
        return;
      }

      setSubmittedRef(data.reference || 'CC-ORD-RECEIVED');
      setFormData({
        name: '',
        hotel: '',
        phone: '',
        email: '',
        city: '',
        message: '',
      });
    } catch {
      setErrorMsg('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              Direct Procurement Channels
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-charcoal-900 flex items-center justify-center text-champagne-300 flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-champagne-300 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">Official Executive Portal</span>
                  <span className="font-semibold text-charcoal-950 text-sm block mt-0.5">Direct Procurement Desk</span>
                  <span className="text-xs text-charcoal-800 block mt-0.5">Inquiries are logged directly into our executive management system with guaranteed same-day response.</span>
                </div>
              </div>

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
                  <span className="text-xs text-charcoal-800 block mt-0.5">Emergency hotel dispatch scheduling on request</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Direct Inquiry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmitInquiry}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-luxury space-y-5"
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-champagne-600" />
              <h2 className="font-serif font-bold text-2xl text-charcoal-900">
                Direct Inquiry &amp; Access Code Request
              </h2>
            </div>
            <p className="text-xs text-charcoal-800">
              Submit your property details below. Your request will be directly registered in our executive system and our procurement desk will contact you.
            </p>

            {submittedRef && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold text-sm">Inquiry Logged Successfully!</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Your reference number is <strong className="font-mono text-emerald-950 font-bold">{submittedRef}</strong>. Our hospitality procurement manager has received your submission in our administrative portal and will reach out to you promptly.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Hotel / Establishment *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotel}
                  onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                  placeholder="e.g. Royal Orchid Suites"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. purchase@hotel.com"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Jaipur, Bengaluru, New Delhi"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Your Inquiry or Requirement Details *
              </label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please state your room count, amenity requirements, custom branding needs, or request for an authorized Customer Access Code..."
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting to Executive Desk...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-champagne-300" />
                  <span>Submit Inquiry to Procurement Desk</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
