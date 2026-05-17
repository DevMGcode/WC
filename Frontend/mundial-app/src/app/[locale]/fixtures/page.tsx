'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FiCalendar, FiClock, FiActivity, FiCheck, FiList,
  FiChevronRight, FiZap, FiTrendingUp,
} from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Navigation';
import { getAllFixtures, getCurrentTournament } from '@/services/publicTournament';
import { useT } from '@/hooks/useT';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
type FilterKey = 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED';

const FILTERS: { key: FilterKey; labelKey: string; icon: React.ReactNode; color: string; glow: string }[] = [
  { key: 'ALL',       labelKey: 'fixtures.filters.all',      icon: <FiList size={12} />,     color: '#94a3b8', glow: 'rgba(148,163,184,0.55)' },
  { key: 'LIVE',      labelKey: 'fixtures.filters.live',     icon: <FiActivity size={12} />, color: '#ef4444', glow: 'rgba(239,68,68,0.60)'   },
  { key: 'SCHEDULED', labelKey: 'fixtures.filters.pending',  icon: <FiClock size={12} />,    color: '#22d3ee', glow: 'rgba(34,211,238,0.60)'  },
  { key: 'FINISHED',  labelKey: 'fixtures.filters.finished', icon: <FiCheck size={12} />,    color: '#34d399', glow: 'rgba(52,211,153,0.60)'  },
];

const STATUS_CFG = {
  LIVE:      { labelKey: 'fixtures.filters.live',     color: '#ef4444', glow: 'rgba(239,68,68,0.60)',   bg: 'rgba(239,68,68,0.10)',  cardBg: 'rgba(239,68,68,0.04)'  },
  SCHEDULED: { labelKey: 'fixtures.filters.pending',  color: '#22d3ee', glow: 'rgba(34,211,238,0.60)',  bg: 'rgba(34,211,238,0.08)', cardBg: 'rgba(34,211,238,0.02)' },
  FINISHED:  { labelKey: 'common.finished',           color: '#34d399', glow: 'rgba(52,211,153,0.60)',  bg: 'rgba(52,211,153,0.08)', cardBg: 'rgba(52,211,153,0.02)' },
  POSTPONED: { labelKey: 'common.pending',            color: '#94a3b8', glow: 'rgba(148,163,184,0.45)', bg: 'rgba(148,163,184,0.06)', cardBg: 'transparent'          },
} as const;

/* ══════════════════════════════════════════
   EFFECTIVE STATUS — frontend time-based override
   When the backend hasn't updated a SCHEDULED match yet,
   we derive the effective status from kickoffAt:
     kickoffAt + 120 min < now  → treat as FINISHED
     kickoffAt <= now < +120min → treat as LIVE
   FINISHED / LIVE from the backend are always respected.
══════════════════════════════════════════ */
const MATCH_DURATION_MS = 120 * 60 * 1000; // 2 hours

function getEffectiveStatus(fixture: { status: string; kickoffAt: string }): string {
  if (fixture.status === 'FINISHED' || fixture.status === 'LIVE') return fixture.status;
  if (fixture.status === 'SCHEDULED') {
    const kickoff = new Date(fixture.kickoffAt).getTime();
    const now     = Date.now();
    if (now >= kickoff + MATCH_DURATION_MS) return 'FINISHED';
    if (now >= kickoff) return 'LIVE';
  }
  return fixture.status;
}

/* ══════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════ */
const EQBars = ({ color, count = 7, maxH = 14 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        const h3 = (seq[(i + 2) % seq.length] / 20) * maxH;
        return (
          <motion.div key={i} className="rounded-full"
            style={{ width: 2.5, background: color, boxShadow: `0 0 4px ${color}` }}
            animate={{ height: [h1, h2, h3, h2, h1] }}
            transition={{ duration: 1.3 + i * 0.11, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }} />
        );
      })}
    </div>
  );
};

