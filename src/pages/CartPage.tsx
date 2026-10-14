import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, ShoppingBag, ArrowRight, ShieldCheck, Key, 
  MessageCircle, Loader2, AlertCircle, CheckCircle, Plus, Minus, Send, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AccessCodeModal } from '../components/common/AccessCodeModal';
import { TurnstileWidget } from '../components/TurnstileWidget';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();
  const navigate = useNavigate();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  // Access code live checking state
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeVerification, setCodeVerification] = useState<{
    valid?: boolean;
    client_name?: string;
    remaining_uses?: number;
    message?: string;
  } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  // Live access code check
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

    if (items.length === 0) {
      setErrorMsg('Your requirements cart is empty.');
      return;
    }

    if (!customerName.trim() || !companyName.trim() || !contactPhone.trim() || !deliveryCity.trim()) {
      setErrorMsg('Please complete all required fields (Contact Person, Hotel/Company, Phone, Delivery City).');
      return;
    }

    if (!accessCode.trim()) {
      setErrorMsg('A valid customer access code is required to submit requirements.');
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
        inquiry_type: 'cart',
        access_code: accessCode.trim().toUpperCase(),
        customer_name: customerName.trim(),
        company_name: companyName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        delivery_city: deliveryCity.trim(),
        expected_date: expectedDate || undefined,
        notes: notes.trim() || undefined,
        turnstile_token: turnstileToken || undefined,
        items: items.map((i) => ({
          product_id: i.productId,
          product_name: i.productName,
          variant: i.variant,
          pack_size: i.packSize,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please check your access code.');
        setSubmitting(false);
        return;
      }

      // Inquiry successfully recorded in database!
      clearCart();

      // Navigate to confirmation page
      navigate(`/confirmation/${data.reference}`, {
        state: {
          reference: data.reference,
          whatsappUrl: data.whatsapp_url,
          customerName: customerName.trim(),
          companyName: companyName.trim(),
          itemCount: items.length,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-champagne-600 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Your Requirements Cart is Empty</h1>
        <p className="text-sm text-charcoal-800 max-w-md mx-auto leading-relaxed">
          Browse our hotel amenities catalog to select products, specify quantities, and configure your property's order.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
        >
          <span>Explore Product Catalog</span>
          <ArrowRight className="w-4 h-4 text-champagne-400" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Procurement Step Progress */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Procurement Review</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">Requirements Cart</h1>
            <p className="text-sm text-charcoal-800 mt-1 leading-relaxed">
              Review your selected amenities, configure hotel delivery specifications, and submit for direct quotation.
            </p>
          </div>
          <div className="text-xs text-charcoal-800 bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5">
            <span className="font-semibold text-charcoal-900">{items.length} items</span> ({itemCount} total units)
          </div>
        </div>

        {/* 3-Step visual progress helper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-champagne-100/60 border border-champagne-300">
            <span className="w-6 h-6 rounded-full bg-champagne-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div className="text-xs">
              <span className="font-bold text-charcoal-900 block">Review Items</span>
              <span className="text-charcoal-800">Adjust unit quantities</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
            <span className="w-6 h-6 rounded-full bg-charcoal-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div className="text-xs">
              <span className="font-bold text-charcoal-900 block">Property Details</span>
              <span className="text-charcoal-800">Hotel &amp; delivery city</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
            <span className="w-6 h-6 rounded-full bg-charcoal-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div className="text-xs">
              <span className="font-bold text-charcoal-900 block">Access Code &amp; Quote</span>
              <span className="text-charcoal-800">Direct portal &amp; WhatsApp log</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Items Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <h2 className="font-serif font-bold text-lg text-charcoal-900">
                Selected Products ({itemCount} total units)
              </h2>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-cream-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                    className="w-16 h-16 rounded-xl object-contain bg-[#FAF8F5] p-1 border border-cream-200 flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-sm text-charcoal-900 truncate">
                      {item.productName}
                    </h3>
                    {item.variant && (
                      <p className="text-xs text-champagne-700 font-medium mt-0.5">
                        Variant: {item.variant}
                      </p>
                    )}
                    {item.packSize && (
                      <p className="text-[11px] text-charcoal-800">
                        Pack Standard: {item.packSize}
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50 flex-shrink-0 overflow-hidden shadow-inner">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 50))}
                      className="px-2.5 py-1.5 text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-200 active:scale-95 transition-all"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center text-xs font-semibold bg-transparent py-1.5 border-x border-cream-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 50)}
                      className="px-2.5 py-1.5 text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-200 active:scale-95 transition-all"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-charcoal-800 hover:text-rose-600 transition-colors flex-shrink-0"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-cream-200 flex justify-between items-center text-xs text-charcoal-800">
              <Link to="/products" className="text-champagne-700 font-semibold hover:underline inline-flex items-center gap-1">
                <span>&larr; Add more products</span>
              </Link>
              <span>{items.length} distinct item types</span>
            </div>
          </div>

          {/* Wholesale notice */}
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs text-charcoal-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-charcoal-900">Wholesale Volume Pricing</p>
              <p className="mt-0.5 leading-relaxed">
                Direct quotation with customized branding, bulk tier discounts, and freight timeline will be generated upon submission.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hotel Details & Verified Access Code Submission (Sticky on desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8 shadow-luxury space-y-5">
            <h2 className="font-serif font-bold text-xl text-charcoal-900 pb-2 border-b border-cream-200">
              Procurement &amp; Dispatch Details
            </h2>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Hotel Name */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Hotel / Resort / Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. The Grand Hotel &amp; Suites"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Vikram Singhania (Procurement Head)"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Contact Phone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="procurement@hotel.com"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>
            </div>

            {/* City & Expected Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Delivery City / State *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="e.g. Bengaluru / Goa / Delhi"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                />
              </div>
            </div>

            {/* Special notes */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                Special Notes / Custom Logo Requirements
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention custom logo printing, fragrance preferences, or delivery instructions..."
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            {/* CUSTOMER ACCESS CODE INPUT */}
            <div className="p-4 rounded-xl bg-champagne-100/50 border border-champagne-300 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-champagne-700" />
                  Customer Access Code *
                </label>
                <button
                  type="button"
                  onClick={() => setCodeModalOpen(true)}
                  className="text-[11px] text-champagne-800 hover:text-charcoal-950 font-semibold underline transition-colors"
                >
                  Need a code?
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
                  className="flex-1 px-4 py-2.5 bg-white border border-champagne-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyCode(accessCode)}
                  disabled={checkingCode || !accessCode.trim()}
                  className="px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {checkingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                </button>
              </div>

              {/* Code Verification Badge */}
              {codeVerification && (
                <div className={`mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  codeVerification.valid
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {codeVerification.valid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Verified Access Code</p>
                        <p>Issued to: <span className="font-medium">{codeVerification.client_name}</span></p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Invalid Code</p>
                        <p>{codeVerification.message || 'Please verify code spelling or request one.'}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Turnstile Captcha */}
            <div>
              <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-luxury hover:shadow-luxury-hover flex items-center justify-center gap-2.5 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-champagne-400" />
                  <span>Recording Requirements...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-champagne-400" />
                  <span>Submit Requirements for Quotation</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-charcoal-800/80 text-center leading-relaxed">
              Upon submission, your reference number is generated instantly and forwarded to our executive desk for volume quotation.
            </p>
          </div>
        </div>

      </form>

      {/* Access Code Modal */}
      <AccessCodeModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} />
    </div>
  );
};
