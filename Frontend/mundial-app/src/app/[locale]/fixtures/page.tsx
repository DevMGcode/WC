'use client';

/**
 * Fixtures page — pilot for the design-token migration.
 *
 * Before: 1857 hardcoded `rgba()` calls and 252 `#hex` literals were scattered
 * across the app. This file is the first one converted to consume only the
 * design tokens (`@/lib/design/tokens`, `@/lib/design/effects`) and the UI
 * primitives (`@/components/ui`). The visual output is byte-identical to the
 * previous version, but a single token change in `tokens.ts` now retunes the
 * whole page (and, eventually, the whole app).
 *
 * Two helpers worth knowing:
 *   - `alpha(hex.green.bright, 0.18)` → rgba with full token traceability.
 *   - `surfaces.card()` / `borders.card()` / `shadows.glow('green')` → composed
 *     visual recipes for the patterns that repeat the most.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FiCalendar, FiClock, FiActivity, FiCheck, FiList,
  FiChevronRight, FiZap,
} from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Navigation';
import { getAllFixtures, getCurrentTournament } from '@/services/publicTournament';
import { useT } from '@/hooks/useT';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces, borders, gradients, shadows } from '@/lib/design/effects';
import { Surface, Badge, StatusDot } from '@/components/ui';

/* ══════════════════════════════════════════
   CONSTANTS — driven by tokens, not literals
══════════════════════════════════════════ */
type FilterKey = 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED';

/**
 * Each filter maps to a brand color (semantic), not a hardcoded hex. The
 * exact color comes from tokens.ts via `resolveBrandHex`, so re-theming the
 * "live" or "scheduled" state happens in one place.
 */
const FILTERS: { key: FilterKey; labelKey: string; icon: React.ReactNode; color: BrandColor }[] = [
  { key: 'ALL',       labelKey: 'fixtures.filters.all',      icon: <FiList size={12} />,     color: 'neutral' },
  { key: 'LIVE',      labelKey: 'fixtures.filters.live',     icon: <FiActivity size={12} />, color: 'danger'  },
  { key: 'SCHEDULED', labelKey: 'fixtures.filters.pending',  icon: <FiClock size={12} />,    color: 'green'   },
  { key: 'FINISHED',  labelKey: 'fixtures.filters.finished', icon: <FiCheck size={12} />,    color: 'success' },
];

/**
 * Status configs derive everything from a single BrandColor. The bg/glow/border
 * shades come from `alphaOf(color, x)`, never from a hardcoded rgba string.
 */
const STATUS_CFG: Record<string, { labelKey: string; color: BrandColor }> = {
  LIVE:      { labelKey: 'fixtures.filters.live',     color: 'danger'  },
  SCHEDULED: { labelKey: 'fixtures.filters.pending',  color: 'green'   },
  FINISHED:  { labelKey: 'common.finished',           color: 'success' },
  POSTPONED: { labelKey: 'common.pending',            color: 'neutral' },
};

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

/* KPI stat chip — color-driven via BrandColor */
const KPIChip = ({
  icon, value, label, color, delay = 0,
}: { icon: React.ReactNode; value: number | string; label: string; color: BrandColor; delay?: number }) => {
  const glow = alphaOf(color, 0.55);
  const bg   = alphaOf(color, 0.07);
  const text = ({ neutral: hex.text.secondary, green: hex.green.bright, gold: hex.gold.base,
                  danger: hex.status.danger, warning: hex.status.warning, success: hex.green.hover,
                  info: hex.status.info } as const)[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      className="relative flex items-center gap-3 rounded-2xl px-4 py-3 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.95)})`,
        border: `1px solid ${alphaOf(color, 0.21)}`,
        boxShadow: `0 8px 32px ${alphaOf(color, 0.10)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: gradients.divider(color, 0.55) }} />
      <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: gradients.cornerGlow(color, 0.19), filter: 'blur(10px)' }} />
      <motion.div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.85)})`,
                 border: `1px solid ${alphaOf(color, 0.21)}` }}
        animate={{ boxShadow: [`0 0 6px ${alphaOf(color, 0.12)}`, `0 0 18px ${glow}`, `0 0 6px ${alphaOf(color, 0.12)}`] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
        <span style={{ color: text, fontSize: 16 }}>{icon}</span>
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: `1px solid ${alphaOf(color, 0.16)}` }}
          animate={{ opacity: [0, 0.8, 0], scale: [1, 1.35, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} />
      </motion.div>
      <div className="relative z-10 min-w-0">
        <p className="text-base font-black tabular-nums leading-none" style={{ color: text }}>{value}</p>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: glow }}>{label}</p>
      </div>
      <div className="absolute right-3 bottom-2 opacity-30">
        <EQBars color={text} count={5} maxH={10} />
      </div>
    </motion.div>
  );
};

