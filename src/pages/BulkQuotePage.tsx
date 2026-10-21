import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MessageCircle, ShieldCheck, Key, Loader2, 
  AlertCircle, CheckCircle, Sparkles, Send
} from 'lucide-react';
import { Category } from '../types';
import { AccessCodeModal } from '../components/common/AccessCodeModal';
import { TurnstileWidget } from '../components/TurnstileWidget';

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
  const [turnstileToken, setTurnstileToken] = useState('');

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

    const cleanPhone = contactPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
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

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      setErrorMsg('Please complete the security verification challenge before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        inquiry_type: 'bulk_quote',
        access_code: accessCode.trim().toUpperCase(),
        customer_name: customerName.trim(),
        company_name: companyName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        delivery_city: deliveryCity.trim(),
        expected_date: expectedDate || undefined,
        notes: [
          `Estimated Monthly Volume: ${estimatedQuantity}`,
          `Categories Requested: ${selectedCategories.join(', ')}`,
          customLogoRequired ? `Custom Logo: YES (${customBrandingNotes})` : 'Custom Logo: No',
          notes ? `Additional Specs: ${notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        turnstile_token: turnstileToken || undefined,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit quote request. Please verify your access code.');
        setSubmitting(false);
        return;
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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne-100 border border-champagne-300 text-champagne-800 text-xs font-semibold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-champagne-600" />
          Trade Procurement Desk
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 leading-tight">
          Request Bulk Hospitality Quotation
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-800 max-w-xl mx-auto leading-relaxed">
          For chain hotels, luxury resorts, boutique villas, and large-scale hospitality contracts. Customized logo printing, custom fragrance development, and scheduled monthly dispatches.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl border border-cream-200 p-5 sm:p-10 lg:p-12 shadow-luxury space-y-6 sm:space-y-8">
        {errorMsg && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 sm:gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Property & Contact Info */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="font-serif font-bold text-base sm:text-lg text-charcoal-900 border-b border-cream-200 pb-2">
            1. Property &amp; Procurement Officer Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium transition-colors"
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
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                  Contact Phone (WhatsApp) *
                </label>
                <span className="text-[11px] text-charcoal-600 font-mono">
                  {contactPhone ? `${contactPhone.length}/10 digits` : '10 digits'}
                </span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                value={contactPhone}
                onChange={(e) => {
                  let cleaned = e.target.value.replace(/\D/g, '');
                  if (cleaned.startsWith('91') && cleaned.length > 10) {
                    cleaned = cleaned.slice(2);
                  } else if (cleaned.startsWith('0') && cleaned.length > 10) {
                    cleaned = cleaned.slice(1);
                  }
                  setContactPhone(cleaned.slice(0, 10));
                }}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-mono font-medium transition-colors"
              />
              {contactPhone && contactPhone.length !== 10 && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Mobile number must be exactly 10 digits
                </p>
              )}
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
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium transition-colors"
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
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium transition-colors"
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
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Products Required */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="font-serif font-bold text-base sm:text-lg text-charcoal-900 border-b border-cream-200 pb-2">
            2. Amenities Required (Select all that apply)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat.name);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`p-3 sm:p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between active:scale-95 ${
                    checked
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-sm'
                      : 'border-cream-300 bg-cream-50 text-charcoal-800 hover:border-charcoal-400'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  {checked && <CheckCircle className="w-4 h-4 text-champagne-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Estimated Volume / Room Count
              </label>
              <select
                value={estimatedQuantity}
                onChange={(e) => setEstimatedQuantity(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
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
                <span>Logo Customization Requirement (Bags, Coasters, Glass Wraps)</span>
              </label>
              <input
                type="text"
                value={customBrandingNotes}
                onChange={(e) => setCustomBrandingNotes(e.target.value)}
                placeholder="e.g. Yes, hotel logo on carry bags and coasters"
                className="w-full px-3.5 sm:px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
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
              className="w-full px-3.5 sm:px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
        </div>

        {/* Section 3: Verified Access Code */}
        <div className="p-4 sm:p-6 rounded-2xl bg-champagne-100/60 border border-champagne-300 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-champagne-700" />
              Customer Access Code *
            </label>
            <button
              type="button"
              onClick={() => setCodeModalOpen(true)}
              className="text-xs text-champagne-800 hover:text-charcoal-950 font-semibold underline text-left sm:text-right"
            >
              Request Access Code via WhatsApp
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
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
              className="flex-1 px-3.5 sm:px-4 py-2.5 bg-white border border-champagne-300 rounded-xl text-base sm:text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
            <button
              type="button"
              onClick={() => handleVerifyCode(accessCode)}
              disabled={checkingCode || !accessCode.trim()}
              className="px-5 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-50"
            >
              {checkingCode ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify Code'}
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
                    <p>{codeVerification.message || 'Please contact CryststalClean on WhatsApp for an active code.'}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cloudflare Turnstile Human Verification (only if configured) */}
        {Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY) && (
          <TurnstileWidget
            onVerify={(token) => {
              setTurnstileToken(token);
              setErrorMsg(null);
            }}
            onExpire={() => setTurnstileToken('')}
            onError={(err) => setErrorMsg(err)}
          />
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 sm:py-4 px-6 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording Quotation...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-champagne-300" />
                <span>Submit Quotation Request</span>
              </>
            )}
          </button>
          <p className="text-[11px] sm:text-xs text-charcoal-800 text-center mt-3 leading-relaxed">
            Upon submission, your quotation parameters are saved directly to our procurement database and logged in the executive admin portal with a unique tracking reference (e.g. CC-ORD-XXXX).
          </p>
        </div>
      </form>

      {/* Access Code Modal */}
      <AccessCodeModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} />
    </div>
  );
};
