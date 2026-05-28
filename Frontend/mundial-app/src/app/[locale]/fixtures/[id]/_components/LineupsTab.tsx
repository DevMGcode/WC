'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface LineupPlayer { playerId: number; playerName: string; shirtNumber: number; position: string; grid?: string; }
interface LineupTeam { teamId: number; teamName: string; teamLogoUrl: string; coachName: string; coachPhotoUrl?: string; formation: string; startXI: LineupPlayer[]; substitutes: LineupPlayer[]; }

function TeamLineup({ team, side }: { team: LineupTeam; side: 'home' | 'away' }) {
  const accent = side === 'home' ? hex.green.bright : hex.gold.base;
  const accentAlpha = side === 'home' ? alphaOf('green', 0.15) : alphaOf('gold', 0.15);

  return (
    <div className="flex-1 min-w-0">
      {/* Team header */}
      <div className={`flex items-center gap-2 mb-4 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
        {team.teamLogoUrl && (
          <div className="relative w-8 h-8 shrink-0">
            <Image src={team.teamLogoUrl} alt={team.teamName} fill className="object-contain" />
          </div>
        )}
        <div className={side === 'away' ? 'text-right' : ''}>
          <p className="text-[11px] font-black tracking-wide truncate" style={{ color: hex.text.primary }}>{team.teamName}</p>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-0.5"
            style={{ background: accentAlpha, border: `1px solid ${accent}30` }}>
            <span className="text-[9px] font-black tracking-widest" style={{ color: accent }}>{team.formation}</span>
          </div>
        </div>
      </div>

      {/* Starting XI */}
      <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-2" style={{ color: alpha(hex.text.secondary, 0.4) }}>
        TITULAR
      </p>
      <div className="space-y-1 mb-4">
        {team.startXI.map((p, i) => (
          <motion.div key={p.playerId} initial={{ opacity: 0, x: side === 'home' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${side === 'away' ? 'flex-row-reverse' : ''}`}
            style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
            <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
              style={{ background: accentAlpha, color: accent }}>
              {p.shirtNumber}
            </span>
            <span className="text-[11px] font-bold flex-1 truncate" style={{ color: hex.text.primary }}>{p.playerName}</span>
            <span className="text-[8px] font-bold shrink-0" style={{ color: alpha(hex.text.secondary, 0.4) }}>{p.position}</span>
          </motion.div>
        ))}
      </div>

      {/* Substitutes */}
      {team.substitutes.length > 0 && (
        <>
          <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-2" style={{ color: alpha(hex.text.secondary, 0.4) }}>
            SUPLENTES
          </p>
          <div className="space-y-1">
            {team.substitutes.map((p, i) => (
              <motion.div key={p.playerId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.03 }}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg ${side === 'away' ? 'flex-row-reverse' : ''}`}
                style={{ background: alpha(hex.neutral.white, 0.015) }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: alpha(hex.neutral.white, 0.05), color: alpha(hex.text.secondary, 0.5) }}>
                  {p.shirtNumber}
                </span>
                <span className="text-[10px] flex-1 truncate" style={{ color: alpha(hex.text.secondary, 0.6) }}>{p.playerName}</span>
                <span className="text-[8px] shrink-0" style={{ color: alpha(hex.text.secondary, 0.3) }}>{p.position}</span>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Coach */}
      {team.coachName && (
        <div className={`flex items-center gap-2 mt-4 pt-3 ${side === 'away' ? 'flex-row-reverse' : ''}`}
          style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
            <span className="text-xs">🎽</span>
          </div>
          <div className={side === 'away' ? 'text-right' : ''}>
            <p className="text-[8px] font-black tracking-widest uppercase" style={{ color: alpha(hex.text.secondary, 0.35) }}>DT</p>
            <p className="text-[10px] font-bold" style={{ color: alpha(hex.text.secondary, 0.7) }}>{team.coachName}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LineupsTab({ fixtureId }: { fixtureId: number }) {
  const [lineups, setLineups] = useState<LineupTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty,   setEmpty]   = useState(false);

  useEffect(() => {
    fetch(`/api/v1/public/fixtures/${fixtureId}/lineups`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const data = d?.data ?? [];
        setLineups(data);
        setEmpty(data.length === 0);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1].map(i => (
        <div key={i} className="space-y-2">
          {Array.from({ length: 11 }).map((_, j) => (
            <div key={j} className="h-8 rounded-lg animate-pulse" style={{ background: alpha(hex.neutral.white, 0.04), animationDelay: `${j * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );

  if (empty || lineups.length < 2) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">📋</span>
      <p className="text-sm font-bold text-center" style={{ color: alpha(hex.text.secondary, 0.5) }}>
        Alineaciones no disponibles aún
      </p>
      <p className="text-[10px] tracking-widest uppercase text-center" style={{ color: alpha(hex.text.secondary, 0.3) }}>
        Se publican cerca del inicio del partido
      </p>
    </div>
  );

  const [home, away] = lineups;
  return (
    <div className="flex gap-4">
      <TeamLineup team={home} side="home" />
      <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.06) }} />
      <TeamLineup team={away} side="away" />
    </div>
  );
}
