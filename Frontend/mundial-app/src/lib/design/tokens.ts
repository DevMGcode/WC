/**
 * ORIONIX GOL — Single source of truth for design tokens.
 * ──────────────────────────────────────────────────────────────────────────
 */

// ────────────────────────────────────────────────────────────────────────────
// RAW VALUES — internal, used by helpers below. Mirrors globals.css :root.
// Keep these in sync. If you change a value here, change it in globals.css too.
// ────────────────────────────────────────────────────────────────────────────
const raw = {
  bg: {
    primary:   '#050D07',
    secondary: '#08170D',
    elevated:  '#0E2214',
    soft:      '#14311C',
  },
  green: {
    dark:    '#1B5E20',
    base:    '#2E7D32',
    hover:   '#388E3C',
    bright:  '#4CAF50',
    soft:    '#A5D6A7',
    muted:   '#7CBF7F',
  },
  gold: {
    dark:    '#8C6A16',
    muted:   '#C9A227',
    base:    '#D4AF37',
    bright:  '#E2C760',
    soft:    '#F1DB91',
  },
  text: {
    primary:   '#F5F7FA',
    secondary: '#B8C4BC',
    muted:     '#6E7C72',
    dark:      '#050D07',
  },
  status: {
    success: '#4CAF50',
    warning: '#E2C760',
    danger:  '#D32F2F',
    info:    '#0288D1',
    live:    '#4CAF50',
    pending: '#E2C760',
    finished:'#B8C4BC',
  },
  host: {
    usaBlue:  '#0A3161',
    usaRed:   '#B31942',
    mexGreen: '#006847',
    mexRed:   '#CE1126',
    canRed:   '#D80621',
    canIce:   '#F5F7FA',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ACCENT PALETTE — UI colors intentionally outside the brand green/gold axis.
  // Use `alpha(hex.accent.X, opacity)` for rgba usage.
  // These cover: teal (legal pages), red/pink/emerald (profile/states),
  // orange/amber/yellow (login fire), slate (muted text), navy (dark pages).
  // ──────────────────────────────────────────────────────────────────────────
  accent: {
    // ── Teal / Cyan ──────────────────────────────────────────────────────────
    teal:        '#00D2B9',   // rgb(0,210,185)  — privacy/terms primary accent
    tealDeep:    '#00B49B',   // rgb(0,180,155)  — ambient orb (privacy/terms)
    sky:         '#38BDF8',   // rgb(56,189,248) — card border (privacy/terms)
    skyBlue:     '#0082D2',   // rgb(0,130,210)  — ambient orb (privacy/terms)

    // ── Orange / Amber / Yellow ───────────────────────────────────────────────
    orange:      '#F97316',   // rgb(249,115,22) — fire / login accents
    amber:       '#D97706',   // rgb(217,119,6)  — login warm glow
    yellow:      '#FDE047',   // rgb(253,224,71) — login fire highlight

    // ── Pink ─────────────────────────────────────────────────────────────────
    pink:        '#F472B6',   // rgb(244,114,182) — profile favorites / notif

    // ── Red (UI danger — Tailwind red, different from brand #D32F2F) ─────────
    red:         '#EF4444',   // red-500 — error borders, buttons
    redSoft:     '#F87171',   // red-400 — icon color
    redSubtle:   '#FCA5A5',   // red-300 — success/error text
    redStrong:   '#DC2626',   // red-600 — delete button gradient

    // ── Emerald (UI success — different from brand green) ────────────────────
    emerald:     '#10B981',   // emerald-500
    emeraldSoft: '#6EE7B7',   // emerald-300

    // ── Slate (gray-blue muted UI text) ──────────────────────────────────────
    slate:       '#94A3B8',   // slate-400
    slateDeep:   '#64748B',   // slate-500
    slateDark:   '#475569',   // slate-600
    slateLight:  '#E2E8F0',   // slate-200

    // ── Navy (dark backgrounds — login / legal pages, blue-tinted) ───────────
    navy:        '#080F22',   // privacy/terms page bg
    navyDeep:    '#010810',   // privacy/terms darker bg
    navyCard:    '#060E1E',   // login floating card bg
    navyCardMid: '#081226',   // login card gradient end
    navyPanel:   '#090E1F',   // privacy/terms card bg
    navyPanelAlt:'#0B1628',   // privacy/terms card gradient end
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// CSS VAR REFERENCES — preferred way to consume tokens in `style={{ }}`.
// Using these makes runtime theme switching trivial (just override the CSS var).
// ────────────────────────────────────────────────────────────────────────────
export const tokens = {
  bg: {
    primary:   'var(--orionix-bg-primary)',
    secondary: 'var(--orionix-bg-secondary)',
    elevated:  'var(--orionix-bg-elevated)',
    soft:      'var(--orionix-bg-soft)',
    glass:     'var(--orionix-bg-glass)',
  },
  green: {
    dark:    'var(--orionix-green-dark)',
    base:    'var(--orionix-green)',
    hover:   'var(--orionix-green-hover)',
    bright:  'var(--orionix-green-bright)',
    soft:    'var(--orionix-green-soft)',
    muted:   'var(--orionix-green-muted)',
  },
  gold: {
    dark:    'var(--orionix-gold-dark)',
    muted:   'var(--orionix-gold-muted)',
    base:    'var(--orionix-gold)',
    bright:  'var(--orionix-gold-bright)',
    soft:    'var(--orionix-gold-soft)',
  },
  text: {
    primary:   'var(--orionix-text-primary)',
    secondary: 'var(--orionix-text-secondary)',
    muted:     'var(--orionix-text-muted)',
  },
  status: {
    success: 'var(--orionix-success)',
    warning: 'var(--orionix-warning)',
    danger:  'var(--orionix-danger)',
    info:    'var(--orionix-info)',
  },
  host: {
    usaBlue:  'var(--orionix-usa-blue)',
    usaRed:   'var(--orionix-usa-red)',
    mexGreen: 'var(--orionix-mex-green)',
    mexRed:   'var(--orionix-mex-red)',
    canRed:   'var(--orionix-can-red)',
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// HEX REFERENCES — for places where CSS vars can't go (gradients, rgba(), etc).
// Prefer `tokens.*` whenever possible; fall back to `hex.*` only when needed.
// ────────────────────────────────────────────────────────────────────────────
export const hex = raw;

// ────────────────────────────────────────────────────────────────────────────
// SEMANTIC TYPE — for components that accept a "brand color" prop.
// Core brand: green | gold | danger | warning | success | info | neutral
// Extended accents: pink | teal | orange | emerald | red
// ────────────────────────────────────────────────────────────────────────────
export type BrandColor =
  | 'green'
  | 'gold'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'neutral'
  // ── extended accent colors ──
  | 'pink'
  | 'teal'
  | 'orange'
  | 'emerald'
  | 'red';

/**
 * Resolve a semantic color name to its hex value. Useful for consumers that
 * receive a `color` prop and need to compose rgba()/linear-gradient with it.
 */
export function resolveBrandHex(color: BrandColor): string {
  switch (color) {
    case 'green':   return raw.green.bright;
    case 'gold':    return raw.gold.base;
    case 'danger':  return raw.status.danger;
    case 'warning': return raw.status.warning;
    case 'success': return raw.status.success;
    case 'info':    return raw.status.info;
    case 'neutral': return raw.text.secondary;
    // extended accents
    case 'pink':    return raw.accent.pink;
    case 'teal':    return raw.accent.teal;
    case 'orange':  return raw.accent.orange;
    case 'emerald': return raw.accent.emerald;
    case 'red':     return raw.accent.red;
  }
}
