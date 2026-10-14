import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  loading: boolean;
  previewDrafts: boolean;
  setPreviewDrafts: (val: boolean) => void;
  loginWithToken: (newToken: string, user: AdminUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);

  const loginWithToken = (newToken: string, user: AdminUser) => {
    localStorage.setItem('cc_token', newToken);
    setToken(newToken);
    setAdminUser(user);
    setLoading(false);
  };
  const [previewDrafts, setPreviewDraftsState] = useState<boolean>(() => {
    return localStorage.getItem('cc_preview_drafts') === 'true' || window.location.search.includes('preview=drafts');
  });

  const setPreviewDrafts = (val: boolean) => {
    setPreviewDraftsState(val);
    if (val) {
      localStorage.setItem('cc_preview_drafts', 'true');
    } else {
      localStorage.removeItem('cc_preview_drafts');
    }
  };

  const checkAuth = async () => {
    const currentToken = token || localStorage.getItem('cc_token');
    try {
      const headers: Record<string, string> = {};
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user);
        if (currentToken && !token) {
          setToken(currentToken);
        }
      } else if (res.status === 401 || res.status === 403) {
        setAdminUser(null);
        setToken(null);
        localStorage.removeItem('cc_token');
      }
    } catch (err) {
      console.warn('Network error during auth verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setAdminUser(null);
    setToken(null);
    setPreviewDrafts(false);
    localStorage.removeItem('cc_token');
  };

  return (
    <AuthContext.Provider value={{ adminUser, token, loading, previewDrafts, setPreviewDrafts, loginWithToken, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
