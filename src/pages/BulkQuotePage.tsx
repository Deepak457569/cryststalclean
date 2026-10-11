import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MessageCircle, ShieldCheck, Key, Loader2, 
  AlertCircle, CheckCircle, Sparkles 
} from 'lucide-react';
import { Category } from '../types';
import { AccessCodeModal } from '../components/common/AccessCodeModal';

export const BulkQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState('500 - 1,000 units / month');
  const [notes, setNotes] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [customLogoRequired, setCustomLogoRequired] = useState(false);
  const [customBrandingNotes, setCustomBrandingNotes] = useState('');

  // Access code check state
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeVerification, setCodeVerification] = useState<{
    valid?: boolean;
    client_name?: string;
    remaining_uses?: number;
    message?: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleVerifyCode = async (codeToTest: string) => {
    if (!codeToTest.trim()) {
      setCodeVerification(null);
      return;
    }
    setCheckingCode(true);
    try {
      const res = await fetch('/api/access-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToTest.trim() }),
      });
      const data = await res.json();
      setCodeVerification(data);
    } catch {
      setCodeVerification({ valid: false, message: 'Could not connect to verification server' });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !companyName.trim() || !contactPhone.trim() || !deliveryCity.trim()) {
      setErrorMsg('Please fill in all mandatory contact information.');
      return;
    }

    if (!accessCode.trim()) {
      setErrorMsg('A valid customer access code is required for wholesale quotation requests.');
      return;
    }

    if (selectedCategories.length === 0) {
      setErrorMsg('Please select at least one amenity category of interest.');
      return;
    }

    setSubmitting(true);

    try {
      const combinedNotes = [
        `Requested Categories: ${selectedCategories.join(', ')}`,
        `Estimated Volume: ${estimatedQuantity}`,
        customLogoRequired ? `Logo Customization Required: Yes (Bags/Packaging/Amenities)` : '',
        customBrandingNotes.trim() ? `Branding Details: ${customBrandingNotes.trim()}` : '',
        notes.trim() ? `Specifications: ${notes.trim()}` : '',
      ].filter(Boolean).join('\n');

      const payload = {
        inquiry_type: 'bulk_quote',
        access_code: accessCode.trim().toUpperCase(),
        customer_name: customerName.trim(),
        company_name: companyName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        delivery_city: deliveryCity.trim(),
        expected_date: expectedDate || undefined,
        notes: combinedNotes,
        items: selectedCategories.map((catName) => ({
          product_name: `Bulk Category Request: ${catName}${customLogoRequired ? ' (Logo Customization Required)' : ''}`,
          pack_size: estimatedQuantity,
          quantity: 1,
        })),
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit quotation request. Please verify your access code.');
        setSubmitting(false);
        return;
      }

      // Open WhatsApp handoff
      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank');
      }

      // Redirect to confirmation
      navigate(`/confirmation/${data.reference}`, {
        state: {
          reference: data.reference,
          whatsappUrl: data.whatsapp_url,
          customerName: customerName.trim(),
          companyName: companyName.trim(),
          isBulkQuote: true,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting request. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-100 border border-champagne-300 text-champagne-700 text-xs font-semibold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-champagne-600" />
          Trade Procurement Desk
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Request Bulk Hospitality Quotation
        </h1>
        <p className="text-sm text-charcoal-800 max-w-xl mx-auto leading-relaxed">
          For chain hotels, luxury resorts, boutique villas, and large-scale hospitality contracts. Customized logo printing, custom fragrance development, and scheduled monthly dispatches.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-200 p-8 sm:p-12 shadow-luxury space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Property & Contact Info */}
        <div className="space-y-5">
          <h2 className="font-serif font-bold text-lg text-charcoal-900 border-b border-cream-200 pb-2">
            1. Property &amp; Procurement Officer Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Hotel / Resort / Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Radisson Blu Resort &amp; Spa"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Verma (General Manager)"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Contact Phone (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 91499 53610"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="procurement@hotel.com"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Delivery City &amp; State *
              </label>
              <input
                type="text"
                required
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="e.g. Jaipur, Rajasthan / Goa"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Target Dispatch Date
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Products Required */}
        <div className="space-y-5">
          <h2 className="font-serif font-bold text-lg text-charcoal-900 border-b border-cream-200 pb-2">
            2. Amenities Required (Select all that apply)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat.name);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    checked
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-sm'
                      : 'border-cream-300 bg-cream-50 text-charcoal-800 hover:border-charcoal-400'
                  }`}
                >
                  <span>{cat.name}</span>
                  {checked && <CheckCircle className="w-4 h-4 text-champagne-400" />}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Estimated Volume / Room Count
              </label>
              <select
                value={estimatedQuantity}
                onChange={(e) => setEstimatedQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              >
                <option value="Under 500 units (Sample / Boutique Trial)">Under 500 units (Sample / Boutique Trial)</option>
                <option value="500 - 1,000 units / month">500 - 1,000 units / month</option>
                <option value="1,000 - 3,000 units / month">1,000 - 3,000 units / month</option>
                <option value="5,000+ units / month (Chain Contract)">5,000+ units / month (Chain Contract)</option>
                <option value="Institutional 5-Litre Gallon Dispensers">Institutional 5-Litre Gallon Dispensers</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-charcoal-900 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={customLogoRequired}
                  onChange={(e) => setCustomLogoRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-champagne-600 focus:ring-champagne-500 border-cream-300"
                />
                <span>Logo Customization Requirement (for Bags, Coasters, Glass Wraps &amp; Amenities)</span>
              </label>
              <input
                type="text"
                value={customBrandingNotes}
                onChange={(e) => setCustomBrandingNotes(e.target.value)}
                placeholder="e.g. Yes, hotel logo on carry bags and coasters"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Specific Fragrance or Formulation Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specify requirements such as paraben-free formulas, bamboo handles, white tea fragrance, or custom bottle shapes..."
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
        </div>

        {/* Section 3: Verified Access Code */}
        <div className="p-6 rounded-2xl bg-champagne-100/60 border border-champagne-300 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-champagne-700" />
              Customer Access Code *
            </label>
            <button
              type="button"
              onClick={() => setCodeModalOpen(true)}
              className="text-xs text-champagne-800 hover:text-charcoal-950 font-semibold underline"
            >
              Request Access Code via WhatsApp
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              required
              value={accessCode}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setAccessCode(val);
                if (val.length >= 6) {
                  handleVerifyCode(val);
                } else {
                  setCodeVerification(null);
                }
              }}
              placeholder="Enter code (e.g. CC-HOTEL-2026)"
              className="flex-1 px-4 py-2.5 bg-white border border-champagne-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
            <button
              type="button"
              onClick={() => handleVerifyCode(accessCode)}
              disabled={checkingCode || !accessCode.trim()}
              className="px-5 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-medium"
            >
              {checkingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
          </div>

          {codeVerification && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              codeVerification.valid
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {codeVerification.valid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Access Code Verified</p>
                    <p>Registered Property: <span className="font-medium">{codeVerification.client_name}</span></p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Code Not Recognized</p>
                    <p>{codeVerification.message || 'Please contact CrystalClean on WhatsApp for an active code.'}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-whatsapp-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording Quotation &amp; Preparing WhatsApp...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                <span>Submit Quotation Request &amp; Handoff to WhatsApp</span>
              </>
            )}
          </button>
          <p className="text-xs text-charcoal-800 text-center mt-3 leading-relaxed">
            Upon submission, your quotation parameters are saved in our database with a unique inquiry reference (e.g. CC-ORD-XXXX) and you are connected directly to our executive on WhatsApp (+91 91499 53610).
          </p>
        </div>
      </form>

      {/* Access Code Modal */}
      <AccessCodeModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} />
    </div>
  );
};
