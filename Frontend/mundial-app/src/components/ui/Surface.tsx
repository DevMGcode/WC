'use client';

import React, { CSSProperties, ReactNode } from 'react';
import { surfaces, borders, shadows } from '@/lib/design/effects';

/**
 * Surface — the base "card" primitive of the design system.
 *
 * Wraps the most repeated visual pattern in the app: a dark gradient
 * background, a subtle border, soft shadow. Replaces ~200+ inline
 * `style={{ background: 'linear-gradient(...)' }}` blocks.
 *
 * Variants:
 *   - card    (default): the standard content card
 *   - panel   : a slightly stronger surface, for modals/sidebars
 *   - glass   : translucent, for floating overlays on top of other content
 *   - premium : card + subtle gold corner accent
 *
 * Why this file is small but central: every page in the app should compose
 * its content INSIDE Surfaces, so when the design language shifts (e.g. the
 * card gradient gets a hue adjustment), the change happens here only.
 */

type Variant = 'card' | 'panel' | 'glass' | 'premium';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:    Variant;
  /** Disable the default shadow (useful when nesting Surfaces). */
  flat?:       boolean;
  /** Custom border override — pass a string from `borders.*` or your own. */
  border?:     string | false;
  /** Apply backdrop-filter for glass effect. Auto-on for `glass` variant. */
  blurBg?:     boolean;
  children?:   ReactNode;
  className?:  string;
  style?:      CSSProperties;
}

export function Surface({
  variant = 'card',
  flat = false,
  border,
  blurBg,
  children,
  className = '',
  style: extraStyle,
  ...rest
}: SurfaceProps) {
  const background = (() => {
    switch (variant) {
      case 'panel':   return surfaces.panel();
      case 'glass':   return surfaces.glass();
      case 'premium': return surfaces.premium();
      case 'card':
      default:        return surfaces.card();
    }
  })();

  const resolvedBorder =
    border === false ? undefined : (border ?? borders.card());

  const wantsBlur = blurBg ?? variant === 'glass';

  const baseStyle: CSSProperties = {
    background,
    border:           resolvedBorder,
    boxShadow:        flat ? undefined : shadows.card(),
    backdropFilter:   wantsBlur ? 'blur(20px)' : undefined,
    WebkitBackdropFilter: wantsBlur ? 'blur(20px)' : undefined,
    ...extraStyle,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={baseStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
