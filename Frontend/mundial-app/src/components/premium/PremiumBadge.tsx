'use client';

/**
 * Insignia "PRO" visible al lado del nombre de un usuario Premium
 * en rankings, lista de miembros de liga, perfil, etc.
 *
 * Se renderiza solo si `isPremium === true`. Si es false/undefined → nada.
 */

import { FiZap } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

interface PremiumBadgeProps {
  isPremium?: boolean | null;
  size?: 'sm' | 'md';
  /** Si true, solo muestra el icono ⚡ (sin texto). Útil en filas estrechas. */
  iconOnly?: boolean;
}

export function PremiumBadge({ isPremium, size = 'sm', iconOnly = false }: PremiumBadgeProps) {
  if (!isPremium) return null;

  const dim = size === 'md'
    ? { padX: 8, padY: 2, fontSize: 10, iconSize: 11 }
    : { padX: 6, padY: 1, fontSize: 9,  iconSize: 9  };

  return (
    <span
      title="Usuario con Pase Mundial Premium"
      className="inline-flex items-center gap-1 rounded-full font-black tracking-wider uppercase shrink-0"
      style={{
        padding: `${dim.padY}px ${dim.padX}px`,
        background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
        color: hex.neutral.black,
        fontSize: `${dim.fontSize}px`,
        boxShadow: `0 2px 8px ${alpha(hex.gold.base, 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.30)}`,
        verticalAlign: 'middle',
      }}
    >
      <FiZap size={dim.iconSize} style={{ fill: hex.neutral.black }} />
      {!iconOnly && 'PRO'}
    </span>
  );
}