/* KPI stat chip — same pattern as home page */
const KPIChip = ({
  icon, value, label, color, glow, bg, delay = 0,
}: { icon: React.ReactNode; value: number | string; label: string; color: string; glow: string; bg: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -14, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3, scale: 1.03 }}
    className="relative flex items-center gap-3 rounded-2xl px-4 py-3 overflow-hidden"
    style={{
      background: `linear-gradient(145deg, ${bg}, rgba(2,8,20,0.95))`,
      border: `1px solid ${glow}35`,
      boxShadow: `0 8px 32px ${glow}18, inset 0 1px 0 rgba(255,255,255,0.04)`,
      backdropFilter: 'blur(20px)',
    }}
  >
    {/* top gradient line */}
    <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
    {/* corner glow */}
    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${glow}30 0%, transparent 70%)`, filter: 'blur(10px)' }} />
    {/* icon box */}
    <motion.div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
      style={{ background: `linear-gradient(145deg, ${bg}, rgba(2,8,20,0.85))`, border: `1px solid ${glow}35` }}
      animate={{ boxShadow: [`0 0 6px ${glow}20`, `0 0 18px ${glow}55`, `0 0 6px ${glow}20`] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
      <span style={{ color, fontSize: 16 }}>{icon}</span>
      <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ border: `1px solid ${glow}28` }}
        animate={{ opacity: [0, 0.8, 0], scale: [1, 1.35, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} />
    </motion.div>
    <div className="relative z-10 min-w-0">
      <p className="text-base font-black tabular-nums leading-none" style={{ color }}>{value}</p>
      <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: `${glow}` }}>{label}</p>
    </div>
    <div className="absolute right-3 bottom-2 opacity-30">
      <EQBars color={color} count={5} maxH={10} />
    </div>
  </motion.div>
);

const FlagBubble = ({ url, name, size = 60, glow = 'rgba(34,211,238,0.20)' }: { url: string; name: string; size?: number; glow?: string }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: glow, filter: 'blur(12px)', transform: 'scale(1.3)' }}
      animate={{ opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
      style={{ border: '1.5px solid rgba(255,255,255,0.12)', background: '#0a1628' }}>
      {url && <img src={url} alt={name} className="w-full h-full object-cover" />}
    </div>
  </div>
);

const MatchCard = ({ fixture, index, isFirst, t }: { fixture: any; index: number; t: (key: string) => string; isFirst?: boolean }) => {
  const effectiveStatus = getEffectiveStatus(fixture);
  const isLive     = effectiveStatus === 'LIVE';
  const isFinished = effectiveStatus === 'FINISHED';
  const cfg = STATUS_CFG[effectiveStatus as keyof typeof STATUS_CFG] ?? STATUS_CFG.SCHEDULED;

  const dt      = new Date(fixture.kickoffAt);
  const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.42, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.012 }}
      className="group"
      {...(isFirst ? { 'data-tour': 'calendar-match' } : {})}
    >
      <Link href={`fixtures/${fixture.id}`}>
        <div className="relative overflow-hidden rounded-2xl cursor-pointer"
          style={{
            background: `linear-gradient(145deg, rgba(4,12,28,0.98) 0%, rgba(5,16,36,0.97) 60%, ${cfg.cardBg} 100%)`,
            border: `1px solid ${isLive ? 'rgba(239,68,68,0.35)' : cfg.color + '18'}`,
            backdropFilter: 'blur(28px)',
            boxShadow: isLive
              ? `0 0 0 1px rgba(239,68,68,0.08), 0 20px 56px rgba(0,0,0,0.65), 0 0 40px rgba(239,68,68,0.10)`
              : `0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.015), 0 0 20px ${cfg.glow}08`,
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Left accent bar */}
          <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
            style={{ background: `linear-gradient(180deg, transparent, ${cfg.color}, transparent)`, boxShadow: `0 0 8px ${cfg.glow}` }} />

          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)` }} />

          {/* Live pulsing overlay */}
          {isLive && (
            <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
              animate={{ opacity: [0, 0.10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.28), transparent 65%)' }} />
          )}

          {/* Hover shimmer */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100"
            style={{ background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.022) 50%, transparent 70%)', transition: 'opacity 0.28s' }} />

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}35` }}>
              {isLive && (
                <motion.span className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                  style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }}
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.6, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }} />
              )}
              <span className="text-[8px] font-black tracking-[0.26em] uppercase whitespace-nowrap"
                style={{ color: cfg.color, textShadow: isLive ? `0 0 10px ${cfg.glow}` : 'none' }}>
                {t(cfg.labelKey)}
              </span>
            </div>

            {/* Stage / round */}
            {fixture.round && (
              <span className="text-[8px] font-black tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                style={{ color: 'rgba(148,163,184,0.40)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {fixture.round}
              </span>
            )}

            <motion.span className="text-slate-700 shrink-0 group-hover:text-slate-500"
              style={{ transition: 'color 0.2s' }}
              animate={isLive ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}>
              <FiChevronRight size={14} />
            </motion.span>
          </div>

          {/* ── TEAMS + SCORE ── */}
          <div className="flex items-center justify-around px-5 py-6 gap-3">
            {/* Home team */}
            <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
              <FlagBubble url={fixture.homeTeam?.flagUrl} name={fixture.homeTeam?.name} size={62}
                glow={isFinished || isLive ? cfg.glow.replace('0.60', '0.22') : 'rgba(34,211,238,0.14)'} />
              <p className="text-[11px] font-black text-slate-200 tracking-widest text-center leading-none truncate w-full uppercase">
                {fixture.homeTeam?.shortName}
              </p>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 px-3">
              {isFinished || isLive ? (
                <motion.div className="flex items-center gap-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <span className="font-black tabular-nums leading-none"
                    style={{
                      fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                      color: '#fff',
                      textShadow: `0 0 24px ${cfg.glow}, 0 0 48px ${cfg.glow}50`,
                    }}>
                    {fixture.homeScore ?? 0}
                  </span>
                  <span className="font-black" style={{ color: 'rgba(255,255,255,0.12)', fontSize: 'clamp(1.5rem,4vw,2.2rem)' }}>–</span>
                  <span className="font-black tabular-nums leading-none"
                    style={{
                      fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                      color: '#fff',
                      textShadow: `0 0 24px ${cfg.glow}, 0 0 48px ${cfg.glow}50`,
                    }}>
                    {fixture.awayScore ?? 0}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  {/* VS ring */}
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <motion.div className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${cfg.color}28` }}
                      animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.4, repeat: Infinity }} />
                    <motion.p className="font-black leading-none text-lg"
                      style={{ color: `${cfg.color}50`, letterSpacing: '0.10em' }}
                      animate={{ opacity: [0.35, 0.70, 0.35] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      VS
                    </motion.p>
                  </div>
                  <p className="text-[10px] font-black tabular-nums"
                    style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}>
                    {timeStr}
                  </p>
                </div>
              )}
              {isLive && (
                <motion.div className="flex items-center gap-1 mt-1"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}>
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  <p className="text-[7px] font-black tracking-[0.35em] uppercase"
                    style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
                    {t('fixtures.filters.live')}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
              <FlagBubble url={fixture.awayTeam?.flagUrl} name={fixture.awayTeam?.name} size={62}
                glow={isFinished || isLive ? cfg.glow.replace('0.60', '0.22') : 'rgba(34,211,238,0.14)'} />
              <p className="text-[11px] font-black text-slate-200 tracking-widest text-center leading-none truncate w-full uppercase">
                {fixture.awayTeam?.shortName}
              </p>
            </div>
          </div>

          {/* ── GOLEADORES (solo partidos FINISHED con scorers) ── */}
          {isFinished && fixture.scorers && fixture.scorers.length > 0 && (
            <div className="px-4 pb-3">
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Header */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[8px] font-black tracking-[0.22em] uppercase" style={{ color: 'rgba(251,191,36,0.55)' }}>Goleadores</span>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.08)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.18)' }}>
                    {fixture.scorers.length}
                  </span>
                </div>
                {/* Dos columnas */}
                <div className="flex gap-2">
                  {/* Local — cyan */}
                  <div className="flex-1 space-y-1 min-w-0">
                    {fixture.scorers
                      .filter((s: any) => s.teamId === fixture.homeTeam?.id)
                      .map((s: any) => (
                        <div key={s.id} className="flex items-center gap-1 text-[9px]" style={{ color: '#22d3ee' }}>
                          <span className="shrink-0">⚽</span>
                          <span className="font-bold truncate">{s.playerName}</span>
                          {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                        </div>
                      ))}
                  </div>
                  {/* Divisor */}
                  <div className="w-px shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  {/* Visitante — rose */}
                  <div className="flex-1 space-y-1 min-w-0">
                    {fixture.scorers
                      .filter((s: any) => s.teamId === fixture.awayTeam?.id)
                      .map((s: any) => (
                        <div key={s.id} className="flex items-center justify-end gap-1 text-[9px]" style={{ color: '#fb7185' }}>
                          {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                          <span className="font-bold truncate">{s.playerName}</span>
                          <span className="shrink-0">⚽</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.22)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <FiCalendar size={9} style={{ color: 'rgba(148,163,184,0.25)' }} />
                <span className="text-[8px] text-slate-600 font-semibold capitalize">{dateStr}</span>
              </div>
              {!isLive && !isFinished && (
                <>
                  <div className="w-px h-2.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="flex items-center gap-1.5">
                    <FiClock size={9} style={{ color: 'rgba(148,163,184,0.25)' }} />
                    <span className="text-[8px] text-slate-600 font-semibold">{timeStr}</span>
                  </div>
                </>
              )}
            </div>
            {/* Predict CTA for scheduled */}
            {!isFinished && !isLive && (
              <motion.div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', color: 'rgba(34,211,238,0.65)' }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(34,211,238,0.12)' }}>
                <FiZap size={8} />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase">{t('fixtures.predict')}</span>
              </motion.div>
            )}
            {isFinished && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
                <FiCheck size={8} style={{ color: '#34d399' }} />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase text-emerald-400">{t('fixtures.final')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function FixturesPage() {
  const { t } = useT();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'es';
  const [allFixtures, setAllFixtures] = useState<any[]>([]);
  const [filter, setFilter]           = useState<FilterKey>('ALL');
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadFixtures(); }, []);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const tournament = await getCurrentTournament();
      if (!tournament) { setAllFixtures([]); return; }
      const data = await getAllFixtures();
      setAllFixtures(data);
    } catch (e) {
      console.error('Error loading fixtures:', e);
    } finally {
      setLoading(false);
    }
  };

  const fixtures = useMemo(() =>
    filter === 'ALL' ? allFixtures : allFixtures.filter(f => getEffectiveStatus(f) === filter),
    [filter, allFixtures]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: any[] }>();
    fixtures.forEach(f => {
      const d = new Date(f.kickoffAt);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!map.has(key)) map.set(key, { key, label, items: [] });
      map.get(key)!.items.push(f);
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [fixtures]);

  const counts = useMemo(() => ({
    total:     allFixtures.length,
    live:      allFixtures.filter(f => getEffectiveStatus(f) === 'LIVE').length,
    scheduled: allFixtures.filter(f => getEffectiveStatus(f) === 'SCHEDULED').length,
    finished:  allFixtures.filter(f => getEffectiveStatus(f) === 'FINISHED').length,
  }), [allFixtures]);

  let globalIdx = 0;

  return (
    <div className="w-full min-h-screen relative"
      style={{ background: 'radial-gradient(ellipse at 20% 30%, #060f1e 0%, #030a14 50%, #010508 100%)' }}>

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 700, height: 700, top: -200, left: -150, background: 'radial-gradient(circle, rgba(0,210,185,0.07) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, right: -80, background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)', filter: 'blur(65px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 14, repeat: Infinity, delay: 4 }} />

      <div className="relative z-10">
        <Header title="⚽ Orionix Gol" subtitle={t('fixtures.subtitle')} centered />
      </div>

      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-6xl mx-auto w-full pb-32">

        {/* ── PAGE TITLE ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-[3px] h-6 rounded-full"
                style={{ background: 'linear-gradient(180deg, #22d3ee, #10b981)', boxShadow: '0 0 8px rgba(34,211,238,0.6)' }} />
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                {t('fixtures.title')}
              </h1>
              <motion.div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full ml-1"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)' }}
                animate={{ boxShadow: ['0 0 6px rgba(34,211,238,0.06)', '0 0 16px rgba(34,211,238,0.18)', '0 0 6px rgba(34,211,238,0.06)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <span className="text-[9px] font-black text-cyan-300 tabular-nums">{counts.total}</span>
                <span className="text-[7px] text-slate-600 tracking-widest uppercase font-bold">{t('fixtures.matches')}</span>
              </motion.div>
            </div>
            <p className="text-[11px] tracking-widest text-slate-700 ml-5 uppercase">
              Mundial 2026 · USA · México · Canadá
            </p>
          </div>

          {/* Live pill */}
          {counts.live > 0 && (
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}
              animate={{ boxShadow: ['0 0 10px rgba(239,68,68,0.10)', '0 0 24px rgba(239,68,68,0.28)', '0 0 10px rgba(239,68,68,0.10)'] }}
              transition={{ duration: 1.4, repeat: Infinity }}>
              <motion.span className="w-2 h-2 rounded-full bg-red-400 shrink-0"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }} />
              <span className="text-[10px] font-black text-red-400 tracking-widest uppercase">
                {counts.live} {t('fixtures.filters.live')}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── KPI CHIPS ── */}
        {!loading && (
          <div data-tour="calendar-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <KPIChip icon={<FiList />}        value={counts.total}     label={t('fixtures.total')}            color="#94a3b8" glow="rgba(148,163,184,0.55)" bg="rgba(148,163,184,0.07)" delay={0.06} />
            <KPIChip icon={<FiActivity />}    value={counts.live}      label={t('fixtures.filters.live')}     color="#ef4444" glow="rgba(239,68,68,0.60)"   bg="rgba(239,68,68,0.08)"   delay={0.12} />
            <KPIChip icon={<FiClock />}       value={counts.scheduled} label={t('fixtures.filters.pending')}  color="#22d3ee" glow="rgba(34,211,238,0.60)"  bg="rgba(34,211,238,0.07)"  delay={0.18} />
            <KPIChip icon={<FiCheck />}       value={counts.finished}  label={t('fixtures.filters.finished')} color="#34d399" glow="rgba(52,211,153,0.60)"  bg="rgba(52,211,153,0.07)"  delay={0.24} />
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          data-tour="calendar-filters"
          className="relative overflow-hidden rounded-2xl mb-6 p-2"
          style={{
            background: 'linear-gradient(145deg, rgba(4,12,28,0.96), rgba(5,16,38,0.94))',
            border: '1px solid rgba(34,211,238,0.10)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map(({ key, labelKey, icon, color, glow }) => {
              const isActive = filter === key;
              const count = key === 'ALL' ? counts.total : key === 'LIVE' ? counts.live : key === 'SCHEDULED' ? counts.scheduled : counts.finished;
              return (
                <motion.button key={key} onClick={() => setFilter(key)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{ outline: 'none', cursor: 'pointer' }}>
                  {isActive && (
                    <motion.span layoutId="fixture-filter-pill" className="absolute inset-0 rounded-xl"
                      style={{ background: `linear-gradient(135deg, ${color}22, ${color}0c)`, border: `1px solid ${color}40`, boxShadow: `0 0 16px ${glow}30` }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }} />
                  )}
                  {/* Icon box */}
                  <motion.span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
                    style={{
                      background: isActive ? `${color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? color + '45' : 'rgba(255,255,255,0.06)'}`,
                      color: isActive ? color : 'rgba(100,116,139,0.45)',
                      transition: 'all 0.22s ease',
                    }}
                    animate={isActive ? { boxShadow: [`0 0 4px ${glow}20`, `0 0 12px ${glow}50`, `0 0 4px ${glow}20`] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {icon}
                  </motion.span>
                  <span className="relative z-10 text-[10px] font-black tracking-[0.12em] whitespace-nowrap"
                    style={{ color: isActive ? color : 'rgba(100,116,139,0.55)', textShadow: isActive ? `0 0 10px ${glow}` : 'none', transition: 'all 0.22s' }}>
                    {t(labelKey)}
                  </span>
                  {count > 0 && (
                    <span className="relative z-10 text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{ background: isActive ? `${color}22` : 'rgba(255,255,255,0.04)', color: isActive ? color : 'rgba(100,116,139,0.40)', border: `1px solid ${isActive ? color + '30' : 'transparent'}`, transition: 'all 0.22s' }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
            <div className="flex-1" />
            <div className="hidden sm:flex items-center pr-2">
              <EQBars color="rgba(34,211,238,0.30)" count={6} maxH={14} />
            </div>
          </div>
        </motion.div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(4,12,28,0.95)', border: '1px solid rgba(34,211,238,0.07)', height: 180 }}
                animate={{ opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}>
                <div className="h-full flex flex-col">
                  <div className="h-11 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.22)' }} />
                  <div className="flex-1 flex items-center justify-around px-6 py-4 gap-4">
                    <div className="w-14 h-14 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="w-14 h-7 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="w-14 h-14 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                  <div className="h-9 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.22)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : grouped.length > 0 ? (
          <div className="space-y-8">
            {grouped.map(({ key, label, items }) => (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Date separator */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <motion.div className="w-2 h-2 rounded-full"
                      style={{ background: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.8)' }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2.4, repeat: Infinity }} />
                    <span className="text-[11px] font-black tracking-[0.28em] uppercase"
                      style={{ color: 'rgba(34,211,238,0.70)', textShadow: '0 0 10px rgba(34,211,238,0.30)' }}>
                      {label}
                    </span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.18), transparent)' }} />
                  <span className="text-[8px] font-black text-slate-700 tracking-[0.22em] uppercase shrink-0">
                    {items.length} {items.length === 1 ? t('fixtures.match') : t('fixtures.matches')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {items.map((fixture) => {
                      const idx = globalIdx++;
                      return <MatchCard key={fixture.id} fixture={fixture} index={idx} isFirst={idx === 0} t={t} />;
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-28 gap-6">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'rgba(34,211,238,0.12)', filter: 'blur(22px)', transform: 'scale(1.5)' }}
                animate={{ scale: [1.3, 1.7, 1.3], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative w-18 h-18 rounded-2xl flex items-center justify-center p-5"
                style={{ background: 'linear-gradient(145deg, rgba(34,211,238,0.14), rgba(4,12,28,0.90))', border: '1px solid rgba(34,211,238,0.24)' }}>
                <FiCalendar size={30} style={{ color: 'rgba(34,211,238,0.60)' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-400 mb-1 tracking-wide">{t('fixtures.noMatches')}</p>
              <p className="text-[11px] text-slate-700 tracking-widest uppercase">{t('fixtures.tryOtherFilter')}</p>
            </div>
            <motion.button onClick={() => setFilter('ALL')}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.22em] uppercase"
              style={{ color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.08)', boxShadow: '0 0 16px rgba(34,211,238,0.10)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(34,211,238,0.22)' }}
              whileTap={{ scale: 0.96 }}>
              {t('fixtures.viewAllMatches')}
            </motion.button>
          </motion.div>
        )}
      </div>
      <TourButton steps={getTourSteps(locale, 'calendar')} />
    </div>
  );
}
