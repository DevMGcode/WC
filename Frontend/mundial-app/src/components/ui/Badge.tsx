'use client';

import React, { ReactNode } from 'react';
import { alphaOf } from '@/lib/design/effects';
import { tokens, type BrandColor } from '@/lib/design/tokens';

/**
 * Badge — small tag/pill primitive.
 *
 * Replaces dozens of variants of:
 *   <span className="text-[9px] font-black px-2.5 py-1 rounded-full ..."
 *         style={{ color: '#4CAF50', background: 'rgba(76,175,80,0.12)',
 *                  border: '1px solid rgba(76,175,80,0.28)' }}>
 *     LIVE
 *   </span>
 *
 * With:
 *   <Badge color="success">LIVE</Badge>
 *
 * The `color` prop drives all three (text, bg, border) via the design tokens,
 * so re-theming is one variable change.
 */

type Size = 'xs' | 'sm' | 'md';

export interface BadgeProps {
  color?:    BrandColor;
  size?:     Size;
  outlined?: boolean;
  className?: string;
  children:  ReactNode;
}

export function Badge({
  color = 'green',
  size = 'sm',
  outlined = false,
  className = '',
  children,
}: BadgeProps) {
  const sizing = (() => {
    switch (size) {
      case 'xs': return 'text-[9px]  px-2   py-0.5 tracking-widest';
      case 'md': return 'text-[11px] px-3   py-1.5 tracking-wider';
      case 'sm':
      default:   return 'text-[10px] px-2.5 py-1   tracking-widest';
    }
  })();

  // Color resolution — uses design tokens consistently
  const textColor = (() => {
    switch (color) {
      case 'green':   return tokens.green.bright;
      case 'gold':    return tokens.gold.base;
      case 'danger':  return tokens.status.danger;
      case 'warning': return tokens.status.warning;
      case 'success': return tokens.status.success;
      case 'info':    return tokens.status.info;
      case 'neutral': return tokens.text.secondary;
    }
  })();

  return (
    <span
      className={`inline-flex items-center gap-1 font-black uppercase rounded-full ${sizing} ${className}`}
      style={{
        color:      textColor,
        background: outlined ? 'transparent' : alphaOf(color, 0.12),
        border:     `1px solid ${alphaOf(color, outlined ? 0.45 : 0.28)}`,
      }}
    >
      {children}
    </span>
  );
}
