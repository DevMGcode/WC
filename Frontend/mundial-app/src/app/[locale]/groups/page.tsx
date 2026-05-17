'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { FiAward, FiBarChart2, FiShield, FiZap, FiGrid, FiTarget, FiCrosshair } from 'react-icons/fi';
import { Header } from '@/components/Navigation';
import { Bracket } from '@/components/BracketChampions';
import { getCurrentTournament, getTournamentFixtures, getTournamentGroups } from '@/services/publicTournament';
import { useT } from '@/hooks/useT';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
type Team     = { id: number; name: string; shortName: string; flagUrl: string };
type Standing = { position: number; team: Team; points: number; played: number; won: number; drawn: number; lost: number; goalDiff: number };
type Group    = { id: number; name: string; standings: Standing[] };
type Match    = { id: number; homeTeam: Team; awayTeam: Team; homeScore?: number; awayScore?: number; winner?: Team | null; isPlayed?: boolean };
type BracketData  = { octavos: Match[]; cuartos: Match[]; semifinales: Match[]; final: Match[] };
type KnockoutRound = 'octavos' | 'cuartos' | 'semifinales' | 'final';

/* ══════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════ */
const EQBars = ({ color, count = 6, maxH = 12 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        return (
          <motion.div key={i} className="rounded-full"
            style={{ width: 2, background: color, boxShadow: `0 0 3px ${color}` }}
            animate={{ height: [h1, h2, h1] }}
            transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }} />
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════
   GROUPS TAB — PREMIUM GROUP CARD
══════════════════════════════════════════ */
const QUALIFY_CFG = [
  { border: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.06)', text: '#22d3ee', glow: 'rgba(34,211,238,0.55)', badge: 'rgba(34,211,238,0.15)' },
  { border: 'rgba(16,185,129,0.30)', bg: 'rgba(16,185,129,0.05)', text: '#10b981', glow: 'rgba(16,185,129,0.45)', badge: 'rgba(16,185,129,0.12)' },
];

const GlowBar = ({ value, max = 9, color }: { value: number; max?: number; color: string }) => (
  <div className="relative h-[3px] rounded-full overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
    <motion.div className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 6px ${color}` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
  </div>
);

const GroupCard = ({ group, index, t }: { group: Group; index: number; t: (key: string) => string }) => {
  const maxPts = Math.max(...group.standings.map(s => s.points), 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
        border: '1px solid rgba(34,211,238,0.12)',
        backdropFilter: 'blur(28px)',
        boxShadow: '0 20px 56px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.01)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.55), rgba(16,185,129,0.35), transparent)' }} />
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(34,211,238,0.06), rgba(16,185,129,0.03), transparent)' }}>
        <div className="flex items-center gap-2.5">
          <motion.div className="w-1.5 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, #22d3ee, #10b981)' }}
            animate={{ boxShadow: ['0 0 6px rgba(34,211,238,0.4)', '0 0 14px rgba(34,211,238,0.8)', '0 0 6px rgba(34,211,238,0.4)'] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
          <h3 className="text-sm font-black text-white tracking-[0.22em] uppercase">{group.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <EQBars color="rgba(34,211,238,0.40)" count={5} maxH={10} />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)' }}>
            <span className="text-[7px] font-black text-cyan-400 tracking-[0.2em] uppercase">{group.standings.length} {t('groups.teams')}</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid px-4 py-2"
        style={{ gridTemplateColumns: '28px 1fr 28px 28px 28px 28px 32px 36px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {['#', t('groups.team'), t('groups.played'), t('groups.won'), t('groups.drawn'), t('groups.lost'), t('groups.goals'), t('groups.points')].map((h, hi) => (
          <span key={hi} className={`text-[8px] font-black tracking-[0.22em] uppercase ${
            hi === 3 ? 'text-emerald-600 text-center' : hi === 4 ? 'text-amber-600 text-center' :
            hi === 5 ? 'text-rose-600 text-center' : hi === 7 ? 'text-cyan-500 text-center' :
            hi === 0 ? 'text-slate-700' : 'text-slate-700 text-center'
          }`}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {group.standings.map((s, idx) => {
        const q = idx < 2 ? QUALIFY_CFG[idx] : null;
        return (
          <motion.div key={s.team.id}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 + idx * 0.05 + 0.2 }}
            style={{
              background: q ? q.bg : 'transparent',
              borderBottom: idx < group.standings.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              borderLeft: q ? `2px solid ${q.text}35` : '2px solid transparent',
            }}
          >
            <div className="grid items-center px-4 py-3"
              style={{ gridTemplateColumns: '28px 1fr 28px 28px 28px 28px 32px 36px' }}>
              {/* Position */}
              <div className="flex items-center">
                {q ? (
                  <motion.div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                    style={{ background: q.badge, border: `1px solid ${q.text}40`, color: q.text }}
                    animate={{ boxShadow: [`0 0 4px ${q.glow}20`, `0 0 10px ${q.glow}50`, `0 0 4px ${q.glow}20`] }}
                    transition={{ duration: 2.8 + idx * 0.3, repeat: Infinity }}>
                    {s.position}
                  </motion.div>
                ) : (
                  <span className="text-[9px] font-bold text-slate-700">{s.position}</span>
                )}
              </div>
              {/* Team */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="relative shrink-0 w-5 h-5">
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: q ? q.glow : 'rgba(255,255,255,0.10)', filter: 'blur(4px)', opacity: q ? 0.4 : 0.1 }} />
                  <div className="relative w-5 h-5 rounded-full overflow-hidden shadow-lg"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    {s.team.flagUrl && <Image src={s.team.flagUrl} alt={s.team.name} fill sizes="20px" className="object-cover" unoptimized />}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black truncate leading-none"
                    style={{ color: q ? q.text : 'rgba(203,213,225,0.80)' }}>{s.team.shortName}</span>
                  <span className="text-[8px] text-slate-600 truncate hidden sm:block">{s.team.name}</span>
                </div>
              </div>
              {/* Stats */}
              <span className="text-[10px] text-slate-500 text-center tabular-nums">{s.played}</span>
              <span className="text-[10px] font-bold text-emerald-400 text-center tabular-nums">{s.won}</span>
              <span className="text-[10px] font-bold text-amber-400 text-center tabular-nums">{s.drawn}</span>
              <span className="text-[10px] font-bold text-rose-400 text-center tabular-nums">{s.lost}</span>
              <span className="text-[10px] text-slate-400 text-center tabular-nums">{s.goalDiff > 0 ? '+' : ''}{s.goalDiff}</span>
              {/* Points */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-black tabular-nums text-center"
                  style={{ color: q ? q.text : 'rgba(255,255,255,0.65)', textShadow: q ? `0 0 10px ${q.glow}` : 'none' }}>
                  {s.points}
                </span>
                <div className="w-full px-0.5">
                  <GlowBar value={s.points} max={maxPts} color={q?.text ?? 'rgba(100,116,139,0.6)'} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.18)' }}>
        <motion.div className="w-3 h-3 rounded-sm"
          style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.30)' }}
          animate={{ boxShadow: ['0 0 3px rgba(34,211,238,0.20)', '0 0 8px rgba(34,211,238,0.50)', '0 0 3px rgba(34,211,238,0.20)'] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <span className="text-[8px] text-slate-600 font-medium tracking-wide">{t('groups.qualify')}</span>
        <div className="flex-1" />
        <FiShield size={9} style={{ color: 'rgba(34,211,238,0.25)' }} />
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   ELIMINATORIAS — PREMIUM KNOCKOUT CARD
══════════════════════════════════════════ */
const ROUND_META: Record<KnockoutRound, { icon: React.ReactNode; color: string; glow: string }> = {
  octavos:     { icon: <FiGrid size={12} />,     color: '#22d3ee', glow: 'rgba(34,211,238,0.55)'  },
  cuartos:     { icon: <FiTarget size={12} />,   color: '#38bdf8', glow: 'rgba(56,189,248,0.55)'  },
  semifinales: { icon: <FiZap size={12} />,      color: '#a78bfa', glow: 'rgba(167,139,250,0.55)' },
  final:       { icon: <FiAward size={12} />,    color: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  },
};

const ROUND_I18N: Record<KnockoutRound, { labelKey: string; shortLabelKey: string }> = {
  octavos:     { labelKey: 'groups.round16',      shortLabelKey: 'groups.round16Short' },
  cuartos:     { labelKey: 'groups.quarter',       shortLabelKey: 'groups.quarterShort' },
  semifinales: { labelKey: 'groups.semi',          shortLabelKey: 'groups.semiShort'   },
  final:       { labelKey: 'groups.final',         shortLabelKey: 'groups.finalShort'  },
};

const ROUND_GRID: Record<KnockoutRound, string> = {
  octavos:     'grid-cols-1 sm:grid-cols-2',
  cuartos:     'grid-cols-1 sm:grid-cols-2',
  semifinales: 'grid-cols-1 sm:grid-cols-2',
  final:       'grid-cols-1 max-w-xs mx-auto',
};

const KnockoutCard = ({ match, round, index = 0, t }: { match: Match; round: KnockoutRound; index?: number; t: (key: string) => string }) => {
  const meta   = { ...ROUND_META[round], shortLabel: t(ROUND_I18N[round].shortLabelKey) };
  const isFinal = round === 'final';
  const homeWon = Boolean(match.isPlayed && match.winner?.id === match.homeTeam?.id);
  const awayWon = Boolean(match.isPlayed && match.winner?.id === match.awayTeam?.id);
  const accent  = isFinal ? '#fbbf24' : meta.color;
  const accentGlow = isFinal ? 'rgba(251,191,36,0.55)' : meta.glow;

  const TeamRow = ({ team, score, won, side }: { team: Team; score?: number; won: boolean; side: 'home' | 'away' }) => (
    <div className="flex items-center gap-3 px-4 py-3 relative"
      style={{
        background: won ? `linear-gradient(${side === 'home' ? '90deg' : '270deg'}, ${accent}12, transparent)` : 'transparent',
        transition: 'background 0.2s',
      }}>
      {/* Winner left accent */}
      {won && side === 'home' && (
        <motion.div className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accentGlow}` }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} />
      )}

      {/* Flag */}
      <div className="relative shrink-0 w-7 h-7">
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: won ? accentGlow : 'rgba(255,255,255,0.08)', filter: 'blur(5px)', opacity: won ? 0.45 : 0.12 }} />
        <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-lg"
          style={{ border: `1.5px solid ${won ? accent + '50' : 'rgba(255,255,255,0.10)'}` }}>
          {team?.flagUrl && (
            <Image src={team.flagUrl} alt={team.name} fill sizes="28px" className="object-cover" unoptimized />
          )}
        </div>
      </div>

      {/* Name */}
      <span className="flex-1 text-[12px] font-black truncate leading-none"
        style={{ color: won ? accent : 'rgba(148,163,184,0.75)', textShadow: won ? `0 0 12px ${accentGlow}` : 'none' }}>
        {team?.name ?? '?'}
      </span>

      {/* Score */}
      {match.isPlayed && score !== undefined && (
        <motion.span
          className="text-xl font-black tabular-nums w-7 text-center shrink-0 leading-none"
          style={{ color: won ? accent : 'rgba(71,85,105,0.70)', textShadow: won ? `0 0 14px ${accentGlow}` : 'none' }}
          animate={won ? { textShadow: [`0 0 8px ${accentGlow}50`, `0 0 20px ${accentGlow}`, `0 0 8px ${accentGlow}50`] } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {score}
        </motion.span>
      )}

      {/* Winner dot */}
      {won && (
        <motion.div className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: accent, boxShadow: `0 0 6px ${accentGlow}` }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }} />
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: isFinal
          ? 'linear-gradient(145deg, rgba(14,10,2,0.98), rgba(22,16,4,0.97))'
          : 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
        border: `1px solid ${accent}${isFinal ? '30' : '18'}`,
        backdropFilter: 'blur(28px)',
        boxShadow: isFinal
          ? `0 0 0 1px rgba(251,191,36,0.06), 0 20px 60px rgba(0,0,0,0.70), 0 0 32px rgba(251,191,36,0.12)`
          : `0 16px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.01)`,
      }}
    >
      {/* Top neon line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />

      {/* Final crown */}
      {isFinal && match.winner && (
        <div className="absolute -top-2 right-3 z-10">
          <motion.span className="text-base"
            animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 2.8, repeat: Infinity }}>👑</motion.span>
        </div>
      )}

      {/* Ambient glow for final */}
      {isFinal && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{ opacity: [0, 0.06, 0] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.20), transparent 65%)' }} />
      )}

      {/* Status badge */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}>
          <span style={{ color: accent, filter: `drop-shadow(0 0 4px ${accentGlow})`, display: 'flex' }}>
            {meta.icon}
          </span>
          <span className="text-[8px] font-black tracking-[0.22em] uppercase" style={{ color: accent }}>
            {meta.shortLabel}
          </span>
        </div>
        <span className="text-[8px] font-bold tracking-widest uppercase"
          style={{ color: match.isPlayed ? `${accent}70` : 'rgba(100,116,139,0.45)' }}>
          {match.isPlayed ? t('common.finished') : t('common.pending')}
        </span>
      </div>

      {/* Teams */}
      <div>
        <TeamRow team={match.homeTeam} score={match.homeScore} won={homeWon} side="home" />
        <div className="h-px mx-4" style={{ background: `linear-gradient(90deg, transparent, ${accent}15, transparent)` }} />
        <TeamRow team={match.awayTeam} score={match.awayScore} won={awayWon} side="away" />
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.018) 50%, transparent 75%)' }} />
    </motion.div>
  );
};

