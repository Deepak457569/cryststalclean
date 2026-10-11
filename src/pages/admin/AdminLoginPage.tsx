import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, adminUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (adminUser) {
      navigate('/admin');
    }

    const oauthError = searchParams.get('error');
    const deniedEmail = searchParams.get('email');
    if (oauthError === 'unauthorized_email') {
      setError(`Access Denied: The Google account (${deniedEmail || 'unknown'}) is not on the authorized CrystalClean administrator allowlist.`);
    } else if (oauthError === 'oauth_denied') {
      setError('Google Sign-In was cancelled or denied.');
    } else if (oauthError === 'oauth_not_configured') {
      setError('Google OAuth is not configured in this environment yet. Please use email/password login.');
    }
  }, [adminUser, searchParams, navigate]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid credentials or unauthorized email');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-cream-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-200 shadow-luxury p-8 sm:p-10 space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-cream-300 flex items-center justify-center p-1 mx-auto shadow-md">
            <img
              src="/logo.png"
              alt="CrystalClean Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Admin Authentication
          </h1>
          <p className="text-xs text-charcoal-800">
            CrystalClean Hotel Amenities Executive Management
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crystalclean.in"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
              <Mail className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
              />
              <Key className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In with Password'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-cream-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-semibold text-charcoal-800 uppercase tracking-wider">
            OR
          </span>
          <div className="border-t border-cream-200 w-full"></div>
        </div>

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-cream-100 text-charcoal-900 font-semibold rounded-xl text-sm transition-all border border-cream-300 shadow-sm flex items-center justify-center gap-3"
          >
            {/* Google SVG Monogram */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <p className="text-[11px] text-charcoal-800 text-center mt-2">
            Only accounts matching the configured admin allowlist will be admitted.
          </p>
        </div>

        {/* Security Note */}
        <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-charcoal-800">
          <Link to="/" className="text-champagne-700 hover:underline">
            &larr; Return to Website
          </Link>
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-bit PBKDF2 Secure
          </span>
        </div>
      </div>
    </div>
  );
};
