'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { apiFetch } from '@/lib/apiFetch';
import type { MatchEvent } from '@/types';

interface LineupPlayer { playerId: number; playerName: string; shirtNumber: number; position: string; grid?: string; }
interface LineupTeam { teamId: number; teamName: string; teamLogoUrl: string; coachName: string; coachPhotoUrl?: string; formation: string; startXI: LineupPlayer[]; substitutes: LineupPlayer[]; }

// ── helpers ──────────────────────────────────────────────────────────────────

function lastName(full: string): string {
  const parts = full.trim().split(' ');
  if (parts.length === 1) return full;
  const last = parts[parts.length - 1];
  return last.length > 9 ? last.slice(0, 8) + '.' : last;
}

function groupByGrid(players: LineupPlayer[]): LineupPlayer[][] {
  if (players.some(p => p.grid)) {
    const map: Record<number, LineupPlayer[]> = {};
    players.forEach(p => {
      const row = p.grid ? parseInt(p.grid.split(':')[0]) : 1;
      (map[row] ??= []).push(p);
    });
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map(r => map[r].sort((a, b) => {
        const ca = a.grid ? parseInt(a.grid.split(':')[1]) : 0;
        const cb = b.grid ? parseInt(b.grid.split(':')[1]) : 0;
        return ca - cb;
      }));
  }
  // fallback sin grid: agrupar por posición
  const gk  = players.filter(p => p.position === 'G');
  const def = players.filter(p => p.position === 'D');
  const mid = players.filter(p => p.position === 'M');
  const fwd = players.filter(p => p.position === 'F');
  return [gk, def, mid, fwd].filter(r => r.length > 0);
}

// ── PlayerDot ─────────────────────────────────────────────────────────────────

interface SubInfo { playerInName: string; minute: number; }

