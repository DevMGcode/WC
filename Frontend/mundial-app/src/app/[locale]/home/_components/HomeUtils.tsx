'use client';

/**
 * Micro-componentes y helpers compartidos del Home Dashboard.
 * Todos los colores vienen de tokens — sin rgba literals.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

/* ══════════════════════════════════════════
   CARD SURFACE HELPER
══════════════════════════════════════════ */
export const card = (border: string): React.CSSProperties => ({
  background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)} 0%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
  border: `1px solid ${border}`,
  backdropFilter: 'blur(28px)',
  boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.03)}`,
});

/* ══════════════════════════════════════════
   ICON BOX
══════════════════════════════════════════ */
export const IconBox = ({
  icon, color, size = 'md',
}: { icon: React.ReactNode; color: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = { sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' }[size];
  const px  = { sm: 14, md: 18, lg: 24 }[size];
  const rnd = { sm: 'rounded-xl', md: 'rounded-2xl', lg: 'rounded-2xl' }[size];
  return (
    <div className={`relative shrink-0 ${dim} ${rnd} flex items-center justify-center overflow-hidden`}
      style={{
        background: `linear-gradient(145deg, ${color}1a 0%, ${alpha(hex.neutral.black, 0.60)} 100%)`,
        border: `1px solid ${color}35`,
        boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.07)}, 0 4px 16px ${alpha(hex.neutral.black, 0.40)}`,
      }}>
      <div className={`absolute inset-x-0 top-0 h-px ${rnd}`}
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
      <span style={{ color, fontSize: px, filter: `drop-shadow(0 0 6px ${color}90)` }}>{icon}</span>
    </div>
  );
};

/* ══════════════════════════════════════════
   RING — círculo de progreso SVG animado
══════════════════════════════════════════ */
export const Ring = ({
  value, max = 100, size = 72, stroke = 6, color, trail,
}: { value: number; max?: number; size?: number; stroke?: number; color: string; trail?: string }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - Math.min(1, value / Math.max(max, 1)));
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ overflow: 'visible' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={trail ?? alpha(hex.neutral.white, 0.05)} strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}44)` }}
      />
    </svg>
  );
};

/* ══════════════════════════════════════════
   GLOW BAR — barra de progreso con brillo
══════════════════════════════════════════ */
export const GlowBar = ({ value, max = 100, color, height = 3 }: {
  value: number; max?: number; color: string; height?: number;
}) => (
  <div className="relative w-full rounded-full overflow-hidden"
    style={{ height, background: alpha(hex.neutral.white, 0.05) }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 8px ${color}55` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.3, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

