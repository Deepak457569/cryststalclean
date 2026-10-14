import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { adminUser, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Add noindex meta tag dynamically for search engines
    let metaTag = document.querySelector('meta[name="robots"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'robots');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', 'noindex, nofollow');

    if (adminUser) {
      navigate('/admin');
    }

    const oauthError = searchParams.get('error');
    const deniedEmail = searchParams.get('email');
    if (oauthError === 'unauthorized_email') {
      setError(`Access Denied: The Google account (${deniedEmail || 'unknown'}) is not on the authorized CryststalClean administrator allowlist.`);
    } else if (oauthError === 'oauth_denied') {
      setError('Google Sign-In was cancelled or denied.');
    } else if (oauthError === 'oauth_not_configured') {
      setError('Google OAuth credentials are not configured in this environment. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    } else if (oauthError === 'invalid_oauth_state') {
      setError('Security validation failed: invalid OAuth state. Please try logging in again.');
    } else if (oauthError === 'token_exchange_failed' || oauthError === 'userinfo_failed') {
      setError('Authentication failed during secure token verification with Google.');
    }
  }, [adminUser, searchParams, navigate]);

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid administrative passcode.');
        return;
      }

      loginWithToken(data.token, data.user);
      navigate('/admin');
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-cream-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-200 shadow-luxury p-8 sm:p-10 space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-cream-300 flex items-center justify-center p-1 mx-auto shadow-md">
            <img
              src="/logo.png"
              alt="CryststalClean Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Admin Authentication
          </h1>
          <p className="text-xs text-charcoal-800">
            CryststalClean Hotel Amenities Executive Portal
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Free Direct Passcode Login Form */}
        <form onSubmit={handlePasscodeLogin} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                required
                className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-champagne-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-700 cursor-pointer p-1"
                title={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passcode.trim()}
            className="w-full py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-champagne-400" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-champagne-400" />
                <span>Sign In with Passcode</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-cream-200"></div>
          <span className="flex-shrink mx-4 text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">or sign in with</span>
          <div className="flex-grow border-t border-cream-200"></div>
        </div>

        {/* Alternative SSO Options */}
        <div className="space-y-3">
          {/* Cloudflare Zero Trust OTP */}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full py-2.5 px-4 bg-cream-100 hover:bg-cream-200 border border-cream-300 text-charcoal-900 font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cloudflare Zero Trust (Email OTP)</span>
          </button>

          {/* Google OAuth Section */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-cream-100 border border-cream-300 text-charcoal-800 font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {/* Google Monogram SVG */}
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-charcoal-800">
          <Link to="/" className="text-champagne-700 hover:underline">
            &larr; Return to Website
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-charcoal-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            OAuth 2.0 Restricted
          </span>
        </div>
      </div>
    </div>
  );
};
