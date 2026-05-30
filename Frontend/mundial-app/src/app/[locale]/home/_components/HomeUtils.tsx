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
   — fondo más diferenciado del bg general
   para separar visualmente cada sección
══════════════════════════════════════════ */
export const card = (border: string): React.CSSProperties => ({
  background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
  border: `1px solid ${border}`,
  backdropFilter: 'blur(28px)',
  boxShadow: `0 28px 72px ${alpha(hex.neutral.black, 0.70)}, 0 4px 12px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.07)}`,
});

/* ══════════════════════════════════════════
   ICON BOX
══════════════════════════════════════════ */
export const IconBox = ({
  icon, color, size = 'md',
}: { icon: React.ReactNode; color: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = { sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' }[size];
  const px  = { sm: 16, md: 20, lg: 26 }[size];
  const rnd = { sm: 'rounded-xl', md: 'rounded-2xl', lg: 'rounded-2xl' }[size];
  return (
    <div className={`relative shrink-0 ${dim} ${rnd} flex items-center justify-center overflow-hidden`}
      style={{
        background: `linear-gradient(145deg, ${color}22 0%, ${alpha(hex.neutral.black, 0.65)} 100%)`,
        border: `1px solid ${color}45`,
        boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.10)}, 0 4px 16px ${alpha(hex.neutral.black, 0.45)}, 0 0 24px ${color}18`,
      }}>
      <div className={`absolute inset-x-0 top-0 h-px ${rnd}`}
        style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }} />
      <span style={{ color, fontSize: px, filter: `drop-shadow(0 0 9px ${color}aa)` }}>{icon}</span>
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
        stroke={trail ?? alpha(hex.neutral.white, 0.08)} strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}55)` }}
      />
    </svg>
  );
};

/* ══════════════════════════════════════════
   GLOW BAR — barra de progreso con brillo
══════════════════════════════════════════ */
export const GlowBar = ({ value, max = 100, color, height = 5 }: {
  value: number; max?: number; color: string; height?: number;
}) => (
  <div className="relative w-full rounded-full overflow-hidden"
    style={{ height, background: alpha(hex.neutral.white, 0.08) }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 10px ${color}66` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.3, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

/* ══════════════════════════════════════════
   KPI CHIP — más aire, número prominente,
   label con contraste real (miopía-safe)
══════════════════════════════════════════ */
export const KPIChip = ({
  icon, value, label, color, glow, bg, delay,
}: {
  icon: React.ReactNode; value: string | number; label: string;
  color: string; glow: string; bg: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -16, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.2 } }}
    className="relative overflow-hidden rounded-2xl cursor-default"
    style={{
      background: `linear-gradient(160deg, ${bg} 0%, ${alpha(hex.bg.soft, 0.90)} 40%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
      border: `1px solid ${color}38`,
      boxShadow: `0 10px 38px ${alpha(hex.neutral.black, 0.55)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.03)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.07)}`,
    }}
  >
    {/* Top glow line */}
    <div className="absolute inset-x-0 top-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${color}ee, transparent)` }} />

    {/* Corner orb */}
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${glow}38 0%, transparent 70%)`, filter: 'blur(16px)' }} />

    {/* Bottom shine */}
    <div className="absolute inset-x-0 bottom-0 h-[1px]"
      style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.06)}, transparent)` }} />

    <div className="relative z-10 p-5 pb-6">
      {/* Header row: label + icon */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* label miopía-safe: 13px, contraste real — decorativo uppercase */}
          <p className="text-[13px] font-black tracking-[0.16em] uppercase leading-none mb-1.5"
            style={{ color: `${color}dd` }}>
            {label}
          </p>
          <div className="w-6 h-[2px] rounded-full" style={{ background: `${color}55` }} />
        </div>
        <IconBox icon={icon} color={color} size="sm" />
      </div>

      {/* Big number */}
      <p className="font-black tabular-nums leading-none"
        style={{
          fontSize: 'clamp(2.1rem, 4.5vw, 2.7rem)',
          color,
          textShadow: `0 0 36px ${glow}77, 0 2px 4px ${alpha(hex.neutral.black, 0.55)}`,
          fontVariantNumeric: 'tabular-nums',
        }}>
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
  const borderSize = { sm: 'border-2', md: 'border-2', lg: 'border-[3px]' }[size];
  return (
    <div className="relative shrink-0">
      {glow && (
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: glow, filter: 'blur(16px)', transform: 'scale(1.55)', opacity: 0.55 }} />
      )}
      <div className={`relative ${sz} rounded-full ${borderSize} overflow-hidden`}
        style={{
          borderColor: alpha(hex.neutral.white, 0.22),
          background: hex.bg.elevated,
          boxShadow: `0 4px 18px ${alpha(hex.neutral.black, 0.60)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.06)}`,
        }}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PITCH MINI — decorativo SVG cancha
══════════════════════════════════════════ */
export const PitchMini = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 32" width={64} height={32} style={{ opacity: 0.30 }}>
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
   Dots más grandes y label más legible
══════════════════════════════════════════ */
export const FormStrip = ({ results, predictions }: {
  results: any[]; predictions: Record<number, any>;
}) => {
  const dots = results.slice(0, 5).map(f => {
    const pred = predictions[f.id];
    if (!pred) return null;
    const { predictedHomeScore: ph, predictedAwayScore: pa } = pred;
    const { homeScore: rh, awayScore: ra } = f;
    if (ph === rh && pa === ra) return { type: 'E', color: hex.green.hover, bg: alphaOf('success', 0.15), label: 'Exacta' };
    if (Math.sign(ph - pa) === Math.sign(rh - ra)) return { type: 'W', color: hex.green.bright, bg: alphaOf('green', 0.11), label: 'Correcto' };
    return { type: 'L', color: hex.status.danger, bg: alphaOf('danger', 0.16), label: 'Fallado' };
  }).filter(Boolean);

  if (!dots.length) return null;

  return (
    <div className="flex items-center gap-2.5 mt-4 pt-3.5"
      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
      {/* "FORMA" — 12px mínimo para texto secundario de apoyo */}
      <span className="text-[12px] font-black tracking-[0.16em] uppercase"
        style={{ color: alpha(hex.neutral.white, 0.50) }}>FORMA</span>
      <div className="flex items-center gap-1.5">
        {dots.map((d, i) => (
          <div key={i}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-black"
            style={{ background: d!.bg, border: `1px solid ${d!.color}55`, color: d!.color, boxShadow: `0 0 8px ${d!.color}35` }}
            title={d!.label}>
            {d!.type}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION HEADER — label más grande,
   barra más prominente, mejor contraste
══════════════════════════════════════════ */
export const SectionHeader = ({
  label, accent = hex.green.bright, right,
}: { label: string; accent?: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      {/* Barra lateral con glow más visible */}
      <div className="relative w-1 h-7 rounded-full overflow-hidden shrink-0">
        <div className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}60)` }} />
        <div className="absolute inset-0 rounded-full"
          style={{ background: accent, filter: `blur(2px)`, opacity: 0.7 }} />
      </div>
      {/* label miopía-safe: text-sm = 14px */}
      <span className="text-sm font-black tracking-[0.14em] uppercase"
        style={{ color: alpha(hex.neutral.white, 0.90) }}>
        {label}
      </span>
    </div>
    {right}
  </div>
);

/* ══════════════════════════════════════════
   GET PRED RESULT — helper resultado predicción
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
