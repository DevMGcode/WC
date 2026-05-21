'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      setError(response.message || 'Login fallido');
      return false;
    } catch {
      setError('Error de conexión');
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
      if (response.success && response.emailVerificationRequired) {
        return { ok: true, emailVerificationRequired: true, message: response.message };
      }
      if (response.success && response.data) {
        setUser(response.data.user);
        return { ok: true };
      }
      setError(response.message || 'Registro fallido');
      return { ok: false, message: response.message };
    } catch {
      setError('Error de conexión');
      return { ok: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('orionix-dock-visible');
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
