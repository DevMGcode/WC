'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook que lee el estado Premium del usuario autenticado.
 *
 * El backend expone `isPremium` en el LoginResponse y en GET /users/{id}.
 * Como se guarda en localStorage al hacer login, esta función simplemente
 * lo lee del AuthContext (sin hacer fetch).
 *
 * Si el usuario está Premium → `true`.
 * Si es Free, no autenticado, o cargando → `false`.
 *
 * Para refrescar el estado tras un pago, hay que volver a leer el usuario
 * del backend (ej. tras volver de /checkout/result) y actualizar el contexto.
 */
export function usePremium(): {
  isPremium: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { user, loading, isAuthenticated } = useAuth();

  return {
    isPremium: !!user?.isPremium,
    isLoading: loading,
    isAuthenticated,
  };
}
