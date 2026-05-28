'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface StatTeam { teamId: number; teamName: string; teamLogoUrl: string; statistics: Record<string, string>; }

const STAT_LABELS: Record<string, string> = {
  'Ball Possession': 'Posesión', 'Total Shots': 'Tiros totales', 'Shots on Goal': 'Tiros a puerta',
  'Shots off Goal': 'Tiros fuera', 'Blocked Shots': 'Tiros bloqueados', 'Corner Kicks': 'Córners',
  'Offsides': 'Fueras de juego', 'Fouls': 'Faltas', 'Yellow Cards': 'Tarjetas amarillas',
  'Red Cards': 'Tarjetas rojas', 'Goalkeeper Saves': 'Paradas', 'Total passes': 'Pases totales',
  'Passes accurate': 'Pases precisos', 'Passes %': '% de pases', 'expected_goals': 'xG',
};

function parseNum(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(v.replace('%', '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function StatBar({ label, homeVal, awayVal }: { label: string; homeVal: string; awayVal: string }) {
  const isPercent = homeVal?.includes('%') || awayVal?.includes('%');
  const h = parseNum(homeVal);
  const a = parseNum(awayVal);
  const total = h + a;
  const homePct = total > 0 ? (h / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-black tabular-nums" style={{ color: hex.green.bright }}>{homeVal || '0'}</span>
        <span className="text-[8px] font-black tracking-widest uppercase text-center flex-1 px-2" style={{ color: alpha(hex.text.secondary, 0.45) }}>
          {STAT_LABELS[label] ?? label}
        </span>
        <span className="text-[11px] font-black tabular-nums" style={{ color: hex.gold.base }}>{awayVal || '0'}</span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: alpha(hex.neutral.white, 0.06) }}>
        <motion.div className="absolute left-0 top-0 h-full rounded-full"
          initial={{ width: 0 }} animate={{ width: `${homePct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${hex.green.bright}, ${hex.green.hover})` }} />
        <motion.div className="absolute right-0 top-0 h-full rounded-full"
          initial={{ width: 0 }} animate={{ width: `${100 - homePct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: `linear-gradient(270deg, ${hex.gold.base}, ${alpha(hex.gold.base, 0.7)})` }} />
      </div>
    </div>
  );
}

export default function StatisticsTab({ fixtureId }: { fixtureId: number }) {
  const [stats,   setStats]   = useState<StatTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty,   setEmpty]   = useState(false);

  useEffect(() => {
    fetch(`/api/v1/public/fixtures/${fixtureId}/statistics`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const data = d?.data ?? [];
        setStats(data);
        setEmpty(data.length === 0);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 rounded animate-pulse" style={{ background: alpha(hex.neutral.white, 0.05) }} />
          <div className="h-1.5 rounded-full animate-pulse" style={{ background: alpha(hex.neutral.white, 0.04) }} />
        </div>
      ))}
    </div>
  );

  if (empty || stats.length < 2) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">📊</span>
      <p className="text-sm font-bold" style={{ color: alpha(hex.text.secondary, 0.5) }}>Estadísticas no disponibles</p>
      <p className="text-[10px] tracking-widest uppercase" style={{ color: alpha(hex.text.secondary, 0.3) }}>
        Disponibles durante y después del partido
      </p>
    </div>
  );

  const [home, away] = stats;
  const allKeys = Object.keys(home.statistics);

  return (
    <div>
      {/* Team headers */}
      <div className="flex items-center justify-between mb-5">
        {[home, away].map((team, i) => (
          <div key={team.teamId} className={`flex items-center gap-2 ${i === 1 ? 'flex-row-reverse' : ''}`}>
            {team.teamLogoUrl && (
              <div className="relative w-6 h-6 shrink-0">
                <Image src={team.teamLogoUrl} alt={team.teamName} fill className="object-contain" />
              </div>
            )}
            <span className="text-[10px] font-black truncate max-w-[80px]"
              style={{ color: i === 0 ? hex.green.bright : hex.gold.base }}>{team.teamName}</span>
          </div>
        ))}
      </div>

      {/* Stat bars */}
      <div className="space-y-4">
        {allKeys.map(key => (
          <StatBar key={key} label={key}
            homeVal={home.statistics[key] ?? '0'}
            awayVal={away.statistics[key] ?? '0'} />
        ))}
      </div>
    </div>
  );
}