/* ══════════════════════════════════════════
   KPI CHIP
══════════════════════════════════════════ */
export const KPIChip = ({
  icon, value, label, color, glow, bg, delay,
}: {
  icon: React.ReactNode; value: string | number; label: string;
  color: string; glow: string; bg: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -14, scale: 0.93 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.03 }}
    className="relative overflow-hidden rounded-2xl cursor-default"
    style={{
      background: `linear-gradient(145deg, ${bg} 0%, ${alpha(hex.bg.primary, 0.97)} 100%)`,
      border: `1px solid ${color}28`,
      boxShadow: `0 8px 30px ${alpha(hex.neutral.black, 0.45)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.02)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${color}cc, transparent)` }} />
    <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${glow}28 0%, transparent 70%)`, filter: 'blur(12px)' }} />
    <div className="relative z-10 p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[8px] font-black tracking-[0.30em] uppercase" style={{ color: `${color}65` }}>{label}</p>
        <IconBox icon={icon} color={color} size="sm" />
      </div>
      <p className="text-[2.2rem] font-black tabular-nums leading-none"
        style={{ color, textShadow: `0 0 24px ${glow}55`, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════
   FLAG
══════════════════════════════════════════ */
export const Flag = ({ url, name, size = 'md', glow }: {
  url: string; name: string; size?: 'sm' | 'md' | 'lg'; glow?: string;
}) => {
  const sz = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-[72px] h-[72px]' }[size];
  return (
    <div className="relative shrink-0">
      {glow && <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: glow, filter: 'blur(14px)', transform: 'scale(1.45)', opacity: 0.6 }} />}
      <div className={`relative ${sz} rounded-full border-2 overflow-hidden`}
        style={{ borderColor: alpha(hex.neutral.white, 0.12), background: hex.bg.elevated,
                 boxShadow: `0 4px 16px ${alpha(hex.neutral.black, 0.55)}` }}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PITCH MINI — decorativo SVG cancha
══════════════════════════════════════════ */
export const PitchMini = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 32" width={64} height={32} style={{ opacity: 0.28 }}>
    <rect x="1" y="1" width="62" height="30" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
    <line x1="32" y1="1" x2="32" y2="31" stroke={color} strokeWidth="0.9" />
    <circle cx="32" cy="16" r="6.5" fill="none" stroke={color} strokeWidth="0.9" />
    <circle cx="32" cy="16" r="1" fill={color} />
    <rect x="1" y="9" width="11" height="14" rx="1.5" fill="none" stroke={color} strokeWidth="0.8" />
    <rect x="52" y="9" width="11" height="14" rx="1.5" fill="none" stroke={color} strokeWidth="0.8" />
    <rect x="1" y="13" width="5" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.6" />
    <rect x="58" y="13" width="5" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.6" />
  </svg>
);

/* ══════════════════════════════════════════
   FORM STRIP — historial de forma reciente
══════════════════════════════════════════ */
export const FormStrip = ({ results, predictions }: {
  results: any[]; predictions: Record<number, any>;
}) => {
  const dots = results.slice(0, 5).map(f => {
    const pred = predictions[f.id];
    if (!pred) return null;
    const { predictedHomeScore: ph, predictedAwayScore: pa } = pred;
    const { homeScore: rh, awayScore: ra } = f;
    if (ph === rh && pa === ra) return { type: 'E', color: hex.green.hover, bg: alphaOf('success', 0.13), label: 'Exacta' };
    if (Math.sign(ph - pa) === Math.sign(rh - ra)) return { type: 'W', color: hex.green.bright, bg: alphaOf('green', 0.09), label: 'Correcto' };
    return { type: 'L', color: hex.status.danger, bg: alphaOf('danger', 0.14), label: 'Fallado' };
  }).filter(Boolean);

  if (!dots.length) return null;

  return (
    <div className="flex items-center gap-2 mt-4 pt-3"
      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
      <span className="text-[7.5px] font-black tracking-[0.24em] uppercase"
        style={{ color: alpha(hex.neutral.white, 0.22) }}>FORMA</span>
      <div className="flex items-center gap-1.5">
        {dots.map((d, i) => (
          <div key={i}
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-black"
            style={{ background: d!.bg, border: `1px solid ${d!.color}45`, color: d!.color }}
            title={d!.label}>
            {d!.type}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════ */
export const SectionHeader = ({
  label, accent = hex.green.bright, right,
}: { label: string; accent?: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}55)` }} />
      <span className="text-[10px] font-black tracking-[0.26em] uppercase text-orionix-text-muted">{label}</span>
    </div>
    {right}
  </div>
);

/* ══════════════════════════════════════════
   GET PRED RESULT — helper de resultado de predicción
   Returns null si no hay predicción/partido
══════════════════════════════════════════ */
export const getPredResult = (fixture: any, prediction: any, t: (k: string) => string) => {
  if (!prediction || !fixture) return null;
  const { predictedHomeScore: ph, predictedAwayScore: pa } = prediction;
  const { homeScore: rh, awayScore: ra } = fixture;
  if (ph === rh && pa === ra)
    return { label: t('home.result.exactScore'), pts: '+3 pts', color: hex.green.hover, glow: hex.green.hover, border: alphaOf('success', 0.28) };
  if (Math.sign(ph - pa) === Math.sign(rh - ra))
    return { label: t('home.result.correct'), pts: '+1 pt', color: hex.green.bright, glow: hex.green.muted, border: alphaOf('green', 0.25) };
  return { label: t('home.result.wrong'), pts: '0 pts', color: hex.status.danger, glow: '#ef4444', border: alphaOf('danger', 0.28) };
};
