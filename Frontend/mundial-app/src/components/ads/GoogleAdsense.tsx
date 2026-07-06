'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/components/CookieConsent';
import { GOOGLE_ADSENSE } from '@/lib/ads/config';
import { usePremium } from '@/hooks/usePremium';

/**
 * Rutas CON contenido editorial — ALLOWLIST (política AdSense "Valor del
 * inventario": los anuncios de Google solo pueden aparecer junto a contenido
 * del editor; están prohibidos en pantallas funcionales — login, registro,
 * checkout, perfil, porras, onboarding, admin — y en pantallas de carga).
 * El script SOLO se carga en estas rutas; cualquier ruta nueva queda sin
 * anuncios por defecto (allowlist, no blocklist).
 */
const CONTENT_ROUTES = /^\/[a-z]{2}(\/(fixtures|groups|scorers|about|faq|terms|privacy)(\/.*)?)?$/;

// El script carga para todos en rutas de contenido (necesario para que el
// crawler de Google verifique el sitio). Para usuarios Premium se pausa la
// entrega de anuncios vía la API de AdSense. El consentimiento controla la
// personalización.
export function GoogleAdsense() {
  const { consent } = useCookieConsent();
  const { isPremium, isLoading } = usePremium();
  const pathname = usePathname() ?? '';
  const isContentRoute = CONTENT_ROUTES.test(pathname);

  // Navegación SPA: si el usuario entra por una ruta de contenido (script ya
  // cargado) y navega a una funcional (p. ej. /login), el script no se puede
  // "descargar". Se pausan las solicitudes y se ocultan por CSS los contenedores
  // ya inyectados (incluye anclados de Auto Ads); al volver a contenido, se reanuda.
  useEffect(() => {
    if (!GOOGLE_ADSENSE.enabled) return;
    const w = window as { adsbygoogle?: { pauseAdRequests?: number } };
    if (w.adsbygoogle) w.adsbygoogle.pauseAdRequests = isContentRoute ? 0 : 1;
    document.documentElement.toggleAttribute('data-hide-google-ads', !isContentRoute);
  }, [isContentRoute]);

  if (!GOOGLE_ADSENSE.enabled) return null;
  if (!isContentRoute) return null;

  const personalized = consent === 'accepted';
  const pauseAds = !isLoading && isPremium;

  return (
    <>
      {pauseAds && (
        <Script id="adsense-pause" strategy="afterInteractive">
          {`(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;`}
        </Script>
      )}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE.client}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        data-ad-personalization-allowed={personalized ? '1' : '0'}
      />
    </>
  );
}
