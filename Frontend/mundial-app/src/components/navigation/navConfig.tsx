import React from 'react';
import { FiHome, FiCalendar, FiTarget, FiTrendingUp, FiAward } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

export interface NavItem {
  label: string;
  href: string;
  originalHref: string;
  icon: React.ReactNode;
  accentHex: string;
  glowRgba: string;
  bgRgba: string;
  key?: string;
}

/* Íconos a 17px para mejor presencia visual dentro del contenedor 32×32 */
export const baseNavConfig = [
  { key: 'home',        href: '/',            icon: <FiHome size={17} />,       accentHex: hex.green.bright, glowRgba: alphaOf('green', 0.55),       bgRgba: alphaOf('green', 0.10) },
  { key: 'calendar',    href: '/fixtures',    icon: <FiCalendar size={17} />,   accentHex: hex.green.soft,   glowRgba: alpha(hex.green.soft, 0.55),  bgRgba: alpha(hex.green.soft, 0.10) },
  { key: 'groups',      href: '/groups',      icon: <FiTarget size={17} />,     accentHex: hex.green.hover,  glowRgba: alpha(hex.green.hover, 0.55), bgRgba: alpha(hex.green.hover, 0.10) },
  { key: 'scorers',     href: '/scorers',     icon: <FiAward size={17} />,      accentHex: hex.gold.base,    glowRgba: alpha(hex.gold.base, 0.55),   bgRgba: alphaOf('gold', 0.10) },
  { key: 'predictions', href: '/predictions', icon: <FiTrendingUp size={17} />, accentHex: hex.green.muted,  glowRgba: alpha(hex.green.muted, 0.55), bgRgba: alpha(hex.green.muted, 0.10) },
];
