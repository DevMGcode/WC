'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';

/* ── Animated counter ─────────────────────────────────────────────────────── */
export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 900;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

/* ── Shared styles ────────────────────────────────────────────────────────── */
export const SCHED_SELECT: React.CSSProperties = {
  background: alpha(hex.bg.primary, 0.95),
  border: borders.brand('green', 0.18),
  color: hex.text.primary,
  borderRadius: 10,
  padding: '9px 11px',
  width: '100%',
  fontSize: 12,
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
};

export const STATUS_CFG_SCHED: Record<string, {
  label: string; color: string; bg: string; border: string; dot: string;
  cardBg: string; cardBorder: string; line: string;
}> = {
  SCHEDULED: {
    label: 'Programado', color: hex.gold.base,
    bg: alphaOf('gold', 0.1), border: alpha(hex.gold.base, 0.28), dot: 'bg-amber-400 animate-pulse',
    cardBg: 'linear-gradient(145deg,rgba(20,14,6,0.96),rgba(28,18,6,0.92))',
    cardBorder: alpha(hex.gold.base, 0.28), line: `${hex.gold.base}55`,
  },
  LIVE: {
    label: 'En Vivo', color: hex.status.danger,
    bg: alphaOf('danger', 0.1), border: 'rgba(248,113,113,0.32)', dot: 'bg-red-400 animate-pulse',
    cardBg: 'linear-gradient(145deg,rgba(24,6,6,0.96),rgba(34,8,8,0.92))',
    cardBorder: 'rgba(248,113,113,0.35)', line: '#f8717155',
  },
  FINISHED: {
    label: 'Finalizado', color: hex.green.soft,
    bg: alpha(hex.green.soft, 0.1), border: alpha(hex.green.soft, 0.22), dot: 'bg-green-400',
    cardBg: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.96)}, ${alpha(hex.bg.secondary, 0.92)})`,
    cardBorder: alpha(hex.green.soft, 0.20), line: `${hex.green.soft}55`,
  },
  POSTPONED: {
    label: 'Pospuesto', color: hex.text.secondary,
    bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', dot: 'bg-slate-400',
    cardBg: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.96)}, ${alpha(hex.bg.secondary, 0.92)})`,
    cardBorder: 'rgba(148,163,184,0.18)', line: '#94a3b833',
  },
};

/* ── Status pill ──────────────────────────────────────────────────────────── */
export function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG_SCHED[status] ?? STATUS_CFG_SCHED.POSTPONED;
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'var(--font-display)' }}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label.toUpperCase()}
    </div>
  );
}

/* ── Flag image ───────────────────────────────────────────────────────────── */
export function FlagBig({ url, name }: { url?: string; name: string }) {
  if (!url) return (
    <div className="w-9 h-6 rounded-md flex items-center justify-center text-sm shrink-0"
      style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
      🏳
    </div>
  );
  return (
    <img src={url} alt={name} className="w-9 h-6 rounded-md object-cover shrink-0"
      style={{ border: `1px solid ${alpha(hex.neutral.white, 0.1)}` }}
      onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  );
}

/* ── datetime-local converter ─────────────────────────────────────────────── */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