function PlayerDot({ player, x, y, color, bg, subbed, subInfo }: {
  player: LineupPlayer; x: number; y: number; color: string; bg: string;
  subbed?: boolean;    // este jugador salió
  subInfo?: SubInfo;   // sustituto que entró en su lugar
}) {
  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: 44, zIndex: 10 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: subbed ? 0.35 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: Math.random() * 0.3 }}
        className="relative rounded-full flex items-center justify-center font-black"
        style={{
          width: 24, height: 24,
          background: bg,
          border: `1.5px solid ${subbed ? '#666' : color}`,
          fontSize: 8,
          color: subbed ? '#888' : color,
          boxShadow: subbed ? 'none' : `0 0 8px ${color}50`,
        }}
      >
        {player.shirtNumber}
        {subbed && (
          <span className="absolute -top-1 -right-1 text-[8px] leading-none">🔴</span>
        )}
      </motion.div>
      <span className="text-center font-bold leading-tight mt-0.5 truncate w-full"
        style={{ fontSize: 6.5, color: subbed ? '#777' : '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
        {lastName(player.playerName)}
      </span>
      {subInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-0.5 mt-0.5 px-1 rounded-sm"
          style={{ background: 'rgba(0,200,80,0.2)', border: '1px solid rgba(0,200,80,0.4)' }}
        >
          <span style={{ fontSize: 6 }}>🟢</span>
          <span className="font-bold truncate" style={{ fontSize: 6, color: '#6fff9e', maxWidth: 34 }}>
            {lastName(subInfo.playerInName)} {subInfo.minute}'
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ── PitchView (horizontal) ────────────────────────────────────────────────────

function matchName(fullName: string, eventName: string): boolean {
  const last = (n: string) => n.trim().split(' ').pop()?.toLowerCase() ?? '';
  return last(fullName) === last(eventName) && last(fullName).length > 1;
}

function PitchView({ home, away, liveEvents }: { home: LineupTeam; away: LineupTeam; liveEvents: MatchEvent[] }) {
  const homeColor = hex.green.bright;
  const awayColor = hex.gold.base;
  const homeBg    = alphaOf('green', 0.35);
  const awayBg    = alphaOf('gold',  0.35);
  const line      = 'rgba(255,255,255,0.2)';

  const homeRows = useMemo(() => groupByGrid(home.startXI), [home.startXI]);
  const awayRows = useMemo(() => groupByGrid(away.startXI), [away.startXI]);

  // Sustituciones recibidas por WebSocket
  const subs = useMemo(() =>
    liveEvents.filter(e => e.type === 'SUBSTITUTION' && e.playerOut),
  [liveEvents]);

  // Home: GK izquierda (x≈7%), delanteros hacia centro (x≈44%)
  const homeX = homeRows.map((_, i) => {
    const t = homeRows.length <= 1 ? 0 : i / (homeRows.length - 1);
    return 7 + t * 37;
  });
  // Away: GK derecha (x≈93%), delanteros hacia centro (x≈56%)
  const awayX = awayRows.map((_, i) => {
    const t = awayRows.length <= 1 ? 0 : i / (awayRows.length - 1);
    return 93 - t * 37;
  });

  return (
    <motion.div
      key="pitch"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ paddingBottom: '62%', background: '#1b3d1b', border: `1px solid rgba(255,255,255,0.08)` }}
    >
      <div className="absolute inset-0">
        {/* ── Franjas de césped verticales ── */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute h-full" style={{
            left: `${i * 10}%`, width: '10%',
            background: i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent',
          }} />
        ))}

        {/* ── Líneas de campo horizontal ── */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 100" preserveAspectRatio="none">
          {/* borde */}
          <rect x="3" y="3" width="154" height="94" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* línea central vertical */}
          <line x1="80" y1="3" x2="80" y2="97" stroke={line} strokeWidth="0.5"/>
          {/* círculo central */}
          <circle cx="80" cy="50" r="12" fill="none" stroke={line} strokeWidth="0.5"/>
          <circle cx="80" cy="50" r="0.9" fill={line}/>
          {/* área grande izquierda (home) */}
          <rect x="3" y="20" width="28" height="60" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* área pequeña izquierda */}
          <rect x="3" y="33" width="13" height="34" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* punto penal izquierdo */}
          <circle cx="20" cy="50" r="0.8" fill={line}/>
          {/* arco penal izquierdo (abre hacia la derecha) */}
          <path d="M 31 33 A 13 13 0 0 1 31 67" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* área grande derecha (away) */}
          <rect x="129" y="20" width="28" height="60" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* área pequeña derecha */}
          <rect x="144" y="33" width="13" height="34" fill="none" stroke={line} strokeWidth="0.5"/>
          {/* punto penal derecho */}
          <circle cx="140" cy="50" r="0.8" fill={line}/>
          {/* arco penal derecho (abre hacia la izquierda) */}
          <path d="M 129 33 A 13 13 0 0 0 129 67" fill="none" stroke={line} strokeWidth="0.5"/>
        </svg>

        {/* ── Etiqueta home (izquierda) ── */}
        <div className="absolute flex items-center" style={{ left: '1%', bottom: '3%' }}>
          <span className="text-[7px] font-black tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: homeColor, background: alpha(homeColor, 0.15) }}>
            {home.teamName} · {home.formation}
          </span>
        </div>
        {/* ── Etiqueta away (derecha) ── */}
        <div className="absolute flex items-center" style={{ right: '1%', bottom: '3%' }}>
          <span className="text-[7px] font-black tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: awayColor, background: alpha(awayColor, 0.15) }}>
            {away.formation} · {away.teamName}
          </span>
        </div>

        {/* ── Jugadores home (mitad izquierda) ── */}
        {homeRows.map((row, ri) =>
          row.map((p, ci) => {
            const sub = subs.find(s => s.playerOut && matchName(p.playerName, s.playerOut));
            return (
              <PlayerDot key={p.playerId} player={p}
                x={homeX[ri]}
                y={(ci + 1) / (row.length + 1) * 100}
                color={homeColor} bg={homeBg}
                subbed={!!sub}
                subInfo={sub ? { playerInName: sub.playerName ?? '', minute: sub.minute } : undefined}
              />
            );
          })
        )}

        {/* ── Jugadores away (mitad derecha) ── */}
        {awayRows.map((row, ri) =>
          row.map((p, ci) => {
            const sub = subs.find(s => s.playerOut && matchName(p.playerName, s.playerOut));
            return (
              <PlayerDot key={p.playerId} player={p}
                x={awayX[ri]}
                y={(ci + 1) / (row.length + 1) * 100}
                color={awayColor} bg={awayBg}
                subbed={!!sub}
                subInfo={sub ? { playerInName: sub.playerName ?? '', minute: sub.minute } : undefined}
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
}

// ── ListView (original) ───────────────────────────────────────────────────────

function TeamLineup({ team, side }: { team: LineupTeam; side: 'home' | 'away' }) {
  const accent      = side === 'home' ? hex.green.bright : hex.gold.base;
  const accentAlpha = side === 'home' ? alphaOf('green', 0.15) : alphaOf('gold', 0.15);

  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-4 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
        {team.teamLogoUrl && (
          <div className="relative w-8 h-8 shrink-0">
            <Image src={team.teamLogoUrl} alt={team.teamName} fill sizes="32px" className="object-contain" />
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

      <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-2" style={{ color: alpha(hex.text.secondary, 0.4) }}>TITULAR</p>
      <div className="space-y-1 mb-4">
        {team.startXI.map((p, i) => (
          <motion.div key={p.playerId}
            initial={{ opacity: 0, x: side === 'home' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
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

      {team.substitutes.length > 0 && (
        <>
          <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-2" style={{ color: alpha(hex.text.secondary, 0.4) }}>SUPLENTES</p>
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

// ── Main export ───────────────────────────────────────────────────────────────

type ViewMode = 'pitch' | 'list';

export default function LineupsTab({ fixtureId, liveEvents = [] }: { fixtureId: number; liveEvents?: MatchEvent[] }) {
  const t = useTranslations();
  const [lineups,   setLineups]   = useState<LineupTeam[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [empty,     setEmpty]     = useState(false);
  const [view,      setView]      = useState<ViewMode>('pitch');
  const [pastSubs,  setPastSubs]  = useState<MatchEvent[]>([]);

  useEffect(() => {
    apiFetch(`/api/v1/public/fixtures/${fixtureId}/lineups`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const data = d?.data ?? [];
        setLineups(data);
        setEmpty(data.length === 0);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  // Carga sustituciones ya persistidas en BD (para quien abre la página tarde)
  useEffect(() => {
    apiFetch(`/api/v1/public/fixtures/${fixtureId}/events`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const events: Array<{ playerName: string; playerOut?: string | null; minute: number; eventType: string; teamId?: number | null }> = d?.data ?? [];
        const subs = events
          .filter(e => e.eventType === 'SUBSTITUTION')
          .map(e => ({
            matchId: fixtureId,
            type: 'SUBSTITUTION' as const,
            teamId: e.teamId ?? null,
            playerId: null,
            playerName: e.playerName,
            playerOut: e.playerOut ?? null,
            minute: e.minute,
            occurredAt: '',
          }));
        setPastSubs(subs);
      })
      .catch(() => {});
  }, [fixtureId]);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1].map(i => (
        <div key={i} className="space-y-2">
          {Array.from({ length: 11 }).map((_, j) => (
            <div key={j} className="h-8 rounded-lg animate-pulse"
              style={{ background: alpha(hex.neutral.white, 0.04), animationDelay: `${j * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );

  if (empty || lineups.length < 2) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">📋</span>
      <p className="text-sm font-bold text-center" style={{ color: alpha(hex.text.secondary, 0.5) }}>
        {t('fixture.lineupsNotYet')}
      </p>
      <p className="text-[10px] tracking-widest uppercase text-center" style={{ color: alpha(hex.text.secondary, 0.3) }}>
        {t('fixture.lineupsHint')}
      </p>
    </div>
  );

  const [home, away] = lineups;

  // Merge sustituciones pasadas (REST) + en tiempo real (WebSocket), dedup por minuto+jugador
  const allLiveEvents = useMemo(() => {
    const wsSubKeys = new Set(
      liveEvents
        .filter(e => e.type === 'SUBSTITUTION')
        .map(e => `${e.minute}|${e.playerName}`)
    );
    const dedupedPast = pastSubs.filter(s => !wsSubKeys.has(`${s.minute}|${s.playerName}`));
    return [...dedupedPast, ...liveEvents];
  }, [pastSubs, liveEvents]);

  return (
    <div className="space-y-4">
      {/* ── Toggle ── */}
      <div className="flex gap-1 p-1 rounded-xl self-center mx-auto w-fit"
        style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
        {(['pitch', 'list'] as ViewMode[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-200"
            style={{
              background: view === v ? alpha(hex.green.bright, 0.2) : 'transparent',
              color: view === v ? hex.green.bright : alpha(hex.text.secondary, 0.5),
              border: view === v ? `1px solid ${alpha(hex.green.bright, 0.3)}` : '1px solid transparent',
            }}>
            {v === 'pitch' ? '⚽ Cancha' : '📋 Lista'}
          </button>
        ))}
      </div>

      {/* ── Contenido ── */}
      <AnimatePresence mode="wait">
        {view === 'pitch' ? (
          <PitchView key="pitch" home={home} away={away} liveEvents={allLiveEvents} />
        ) : (
          <motion.div key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-4">
            <TeamLineup team={home} side="home" />
            <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.06) }} />
            <TeamLineup team={away} side="away" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
