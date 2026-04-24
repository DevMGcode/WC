'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '@/services/auth';

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getUser();

        if (token && savedUser) {
          setUser(savedUser);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Login fallido');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    displayName: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(email, displayName, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Registro fallido');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
