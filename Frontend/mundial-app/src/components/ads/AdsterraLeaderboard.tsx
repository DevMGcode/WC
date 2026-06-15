'use client';

import { useEffect, useState } from 'react';
import { AdsterraBanner } from './AdsterraBanner';

type LeaderboardSlot = 'leader728x90' | 'banner468x60' | 'mobile320x50';

/**
 * Leaderboard horizontal responsivo: una sola colocación que sirve la
 * unidad correcta según el ancho de pantalla:
 *   ≥768px → 728x90 (desktop) · ≥520px → 468x60 (tablet) · resto → 320x50 (móvil)
 *
 * La unidad se decide una sola vez al montar (los iframes de Adsterra son de
 * tamaño fijo y recargar el anuncio en cada resize penaliza las métricas).
 * Hereda el gating de AdsterraBanner: solo usuarios Free autenticados.
 */
export function AdsterraLeaderboard({ className = '' }: { className?: string }) {
  const [slot, setSlot] = useState<LeaderboardSlot | null>(null);

  useEffect(() => {
    const w = window.innerWidth;
    setSlot(w >= 768 ? 'leader728x90' : w >= 520 ? 'banner468x60' : 'mobile320x50');
  }, []);

  if (!slot) return null;
  return <AdsterraBanner slot={slot} className={className} />;
}
