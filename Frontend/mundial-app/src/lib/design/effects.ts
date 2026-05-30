/**
 * Composed visual effects — gradients, shadows, surfaces.
 * ──────────────────────────────────────────────────────────────────────────
 * These helpers wrap repeated patterns that show up across the app (e.g.
 * the dark card with a 145° gradient and a subtle border) so that:
 *   - We don't repeat the same `linear-gradient(145deg, rgba(6,17,10,0.97)...)`
 *     in 200+ places.
 *   - When the design changes (e.g. shift the card hue slightly), we change
 *     one function and everything updates.
 *   - Components stay declarative: `style={surfaces.card()}` is way more
 *     readable than the raw gradient string.
 *
 * Naming convention:
 *   - `surfaces.*`  → backgrounds (cards, panels, glass)
 *   - `borders.*`   → border definitions (string for `border` CSS prop)
 *   - `shadows.*`   → box-shadow strings
 *   - `gradients.*` → standalone linear/radial gradients (for badges, dividers)
 *
 * Use `hex.*` from tokens.ts whenever a CSS variable can't go inside the
 * gradient/rgba() string (which is most of the time, since `linear-gradient(
 * var(--orionix-green))` doesn't expand correctly across all browsers).
 */

import { hex, type BrandColor, resolveBrandHex } from './tokens';

// ────────────────────────────────────────────────────────────────────────────
// ALPHA — express opacity declaratively. `alpha('#4CAF50', 0.18)` → rgba(...).
// ────────────────────────────────────────────────────────────────────────────
export function alpha(hexColor: string, opacity: number): string {
  const clean = hexColor.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** `alphaOf('green', 0.18)` → rgba of #4CAF50 at 0.18. */
export function alphaOf(color: BrandColor, opacity: number): string {
  return alpha(resolveBrandHex(color), opacity);
}

// ────────────────────────────────────────────────────────────────────────────
// SURFACES — full background defs ready to drop into `style={{ background: ... }}`.
// ────────────────────────────────────────────────────────────────────────────
export const surfaces = {
  /** Premium dark card with a subtle 145° gradient. The default app surface. */
  card: () =>
    `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.97)}, ${alpha(hex.bg.secondary, 0.95)})`,

  /** Slightly darker variant for elevated panels / modals. */
  panel: () =>
    `linear-gradient(180deg, ${alpha(hex.bg.secondary, 0.98)}, ${alpha(hex.bg.primary, 0.98)})`,

  /** Translucent surface for floating overlays. */
  glass: () =>
    `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.88)}, ${alpha(hex.bg.secondary, 0.85)})`,

  /** Premium card with a gold accent gradient in the corner. */
  premium: () =>
    `linear-gradient(145deg, ${alpha(hex.bg.secondary, 0.98)} 0%, ${alpha(hex.bg.elevated, 0.96)} 72%, ${alpha(hex.gold.base, 0.08)} 100%)`,

  /** Subtle tinted surface, e.g. status banners. Pass a brand color. */
  tint: (color: BrandColor, opacity = 0.08) =>
    alphaOf(color, opacity),
};

// ────────────────────────────────────────────────────────────────────────────
// BORDERS — string for the `border` CSS prop. Pass thickness optionally.
// ────────────────────────────────────────────────────────────────────────────
export const borders = {
  /** Default subtle border for cards. */
  card:    () => `1px solid ${alpha(hex.green.bright, 0.12)}`,
  /** Stronger border for emphasis (e.g. active tab). */
  strong:  (color: BrandColor = 'green') => `1px solid ${alphaOf(color, 0.35)}`,
  /** Faint divider line. */
  divider: () => `1px solid ${alpha(hex.text.secondary, 0.08)}`,
  /** Custom: pick brand color + opacity. */
  brand:   (color: BrandColor, opacity = 0.22) => `1px solid ${alphaOf(color, opacity)}`,
};

// ────────────────────────────────────────────────────────────────────────────
// SHADOWS — single-string composed shadows ready for `boxShadow`.
// ────────────────────────────────────────────────────────────────────────────
export const shadows = {
  /** Default elevation for cards (soft drop). */
  card: () => `0 10px 30px ${alpha(hex.neutral.black, 0.35)}, inset 0 0 0 1px ${alpha(hex.neutral.white, 0.02)}`,

  /** Stronger elevation for floating panels. */
  panel: () => `0 24px 60px ${alpha(hex.neutral.black, 0.45)}`,

  /** Glow effect — used on hover or for accents. */
  glow: (color: BrandColor, intensity = 0.18) =>
    `0 0 26px ${alphaOf(color, intensity)}`,

  /** Strong hover glow. */
  hoverGlow: (color: BrandColor = 'green') =>
    `0 0 24px ${alphaOf(color, 0.28)}`,

  /** No shadow (for resets). */
  none: () => 'none',
};

// ────────────────────────────────────────────────────────────────────────────
// GRADIENTS — standalone linear/radial for accents, dividers, badges.
// ────────────────────────────────────────────────────────────────────────────
export const gradients = {
  /** Horizontal divider with brand color in the middle. */
  divider: (color: BrandColor = 'green', intensity = 0.5) =>
    `linear-gradient(90deg, transparent, ${alphaOf(color, intensity)}, transparent)`,

  /** Vertical divider. */
  dividerV: (color: BrandColor = 'green', intensity = 0.5) =>
    `linear-gradient(180deg, transparent, ${alphaOf(color, intensity)}, transparent)`,

  /** Brand button gradient (3-stop). */
  button: (color: BrandColor = 'green') => {
    if (color === 'green') {
      return `linear-gradient(135deg, ${hex.green.base} 0%, ${hex.green.hover} 55%, ${hex.green.bright} 100%)`;
    }
    if (color === 'gold') {
      return `linear-gradient(135deg, ${hex.gold.muted} 0%, ${hex.gold.base} 50%, ${hex.gold.bright} 100%)`;
    }
    const c = resolveBrandHex(color);
    return `linear-gradient(135deg, ${c} 0%, ${c} 100%)`;
  },

  /** Radial highlight (corner glow). */
  cornerGlow: (color: BrandColor = 'green', opacity = 0.08) =>
    `radial-gradient(circle, ${alphaOf(color, opacity)} 0%, transparent 70%)`,
};
