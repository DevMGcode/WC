'use client';

import { usePremium } from '@/hooks/usePremium';
import { ADSTERRA } from '@/lib/ads/config';

/**
 * Regla única de visibilidad de anuncios:
 *   - Adsterra habilitado globalmente
 *   - sesión iniciada y resuelta (sin parpadeo durante la carga)
 *   - plan Free (Premium = cero anuncios, es su beneficio principal)
 *
 * No se muestran anuncios a visitantes anónimos: las únicas páginas públicas
 * son login/registro/legales y ensuciarlas perjudica la conversión.
 */
export function useShowAds(): boolean {
  const { isPremium, isLoading, isAuthenticated } = usePremium();
  return ADSTERRA.enabled && !isLoading && isAuthenticated && !isPremium;
}