const FlagBubble = ({ url, name, size = 60, color = 'green' as BrandColor, soft = false }: {
  url: string; name: string; size?: number; color?: BrandColor; soft?: boolean;
}) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: alphaOf(color, soft ? 0.14 : 0.22), filter: 'blur(12px)', transform: 'scale(1.3)' }}
      animate={{ opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
      style={{ border: `1.5px solid ${alpha(hex.neutral.white, 0.12)}`, background: hex.bg.elevated }}>
      {url && <img src={url} alt={name} className="w-full h-full object-cover" />}
    </div>
  </div>
);

const MatchCard = ({ fixture, index, isFirst, t }: { fixture: any; index: number; t: (key: string) => string; isFirst?: boolean }) => {
  const effectiveStatus = getEffectiveStatus(fixture);
  const isLive     = effectiveStatus === 'LIVE';
  const isFinished = effectiveStatus === 'FINISHED';
  const cfg        = STATUS_CFG[effectiveStatus] ?? STATUS_CFG.SCHEDULED;

  const dt      = new Date(fixture.kickoffAt);
  const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  const glow = alphaOf(cfg.color, 0.60);
  const cardTintBg = alphaOf(cfg.color, isFinished || isLive ? 0.04 : 0.02);

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
            background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)} 0%, ${alpha(hex.bg.secondary, 0.97)} 60%, ${cardTintBg} 100%)`,
            border: `1px solid ${alphaOf(cfg.color, isLive ? 0.35 : 0.095)}`,
            backdropFilter: 'blur(28px)',
            boxShadow: isLive
              ? `0 0 0 1px ${alphaOf(cfg.color, 0.08)}, 0 20px 56px ${alpha(hex.neutral.black, 0.65)}, 0 0 40px ${alphaOf(cfg.color, 0.10)}`
              : `0 20px 48px ${alpha(hex.neutral.black, 0.55)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.015)}, 0 0 20px ${alphaOf(cfg.color, 0.08)}`,
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Left accent bar */}
          <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
            style={{ background: gradients.dividerV(cfg.color, 1), boxShadow: `0 0 8px ${glow}` }} />

          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: gradients.divider(cfg.color, 0.6) }} />

          {/* Live pulsing overlay */}
          {isLive && (
            <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
              animate={{ opacity: [0, 0.10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${alphaOf('danger', 0.28)}, transparent 65%)` }} />
          )}

          {/* Hover shimmer */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100"
            style={{ background: `linear-gradient(108deg, transparent 30%, ${alpha(hex.neutral.white, 0.022)} 50%, transparent 70%)`,
                     transition: 'opacity 0.28s' }} />

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: borders.divider() }}>
            {/* Status badge — using the Badge primitive */}
            <Badge color={cfg.color} size="xs">
              {isLive && <StatusDot color={cfg.color} size={6} />}
              {t(cfg.labelKey)}
            </Badge>

            {/* Stage / round */}
            {fixture.round && (
              <span className="text-[8px] font-black tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                style={{ color: alpha(hex.text.secondary, 0.40),
                         background: alpha(hex.neutral.white, 0.03),
                         border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
                {fixture.round}
              </span>
            )}

            <motion.span className="shrink-0"
              style={{ color: hex.text.muted, transition: 'color 0.2s' }}
              animate={isLive ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}>
              <FiChevronRight size={14} />
            </motion.span>
          </div>

          {/* ── TEAMS + SCORE ── */}
          <div className="flex items-center justify-around px-5 py-6 gap-3">
            <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
              <FlagBubble url={fixture.homeTeam?.flagUrl} name={fixture.homeTeam?.name} size={62}
                color={cfg.color} soft={!isFinished && !isLive} />
              <p className="text-[11px] font-black tracking-widest text-center leading-none truncate w-full uppercase text-orionix-text-secondary">
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
                      color: hex.neutral.white,
                      textShadow: `0 0 24px ${glow}, 0 0 48px ${alphaOf(cfg.color, 0.31)}`,
                    }}>
                    {fixture.homeScore ?? 0}
                  </span>
                  <span className="font-black"
                    style={{ color: alpha(hex.neutral.white, 0.12), fontSize: 'clamp(1.5rem,4vw,2.2rem)' }}>–</span>
                  <span className="font-black tabular-nums leading-none"
                    style={{
                      fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                      color: hex.neutral.white,
                      textShadow: `0 0 24px ${glow}, 0 0 48px ${alphaOf(cfg.color, 0.31)}`,
                    }}>
                    {fixture.awayScore ?? 0}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <motion.div className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${alphaOf(cfg.color, 0.16)}` }}
                      animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.4, repeat: Infinity }} />
                    <motion.p className="font-black leading-none text-lg"
                      style={{ color: alphaOf(cfg.color, 0.31), letterSpacing: '0.10em' }}
                      animate={{ opacity: [0.35, 0.70, 0.35] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      VS
                    </motion.p>
                  </div>
                  <p className="text-[10px] font-black tabular-nums"
                    style={{ color: alphaOf(cfg.color, 1), textShadow: `0 0 8px ${glow}` }}>
                    {timeStr}
                  </p>
                </div>
              )}
              {isLive && (
                <motion.div className="flex items-center gap-1 mt-1"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}>
                  <StatusDot color="danger" size={4} pulse={false} />
                  <p className="text-[7px] font-black tracking-[0.35em] uppercase"
                    style={{ color: hex.status.danger, textShadow: `0 0 10px ${alphaOf('danger', 0.5)}` }}>
                    {t('fixtures.filters.live')}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
              <FlagBubble url={fixture.awayTeam?.flagUrl} name={fixture.awayTeam?.name} size={62}
                color={cfg.color} soft={!isFinished && !isLive} />
              <p className="text-[11px] font-black tracking-widest text-center leading-none truncate w-full uppercase text-orionix-text-secondary">
                {fixture.awayTeam?.shortName}
              </p>
            </div>
          </div>

          {/* ── GOLEADORES (solo partidos FINISHED con scorers) ── */}
          {isFinished && fixture.scorers && fixture.scorers.length > 0 && (
            <div className="px-4 pb-3">
              <div className="rounded-xl px-3 py-2.5"
                style={{ background: alpha(hex.neutral.black, 0.28), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[8px] font-black tracking-[0.22em] uppercase"
                    style={{ color: alpha(hex.gold.muted, 0.55) }}>Goleadores</span>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: alpha(hex.gold.muted, 0.08), color: alpha(hex.gold.muted, 0.7),
                             border: `1px solid ${alpha(hex.gold.muted, 0.18)}` }}>
                    {fixture.scorers.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1 min-w-0">
                    {fixture.scorers
                      .filter((s: any) => s.teamId === fixture.homeTeam?.id)
                      .map((s: any) => (
                        <div key={s.id} className="flex items-center gap-1 text-[9px] text-orionix-green-bright">
                          <span className="shrink-0">⚽</span>
                          <span className="font-bold truncate">{s.playerName}</span>
                          {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                        </div>
                      ))}
                  </div>
                  <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.07) }} />
                  <div className="flex-1 space-y-1 min-w-0">
                    {fixture.scorers
                      .filter((s: any) => s.teamId === fixture.awayTeam?.id)
                      .map((s: any) => (
                        <div key={s.id} className="flex items-center justify-end gap-1 text-[9px]"
                          style={{ color: hex.gold.bright }}>
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
            style={{ borderTop: borders.divider(), background: alpha(hex.neutral.black, 0.22) }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <FiCalendar size={9} style={{ color: alpha(hex.text.secondary, 0.25) }} />
                <span className="text-[8px] font-semibold capitalize text-orionix-text-muted">{dateStr}</span>
              </div>
              {!isLive && !isFinished && (
                <>
                  <div className="w-px h-2.5" style={{ background: alpha(hex.neutral.white, 0.06) }} />
                  <div className="flex items-center gap-1.5">
                    <FiClock size={9} style={{ color: alpha(hex.text.secondary, 0.25) }} />
                    <span className="text-[8px] font-semibold text-orionix-text-muted">{timeStr}</span>
                  </div>
                </>
              )}
            </div>
            {!isFinished && !isLive && (
              <motion.div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: alphaOf('green', 0.06), border: borders.brand('green', 0.18),
                         color: alphaOf('green', 0.65) }}
                whileHover={{ scale: 1.05, backgroundColor: alphaOf('green', 0.12) }}>
                <FiZap size={8} />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase">{t('fixtures.predict')}</span>
              </motion.div>
            )}
            {isFinished && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: alphaOf('success', 0.06), border: borders.brand('success', 0.18) }}>
                <FiCheck size={8} className="text-orionix-green-hover" />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase text-orionix-green-bright">{t('fixtures.final')}</span>
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
      style={{ background: `radial-gradient(ellipse at 20% 30%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 50%, ${hex.bg.primary} 100%)` }}>

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 700, height: 700, top: -200, left: -150,
                 background: gradients.cornerGlow('success', 0.07).replace('circle,', 'circle at center,'),
                 filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, right: -80,
                 background: gradients.cornerGlow('green', 0.07).replace('circle,', 'circle at center,'),
                 filter: 'blur(65px)', zIndex: 0 }}
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
                style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})`,
                         boxShadow: `0 0 8px ${alphaOf('green', 0.6)}` }} />
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                {t('fixtures.title')}
              </h1>
              <motion.div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full ml-1"
                style={{ background: alphaOf('green', 0.08), border: borders.brand('green', 0.22) }}
                animate={{ boxShadow: [`0 0 6px ${alphaOf('green', 0.06)}`, `0 0 16px ${alphaOf('green', 0.18)}`, `0 0 6px ${alphaOf('green', 0.06)}`] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <span className="text-[9px] font-black tabular-nums text-orionix-green-soft">{counts.total}</span>
                <span className="text-[7px] tracking-widest uppercase font-bold text-orionix-text-muted">{t('fixtures.matches')}</span>
              </motion.div>
            </div>
            <p className="text-[11px] tracking-widest ml-5 uppercase text-orionix-text-muted">
              Mundial 2026 · USA · México · Canadá
            </p>
          </div>

          {/* Live pill */}
          {counts.live > 0 && (
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{ background: alphaOf('danger', 0.10), border: borders.brand('danger', 0.30) }}
              animate={{ boxShadow: [`0 0 10px ${alphaOf('danger', 0.10)}`, `0 0 24px ${alphaOf('danger', 0.28)}`, `0 0 10px ${alphaOf('danger', 0.10)}`] }}
              transition={{ duration: 1.4, repeat: Infinity }}>
              <StatusDot color="danger" size={8} />
              <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: hex.status.danger }}>
                {counts.live} {t('fixtures.filters.live')}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── KPI CHIPS ── */}
        {!loading && (
          <div data-tour="calendar-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <KPIChip icon={<FiList />}     value={counts.total}     label={t('fixtures.total')}            color="neutral" delay={0.06} />
            <KPIChip icon={<FiActivity />} value={counts.live}      label={t('fixtures.filters.live')}     color="danger"  delay={0.12} />
            <KPIChip icon={<FiClock />}    value={counts.scheduled} label={t('fixtures.filters.pending')}  color="green"   delay={0.18} />
            <KPIChip icon={<FiCheck />}    value={counts.finished}  label={t('fixtures.filters.finished')} color="success" delay={0.24} />
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <Surface className="mb-6 p-2" blurBg style={{ boxShadow: `0 8px 32px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}` }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            data-tour="calendar-filters"
            className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map(({ key, labelKey, icon, color }) => {
              const isActive = filter === key;
              const count = key === 'ALL' ? counts.total : key === 'LIVE' ? counts.live : key === 'SCHEDULED' ? counts.scheduled : counts.finished;
              const glow  = alphaOf(color, 0.55);
              const textC = ({ neutral: hex.text.secondary, green: hex.green.bright, gold: hex.gold.base,
                              danger: hex.status.danger, warning: hex.status.warning, success: hex.green.hover,
                              info: hex.status.info } as const)[color];
              return (
                <motion.button key={key} onClick={() => setFilter(key)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{ outline: 'none', cursor: 'pointer' }}>
                  {isActive && (
                    <motion.span layoutId="fixture-filter-pill" className="absolute inset-0 rounded-xl"
                      style={{ background: `linear-gradient(135deg, ${alphaOf(color, 0.13)}, ${alphaOf(color, 0.05)})`,
                               border: `1px solid ${alphaOf(color, 0.25)}`,
                               boxShadow: `0 0 16px ${alphaOf(color, 0.19)}` }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }} />
                  )}
                  <motion.span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
                    style={{
                      background: isActive ? alphaOf(color, 0.09) : alpha(hex.neutral.white, 0.03),
                      border: `1px solid ${isActive ? alphaOf(color, 0.27) : alpha(hex.neutral.white, 0.06)}`,
                      color: isActive ? textC : alpha(hex.text.muted, 0.45),
                      transition: 'all 0.22s ease',
                    }}
                    animate={isActive ? { boxShadow: [`0 0 4px ${alphaOf(color, 0.13)}`, `0 0 12px ${glow}`, `0 0 4px ${alphaOf(color, 0.13)}`] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {icon}
                  </motion.span>
                  <span className="relative z-10 text-[10px] font-black tracking-[0.12em] whitespace-nowrap"
                    style={{ color: isActive ? textC : alpha(hex.text.muted, 0.55),
                             textShadow: isActive ? `0 0 10px ${glow}` : 'none', transition: 'all 0.22s' }}>
                    {t(labelKey)}
                  </span>
                  {count > 0 && (
                    <span className="relative z-10 text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{ background: isActive ? alphaOf(color, 0.13) : alpha(hex.neutral.white, 0.04),
                               color: isActive ? textC : alpha(hex.text.muted, 0.40),
                               border: `1px solid ${isActive ? alphaOf(color, 0.19) : 'transparent'}`,
                               transition: 'all 0.22s' }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
            <div className="flex-1" />
            <div className="hidden sm:flex items-center pr-2">
              <EQBars color={alphaOf('green', 0.30)} count={6} maxH={14} />
            </div>
          </motion.div>
        </Surface>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: alpha(hex.bg.primary, 0.95), border: borders.brand('green', 0.07), height: 180 }}
                animate={{ opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}>
                <div className="h-full flex flex-col">
                  <div className="h-11 border-b"
                    style={{ borderColor: alpha(hex.neutral.white, 0.04), background: alpha(hex.neutral.black, 0.22) }} />
                  <div className="flex-1 flex items-center justify-around px-6 py-4 gap-4">
                    <div className="w-14 h-14 rounded-full" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                    <div className="w-14 h-7 rounded-xl" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                    <div className="w-14 h-14 rounded-full" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                  </div>
                  <div className="h-9 border-t"
                    style={{ borderColor: alpha(hex.neutral.white, 0.04), background: alpha(hex.neutral.black, 0.22) }} />
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
                    <StatusDot color="success" size={8} />
                    <span className="text-[11px] font-black tracking-[0.28em] uppercase"
                      style={{ color: alphaOf('green', 0.70), textShadow: `0 0 10px ${alphaOf('green', 0.30)}` }}>
                      {label}
                    </span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.18)}, transparent)` }} />
                  <span className="text-[8px] font-black tracking-[0.22em] uppercase shrink-0 text-orionix-text-muted">
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
                style={{ background: alphaOf('green', 0.12), filter: 'blur(22px)', transform: 'scale(1.5)' }}
                animate={{ scale: [1.3, 1.7, 1.3], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative w-18 h-18 rounded-2xl flex items-center justify-center p-5"
                style={{ background: `linear-gradient(145deg, ${alphaOf('green', 0.14)}, ${alpha(hex.bg.primary, 0.90)})`,
                         border: borders.brand('green', 0.24) }}>
                <FiCalendar size={30} style={{ color: alphaOf('green', 0.60) }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black mb-1 tracking-wide text-orionix-text-muted">{t('fixtures.noMatches')}</p>
              <p className="text-[11px] tracking-widest uppercase text-orionix-text-muted">{t('fixtures.tryOtherFilter')}</p>
            </div>
            <motion.button onClick={() => setFilter('ALL')}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.22em] uppercase"
              style={{ color: hex.green.bright, border: borders.brand('green', 0.25),
                       background: alphaOf('green', 0.08), boxShadow: shadows.glow('green', 0.10) }}
              whileHover={{ scale: 1.05, boxShadow: shadows.hoverGlow('green') }}
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
