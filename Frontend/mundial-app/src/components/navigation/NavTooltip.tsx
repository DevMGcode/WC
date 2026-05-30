'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

/* ActiveOrb — más visible con mayor intensidad */
export const ActiveOrb = ({ color }: { color: string }) => (
  <div
    className="absolute inset-0 pointer-events-none rounded-xl"
    style={{ background: `radial-gradient(ellipse at 22% 50%, ${color} 0%, transparent 65%)`, opacity: 0.95 }}
  />
);

/* NavTooltip — más elegante, label 14px para miopía */
export const NavTooltip = ({ label, accentHex, glowRgba }: { label: string; accentHex: string; glowRgba: string }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: '100%', top: '50%', marginLeft: 16, transform: 'translateY(-50%)', zIndex: 9999, whiteSpace: 'nowrap' }}
    initial={{ opacity: 0, x: -10, scale: 0.90 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -6, scale: 0.94 }}
    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
  >
    <div
      className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${alpha(hex.bg.elevated, 0.99)}, ${alpha(hex.bg.secondary, 0.99)})`,
        border: `1px solid ${accentHex}40`,
        boxShadow: `0 12px 36px ${alpha(hex.neutral.black, 0.70)}, 0 0 20px ${glowRgba}18`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Arrow pointer */}
      <div className="absolute" style={{
        right: '100%', top: '50%', transform: 'translateY(-50%)',
        width: 0, height: 0,
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        borderRight: `5px solid ${accentHex}40`,
      }} />
      {/* Accent dot */}
      <div className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: accentHex, boxShadow: `0 0 6px ${glowRgba}` }} />
      {/* Label tooltip: text-sm = 14px */}
      <span className="text-sm font-bold" style={{ color: accentHex, textShadow: `0 0 14px ${glowRgba}` }}>
        {label}
      </span>
    </div>
  </motion.div>
);
