'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight, FiZap, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { ActiveOrb, NavTooltip } from './NavTooltip';
import type { NavItem as NavItemType } from './navConfig';

const W_OPEN      = 210;
const W_COLLAPSED = 68;

interface NavSidebarProps {
  navItems: NavItemType[];
  hovered: string | null;
  setHovered: (v: string | null) => void;
  prefetchRouteData: (href: string) => void;
  collapsed: boolean;
  toggle: () => void;
  user: { displayName?: string | null } | null;
  locale: string;
  t: (key: string) => string;
  activeItem: NavItemType | undefined;
  pathname: string;
}

export const NavSidebar: React.FC<NavSidebarProps> = ({
  navItems, hovered, setHovered, prefetchRouteData,
  collapsed, toggle, user, locale, t, activeItem, pathname,
}) => {
  const toLocalHref = (h: string) => h === '/' ? `/${locale}` : `/${locale}${h}`;

  return (
    <motion.aside
      className="hidden lg:block fixed left-0 top-0 bottom-0 z-40"
      style={{ overflow: 'visible' }}
      animate={{ width: collapsed ? W_COLLAPSED : W_OPEN }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      initial={false}
    >
      {/* ── Glass background — menos pesado, más balance visual ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `linear-gradient(180deg,
            ${alpha(hex.bg.primary, 0.97)} 0%,
            ${alpha(hex.bg.secondary, 0.96)} 40%,
            ${alpha(hex.bg.elevated, 0.94)} 70%,
            ${alpha(hex.bg.primary, 0.97)} 100%)`,
          borderRight: `1px solid ${alphaOf('green', 0.14)}`,
          boxShadow: `4px 0 48px ${alpha(hex.neutral.black, 0.55)}, inset -1px 0 0 ${alpha(hex.neutral.white, 0.03)}`,
        }}
      >
        {/* Borde gradiente derecho — color del item activo */}
        <div
          className="absolute right-0 top-0 bottom-0"
          style={{
            width: 1,
            background: `linear-gradient(180deg, transparent 5%, ${activeItem?.accentHex ?? hex.green.bright}55 50%, transparent 95%)`,
            opacity: 0.8,
          }}
        />
        {/* Grid pitch sutil */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.018]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="navgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#navgrid)" />
        </svg>
        {/* Ambient bloom superior */}
        <div className="absolute -top-20 -left-10 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${alphaOf('green', 0.09)} 0%, transparent 70%)`, filter: 'blur(40px)' }} />
        {/* Ambient bloom inferior */}
        <div className="absolute -bottom-16 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.05)} 0%, transparent 70%)`, filter: 'blur(40px)' }} />
      </div>

      {/* ── Toggle pill — más elegante y prominente ── */}
      <motion.button
        onClick={toggle}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        className="absolute z-30 flex items-center justify-center"
        style={{
          right: -15, top: '50%', transform: 'translateY(-50%)',
          width: 30, height: 60, borderRadius: 15,
          background: `linear-gradient(160deg, ${alpha(hex.bg.elevated, 0.98)}, ${alpha(hex.bg.primary, 0.98)})`,
          border: `1px solid ${alphaOf('green', 0.24)}`,
          boxShadow: `4px 0 22px ${alpha(hex.neutral.black, 0.60)}, 0 0 16px ${alphaOf('green', 0.10)}`,
          cursor: 'pointer', outline: 'none',
        }}
        whileHover={{
          scale: 1.10,
          borderColor: alphaOf('green', 0.50),
          boxShadow: `4px 0 28px ${alpha(hex.neutral.black, 0.65)}, 0 0 22px ${alphaOf('green', 0.20)}`,
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <FiChevronRight size={14} style={{ color: alphaOf('green', 0.85) }} />
        </motion.div>
      </motion.button>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col" style={{ minWidth: 0 }}>

        {/* ── Logo ── */}
        <div className="px-3 pt-6 pb-4 flex-shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div key="c-logo" className="flex justify-center"
                initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.22 }}
              >
                <Link href={toLocalHref('/profile')}>
                  <div className="relative cursor-pointer">
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: alphaOf('green', 0.22), filter: 'blur(12px)', opacity: 0.6 }} />
                    <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={38} height={38} className="relative z-10 w-[38px] h-[38px] object-contain" />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="e-logo"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.24 }}
              >
                <Link href={toLocalHref('/profile')}>
                  <div className="flex items-center gap-2.5 cursor-pointer">
                    <div className="relative shrink-0">
                      <motion.div className="absolute inset-0 rounded-full"
                        style={{ background: alphaOf('green', 0.28), filter: 'blur(12px)' }}
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.75, 0.3] }}
                        transition={{ duration: 3.2, repeat: Infinity }} />
                      <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={38} height={38} className="relative z-10 w-[38px] h-[38px] object-contain" />
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={110} height={26} className="h-[20px] w-auto object-contain"
                        style={{ mixBlendMode: 'screen', filter: `drop-shadow(0 0 10px ${alphaOf('green', 0.50)}) brightness(1.25)` }} />
                    </div>
                  </div>
                </Link>

                {/* Badge WORLD CUP — tipografía mejorada */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl cursor-default overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${alphaOf('gold', 0.14)}, ${alpha(hex.neutral.black, 0.30)})`,
                    border: `1px solid ${alphaOf('gold', 0.24)}`,
                    boxShadow: `0 2px 12px ${alphaOf('gold', 0.08)}`,
                  }}
                >
                  <FiZap size={11} className="shrink-0" style={{ color: hex.gold.base } as any} />
                  {/* "WORLD CUP": 11px mínimo — legible */}
                  <span className="text-[11px] font-black tracking-[0.16em] uppercase flex-1 truncate" style={{ color: alpha(hex.gold.bright, 0.90) }}>
                    {t('common.worldCup')}
                  </span>
                  <div className="flex gap-0.5 shrink-0">
                    {['#B31942', '#FFFFFF', '#002868'].map((c, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: i === 1 ? 0.55 : 1 }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Separador logo */}
          <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.08)}, transparent)` }} />
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-2.5 py-1 flex flex-col gap-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p key="nav-label"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-2 mb-1.5 mt-0.5 whitespace-nowrap"
                /* Label sección: 10px — mínimo legible para uppercase decorativo */
                style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.24em', textTransform: 'uppercase', color: alpha(hex.neutral.white, 0.35) }}
              >
                {t('nav.section')}
              </motion.p>
            )}
          </AnimatePresence>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.originalHref === '/' && pathname === `/${locale}`);
            const isHov    = hovered === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className="block"
                onMouseEnter={() => { setHovered(item.href); prefetchRouteData(item.originalHref); }}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.div
                  className="relative flex items-center rounded-xl select-none"
                  style={{
                    padding: '11px 10px',
                    gap: collapsed ? 0 : 11,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive
                      ? item.bgRgba
                      : isHov
                        ? alpha(hex.neutral.white, 0.05)
                        : 'transparent',
                    border: `1px solid ${isActive ? item.accentHex + '30' : isHov ? alpha(hex.neutral.white, 0.06) : 'transparent'}`,
                    boxShadow: isActive ? `inset 0 0 22px ${item.glowRgba}15, 0 4px 16px ${alpha(hex.neutral.black, 0.30)}` : 'none',
                    transition: 'background 0.22s, border-color 0.22s, box-shadow 0.22s',
                    overflow: 'visible',
                  }}
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                >
                  {/* Active orb */}
                  {isActive && <ActiveOrb color={item.bgRgba} />}

                  {/* Active left bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarBar"
                      className="absolute left-0 top-2 bottom-2 rounded-full"
                      style={{
                        width: 3,
                        background: `linear-gradient(180deg, ${item.accentHex}, ${item.accentHex}cc)`,
                        boxShadow: `0 0 10px ${item.glowRgba}, 0 0 24px ${item.glowRgba}`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon container — 32×32 para íconos más visibles */}
                  <div
                    className="relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{
                      background: isActive
                        ? item.bgRgba
                        : isHov
                          ? alpha(hex.neutral.white, 0.06)
                          : alpha(hex.neutral.white, 0.03),
                      border: `1px solid ${isActive ? item.accentHex + '35' : isHov ? alpha(hex.neutral.white, 0.08) : alpha(hex.neutral.white, 0.04)}`,
                      color: isActive
                        ? item.accentHex
                        : isHov
                          ? alpha(hex.neutral.white, 0.70)
                          : alpha(hex.neutral.white, 0.45),
                      boxShadow: isActive ? `0 0 14px ${item.glowRgba}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.08)}` : 'none',
                      transition: 'all 0.22s ease',
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label — 14px (text-sm) mínimo para legibilidad con miopía */}
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        className="relative z-10 text-sm font-bold flex-1 leading-none whitespace-nowrap"
                        style={{
                          color: isActive
                            ? item.accentHex
                            : isHov
                              ? alpha(hex.neutral.white, 0.80)
                              : alpha(hex.neutral.white, 0.55),
                          textShadow: isActive ? `0 0 16px ${item.glowRgba}` : 'none',
                          transition: 'color 0.22s, text-shadow 0.22s',
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Chevron activo */}
                  <AnimatePresence initial={false}>
                    {!collapsed && isActive && (
                      <motion.span className="relative z-10 shrink-0"
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        style={{ color: item.accentHex + '80' }}
                      >
                        <FiChevronRight size={13} />
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip collapsed */}
                  <AnimatePresence>
                    {collapsed && isHov && (
                      <NavTooltip label={item.label} accentHex={item.accentHex} glowRgba={item.glowRgba} />
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── Separador ── */}
        <div className="mx-3 h-px mb-2 flex-shrink-0"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.08)}, transparent)` }} />

        {/* ── User profile ── */}
        <div className="px-2.5 pb-5 flex-shrink-0">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p key="user-label"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-2 mb-2 whitespace-nowrap"
                /* Label "PERFIL": 10px mínimo */
                style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.24em', textTransform: 'uppercase', color: alpha(hex.neutral.white, 0.35) }}
              >
                {t('nav.profile')}
              </motion.p>
            )}
          </AnimatePresence>

          <Link href={toLocalHref('/profile')}>
            <motion.div
              className="relative flex items-center rounded-xl cursor-pointer select-none"
              style={{
                padding: '11px 10px',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: `1px solid ${alpha(hex.neutral.white, 0.07)}`,
                background: alpha(hex.neutral.white, 0.02),
                overflow: 'visible',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={() => setHovered('__user__')}
              onMouseLeave={() => setHovered(null)}
              whileHover={{
                backgroundColor: alpha(hex.neutral.white, 0.06),
                borderColor: alpha(hex.green.bright, 0.18),
                x: collapsed ? 0 : 3,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Avatar — 32×32 */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[13px]"
                  style={{
                    background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`,
                    boxShadow: `0 0 16px ${alphaOf('green', 0.35)}`,
                  }}>
                  {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
                </div>
                {/* Indicador online */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: hex.green.bright,
                    border: `2px solid ${hex.bg.primary}`,
                    boxShadow: `0 0 6px ${alphaOf('green', 0.65)}`,
                  }} />
              </div>

              {/* Nombre + estado */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div className="flex-1 min-w-0"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Nombre usuario: 13px — legible */}
                    <p className="text-[13px] font-bold truncate leading-none" style={{ color: hex.text.primary }}>{user?.displayName ?? 'Usuario'}</p>
                    {/* Estado "ONLINE": 11px mínimo */}
                    <p className="text-[11px] font-bold tracking-[0.14em] uppercase mt-1" style={{ color: alphaOf('green', 0.75) }}>{t('nav.online')}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ícono usuario */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FiUser size={14} className="shrink-0" style={{ color: alpha(hex.neutral.white, 0.40) } as any} />
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip collapsed */}
              <AnimatePresence>
                {collapsed && hovered === '__user__' && (
                  <NavTooltip label={user?.displayName ?? 'Perfil'} accentHex={hex.green.bright} glowRgba={alphaOf('green', 0.55)} />
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>

      </div>
    </motion.aside>
  );
};
