'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiHome, FiCalendar, FiTarget, FiTrendingUp,
  FiSettings, FiUser, FiChevronRight, FiZap, FiChevronUp,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useT } from '@/hooks/useT';

interface NavItem {
  label: string;
  href: string;
  originalHref: string;
  icon: React.ReactNode;
  accentHex: string;
  glowRgba: string;
  bgRgba: string;
  key?: string;
}

const baseNavConfig = [
  { key: 'home',        href: '/',            icon: <FiHome size={15} />,       accentHex: '#22d3ee', glowRgba: 'rgba(34,211,238,0.55)',  bgRgba: 'rgba(34,211,238,0.10)' },
  { key: 'calendar',    href: '/fixtures',    icon: <FiCalendar size={15} />,   accentHex: '#38bdf8', glowRgba: 'rgba(56,189,248,0.55)',  bgRgba: 'rgba(56,189,248,0.10)' },
  { key: 'groups',      href: '/groups',      icon: <FiTarget size={15} />,     accentHex: '#34d399', glowRgba: 'rgba(52,211,153,0.55)',  bgRgba: 'rgba(52,211,153,0.10)' },
  { key: 'predictions', href: '/predictions', icon: <FiTrendingUp size={15} />, accentHex: '#fbbf24', glowRgba: 'rgba(251,191,36,0.55)',  bgRgba: 'rgba(251,191,36,0.10)' },
];

/* ── Active orb glow behind selected item ── */
const ActiveOrb = ({ color }: { color: string }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none rounded-xl"
    style={{ background: `radial-gradient(ellipse at 25% 50%, ${color} 0%, transparent 68%)` }}
    animate={{ opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ── Floating tooltip for icon-only collapsed mode ── */
const NavTooltip = ({ label, accentHex, glowRgba }: { label: string; accentHex: string; glowRgba: string }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: '100%', top: '50%', marginLeft: 14, transform: 'translateY(-50%)', zIndex: 9999, whiteSpace: 'nowrap' }}
    initial={{ opacity: 0, x: -10, scale: 0.90 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -6, scale: 0.94 }}
    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
  >
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(4,12,28,0.98), rgba(6,18,42,0.98))',
        border: `1px solid ${accentHex}35`,
        boxShadow: `0 10px 32px rgba(0,0,0,0.65), 0 0 18px ${glowRgba}15`,
        backdropFilter: 'blur(18px)',
      }}
    >
      {/* Arrow pointing left */}
      <div className="absolute" style={{
        right: '100%', top: '50%', transform: 'translateY(-50%)',
        width: 0, height: 0,
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        borderRight: `5px solid ${accentHex}35`,
      }} />
      <span className="text-[12px] font-black tracking-wide" style={{ color: accentHex, textShadow: `0 0 12px ${glowRgba}` }}>
        {label}
      </span>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   NAVIGATION COMPONENT
