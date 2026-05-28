'use client';

/**
 * Fixtures page — pilot for the design-token migration.
 *
 * Sub-componentes extraídos a ./_components/:
 *   - MatchCard       → tarjeta de partido individual
 *   - FixturesFilterBar → barra de filtros (ALL / LIVE / SCHEDULED / FINISHED)
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiActivity, FiCheck, FiList,
} from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Navigation';
import { useAllFixtures } from '@/hooks/useTournamentData';
import { LIVE_REFETCH_INTERVAL_MS } from '@/constants/tournament';
import { fmtDayLong } from '@/utils/format';
import { useT } from '@/hooks/useT';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients, shadows } from '@/lib/design/effects';
import { Surface, StatusDot } from '@/components/ui';

import MatchCard, { getEffectiveStatus } from './_components/MatchCard';
import FixturesFilterBar, { type FilterKey } from './_components/FixturesFilterBar';

/* ══════════════════════════════════════════
   KPI CHIP
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

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function FixturesClient({ initialFixtures }: { initialFixtures?: any[] }) {
  const { t } = useT();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'es';
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const { data: allFixtures = [], isLoading: loading } = useAllFixtures(undefined, initialFixtures, LIVE_REFETCH_INTERVAL_MS);

  const fixtures = useMemo(() =>
    filter === 'ALL' ? allFixtures : allFixtures.filter(f => getEffectiveStatus(f) === filter),
    [filter, allFixtures]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: any[] }>();
    fixtures.forEach(f => {
      const d = new Date(f.kickoffAt);
      const key = d.toISOString().slice(0, 10);
      const label = fmtDayLong(d);
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
        <FixturesFilterBar filter={filter} counts={counts} onFilter={setFilter} t={t} />

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
