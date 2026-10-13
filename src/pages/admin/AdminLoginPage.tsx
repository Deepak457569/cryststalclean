import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, Loader2, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

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

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate password reset');
      }
      setResetToken(data.reset_token || '');
      setResetStep('reset');
      setResetSuccess('Reset token generated! Please enter your new password below.');
    } catch (err: any) {
      setResetError(err.message || 'Error requesting reset token');
    } finally {
      setResetLoading(false);
    }
  };

  const handlePerformPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (newPassword.length < 8) {
      setResetError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), new_password: newPassword }),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowResetModal(false);
        setPassword('');
        setEmail(resetEmail);
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Error updating password');
    } finally {
      setResetLoading(false);
    }
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
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetEmail(email || 'crystalclean457@gmail.com');
                  setResetStep('request');
                  setResetError(null);
                  setResetSuccess(null);
                }}
                className="text-xs text-champagne-700 hover:text-champagne-800 hover:underline font-semibold"
              >
                Reset Password?
              </button>
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

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-cream-200 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                <Key className="w-6 h-6 text-champagne-600" />
                Reset Password
              </h2>
              <p className="text-xs text-charcoal-800">
                Update your administrator credentials for CrystalClean portal.
              </p>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestResetToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Authorized Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="crystalclean457@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                    />
                    <Mail className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-charcoal-700 mt-1">
                    Allowed: <code className="font-mono text-champagne-700">crystalclean457@gmail.com</code> or <code className="font-mono text-champagne-700">admin@crystalclean.in</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Reset Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePerformPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Reset Security Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter security token"
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    New Password (Min 8 Characters)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                    />
                    <Lock className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                    />
                    <Key className="w-4 h-4 text-charcoal-800 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="py-3 px-4 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
