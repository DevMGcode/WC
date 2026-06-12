'use client';

/**
 * Fixtures page — Calendario del Mundial 2026.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiActivity, FiCheck, FiList,
} from 'react-icons/fi';
import { Header } from '@/components/Navigation';
import { useAllFixtures } from '@/hooks/useTournamentData';
import { LIVE_REFETCH_INTERVAL_MS } from '@/constants/tournament';
import { fmtDayLong } from '@/utils/format';
import { useTranslations, useLocale } from 'next-intl';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex, type BrandColor, resolveBrandHex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients, shadows } from '@/lib/design/effects';
import { Surface, StatusDot } from '@/components/ui';

import MatchCard, { getEffectiveStatus } from './_components/MatchCard';
import FixturesFilterBar, { type FilterKey } from './_components/FixturesFilterBar';
import { AdsterraNative, AdsterraBanner } from '@/components/ads';

/* ══════════════════════════════════════════
   EQ BARS — decorativo
══════════════════════════════════════════ */
const EQBars = React.memo(function EQBars({ color, count = 7, maxH = 14 }: { color: string; count?: number; maxH?: number }) {
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
});

/* ══════════════════════════════════════════
   KPI CHIP — con estado vacío/activo diferenciado
══════════════════════════════════════════ */
const KPIChip = React.memo(function KPIChip({
  icon, value, label, color, delay = 0,
}: { icon: React.ReactNode; value: number | string; label: string; color: BrandColor; delay?: number }) {
  const isEmpty = value === 0 || value === '0';
  // Cuando vacío: misma estructura visible, solo sin glow/animación
  const opacityMult  = isEmpty ? 0.85 : 1;
  const glowIntensity = isEmpty ? 0.30 : 0.55;
  const borderAlpha   = isEmpty ? 0.14 : 0.21;
  const bgAlpha       = isEmpty ? 0.05 : 0.07;

  const glow = alphaOf(color, glowIntensity);
  const bg   = alphaOf(color, bgAlpha);
  const text = resolveBrandHex(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: isEmpty ? 0 : -3, scale: isEmpty ? 1 : 1.03 }}
      className="relative flex items-center gap-3 rounded-2xl px-4 py-3.5 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.elevated, 0.97)})`,
        border: `1px solid ${alphaOf(color, borderAlpha)}`,
        boxShadow: isEmpty
          ? `0 4px 16px ${alpha(hex.neutral.black, 0.35)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`
          : `0 8px 32px ${alphaOf(color, 0.12)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top line — solo visible si hay valor */}
      {!isEmpty && (
        <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: gradients.divider(color, 0.55) }} />
      )}

      {/* Corner glow — reducido si vacío */}
      <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: gradients.cornerGlow(color, isEmpty ? 0.06 : 0.19), filter: 'blur(10px)' }} />

      {/* Icon box */}
      <motion.div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{
          background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.85)})`,
          border: `1px solid ${alphaOf(color, borderAlpha)}`,
          opacity: opacityMult,
        }}
        animate={!isEmpty ? {
          boxShadow: [`0 0 6px ${alphaOf(color, 0.12)}`, `0 0 18px ${glow}`, `0 0 6px ${alphaOf(color, 0.12)}`]
        } : { boxShadow: `0 0 4px ${alphaOf(color, 0.06)}` }}
        transition={{ duration: 2.6, repeat: isEmpty ? 0 : Infinity, ease: 'easeInOut' }}>
        <span style={{ color: text, fontSize: 16 }}>{icon}</span>
        {!isEmpty && (
          <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ border: `1px solid ${alphaOf(color, 0.16)}` }}
            animate={{ opacity: [0, 0.8, 0], scale: [1, 1.35, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} />
        )}
      </motion.div>

      <div className="relative z-10 min-w-0">
        <p className="text-base font-black tabular-nums leading-none"
          style={{ color: isEmpty ? alpha(text, 0.80) : text }}>
          {value}
        </p>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5"
          style={{ color: isEmpty ? alphaOf(color, 0.55) : glow }}>
          {label}
        </p>
      </div>

      {/* EQ bars — solo si hay valor */}
      {!isEmpty && (
        <div className="absolute right-3 bottom-2 opacity-30">
          <EQBars color={text} count={5} maxH={10} />
        </div>
      )}
    </motion.div>
  );
});

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function FixturesClient({ initialFixtures }: { initialFixtures?: any[] }) {
  const t      = useTranslations();
  const locale = useLocale();
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
      const label = fmtDayLong(d, locale);
      if (!map.has(key)) map.set(key, { key, label, items: [] });
      map.get(key)!.items.push(f);
    });
    // FINISHED: descendente (más reciente primero) — demás filtros: ascendente
    return Array.from(map.values()).sort((a, b) =>
      filter === 'FINISHED'
        ? b.key.localeCompare(a.key)
        : a.key.localeCompare(b.key)
    );
  }, [fixtures, filter, locale]);

  const counts = useMemo(() => ({
    total:     allFixtures.length,
    live:      allFixtures.filter(f => getEffectiveStatus(f) === 'LIVE').length,
    scheduled: allFixtures.filter(f => getEffectiveStatus(f) === 'SCHEDULED').length,
    finished:  allFixtures.filter(f => getEffectiveStatus(f) === 'FINISHED').length,
  }), [allFixtures]);

  let globalIdx = 0;

  return (
    <div className="w-full min-h-screen relative"
      style={{
        background: `radial-gradient(ellipse at 18% 28%, ${hex.bg.elevated} 0%, ${hex.bg.secondary} 45%, ${hex.bg.primary} 100%)`,
      }}>

      {/* Ambient orbs — CSS puro (sin JS Framer Motion loop) */}
      <div className="animate-orb fixed rounded-full pointer-events-none"
        style={{ width: 700, height: 700, top: -200, left: -150,
                 background: `radial-gradient(circle, ${alphaOf('success', 0.09)} 0%, transparent 65%)`,
                 filter: 'blur(70px)', zIndex: 0 }} />
      <div className="animate-orb-slow fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, right: -80,
                 background: `radial-gradient(circle, ${alphaOf('green', 0.07)} 0%, transparent 65%)`,
                 filter: 'blur(65px)', zIndex: 0 }} />

      <div className="relative z-10">
        <Header title="⚽ Orionix Gol" subtitle={t('fixtures.subtitle')} centered />
      </div>

      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-6xl mx-auto w-full pb-32">

        {/* ── PAGE TITLE ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-[3px] h-7 rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})`,
                  boxShadow: `0 0 10px ${alphaOf('green', 0.65)}`,
                }} />
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                {t('fixtures.title')}
              </h1>
              <motion.div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full ml-1"
                style={{ background: alphaOf('green', 0.10), border: borders.brand('green', 0.24) }}
                animate={{ boxShadow: [`0 0 6px ${alphaOf('green', 0.06)}`, `0 0 18px ${alphaOf('green', 0.22)}`, `0 0 6px ${alphaOf('green', 0.06)}`] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <span className="text-[9px] font-black tabular-nums text-orionix-green-soft">{counts.total}</span>
                <span className="text-[7px] tracking-widest uppercase font-bold text-orionix-text-muted">{t('fixtures.matches')}</span>
              </motion.div>
            </div>
            <p className="text-[11px] tracking-widest ml-5 uppercase text-orionix-text-muted">
              {t('fixtures.hostCountries')}
            </p>
          </div>

          {counts.live > 0 && (
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{ background: alphaOf('danger', 0.12), border: borders.brand('danger', 0.32) }}
              animate={{ boxShadow: [`0 0 10px ${alphaOf('danger', 0.10)}`, `0 0 26px ${alphaOf('danger', 0.32)}`, `0 0 10px ${alphaOf('danger', 0.10)}`] }}
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
          <div data-tour="calendar-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
                style={{ background: alpha(hex.bg.elevated, 0.95), border: borders.brand('green', 0.07), height: 188 }}
                animate={{ opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}>
                <div className="h-full flex flex-col">
                  <div className="h-11 border-b"
                    style={{ borderColor: alpha(hex.neutral.white, 0.05), background: alpha(hex.neutral.black, 0.25) }} />
                  <div className="flex-1 flex items-center justify-around px-6 py-4 gap-4">
                    <div className="w-14 h-14 rounded-full" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                    <div className="w-14 h-7 rounded-xl" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                    <div className="w-14 h-14 rounded-full" style={{ background: alpha(hex.neutral.white, 0.04) }} />
                  </div>
                  <div className="h-9 border-t"
                    style={{ borderColor: alpha(hex.neutral.white, 0.05), background: alpha(hex.neutral.black, 0.25) }} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : grouped.length > 0 ? (
          <div className="space-y-8">
            {grouped.map(({ key, label, items }, gi) => (
              <React.Fragment key={key}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}>

                {/* ── Date separator — mejorado ── */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <StatusDot color="success" size={7} />
                    <span className="text-[11px] font-black tracking-[0.26em] uppercase"
                      suppressHydrationWarning
                      style={{
                        color: hex.green.soft,
                        textShadow: `0 0 12px ${alphaOf('green', 0.35)}`,
                      }}>
                      {label}
                    </span>
                  </div>

                  {/* Línea divisora */}
                  <div className="flex-1 h-px"
                    style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.22)}, transparent)` }} />

                  {/* Badge de cantidad — más visible y elegante */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      background: alphaOf('green', 0.08),
                      border: `1px solid ${alphaOf('green', 0.20)}`,
                    }}>
                    <span className="text-[9px] font-black tabular-nums" style={{ color: hex.green.bright }}>
                      {items.length}
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.16em] uppercase" style={{ color: alphaOf('green', 0.55) }}>
                      {items.length === 1 ? t('fixtures.match') : t('fixtures.matches')}
                    </span>
                  </div>
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

              {/* Banner nativo (solo Free) — integrado al feed tras el primer día */}
              {gi === 0 && grouped.length > 1 && <AdsterraNative />}
              </React.Fragment>
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
