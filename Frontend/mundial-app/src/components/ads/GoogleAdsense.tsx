'use client';

import Script from 'next/script';
import { useCookieConsent } from '@/components/CookieConsent';
import { GOOGLE_ADSENSE } from '@/lib/ads/config';
import { useShowAds } from './useShowAds';

export function GoogleAdsense() {
  const showAds = useShowAds();
  const { consent } = useCookieConsent();

  if (!GOOGLE_ADSENSE.enabled || !showAds || consent !== 'accepted') return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE.client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
