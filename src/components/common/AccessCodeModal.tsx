import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ShieldCheck, MessageCircle, X, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid?: boolean;
    client_name?: string;
    remaining_uses?: number;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode.trim()) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/access-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testCode.trim() }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch {
      setVerificationResult({ valid: false, message: 'Could not connect to verification server' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-luxury-hover border border-champagne-300 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-charcoal-800 hover:text-charcoal-950 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-champagne-100 border border-champagne-300 flex items-center justify-center text-champagne-700">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-charcoal-900">Customer Access Code System</h3>
            <p className="text-xs uppercase tracking-wider text-champagne-700 font-semibold">Verified Hospitality Procurement</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-sm text-charcoal-800 space-y-3 mb-6 bg-cream-50 p-4 rounded-xl border border-cream-200">
          <p>
            CryststalClean operates strictly as an exclusive B2B supplier for hotels, luxury resorts, boutique villas, and bulk hospitality buyers.
          </p>
          <p>
            To prevent automated spam and preserve wholesale price confidentiality, <strong>a valid Access Code is required</strong> before submitting any product inquiry or bulk quotation.
          </p>
          <div className="flex items-center gap-2 text-xs text-charcoal-900 font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Public visitors can freely browse specifications and configure orders.</span>
          </div>
        </div>

        {/* Test Code Verification Box */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
            Verify Your Assigned Access Code
          </label>
          <form onSubmit={handleVerify} className="flex gap-2">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g. CC-HOTEL-2026"
              className="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
            <button
              type="submit"
              disabled={verifying || !testCode.trim()}
              className="px-5 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
            </button>
          </form>

          {/* Test verification feedback */}
          {verificationResult && (
            <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2.5 ${
              verificationResult.valid
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {verificationResult.valid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Valid Access Code!</p>
                    <p>Assigned to: <span className="font-medium">{verificationResult.client_name}</span></p>
                    <p className="text-[11px] opacity-80 mt-0.5">Remaining inquiries: {verificationResult.remaining_uses}</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verification Failed</p>
                    <p>{verificationResult.message || 'Code not recognized or expired'}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Button to Request Code */}
        <div className="border-t border-cream-200 pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/contact');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-sm transition-all shadow-md"
          >
            <Send className="w-4 h-4 text-champagne-300" />
            Request Access Code Online
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-cream-100 hover:bg-cream-200 text-charcoal-800 rounded-xl text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
