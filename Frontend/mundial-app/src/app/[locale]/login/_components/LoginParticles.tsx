'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

export const Ember = ({ index }: { index: number }) => {
  const xBase  = ((index * 29) % 90) - 45;
  const size   = 1.5 + (index % 3);
  const delay  = (index * 0.2) % 3;
  const dur    = 1.3 + (index % 1.6);
  const colors = [
    alpha(hex.gold.base, 1),
    alpha(hex.accent.orange, 0.95),
    alpha(hex.accent.yellow, 0.90),
    alpha(hex.accent.red, 0.85),
    alpha(hex.accent.orange, 0.95),
  ];
  const c = colors[index % colors.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, bottom: '28%', left: `calc(50% + ${xBase}px)`, background: c, boxShadow: `0 0 ${size * 4}px ${c}`, zIndex: 8 }}
      animate={{ y: [0, -(75 + (index % 65))], x: [0, Math.sin(index * 1.9) * 20], opacity: [0, 1, 0.7, 0], scale: [0.3, 1.4, 0.5, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

export const FireRing = ({ delay, size, color }: { delay: number; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, top: '50%', left: '50%', marginTop: -size / 2, marginLeft: -size / 2, border: `1.5px solid ${color}`, boxShadow: `0 0 12px ${color}` }}
    initial={{ scale: 0.3, opacity: 1 }}
    animate={{ scale: 2.6, opacity: 0 }}
    transition={{ duration: 1.6, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 4 }}
  />
);

export const Particle = ({ index }: { index: number }) => {
  const x        = (index * 137.508) % 100;
  const size     = 1.2 + (index % 2);
  const delay    = (index * 0.28) % 6;
  const duration = 9 + (index % 6);
  const cols: [string, string][] = [
    [alphaOf('green', 0.70),        `0 0 8px ${alphaOf('green', 0.80)}`],
    [alpha(hex.green.hover, 0.65),  `0 0 8px ${alpha(hex.green.hover, 0.80)}`],
    [alpha(hex.green.base, 0.60),   `0 0 7px ${alpha(hex.green.base, 0.70)}`],
    [alpha(hex.gold.base, 0.55),    `0 0 7px ${alpha(hex.gold.base, 0.70)}`],
    [alpha(hex.green.hover, 0.55),  `0 0 6px ${alpha(hex.green.hover, 0.70)}`],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -6, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(380 + (index % 180))], x: [0, Math.sin(index * 1.3) * 40], opacity: [0, 0.85, 0.6, 0], scale: [0.5, 1.2, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

export const CountBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="relative flex items-center justify-center rounded-xl"
      style={{ width: 58, height: 46, background: alphaOf('green', 0.06), border: `1px solid ${alphaOf('green', 0.18)}` }}>
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ boxShadow: [`0 0 8px ${alphaOf('green', 0.06)}`, `0 0 20px ${alphaOf('green', 0.16)}`, `0 0 8px ${alphaOf('green', 0.06)}`] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-lg font-black tabular-nums"
        style={{ color: hex.green.bright, textShadow: `0 0 18px ${alphaOf('green', 0.9)}, 0 0 40px ${alphaOf('green', 0.4)}` }}>
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-[8px] font-bold tracking-[0.22em]" style={{ color: alphaOf('green', 0.32) }}>{label}</span>
  </div>
);
