'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiList, FiActivity, FiClock, FiCheck } from 'react-icons/fi';
import { hex, type BrandColor, resolveBrandHex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { Surface } from '@/components/ui';

/* ══════════════════════════════════════════
   TIPOS
══════════════════════════════════════════ */
export type FilterKey = 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED';

export const FILTERS: { key: FilterKey; labelKey: string; icon: React.ReactNode; color: BrandColor }[] = [
  { key: 'ALL',       labelKey: 'fixtures.filters.all',      icon: <FiList size={12} />,     color: 'neutral' },
  { key: 'LIVE',      labelKey: 'fixtures.filters.live',     icon: <FiActivity size={12} />, color: 'danger'  },
  { key: 'SCHEDULED', labelKey: 'fixtures.filters.pending',  icon: <FiClock size={12} />,    color: 'green'   },
  { key: 'FINISHED',  labelKey: 'fixtures.filters.finished', icon: <FiCheck size={12} />,    color: 'success' },
];

/* ══════════════════════════════════════════
   EQ BARS — decorativo
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

/* ══════════════════════════════════════════
   FILTER BAR
══════════════════════════════════════════ */
interface FixturesFilterBarProps {
  filter: FilterKey;
  counts: { total: number; live: number; scheduled: number; finished: number };
  onFilter: (key: FilterKey) => void;
  t: (key: string) => string;
}

const FixturesFilterBar = ({ filter, counts, onFilter, t }: FixturesFilterBarProps) => (
  <Surface className="mb-6 p-2" blurBg style={{ boxShadow: `0 8px 32px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}` }}>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      data-tour="calendar-filters"
      className="flex gap-1.5 overflow-x-auto">
      {FILTERS.map(({ key, labelKey, icon, color }) => {
        const isActive = filter === key;
        const count = key === 'ALL' ? counts.total : key === 'LIVE' ? counts.live : key === 'SCHEDULED' ? counts.scheduled : counts.finished;
        const glow  = alphaOf(color, 0.55);
        const textC = resolveBrandHex(color);
        return (
          <motion.button key={key} onClick={() => onFilter(key)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0 overflow-hidden"
            style={{ outline: 'none', cursor: 'pointer' }}>
            {isActive && (
              <motion.span layoutId="fixture-filter-pill" className="absolute inset-0 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${alphaOf(color, 0.22)}, ${alphaOf(color, 0.09)})`,
                         border: `1px solid ${alphaOf(color, 0.42)}`,
                         boxShadow: `0 0 22px ${alphaOf(color, 0.28)}, inset 0 1px 0 ${alphaOf(color, 0.14)}` }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }} />
            )}
            <motion.span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
              style={{
                background: isActive ? alphaOf(color, 0.14) : alpha(hex.neutral.white, 0.04),
                border: `1px solid ${isActive ? alphaOf(color, 0.38) : alpha(hex.neutral.white, 0.09)}`,
                color: isActive ? textC : alpha(hex.text.secondary, 0.55),
                transition: 'all 0.22s ease',
              }}
              animate={isActive
                ? { boxShadow: [`0 0 4px ${alphaOf(color, 0.15)}`, `0 0 14px ${glow}`, `0 0 4px ${alphaOf(color, 0.15)}`] }
                : { boxShadow: `0 0 0px ${alphaOf(color, 0)}` }}
              transition={{ duration: 2, repeat: Infinity }}>
              {icon}
            </motion.span>
            <span className="relative z-10 text-[10px] font-black tracking-[0.12em] whitespace-nowrap"
              style={{ color: isActive ? textC : alpha(hex.text.secondary, 0.65),
                       textShadow: isActive ? `0 0 12px ${glow}` : 'none', transition: 'all 0.22s' }}>
              {t(labelKey)}
            </span>
            {count > 0 && (
              <span className="relative z-10 text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                style={{ background: isActive ? alphaOf(color, 0.16) : alpha(hex.neutral.white, 0.06),
                         color: isActive ? textC : alpha(hex.text.secondary, 0.55),
                         border: `1px solid ${isActive ? alphaOf(color, 0.28) : alpha(hex.neutral.white, 0.08)}`,
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
);

export default FixturesFilterBar;
