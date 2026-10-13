import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  loading: boolean;
  previewDrafts: boolean;
  setPreviewDrafts: (val: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);
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
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user);
      } else {
        setAdminUser(null);
        setToken(null);
        localStorage.removeItem('cc_token');
      }
    } catch {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('cc_token', data.token);
      }
      setAdminUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

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
    <AuthContext.Provider value={{ adminUser, token, loading, previewDrafts, setPreviewDrafts, login, logout, checkAuth }}>
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
