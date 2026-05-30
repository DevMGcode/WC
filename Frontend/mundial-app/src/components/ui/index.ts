/**
 * Barrel for design-system primitives. Always import from here:
 *
 *   import { Surface, Badge, StatusDot } from '@/components/ui';
 *
 * Keeping the public API in one place lets us swap implementations later
 * (e.g. migrate Surface to a `cva` recipe) without touching callers.
 */

export { Surface } from './Surface';
export type { SurfaceProps } from './Surface';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { StatusDot } from './StatusDot';