══════════════════════════════════════════════════════════ */
export const Navigation: React.FC = () => {
  const pathname  = usePathname();
  const { user }  = useAuth();
  const { collapsed, toggle } = useSidebar();
  const { t, locale } = useT();

  const [mounted,       setMounted]       = useState(false);
  const [hovered,       setHovered]       = useState<string | null>(null);
  const [mobileVisible, setMobileVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  /* Mobile auto-hide on scroll-down, reveal on scroll-up */
  useEffect(() => {
    const onScroll = () => {
      const y  = window.scrollY;
      const dy = y - lastScrollY.current;
      if (dy > 10 && y > 90)  setMobileVisible(false);
      else if (dy < -10)       setMobileVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const authRoutes = ['/login', '/register', '/onboarding', '/privacy'];
  if (!mounted || authRoutes.some(r => pathname.endsWith(r))) return null;

  const toLocalHref = (h: string) => h === '/' ? `/${locale}` : `/${locale}${h}`;

  const isAdmin  = user?.email === 'admin@example.com';
  const navItems: NavItem[] = [
    ...baseNavConfig.map(c => ({ ...c, label: t(`nav.${c.key}`), href: toLocalHref(c.href), originalHref: c.href })),
    ...(isAdmin ? [{ key: 'admin', label: t('nav.admin'), href: toLocalHref('/admin'), originalHref: '/admin', icon: <FiSettings size={15} />, accentHex: '#c084fc', glowRgba: 'rgba(192,132,252,0.55)', bgRgba: 'rgba(192,132,252,0.10)' }] : []),
  ];

  const activeItem = navItems.find(n => n.href === pathname || (n.originalHref === '/' && pathname === `/${locale}`));

  const W_OPEN     = 200;
  const W_COLLAPSED = 64;

  return (
    <>
      {/* ════════════════════════════════════════════════════
          DESKTOP SIDEBAR — collapsible
      ════════════════════════════════════════════════════ */}
      <motion.aside
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40"
        style={{ overflow: 'visible' }}
        animate={{ width: collapsed ? W_COLLAPSED : W_OPEN }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        initial={false}
      >
        {/* ─── Glass background (overflow:hidden clips visual FX) ─── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(3,9,24,0.99) 0%, rgba(5,15,34,0.98) 50%, rgba(3,9,22,0.99) 100%)',
            borderRight: '1px solid rgba(34,211,238,0.08)',
            boxShadow: '4px 0 40px rgba(0,0,0,0.65), inset -1px 0 0 rgba(255,255,255,0.015)',
          }}
        >
          {/* Animated right-edge neon stripe */}
          <motion.div
            className="absolute right-0 top-0 bottom-0"
            style={{ width: 1, background: `linear-gradient(180deg, transparent, ${activeItem?.accentHex ?? '#22d3ee'}55, transparent)` }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Subtle dot-grid texture */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.016]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="navgrid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#navgrid)" />
          </svg>
          {/* Ambient top-left orb */}
          <div className="absolute -top-24 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        {/* ─── Toggle pill button on the right edge ─── */}
        <motion.button
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute z-30 flex items-center justify-center"
          style={{
            right: -14, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 56, borderRadius: 14,
            background: 'linear-gradient(160deg, rgba(5,14,30,0.98), rgba(7,20,42,0.98))',
            border: '1px solid rgba(34,211,238,0.20)',
            boxShadow: '4px 0 18px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.01)',
            cursor: 'pointer',
            outline: 'none',
          }}
          whileHover={{
            scale: 1.12,
            borderColor: 'rgba(34,211,238,0.50)',
            boxShadow: '4px 0 26px rgba(34,211,238,0.22), 0 0 0 1px rgba(34,211,238,0.08)',
          }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <FiChevronRight size={13} style={{ color: 'rgba(34,211,238,0.75)' }} />
          </motion.div>
          {/* Pulse ring on button */}
          <motion.div
            className="absolute inset-0 rounded-[14px] pointer-events-none"
            style={{ border: '1px solid rgba(34,211,238,0.15)' }}
            animate={{ opacity: [0, 0.7, 0], scale: [1, 1.35, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.button>

        {/* ─── Content layer (overflow:visible for tooltips) ─── */}
        <div className="relative z-10 h-full flex flex-col" style={{ minWidth: 0 }}>

          {/* ── LOGO ── */}
          <div className="px-3 pt-6 pb-4 flex-shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {collapsed ? (
                <motion.div key="c-logo" className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ duration: 0.22 }}
                >
                  <Link href={toLocalHref('/profile')}>
                    <div className="relative cursor-pointer">
                      <motion.div className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(34,211,238,0.30)', filter: 'blur(10px)' }}
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3.2, repeat: Infinity }} />
                      <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={36} height={36} className="relative z-10 w-9 h-9 object-contain" />
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
                          style={{ background: 'rgba(34,211,238,0.30)', filter: 'blur(10px)' }}
                          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 3.2, repeat: Infinity }} />
                        <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={36} height={36} className="relative z-10 w-9 h-9 object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={110} height={26} className="h-[20px] w-auto object-contain"
                          style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.55)) brightness(1.25)' }} />
                      </div>
                    </div>
                  </Link>

                  {/* Mundial 2026 badge */}
                  <motion.div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-default overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.14), rgba(120,53,15,0.08))', border: '1px solid rgba(217,119,6,0.20)', boxShadow: '0 0 6px rgba(217,119,6,0.06)' }}
                    animate={{ boxShadow: ['0 0 6px rgba(217,119,6,0.06)', '0 0 16px rgba(217,119,6,0.18)', '0 0 6px rgba(217,119,6,0.06)'] }}
                    transition={{ duration: 2.8, repeat: Infinity }}
                  >
                    <FiZap size={9} className="text-amber-400 shrink-0" />
                    <span className="text-[7.5px] font-black tracking-[0.22em] text-amber-300/75 uppercase flex-1 truncate">{t('common.worldCup')}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {['#B31942', '#FFFFFF', '#002868'].map((c, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: i === 1 ? 0.5 : 1 }} />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
          </div>

          {/* ── NAV ITEMS ── */}
          <nav className="flex-1 px-2 py-1 flex flex-col gap-0.5">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p key="nav-label"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[6.5px] font-black tracking-[0.38em] text-slate-700 uppercase px-2 mb-2 mt-1 whitespace-nowrap"
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
                  className="block"
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <motion.div
                    className="relative flex items-center rounded-xl select-none"
                    style={{
                      padding: '10px',
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: isActive ? item.bgRgba : isHov ? 'rgba(255,255,255,0.04)' : 'transparent',
                      border: `1px solid ${isActive ? item.accentHex + '28' : 'transparent'}`,
                      boxShadow: isActive ? `inset 0 0 18px ${item.glowRgba}12` : 'none',
                      transition: 'background 0.22s, border-color 0.22s, box-shadow 0.22s',
                      overflow: 'visible',
                    }}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  >
                    {/* Active glow orb */}
                    {isActive && <ActiveOrb color={item.bgRgba} />}

                    {/* Active left accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarBar"
                        className="absolute left-0 top-2 bottom-2 rounded-full"
                        style={{ width: 2, background: item.accentHex, boxShadow: `0 0 8px ${item.glowRgba}, 0 0 20px ${item.glowRgba}` }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon box */}
                    <motion.div
                      className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                      style={{
                        background: isActive ? item.bgRgba : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isActive ? item.accentHex + '30' : 'rgba(255,255,255,0.05)'}`,
                        color: isActive ? item.accentHex : isHov ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                        transition: 'all 0.22s ease',
                      }}
                      animate={isActive
                        ? { boxShadow: [`0 0 5px ${item.glowRgba}`, `0 0 14px ${item.glowRgba}`, `0 0 5px ${item.glowRgba}`] }
                        : { boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      {item.icon}
                    </motion.div>

                    {/* Label — fade/slide in expanded mode */}
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          className="relative z-10 text-[13px] font-bold flex-1 leading-none whitespace-nowrap"
                          style={{
                            color: isActive ? item.accentHex : isHov ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                            textShadow: isActive ? `0 0 14px ${item.glowRgba}` : 'none',
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

                    {/* Chevron — active + expanded only */}
                    <AnimatePresence initial={false}>
                      {!collapsed && isActive && (
                        <motion.span className="relative z-10 shrink-0"
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18 }}
                          style={{ color: item.accentHex + '70' }}
                        >
                          <FiChevronRight size={11} />
                        </motion.span>
                      )}
                    </AnimatePresence>


                    {/* Tooltip — collapsed + hovered */}
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

          {/* Separator */}
          <div className="mx-3 h-px mb-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />

          {/* ── USER PROFILE ── */}
          <div className="px-2 pb-5 flex-shrink-0">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p key="user-label"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[6.5px] font-black tracking-[0.38em] text-slate-700 uppercase px-2 mb-2 whitespace-nowrap"
                >
                  {t('nav.profile')}
                </motion.p>
              )}
            </AnimatePresence>

            <Link href={toLocalHref('/profile')}>
              <motion.div
                className="relative flex items-center rounded-xl cursor-pointer select-none"
                style={{
                  padding: '10px',
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'visible',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={() => setHovered('__user__')}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-white font-black text-xs"
                    style={{ boxShadow: '0 0 12px rgba(34,211,238,0.38)' }}>
                    {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <motion.div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                    style={{ border: '1.5px solid rgba(3,9,24,1)', boxShadow: '0 0 3px rgba(52,211,153,0.5)' }}
                    animate={{ boxShadow: ['0 0 3px rgba(52,211,153,0.5)', '0 0 8px rgba(52,211,153,0.9)', '0 0 3px rgba(52,211,153,0.5)'] }}
                    transition={{ duration: 2.2, repeat: Infinity }} />
                </div>

                {/* Name + status — expanded only */}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div className="flex-1 min-w-0"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-[11px] font-bold text-slate-300 truncate leading-none">{user?.displayName ?? 'Usuario'}</p>
                      <p className="text-[7.5px] text-emerald-400/50 font-bold tracking-[0.18em] uppercase mt-0.5">{t('nav.online')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <FiUser size={10} className="text-slate-700 shrink-0" />
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for user when collapsed */}
                <AnimatePresence>
                  {collapsed && hovered === '__user__' && (
                    <NavTooltip label={user?.displayName ?? 'Perfil'} accentHex="#22d3ee" glowRgba="rgba(34,211,238,0.55)" />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* ════════════════════════════════════════════════════
          MOBILE NAV — auto-hide on scroll, spring reveal
      ════════════════════════════════════════════════════ */}
      <motion.nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        animate={{ y: mobileVisible ? 0 : 100, opacity: mobileVisible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      >
        <div style={{
          background: 'linear-gradient(180deg, rgba(2,6,18,0.88) 0%, rgba(3,9,24,0.98) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 -10px 48px rgba(0,0,0,0.65)',
        }}>
          {/* Dynamic top glow per active route */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 5%, ${activeItem?.accentHex ?? '#22d3ee'}55 50%, transparent 95%)` }} />

          <div className="grid grid-cols-4 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.originalHref === '/' && pathname === `/${locale}`);
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className="relative flex flex-col items-center gap-1 py-2.5 rounded-2xl overflow-hidden"
                    whileTap={{ scale: 0.88 }}
                    style={{
                      background: isActive ? item.bgRgba : 'transparent',
                      border: `1px solid ${isActive ? item.accentHex + '28' : 'transparent'}`,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {/* Top neon pill */}
                    {isActive && (
                      <motion.div
                        layoutId="mobileBar"
                        className="absolute -top-px left-1/2 -translate-x-1/2 rounded-full"
                        style={{ width: 22, height: 2, background: item.accentHex, boxShadow: `0 0 10px ${item.glowRgba}, 0 0 20px ${item.glowRgba}` }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.span
                      className="text-[18px] leading-none"
                      style={{ color: isActive ? item.accentHex : 'rgba(255,255,255,0.20)' }}
                      animate={isActive
                        ? { filter: [`drop-shadow(0 0 3px ${item.accentHex})`, `drop-shadow(0 0 9px ${item.accentHex})`, `drop-shadow(0 0 3px ${item.accentHex})`] }
                        : { filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className="text-[9px] font-black tracking-[0.05em] leading-none"
                      style={{
                        color: isActive ? item.accentHex : 'rgba(255,255,255,0.18)',
                        textShadow: isActive ? `0 0 8px ${item.glowRgba}` : 'none',
                        transition: 'all 0.25s',
                      }}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════════════════
          MOBILE FAB — floating pill to restore hidden nav
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!mobileVisible && (
          <motion.button
            className="lg:hidden fixed z-50 flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{
              bottom: 18,
              left: '50%',
              x: '-50%',
              background: 'linear-gradient(135deg, rgba(4,12,28,0.96), rgba(5,16,36,0.98))',
              border: '1px solid rgba(34,211,238,0.32)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              boxShadow: '0 8px 36px rgba(34,211,238,0.20), 0 2px 10px rgba(0,0,0,0.55)',
              cursor: 'pointer',
              outline: 'none',
            }}
            onClick={() => setMobileVisible(true)}
            initial={{ y: 28, opacity: 0, scale: 0.82 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 22, opacity: 0, scale: 0.84 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            whileHover={{ boxShadow: '0 12px 44px rgba(34,211,238,0.30)', scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '1px solid rgba(34,211,238,0.22)' }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <FiChevronUp size={14} style={{ color: '#22d3ee' }} />
            <span className="text-[10px] font-black text-cyan-300 tracking-[0.24em] uppercase">{t('nav.section')}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   HEADER — unchanged API, kept for all pages
══════════════════════════════════════════════════════════ */
export const Header: React.FC<{
  title?: string;
  subtitle?: string;
  centerContent?: React.ReactNode;
  centered?: boolean;
}> = ({ title, subtitle, centerContent, centered = false }) => {
  if (centered && !centerContent) {
    return (
      <header className="relative overflow-hidden bg-gradient-to-r from-[#08111f] via-[#0d1b2a] to-[#101a2f] text-white py-4 px-3 sm:px-4 rounded-b-2xl shadow-2xl border-b border-cyan-400/30">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
              {title && (
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Image src="/Logo_Pestaña.png" alt="Logo" width={64} height={64} className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" />
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={280} height={60} priority
                    className="h-8 sm:h-10 w-auto max-w-[70vw] sm:max-w-none object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] flex-shrink-0" />
                </div>
              )}
              {subtitle && <p className="text-[11px] sm:text-xs text-cyan-200/85 font-medium mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#08111f] via-[#0d1b2a] to-[#101a2f] text-white py-4 sm:py-5 lg:py-6 px-3 sm:px-4 rounded-b-2xl shadow-2xl border-b border-cyan-400/30">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-1 sm:px-2">
        <div className="flex flex-col gap-3 lg:min-h-[80px] lg:flex-row lg:items-center lg:justify-between">
          {centerContent && (
            <Link href="/profile" className="order-2 lg:order-1 w-full lg:w-auto">
              <motion.div whileHover={{ scale: 1.02, y: -2 }}
                className="w-full lg:w-[19rem] rounded-xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/12 via-emerald-400/8 to-cyan-400/10 px-3 sm:px-4 py-3 shadow-[0_8px_32px_rgba(6,182,212,0.15)] backdrop-blur-sm hover:border-cyan-300/60 hover:shadow-[0_12px_40px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer">
                {centerContent}
              </motion.div>
            </Link>
          )}
          <div className="order-1 lg:order-2 text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <div className="inline-flex flex-col items-center">
              {title && (
                <div className="mb-1 sm:mb-2 flex items-center justify-center gap-2">
                  <Image src="/Logo_Pestaña.png" alt="Logo" width={64} height={64} className="h-9 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0" />
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={280} height={60} priority
                    className="h-9 sm:h-10 lg:h-12 w-auto max-w-[72vw] sm:max-w-[65vw] lg:max-w-none object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] flex-shrink-0" />
                </div>
              )}
              {subtitle && <p className="text-[11px] sm:text-xs text-cyan-200/85 font-medium">{subtitle}</p>}
            </div>
          </div>
          <div className="hidden lg:block order-3 w-[19rem]" />
        </div>
      </div>
    </header>
  );
};

export default { Navigation, Header };
