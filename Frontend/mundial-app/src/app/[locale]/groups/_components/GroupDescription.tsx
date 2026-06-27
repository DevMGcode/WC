'use client';

/**
 * Bloque de texto editorial que acompaña a cada tabla de grupo.
 * El contenido lo arma buildGroupNarrative() a partir de los datos reales,
 * y se renderiza dentro de GroupCard (debajo de la leyenda, antes del footer).
 *
 * Importa: aporta contenido textual original e indexable para SEO/AdSense.
 */
import React from 'react';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { buildGroupNarrative } from './groupNarrative';
import type { Group } from './types';

const GroupDescription = ({ group, locale }: { group: Group; locale: string }) => {
  const text = buildGroupNarrative(group, locale);
  if (!text) return null;

  const label = locale.toLowerCase().startsWith('en') ? 'Group analysis' : 'Análisis del grupo';

  return (
    <div className="px-5 py-3.5"
      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.04)}`, background: alpha(hex.neutral.black, 0.12) }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-1 h-3 rounded-full" style={{ background: hex.green.muted }} />
        <span className="text-[8px] font-black tracking-[0.22em] uppercase"
          style={{ color: alphaOf('green', 0.6) }}>
          {label}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: alpha(hex.text.secondary, 0.62) }}>
        {text}
      </p>
    </div>
  );
};

export default React.memo(GroupDescription);
