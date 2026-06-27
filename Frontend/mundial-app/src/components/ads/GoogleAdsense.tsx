'use client';

import Script from 'next/script';
import { useCookieConsent } from '@/components/CookieConsent';
import { GOOGLE_ADSENSE } from '@/lib/ads/config';
import { usePremium } from '@/hooks/usePremium';

// El script carga para todos (necesario para que el crawler de Google verifique
// el sitio). Para usuarios Premium se pausa la entrega de anuncios vía la API
// de AdSense. El consentimiento controla la personalización.
export function GoogleAdsense() {
  const { consent } = useCookieConsent();
  const { isPremium, isLoading } = usePremium();

  if (!GOOGLE_ADSENSE.enabled) return null;

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
