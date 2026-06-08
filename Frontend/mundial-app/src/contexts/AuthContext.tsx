'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { authService, AuthUser, RegisterRequest } from '@/services/auth';

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (req: RegisterRequest) => Promise<{ ok: boolean; emailVerificationRequired?: boolean; message?: string }>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  // null / true on both server and client first render → no hydration mismatch
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runs only on client after hydration completes
  useEffect(() => {
    const token = authService.getToken();
    const saved  = authService.getUser();
    if (token && saved) setUser(saved);
    setLoading(false);
  }, []);

  // Escucha cambios de usuario disparados por otros componentes (ej. /auth/refresh
  // tras un upgrade a Premium). Evita la necesidad de logout/login para que la
  // UI refleje el nuevo plan inmediatamente.
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as AuthUser | undefined;
      if (!detail) return;
      try {
        // Persistimos también el user para que sobreviva al refresh de página.
        window.localStorage.setItem('user', JSON.stringify(detail));
      } catch {}
      setUser(detail);
    };
    window.addEventListener('auth:user-updated', onUpdate);
    return () => window.removeEventListener('auth:user-updated', onUpdate);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        // Limpiar flags de UI por-sesión para que onboarding (modal Premium,
        // tours, etc.) se muestren de nuevo al login con cualquier cuenta.
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('orionix.premiumModalShown');
        }
        return true;
      }
      setError(response.message || t('errors.invalidLogin'));
      return false;
    } catch {
      setError(t('errors.connection'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (req: RegisterRequest): Promise<{ ok: boolean; emailVerificationRequired?: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(req);
      if (response.success) {
        if (response.data) setUser(response.data.user);
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('orionix.premiumModalShown');
        }
        return { ok: true, emailVerificationRequired: response.emailVerificationRequired ?? true, message: response.message };
      }
      setError(response.message || t('register.genericError'));
      return { ok: false, message: response.message };
    } catch {
      setError(t('errors.connection'));
      return { ok: false, message: t('errors.connection') };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('orionix-dock-visible');
      window.sessionStorage.removeItem('orionix.premiumModalShown');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}
