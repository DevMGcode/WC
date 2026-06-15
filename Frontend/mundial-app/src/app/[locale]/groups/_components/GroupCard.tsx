'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import type { Group } from './types';

/* ══════════════════════════════════════════
   EQ BARS — decorativo (exportado para uso en GroupsClient)
══════════════════════════════════════════ */
export const EQBars = ({ color, count = 6, maxH = 12 }: { color: string; count?: number; maxH?: number }) => {
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
   QUALIFY CONFIG — top 2 posiciones del grupo
══════════════════════════════════════════ */
const QUALIFY_CFG: { brand: BrandColor; text: string }[] = [
  { brand: 'green',   text: hex.green.bright },
  { brand: 'success', text: hex.green.hover  },
];

/* ══════════════════════════════════════════
   GLOW BAR — barra de puntos proporcional
══════════════════════════════════════════ */
const GlowBar = ({ value, max = 9, color }: { value: number; max?: number; color: string }) => (
  <div className="relative h-[3px] rounded-full overflow-hidden w-full"
    style={{ background: alpha(hex.neutral.white, 0.05) }}>
    <motion.div className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 6px ${color}` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
  </div>
);

/* ══════════════════════════════════════════
   GROUP CARD
══════════════════════════════════════════ */
interface GroupCardProps {
  group: Group;
  index: number;
  t: (key: string) => string;
}

const GroupCard = ({ group, index, t }: GroupCardProps) => {
  const maxPts = Math.max(...group.standings.map(s => s.points), 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.97)})`,
        border: `1px solid ${alphaOf('green', 0.12)}`,
        backdropFilter: 'blur(28px)',
        boxShadow: `0 20px 56px ${alpha(hex.neutral.black, 0.60)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.01)}`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: gradients.divider('green', 0.55) }} />
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: gradients.cornerGlow('green', 0.08), filter: 'blur(20px)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: borders.divider(),
                 background: `linear-gradient(90deg, ${alphaOf('green', 0.06)}, ${alphaOf('success', 0.03)}, transparent)` }}>
        <div className="flex items-center gap-2.5">
          <motion.div className="w-1.5 h-6 rounded-full"
            style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.hover})` }}
            animate={{ boxShadow: [`0 0 6px ${alphaOf('green', 0.4)}`, `0 0 14px ${alphaOf('green', 0.8)}`, `0 0 6px ${alphaOf('green', 0.4)}`] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
          <h3 className="text-sm font-black text-white tracking-[0.22em] uppercase">{group.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <EQBars color={alphaOf('green', 0.40)} count={5} maxH={10} />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: alphaOf('green', 0.08), border: borders.brand('green', 0.18) }}>
            <span className="text-[7px] font-black text-green-400 tracking-[0.2em] uppercase">{group.standings.length} {t('groups.teams')}</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid px-4 py-2"
        style={{ gridTemplateColumns: '28px 1fr 28px 28px 28px 28px 32px 36px',
                 borderBottom: `1px solid ${alpha(hex.neutral.white, 0.04)}` }}>
        {['#', t('groups.team'), t('groups.played'), t('groups.won'), t('groups.drawn'), t('groups.lost'), t('groups.goals'), t('groups.points')].map((h, hi) => {
          const colColor = hi === 3 ? hex.green.hover
                        : hi === 4 ? hex.gold.muted
                        : hi === 5 ? hex.status.danger
                        : hi === 7 ? hex.green.bright
                        : hex.text.muted;
          return (
            <span key={hi} className={`text-[8px] font-black tracking-[0.22em] uppercase${hi !== 0 && hi !== 1 ? ' text-center' : ''}`}
              style={{ color: colColor }}>{h}</span>
          );
        })}
      </div>

      {/* Rows */}
      {group.standings.map((s, idx) => {
        const q = idx < 2 ? QUALIFY_CFG[idx] : null;
        return (
          <motion.div key={`standing-${s.team.id}-${idx}`}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 + idx * 0.05 + 0.2 }}
            style={{
              background: q ? alphaOf(q.brand, 0.05) : 'transparent',
              borderBottom: idx < group.standings.length - 1 ? `1px solid ${alpha(hex.neutral.white, 0.03)}` : 'none',
              borderLeft: q ? `2px solid ${alphaOf(q.brand, 0.21)}` : '2px solid transparent',
            }}
          >
            <div className="grid items-center px-4 py-3"
              style={{ gridTemplateColumns: '28px 1fr 28px 28px 28px 28px 32px 36px' }}>
              {/* Position */}
              <div className="flex items-center">
                {q ? (
                  <motion.div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                    style={{ background: alphaOf(q.brand, 0.13), border: `1px solid ${alphaOf(q.brand, 0.25)}`, color: q.text }}
                    animate={{ boxShadow: [`0 0 4px ${alphaOf(q.brand, 0.12)}`, `0 0 10px ${alphaOf(q.brand, 0.31)}`, `0 0 4px ${alphaOf(q.brand, 0.12)}`] }}
                    transition={{ duration: 2.8 + idx * 0.3, repeat: Infinity }}>
                    {s.position}
                  </motion.div>
                ) : (
                  <span className="text-[9px] font-bold text-orionix-text-muted">{s.position}</span>
                )}
              </div>
              {/* Team */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="relative shrink-0 w-5 h-5">
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: q ? alphaOf(q.brand, 0.55) : alpha(hex.neutral.white, 0.10),
                             filter: 'blur(4px)', opacity: q ? 0.4 : 0.1 }} />
                  <div className="relative w-5 h-5 rounded-full overflow-hidden shadow-lg"
                    style={{ border: `1px solid ${alpha(hex.neutral.white, 0.12)}` }}>
                    {s.team.flagUrl && <Image src={s.team.flagUrl} alt={s.team.name} fill sizes="20px" className="object-cover" unoptimized />}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black truncate leading-none"
                    style={{ color: q ? q.text : alpha(hex.text.secondary, 0.80) }}>{s.team.shortName}</span>
                  <span className="text-[8px] truncate hidden sm:block text-orionix-text-muted">{s.team.name}</span>
                </div>
              </div>
              {/* Stats */}
              <span className="text-[10px] text-center tabular-nums text-orionix-text-muted">{s.played}</span>
              <span className="text-[10px] font-bold text-center tabular-nums text-orionix-green-bright">{s.won}</span>
              <span className="text-[10px] font-bold text-center tabular-nums text-orionix-gold-muted">{s.drawn}</span>
              <span className="text-[10px] font-bold text-center tabular-nums" style={{ color: hex.status.danger }}>{s.lost}</span>
              <span className="text-[10px] text-center tabular-nums text-orionix-text-muted">{s.goalDiff > 0 ? '+' : ''}{s.goalDiff}</span>
              {/* Points */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-black tabular-nums text-center"
                  style={{ color: q ? q.text : alpha(hex.neutral.white, 0.65),
                           textShadow: q ? `0 0 10px ${alphaOf(q.brand, 0.55)}` : 'none' }}>
                  {s.points}
                </span>
                <div className="w-full px-0.5">
                  <GlowBar value={s.points} max={maxPts} color={q?.text ?? alpha(hex.text.muted, 0.6)} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.04)}`, background: alpha(hex.neutral.black, 0.18) }}>
        <motion.div className="w-3 h-3 rounded-sm"
          style={{ background: alphaOf('green', 0.15), border: borders.brand('green', 0.30) }}
          animate={{ boxShadow: [`0 0 3px ${alphaOf('green', 0.20)}`, `0 0 8px ${alphaOf('green', 0.50)}`, `0 0 3px ${alphaOf('green', 0.20)}`] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <span className="text-[8px] font-medium tracking-wide text-orionix-text-muted">{t('groups.qualify')}</span>
        <div className="flex-1" />
        <FiShield size={9} style={{ color: alphaOf('green', 0.25) }} />
      </div>
    </motion.div>
  );
};

export default React.memo(GroupCard);
