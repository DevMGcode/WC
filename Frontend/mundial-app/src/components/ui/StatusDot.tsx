'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { alphaOf } from '@/lib/design/effects';
import { tokens, type BrandColor } from '@/lib/design/tokens';

/**
 * StatusDot — small pulsing dot used in status indicators (LIVE, CONNECTED, ...).
 *
 * Reasons it's a primitive:
 *   - The "pulsing dot" pattern appears 15+ times across the app, each with
 *     slightly different animation timings and colors. Centralizing it makes
 *     the visual language consistent.
 *   - The animation respects `prefers-reduced-motion` automatically via
 *     framer-motion's defaults.
 */

interface StatusDotProps {
  color?:   BrandColor;
  /** Pulse animation on. Off for static indicators. */
  pulse?:   boolean;
  /** Dot size in pixels. */
  size?:    number;
  className?: string;
}

export function StatusDot({
  color = 'success',
  pulse = true,
  size = 6,
  className = '',
}: StatusDotProps) {
  const colorHex = (() => {
    switch (color) {
      case 'green':   return tokens.green.bright;
      case 'gold':    return tokens.gold.base;
      case 'danger':  return tokens.status.danger;
      case 'warning': return tokens.status.warning;
      case 'success': return tokens.status.success;
      case 'info':    return tokens.status.info;
      case 'neutral': return tokens.text.muted;
    }
  })();

  return (
    <motion.span
      className={`inline-block rounded-full ${className}`}
      style={{
        width:        size,
        height:       size,
        background:   colorHex,
        boxShadow:    `0 0 6px ${alphaOf(color, 0.55)}`,
      }}
      animate={pulse ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
      transition={{ duration: 1.8, repeat: Infinity }}
      aria-hidden="true"
    />
  );
}
