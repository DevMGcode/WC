'use client';

import { AdsterraBanner } from './AdsterraBanner';
import { useShowAds } from './useShowAds';
import { alpha } from '@/lib/design/effects';
import { hex } from '@/lib/design/tokens';

/**
 * Contenedor estilizado para anuncios inline.
 *
 * Aparece entre secciones de contenido — nunca al pie de la página
 * donde compete con el dock de navegación. Muestra el banner 320×50
 * en móvil y el 300×250 en sm+. Solo visible para usuarios Free.
 */
export function AdSlot({ className = '' }: { className?: string }) {
  const showAds = useShowAds();
  if (!showAds) return null;

  const divider = (dir: 'left' | 'right') =>
    `linear-gradient(90deg, ${dir === 'left' ? 'transparent' : alpha(hex.neutral.white, 0.07)}, ${dir === 'left' ? alpha(hex.neutral.white, 0.07) : 'transparent'})`;

  return (
    <div className={`my-6 ${className}`}>
      {/* Separador superior */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: divider('left') }} />
        <span
          className="text-[8px] font-black tracking-[0.35em] uppercase select-none"
          style={{ color: alpha(hex.text.muted, 0.35) }}
        >
          Publicidad
        </span>
        <div className="flex-1 h-px" style={{ background: divider('right') }} />
      </div>

      {/* Anuncio centrado */}
      <div className="flex justify-center">
        <div className="sm:hidden">
          <AdsterraBanner slot="mobile320x50" />
        </div>
        <div className="hidden sm:block">
          <AdsterraBanner slot="rect300x250" />
        </div>
      </div>

      {/* Separador inferior */}
      <div className="flex items-center mt-4">
        <div className="flex-1 h-px" style={{ background: divider('left') }} />
        <div className="flex-1 h-px" style={{ background: divider('right') }} />
      </div>
    </div>
  );
}
