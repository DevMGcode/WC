'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/components/CookieConsent';
import { GOOGLE_ADSENSE } from '@/lib/ads/config';
import { useShowAds } from './useShowAds';

const ADSENSE_SRC =
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE.client}`;

/**
 * Google AdSense (Auto Ads) — solo usuarios Free autenticados.
 *
 * Carga el loader oficial de AdSense; Google inserta los anuncios
 * automáticamente según la configuración de Auto Ads del panel.
 *
 * Doble condición:
 *   - useShowAds(): plan Free con sesión iniciada (Premium = cero anuncios).
 *   - consentimiento de cookies aceptado — AdSense usa cookies de
 *     personalización, mismo criterio que Google Analytics en GAScripts.
 */
export function GoogleAdsense() {
  const showAds = useShowAds();
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (!GOOGLE_ADSENSE.enabled || !showAds || consent !== 'accepted') return;
    if (document.querySelector(`script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // No se retira al desmontar: AdSense no soporta unload limpio y el
    // upgrade a Premium pasa por una recarga completa (checkout/result).
  }, [showAds, consent]);

  return null;
}
