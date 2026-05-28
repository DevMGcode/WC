'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface MatchPlayer {
  playerId: number; playerName: string; teamId: number; teamName: string;
  shirtNumber: number; position: string; minutes: number; rating: string;
  goals: number; assists: number; shotsTotal: number; shotsOn: number;
  yellowCards: number; redCards: number; captain: boolean; substitute: boolean;
}

function RatingBadge({ rating }: { rating: string }) {
  const n = parseFloat(rating);
  const color = isNaN(n) ? alpha(hex.text.secondary, 0.4) : n >= 8 ? hex.green.bright : n >= 7 ? hex.green.hover : n >= 6 ? hex.gold.base : hex.status.danger;
  if (!rating || rating === '0') return <span style={{ color: alpha(hex.text.secondary, 0.3) }}>—</span>;
  return <span className="font-black" style={{ color }}>{Number(rating).toFixed(1)}</span>;
}

function PlayerTable({ players, accent }: { players: MatchPlayer[]; accent: string }) {
  const cols = [
    { key: '#',   w: 28,  render: (p: MatchPlayer) => <span className="font-black text-[10px]" style={{ color: alpha(hex.text.secondary, 0.5) }}>{p.shirtNumber}</span> },
    { key: 'Jugador', w: 0, render: (p: MatchPlayer) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[11px] font-bold truncate" style={{ color: hex.text.primary }}>{p.playerName}</span>
        {p.captain && <span className="text-[8px] font-black px-1 rounded" style={{ background: `${accent}20`, color: accent }}>C</span>}
        {p.substitute && <span className="text-[8px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>↑</span>}
      </div>
    )},
    { key: 'Min', w: 36, render: (p: MatchPlayer) => <span className="text-[10px] tabular-nums" style={{ color: alpha(hex.text.secondary, 0.55) }}>{p.minutes ?? '—'}&apos;</span> },
    { key: '⚽',  w: 28, render: (p: MatchPlayer) => <span className="text-[10px] font-black tabular-nums" style={{ color: p.goals > 0 ? hex.green.bright : alpha(hex.text.secondary, 0.35) }}>{p.goals ?? 0}</span> },
    { key: '🎯',  w: 28, render: (p: MatchPlayer) => <span className="text-[10px] font-black tabular-nums" style={{ color: p.assists > 0 ? hex.gold.base : alpha(hex.text.secondary, 0.35) }}>{p.assists ?? 0}</span> },
    { key: '🟨',  w: 28, render: (p: MatchPlayer) => <span className="text-[10px] tabular-nums" style={{ color: p.yellowCards > 0 ? '#FACC15' : alpha(hex.text.secondary, 0.3) }}>{p.yellowCards ?? 0}</span> },
    { key: 'Rat', w: 36, render: (p: MatchPlayer) => <RatingBadge rating={p.rating} /> },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={{ width: c.w || undefined, paddingBottom: 8, paddingRight: 8, color: alpha(hex.text.secondary, 0.4), fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {c.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <motion.tr key={p.playerId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.04)}` }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: '6px 8px 6px 0', verticalAlign: 'middle' }}>{c.render(p)}</td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlayersTab({ fixtureId, homeTeamId, awayTeamId }: { fixtureId: number; homeTeamId: number; awayTeamId: number }) {
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty,   setEmpty]   = useState(false);
  const [teamTab, setTeamTab] = useState<'home' | 'away'>('home');

  useEffect(() => {
    fetch(`/api/v1/public/fixtures/${fixtureId}/players`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const data = d?.data ?? [];
        setPlayers(data);
        setEmpty(data.length === 0);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) return (
    <div className="space-y-2">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="h-8 rounded animate-pulse" style={{ background: alpha(hex.neutral.white, 0.04) }} />
      ))}
    </div>
  );

  if (empty || players.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">👤</span>
      <p className="text-sm font-bold" style={{ color: alpha(hex.text.secondary, 0.5) }}>Estadísticas de jugadores no disponibles</p>
      <p className="text-[10px] tracking-widest uppercase" style={{ color: alpha(hex.text.secondary, 0.3) }}>Disponibles tras finalizar el partido</p>
    </div>
  );

  const homePlayers = players.filter(p => p.teamId === homeTeamId);
  const awayPlayers = players.filter(p => p.teamId === awayTeamId);
  const current = teamTab === 'home' ? homePlayers : awayPlayers;
  const accent  = teamTab === 'home' ? hex.green.bright : hex.gold.base;

  return (
    <div>
      {/* Team switch */}
      <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
        {(['home', 'away'] as const).map(t => {
          const active = teamTab === t;
          const color  = t === 'home' ? hex.green.bright : hex.gold.base;
          const teamPlayers = t === 'home' ? homePlayers : awayPlayers;
          const teamName = teamPlayers[0]?.teamName ?? (t === 'home' ? 'Local' : 'Visitante');
          return (
            <motion.button key={t} onClick={() => setTeamTab(t)} whileTap={{ scale: 0.97 }}
              className="flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all"
              style={{ background: active ? `${color}15` : 'transparent', border: `1px solid ${active ? `${color}35` : 'transparent'}`, color: active ? color : alpha(hex.text.secondary, 0.4) }}>
              {teamName}
            </motion.button>
          );
        })}
      </div>

      <PlayerTable players={current} accent={accent} />
    </div>
  );
}
