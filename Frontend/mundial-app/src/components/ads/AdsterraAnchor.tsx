'use client';

import { useShowAds } from './useShowAds';
import { AdsterraBanner } from './AdsterraBanner';

/**
 * Banner ancla 320×50 fijo justo encima del dock de navegación móvil.
 * Solo visible en móvil (< sm) para usuarios Free autenticados.
 * z-40 — debajo del dock z-50, encima del contenido de página.
 */
export function AdsterraAnchor() {
  const showAds = useShowAds();
  if (!showAds) return null;

  return (
    <div
      className="sm:hidden fixed left-0 right-0 z-40 flex justify-center"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(to top, rgba(5,13,7,0.97) 55%, rgba(5,13,7,0))',
        backdropFilter: 'blur(6px)',
        paddingTop: 6,
        paddingBottom: 4,
      }}
    >
      <AdsterraBanner slot="mobile320x50" />
    </div>
  );
}