/* Champion banner */
const ChampionBanner = ({ winner, t }: { winner: Team; t: (key: string) => string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl mt-6"
    style={{
      background: 'linear-gradient(145deg, rgba(18,12,2,0.98), rgba(28,20,4,0.97))',
      border: '1px solid rgba(251,191,36,0.30)',
      boxShadow: '0 0 60px rgba(251,191,36,0.16), 0 24px 80px rgba(0,0,0,0.70)',
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.80), transparent)' }} />
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 65%)', filter: 'blur(30px)' }} />
    {/* Confetti */}
    {Array.from({ length: 14 }).map((_, i) => (
      <motion.div key={i} className="absolute rounded-full pointer-events-none"
        style={{ width: 3, height: 3, left: `${(i * 137.5) % 100}%`, top: '0%',
          background: ['#fbbf24','#22d3ee','#34d399','#f87171','#a78bfa'][i % 5] }}
        animate={{ y: [0, 120], opacity: [0, 1, 0], x: [0, Math.sin(i * 1.4) * 24] }}
        transition={{ duration: 2.8, delay: i * 0.14, repeat: Infinity, ease: 'easeOut' }} />
    ))}
    <div className="relative flex flex-col sm:flex-row items-center justify-center gap-5 p-6 sm:p-8">
      <motion.div className="text-4xl" animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.18, 1, 1.18, 1] }}
        transition={{ duration: 3.5, repeat: Infinity }}>🏆</motion.div>
      <div className="text-center sm:text-left">
        <p className="text-[8px] font-black tracking-[0.40em] text-amber-500/60 uppercase mb-1">{t('groups.champion')}</p>
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(251,191,36,0.30)', filter: 'blur(8px)', transform: 'scale(1.3)' }} />
            <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-2xl"
              style={{ border: '2px solid rgba(251,191,36,0.55)' }}>
              {winner.flagUrl && <Image src={winner.flagUrl} alt={winner.name} fill sizes="44px" className="object-cover" unoptimized />}
            </div>
          </div>
          <motion.p className="text-2xl sm:text-3xl font-black text-amber-200"
            style={{ textShadow: '0 0 24px rgba(251,191,36,0.80)' }}
            animate={{ textShadow: ['0 0 14px rgba(251,191,36,0.60)', '0 0 36px rgba(251,191,36,1)', '0 0 14px rgba(251,191,36,0.60)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}>
            {winner.name}
          </motion.p>
        </div>
        <div className="h-px my-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.25), transparent)' }} />
        <p className="text-[8px] tracking-[0.30em] text-amber-600/40 uppercase font-bold">Mundial 2026 · USA · México · Canadá</p>
      </div>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════ */
const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Grupo A', standings: [
    { position: 1, team: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 6 },
    { position: 2, team: { id: 2, name: 'Uruguay',   shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 2 },
    { position: 3, team: { id: 3, name: 'Paraguay',  shortName: 'PAR', flagUrl: 'https://flagcdn.com/py.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -4 },
    { position: 4, team: { id: 4, name: 'Canadá',    shortName: 'CAN', flagUrl: 'https://flagcdn.com/ca.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -4 },
  ]},
  { id: 2, name: 'Grupo B', standings: [
    { position: 1, team: { id: 5, name: 'Brasil',    shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 8 },
    { position: 2, team: { id: 6, name: 'España',    shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 3 },
    { position: 3, team: { id: 7, name: 'Francia',   shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -2 },
    { position: 4, team: { id: 8, name: 'Jamaica',   shortName: 'JAM', flagUrl: 'https://flagcdn.com/jm.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -9 },
  ]},
  { id: 3, name: 'Grupo C', standings: [
    { position: 1, team: { id: 9,  name: 'México',   shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' }, points: 7, played: 3, won: 2, drawn: 1, lost: 0, goalDiff: 4 },
    { position: 2, team: { id: 10, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' }, points: 5, played: 3, won: 1, drawn: 2, lost: 0, goalDiff: 1 },
    { position: 3, team: { id: 11, name: 'Ecuador',  shortName: 'ECU', flagUrl: 'https://flagcdn.com/ec.svg' }, points: 2, played: 3, won: 0, drawn: 2, lost: 1, goalDiff: -2 },
    { position: 4, team: { id: 12, name: 'Bolivia',  shortName: 'BOL', flagUrl: 'https://flagcdn.com/bo.svg' }, points: 1, played: 3, won: 0, drawn: 1, lost: 2, goalDiff: -3 },
  ]},
  { id: 4, name: 'Grupo D', standings: [
    { position: 1, team: { id: 13, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 7 },
    { position: 2, team: { id: 14, name: 'Alemania', shortName: 'GER', flagUrl: 'https://flagcdn.com/de.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 3 },
    { position: 3, team: { id: 15, name: 'Ghana',    shortName: 'GHA', flagUrl: 'https://flagcdn.com/gh.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -4 },
    { position: 4, team: { id: 16, name: 'Japón',    shortName: 'JPN', flagUrl: 'https://flagcdn.com/jp.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -6 },
  ]},
];

const _tbd: Team = { id: 0, name: 'Por definir', shortName: 'TBD', flagUrl: '' };

const EMPTY_BRACKET: BracketData = {
  octavos: Array.from({ length: 8 }, (_, i) => ({
    id: -(i + 1), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false,
  })),
  cuartos: Array.from({ length: 4 }, (_, i) => ({
    id: -(i + 9), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false,
  })),
  semifinales: Array.from({ length: 2 }, (_, i) => ({
    id: -(i + 13), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false,
  })),
  final: [
    { id: -15, homeTeam: _tbd, awayTeam: _tbd, isPlayed: false },
  ],
};

/* ══════════════════════════════════════════
   BRACKET DESKTOP BACKGROUND
══════════════════════════════════════════ */
const BracketBg = () => (
  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" style={{ zIndex: 0 }}>

    {/* Base deep-space gradient */}
    <div className="absolute inset-0"
      style={{ background: 'radial-gradient(ellipse at 50% 8%, #071830 0%, #030d1a 48%, #010508 100%)' }} />

    {/* Nebula blobs */}
    {([
      { x: 10, y: 22, w: 520, h: 320, col: 'rgba(34,211,238,0.10)',  blur: 72, dur: 14, dx: [0,44,-26,0], dy: [0,-30,20,0]  },
      { x: 87, y: 20, w: 420, h: 310, col: 'rgba(167,139,250,0.09)', blur: 65, dur: 19, dx: [0,-36,20,0], dy: [0,28,-18,0]  },
      { x: 50, y: 80, w: 640, h: 260, col: 'rgba(251,191,36,0.07)',  blur: 82, dur: 24, dx: [0,24,-32,0], dy: [0,-18, 12,0] },
      { x: 22, y: 74, w: 360, h: 360, col: 'rgba(52,211,153,0.07)',  blur: 58, dur: 17, dx: [0,-24,34,0], dy: [0,18,-24,0]  },
      { x: 76, y: 64, w: 380, h: 340, col: 'rgba(34,211,238,0.07)',  blur: 66, dur: 22, dx: [0,30,-18,0], dy: [0,-30,34,0]  },
    ] as { x:number;y:number;w:number;h:number;col:string;blur:number;dur:number;dx:number[];dy:number[] }[]).map((o, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ width: o.w, height: o.h, left: `${o.x}%`, top: `${o.y}%`,
          background: `radial-gradient(ellipse, ${o.col} 0%, transparent 65%)`,
          filter: `blur(${o.blur}px)`, transform: 'translate(-50%,-50%)' }}
        animate={{ x: o.dx, y: o.dy, scale: [1, 1.20, 0.93, 1] }}
        transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }} />
    ))}

    {/* Vertical neon light pillars */}
    {([
      { x: 13, col: '#22d3ee', op: 0.055, dur: 6,  del: 0.0 },
      { x: 28, col: '#a78bfa', op: 0.040, dur: 9,  del: 1.8 },
      { x: 50, col: '#fbbf24', op: 0.065, dur: 5,  del: 0.6 },
      { x: 72, col: '#a78bfa', op: 0.040, dur: 10, del: 2.4 },
      { x: 87, col: '#22d3ee', op: 0.055, dur: 7,  del: 1.2 },
    ] as { x:number;col:string;op:number;dur:number;del:number }[]).map((b, i) => (
      <motion.div key={i} className="absolute top-0 bottom-0 w-px"
        style={{ left: `${b.x}%`,
          background: `linear-gradient(180deg, transparent 0%, ${b.col} 25%, ${b.col} 75%, transparent 100%)`,
          filter: 'blur(1px)' }}
        animate={{ opacity: [0, b.op * 3, 0] }}
        transition={{ duration: b.dur, repeat: Infinity, delay: b.del, ease: 'easeInOut' }} />
    ))}

    {/* Aurora horizontal sweeps */}
    <motion.div className="absolute inset-0"
      style={{ background: 'linear-gradient(115deg, transparent 18%, rgba(34,211,238,0.045) 38%, rgba(167,139,250,0.030) 58%, transparent 78%)' }}
      animate={{ x: ['-42%', '42%'] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'linear', repeatType: 'mirror' }} />
    <motion.div className="absolute inset-0"
      style={{ background: 'linear-gradient(248deg, transparent 22%, rgba(251,191,36,0.030) 44%, rgba(52,211,153,0.022) 62%, transparent 80%)' }}
      animate={{ x: ['32%', '-32%'] }}
      transition={{ duration: 29, repeat: Infinity, ease: 'linear', repeatType: 'mirror' }} />

    {/* Rotating dashed energy rings */}
    {([
      { cx: 50, cy: 47, r: 40, col: '#22d3ee', op: 0.10, sw: 0.18, dash: '2 5', dur: 90,  rev: false },
      { cx: 50, cy: 47, r: 28, col: '#a78bfa', op: 0.08, sw: 0.13, dash: '3 6', dur: 68,  rev: true  },
      { cx: 50, cy: 47, r: 54, col: '#fbbf24', op: 0.05, sw: 0.12, dash: '1 6', dur: 110, rev: true  },
      { cx: 18, cy: 26, r: 14, col: '#22d3ee', op: 0.09, sw: 0.14, dash: '2 4', dur: 48,  rev: false },
      { cx: 82, cy: 70, r: 17, col: '#fbbf24', op: 0.07, sw: 0.13, dash: '3 5', dur: 62,  rev: true  },
    ] as { cx:number;cy:number;r:number;col:string;op:number;sw:number;dash:string;dur:number;rev:boolean }[]).map((ring, i) => (
      <motion.svg key={i} className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        animate={{ rotate: ring.rev ? -360 : 360 }}
        style={{ transformOrigin: `${ring.cx}% ${ring.cy}%` }}
        transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}>
        <circle cx={ring.cx} cy={ring.cy} r={ring.r}
          fill="none" stroke={ring.col} strokeWidth={ring.sw}
          strokeDasharray={ring.dash} opacity={ring.op} />
      </motion.svg>
    ))}

    {/* Center golden radiance — behind the FINAL card */}
    <motion.div className="absolute"
      style={{ left: '50%', top: '45%', width: 520, height: 520,
        background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 28%, transparent 58%)',
        filter: 'blur(38px)', transform: 'translate(-50%,-50%)' }}
      animate={{ scale: [1, 1.32, 1], opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Corner accent flares */}
    {([
      { cls: 'top-0 left-0',     bg: 'radial-gradient(circle at 0% 0%, rgba(34,211,238,0.16) 0%, transparent 52%)'   },
      { cls: 'top-0 right-0',    bg: 'radial-gradient(circle at 100% 0%, rgba(167,139,250,0.13) 0%, transparent 52%)' },
      { cls: 'bottom-0 left-0',  bg: 'radial-gradient(circle at 0% 100%, rgba(52,211,153,0.11) 0%, transparent 52%)' },
      { cls: 'bottom-0 right-0', bg: 'radial-gradient(circle at 100% 100%, rgba(251,191,36,0.11) 0%, transparent 52%)'},
    ] as { cls:string; bg:string }[]).map((c, i) => (
      <motion.div key={i} className={`absolute w-72 h-72 ${c.cls}`}
        style={{ background: c.bg }}
        animate={{ opacity: [0.30, 0.88, 0.30] }}
        transition={{ duration: 5.5 + i * 1.4, repeat: Infinity, delay: i * 0.9 }} />
    ))}

    {/* Subtle inner vignette to keep bracket readable */}
    <div className="absolute inset-0"
      style={{ background: 'radial-gradient(ellipse at 50% 46%, transparent 22%, rgba(1,6,14,0.28) 100%)' }} />
  </div>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
const buildBracketFromFixtures = (fixtures: any[]): BracketData => {
  const toMatch = (f: any): Match => {
    const winner = typeof f.homeScore === 'number' && typeof f.awayScore === 'number'
      ? f.homeScore > f.awayScore ? f.homeTeam : f.awayScore > f.homeScore ? f.awayTeam : null : null;
    return { id: f.id, homeTeam: f.homeTeam, awayTeam: f.awayTeam, homeScore: f.homeScore, awayScore: f.awayScore, winner, isPlayed: f.status === 'FINISHED' };
  };
  const b: BracketData = { octavos: [], cuartos: [], semifinales: [], final: [] };
  fixtures.forEach(f => {
    const s = (f.stageName || '').toLowerCase();
    if (s.includes('octavos')) b.octavos.push(toMatch(f));
    else if (s.includes('cuartos')) b.cuartos.push(toMatch(f));
    else if (s.includes('semi')) b.semifinales.push(toMatch(f));
    else if (s.includes('final')) b.final.push(toMatch(f));
  });
  return b;
};

export default function GroupsPage() {
  const { t } = useT();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'es';
  const [groups,       setGroups]       = useState<Group[]>([]);
  const [bracketsData, setBracketsData] = useState<BracketData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<'grupos' | 'eliminatorias'>('grupos');
  const [activeRound,  setActiveRound]  = useState<KnockoutRound>('octavos');

  useEffect(() => {
    const loadData = async () => {
      let rGroups  = MOCK_GROUPS;
      let rBracket: BracketData = EMPTY_BRACKET;
      try {
        const tournament = await getCurrentTournament();
        if (tournament) {
          const apiGroups = await getTournamentGroups(tournament.id);
          rGroups = apiGroups.length > 0
            ? apiGroups.map((g: any) => ({
                id: g.id, name: g.name,
                standings: (g.standings ?? []).map((s: any) => ({
                  position: s.position,
                  team: { id: s.teamId, name: s.teamName, shortName: s.teamShortName ?? s.teamFifaCode ?? s.teamName,
                    flagUrl: s.teamFlagUrl ?? `https://flagcdn.com/${(s.teamFifaCode ?? 'un').toLowerCase()}.svg` },
                  points: s.points, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost,
                  goalDiff: s.goalDifference ?? (s.goalsFor - s.goalsAgainst),
                })),
              }))
            : [];
          const fixtures  = await getTournamentFixtures(tournament.id);
          const backendBk = buildBracketFromFixtures(fixtures);
          const hasKnockout = backendBk.octavos.length > 0 || backendBk.cuartos.length > 0
                           || backendBk.semifinales.length > 0 || backendBk.final.length > 0;
          rBracket = hasKnockout ? backendBk : EMPTY_BRACKET;
        } else {
          rGroups = [];
        }
      } catch (e) { console.warn('Error cargando datos', e); }
      setGroups(rGroups);
      setBracketsData(rBracket);
      setLoading(false);
    };
    loadData();
  }, []);

  const champion = bracketsData?.final[0]?.winner ?? null;

  return (
    <div className="w-full relative min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 22% 30%, #060f1e 0%, #030a14 50%, #010508 100%)' }}>

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 650, height: 650, top: -200, left: -130, background: 'radial-gradient(circle, rgba(0,210,185,0.07) 0%, transparent 65%)', filter: 'blur(75px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, right: -80, background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 65%)', filter: 'blur(65px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 14, repeat: Infinity, delay: 4 }} />

      {/* Tech grid */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.022]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(34,211,238,1)" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="g-fade" cx="40%" cy="30%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="g-mask"><rect width="100%" height="100%" fill="url(#g-fade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#g-grid)" mask="url(#g-mask)" />
      </svg>

      {/* Header */}
      <div className="relative z-10">
        <Header title="⚽ Orionix Gol" subtitle={t('groups.subtitle')} centered />
      </div>

      {/* ── STICKY TAB BAR ── */}
      <div data-tour="groups-tabs" className="sticky top-0 z-40"
        style={{ background: 'rgba(3,9,22,0.92)', borderBottom: '1px solid rgba(34,211,238,0.10)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 32px rgba(0,0,0,0.55)' }}>
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), rgba(251,191,36,0.15), transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
          {([
            { key: 'grupos'        as const, label: t('groups.title'),    icon: <FiBarChart2 size={13} />, color: '#22d3ee', glow: 'rgba(34,211,238,0.55)' },
            { key: 'eliminatorias' as const, label: t('groups.knockout'), icon: <FiAward size={13} />,    color: '#fbbf24', glow: 'rgba(251,191,36,0.55)' },
          ]).map(({ key, label, icon, color, glow }) => {
            const isActive = activeTab === key;
            return (
              <motion.button key={key} onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden"
                style={{ background: isActive ? `linear-gradient(135deg, ${color}15, rgba(2,8,20,0.85))` : 'transparent',
                  border: `1px solid ${isActive ? color + '30' : 'transparent'}`, outline: 'none', cursor: 'pointer' }}
                whileTap={{ scale: 0.96 }}>
                {isActive && (
                  <motion.div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}65, transparent)` }} />
                )}
                <span style={{ color: isActive ? color : 'rgba(100,116,139,0.60)', filter: isActive ? `drop-shadow(0 0 5px ${glow})` : 'none', display: 'flex' }}>{icon}</span>
                <span className="text-[11px] font-black tracking-[0.10em]"
                  style={{ color: isActive ? color : 'rgba(100,116,139,0.60)', textShadow: isActive ? `0 0 10px ${glow}` : 'none' }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
          <div className="flex-1" />
          <EQBars color="rgba(34,211,238,0.30)" count={7} maxH={14} />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 py-5 pb-32">
        {loading ? (
          <div className="flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-4">
              <motion.div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
                animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
              <p className="text-[10px] text-cyan-400/60 tracking-[0.3em] uppercase font-bold">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ═══════════════════ GRUPOS ═══════════════════ */}
            {activeTab === 'grupos' && (
              <motion.div key="grupos"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}>
                <motion.div className="flex items-center gap-3 mb-5"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22d3ee, #10b981)' }} />
                    <h2 className="text-xl font-black text-white tracking-wide">{t('groups.standings')}</h2>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.25), transparent)' }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)' }}>
                    <FiBarChart2 size={10} style={{ color: '#22d3ee' }} />
                    <span className="text-[8px] font-black text-cyan-400 tracking-[0.2em]">{groups.length} {t('groups.title').toUpperCase()}</span>
                  </div>
                </motion.div>
                <div data-tour="groups-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((g, i) => <GroupCard key={g.id} group={g} index={i} t={t} />)}
                </div>
                <motion.div className="mt-5 flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'rgba(34,211,238,0.20)', border: '1px solid rgba(34,211,238,0.35)' }} />
                    <span className="text-[9px] text-slate-600 font-medium">{t('groups.qualifyShort')}</span>
                  </div>
                  {[
                    { c:'#34d399', abbr: t('groups.won'),   label: t('groups.legendWon')   },
                    { c:'#fbbf24', abbr: t('groups.drawn'), label: t('groups.legendDrawn') },
                    { c:'#f87171', abbr: t('groups.lost'),  label: t('groups.legendLost')  },
                    { c:'#94a3b8', abbr: t('groups.goals'), label: t('groups.legendGoals') },
                  ].map(({ c, abbr, label }) => (
                    <div key={abbr} className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black" style={{ color: c }}>{abbr}</span>
                      <span className="text-[9px] text-slate-700">— {label}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ═══════════════════ ELIMINATORIAS ═══════════════════ */}
            {activeTab === 'eliminatorias' && bracketsData && (
              <motion.div key="eliminatorias" data-tour="groups-knockout"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}>

                {/* Section title */}
                <motion.div className="flex items-center gap-3 mb-5"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-2">
                    <motion.div className="w-[3px] h-5 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }}
                      animate={{ boxShadow: ['0 0 6px rgba(251,191,36,0.4)','0 0 18px rgba(251,191,36,0.9)','0 0 6px rgba(251,191,36,0.4)'] }}
                      transition={{ duration: 2.2, repeat: Infinity }} />
                    <h2 className="text-xl font-black text-white tracking-wide">{t('groups.knockoutPhase')}</h2>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.30), transparent)' }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.20)' }}>
                    <FiAward size={10} style={{ color: '#fbbf24' }} />
                    <span className="text-[8px] font-black text-amber-400 tracking-[0.2em]">BRACKET</span>
                  </div>
                </motion.div>

                {/* ── MOBILE/TABLET: round tabs + cards ── */}
                <div className="xl:hidden">
                  {/* Round tab pills */}
                  <div className="relative overflow-hidden rounded-2xl mb-5 p-1.5"
                    style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,32,0.96))',
                      border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.25), transparent)' }} />
                    <div className="flex gap-1.5 overflow-x-auto">
                      {(Object.keys(ROUND_META) as KnockoutRound[]).map((round) => {
                        const meta    = { ...ROUND_META[round], shortLabel: t(ROUND_I18N[round].shortLabelKey) };
                        const isActive = activeRound === round;
                        const count   = bracketsData[round].length;
                        return (
                          <motion.button key={round} onClick={() => setActiveRound(round)}
                            className="relative flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 overflow-hidden"
                            style={{ background: isActive ? `linear-gradient(135deg, ${meta.color}18, rgba(2,8,20,0.90))` : 'transparent',
                              border: `1px solid ${isActive ? meta.color + '35' : 'transparent'}`, outline: 'none', cursor: 'pointer' }}
                            whileTap={{ scale: 0.96 }}>
                            {isActive && (
                              <div className="absolute inset-x-0 top-0 h-px"
                                style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }} />
                            )}
                            <span style={{ color: isActive ? meta.color : 'rgba(100,116,139,0.60)',
                              filter: isActive ? `drop-shadow(0 0 5px ${meta.glow})` : 'none', display: 'flex' }}>
                              {meta.icon}
                            </span>
                            <span className="text-[10px] font-black tracking-[0.10em] whitespace-nowrap"
                              style={{ color: isActive ? meta.color : 'rgba(100,116,139,0.60)',
                                textShadow: isActive ? `0 0 10px ${meta.glow}` : 'none' }}>
                              {meta.shortLabel}
                            </span>
                            {count > 0 && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                                style={{ background: isActive ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
                                  color: isActive ? meta.color : 'rgba(100,116,139,0.45)',
                                  border: `1px solid ${isActive ? meta.color + '28' : 'transparent'}` }}>
                                {count}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Round cards */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeRound}
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className={`grid gap-3 ${ROUND_GRID[activeRound]}`}>
                      {bracketsData[activeRound].map((match, i) => (
                        <KnockoutCard key={match.id} match={match} round={activeRound} index={i} t={t} />
                      ))}
                      {bracketsData[activeRound].length === 0 && (
                        <div className="col-span-2 flex flex-col items-center gap-3 py-16">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
                            <FiAward size={22} style={{ color: 'rgba(251,191,36,0.40)' }} />
                          </div>
                          <p className="text-[10px] text-slate-700 font-bold tracking-[0.2em] uppercase">{t('groups.roundUndefined')}</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── DESKTOP xl+: Bracket component ── */}
                <div className="hidden xl:block relative overflow-hidden rounded-2xl"
                  style={{
                    border: '1px solid rgba(34,211,238,0.10)',
                    boxShadow: '0 28px 90px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,191,36,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}>
                  <BracketBg />
                  <div className="absolute inset-x-0 top-0 h-px z-10"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.55), rgba(251,191,36,0.35), rgba(34,211,238,0.55), transparent)' }} />
                  <div className="relative z-10 overflow-x-auto p-4">
                    <div className="min-w-max">
                      <Bracket key="bracket-desktop" data={bracketsData} showBg={false} />
                    </div>
                  </div>
                </div>

                {/* Champion banner */}
                {champion && <ChampionBanner winner={champion} t={t} />}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
      <TourButton steps={getTourSteps(locale, 'groups')} />
    </div>
  );
}
