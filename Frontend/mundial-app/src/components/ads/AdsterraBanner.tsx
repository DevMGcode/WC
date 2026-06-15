'use client';

import { useMemo } from 'react';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';
import { ADSTERRA, BannerUnit } from '@/lib/ads/config';
import { useShowAds } from './useShowAds';

type BannerSlot = keyof typeof ADSTERRA.banners;

/**
 * Banner display de Adsterra (formato iframe / atOptions).
 *
 * Cada banner se renderiza dentro de un <iframe srcdoc> propio:
 *   - `atOptions` es una variable GLOBAL del script de Adsterra — si dos
 *     banners compartieran el documento, el segundo pisaría al primero.
 *     El iframe le da a cada unidad su propio scope.
 *   - Aísla el script externo del DOM de React (nada de hydration mismatch).
 *   - `loading="lazy"`: el anuncio no se descarga hasta acercarse al viewport.
 *
 * Solo se muestra a usuarios Free autenticados (useShowAds).
 */
export function AdsterraBanner({ slot, className = '' }: { slot: BannerSlot; className?: string }) {
  const showAds = useShowAds();
  const unit: BannerUnit = ADSTERRA.banners[slot];

  const srcDoc = useMemo(() => {
    const options = JSON.stringify({
      key: unit.key,
      format: 'iframe',
      height: unit.height,
      width: unit.width,
      params: {},
    });
    return [
      '<!doctype html><html><head><meta charset="utf-8">',
      '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>',
      '</head><body>',
      `<script>atOptions=${options};</script>`,
      `<script src="https://www.highperformanceformat.com/${unit.key}/invoke.js"></script>`,
      '</body></html>',
    ].join('');
  }, [unit]);

  if (!showAds) return null;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span
        className="text-[8px] font-bold tracking-[0.3em] uppercase"
        style={{ color: alpha(hex.text.muted, 0.55) }}
      >
        Publicidad
      </span>
      <iframe
        title={`Publicidad ${unit.width}x${unit.height}`}
        srcDoc={srcDoc}
        width={unit.width}
        height={unit.height}
        scrolling="no"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        style={{
          border: `1px solid ${alpha(hex.neutral.white, 0.05)}`,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'block',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}
