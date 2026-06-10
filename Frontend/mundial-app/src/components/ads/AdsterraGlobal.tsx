'use client';

import { useEffect } from 'react';
import { ADSTERRA } from '@/lib/ads/config';
import { useShowAds } from './useShowAds';

/**
 * Formatos globales de Adsterra (no anclados a un slot de página):
 *   - Social Bar: widget flotante que el propio script posiciona.
 *   - Popunder: desactivado por defecto en la config (ver nota allí).
 *
 * Se monta una sola vez en el layout y solo inyecta los scripts para
 * usuarios Free autenticados. Al pasar a Premium el flujo de checkout
 * recarga la página, así que los scripts no persisten tras el upgrade.
 */
export function AdsterraGlobal() {
  const showAds = useShowAds();

  useEffect(() => {
    if (!showAds) return;

    const injected: HTMLScriptElement[] = [];

    const inject = (src: string) => {
      // Evita duplicados si el efecto corre dos veces (StrictMode / re-mount)
      if (document.querySelector(`script[src="${src}"]`)) return;
      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      document.body.appendChild(script);
      injected.push(script);
    };

    if (ADSTERRA.socialBar.enabled) inject(ADSTERRA.socialBar.scriptSrc);
    if (ADSTERRA.popunder.enabled)  inject(ADSTERRA.popunder.scriptSrc);

    return () => { injected.forEach(s => s.remove()); };
  }, [showAds]);

  return null;
}
