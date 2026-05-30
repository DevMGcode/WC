'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';

export const EQBars = ({ color, count = 9, maxH = 20 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        const h3 = (seq[(i + 2) % seq.length] / 20) * maxH;
        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 2.5, background: color, boxShadow: `0 0 4px ${color}` }}
            animate={{ height: [h1, h2, h3, h2, h1] }}
            transition={{ duration: 1.3 + i * 0.11, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }}
          />
        );
      })}
    </div>
  );
};

export const Ring = ({
  value, max = 100, size = 68, stroke = 5, color,
  trail = alpha(hex.neutral.white, 0.05),
}: { value: number; max?: number; size?: number; stroke?: number; color: string; trail?: string }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(1, value / Math.max(max, 1));
  const off  = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trail} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}55)` }}
      />
    </svg>
  );
};

export const GlowBar = ({ value, max = 100, color, height = 4 }: { value: number; max?: number; color: string; height?: number }) => {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, background: alpha(hex.neutral.white, 0.05) }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}80` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.18)}, transparent)` }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
    </div>
  );
};

export const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1 + (index % 2);
  const delay = (index * 0.28) % 7;
  const duration = 9 + (index % 7);
  const cols: [string, string][] = [
    [alphaOf('green', 0.60),           `0 0 8px ${alphaOf('green', 0.75)}`],
    [alpha(hex.green.hover, 0.50),     `0 0 7px ${alpha(hex.green.hover, 0.65)}`],
    [alpha(hex.gold.base, 0.45),       `0 0 7px ${alpha(hex.gold.base, 0.60)}`],
    [alpha(hex.green.soft, 0.55),      `0 0 7px ${alpha(hex.green.soft, 0.65)}`],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -4, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(420 + (index % 200))], x: [0, Math.sin(index * 1.4) * 38], opacity: [0, 0.85, 0.5, 0], scale: [0.4, 1.3, 0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

export const SectionLabel = ({ children, color = hex.green.bright }: { children: React.ReactNode; color?: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-[3px] h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }} />
    <span className="text-[10px] font-black tracking-[0.24em] uppercase" style={{ color: hex.text.secondary }}>{children}</span>
  </div>
);

export const DarkInput = ({
  id, label, type = 'text', value, onChange, placeholder, icon, autoComplete,
  showToggle, show, onToggle, focusColor = alphaOf('green', 0.55),
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon: React.ReactNode; autoComplete?: string;
  showToggle?: boolean; show?: boolean; onToggle?: () => void;
  focusColor?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const inputType = showToggle ? (show ? 'text' : 'password') : type;
  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: alpha(hex.accent.slate, 0.7) }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: focused ? focusColor : alpha(hex.accent.slateDeep, 0.7), transition: 'color 200ms' }}>
          {icon}
        </span>
        <input
          id={id} type={inputType} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all text-orionix-text-secondary"
          style={{
            background: alpha(hex.neutral.white, 0.04),
            border: `1px solid ${focused ? focusColor : alpha(hex.neutral.white, 0.08)}`,
            boxShadow: focused ? `0 0 0 3px ${focusColor}20` : 'none',
            outline: 'none',
          }}
        />
        {showToggle && onToggle && (
          <button type="button" tabIndex={-1} onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
            style={{ color: alpha(hex.accent.slate, 0.8) }}>
            {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Toggle = ({ checked, onChange, color = hex.green.bright }: {
  checked: boolean; onChange: (v: boolean) => void; color?: string;
}) => (
  <motion.button
    type="button" role="switch" aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="relative shrink-0 w-11 h-6 rounded-full cursor-pointer"
    style={{
      background: checked ? `linear-gradient(90deg, ${color}90, ${color})` : alpha(hex.neutral.white, 0.07),
      border: `1px solid ${checked ? color + '55' : alpha(hex.neutral.white, 0.10)}`,
      boxShadow: checked ? `0 0 12px ${color}40` : 'none',
      transition: 'background 250ms, border-color 250ms, box-shadow 250ms',
    }}
    whileTap={{ scale: 0.94 }}
  >
    <motion.div
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
      animate={{ x: checked ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    />
  </motion.button>
);

export const DarkModal = ({ children, onClose, width = 'w-[min(420px,90vw)]' }: {
  children: React.ReactNode; onClose: () => void; width?: string;
}) => (
  <>
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    <motion.div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${width}`}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={{
        background: surfaces.card(),
        border: `1px solid ${alphaOf('green', 0.22)}`,
        borderRadius: '1.25rem',
        boxShadow: `0 32px 80px ${alpha(hex.neutral.black, 0.70)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.03)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px rounded-t-[1.25rem]"
        style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.60)}, transparent)` }} />
      {children}
    </motion.div>
  </>
);

export const ModalAlert = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-4"
    style={
      type === 'error'
        ? { background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.22)}` }
        : { background: alpha(hex.green.hover, 0.10), border: `1px solid ${alpha(hex.green.hover, 0.22)}` }
    }
  >
    {type === 'error'
      ? <FiAlertTriangle size={13} style={{ color: hex.accent.redSoft, flexShrink: 0 }} />
      : <FiCheck size={13} style={{ color: hex.green.hover, flexShrink: 0 }} />
    }
    <p className="text-xs font-medium" style={{ color: type === 'error' ? hex.accent.redSubtle : hex.accent.emeraldSoft }}>
      {message}
    </p>
  </motion.div>
);
