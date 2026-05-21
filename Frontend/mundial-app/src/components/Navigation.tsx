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
  { key: 'home',        href: '/',            icon: <FiHome size={15} />,       accentHex: '#4CAF50', glowRgba: 'rgba(76,175,80,0.55)',   bgRgba: 'rgba(76,175,80,0.10)' },
  { key: 'calendar',    href: '/fixtures',    icon: <FiCalendar size={15} />,   accentHex: '#66BB6A', glowRgba: 'rgba(102,187,106,0.55)', bgRgba: 'rgba(102,187,106,0.10)' },
  { key: 'groups',      href: '/groups',      icon: <FiTarget size={15} />,     accentHex: '#388E3C', glowRgba: 'rgba(56,142,60,0.55)',   bgRgba: 'rgba(56,142,60,0.10)' },
  { key: 'predictions', href: '/predictions', icon: <FiTrendingUp size={15} />, accentHex: '#D4A72C', glowRgba: 'rgba(212,167,44,0.55)',  bgRgba: 'rgba(212,167,44,0.10)' },
];

/* ── Active orb glow behind selected item ── */
const ActiveOrb = ({ color }: { color: string }) => (
  <div
    className="absolute inset-0 pointer-events-none rounded-xl"
    style={{ background: `radial-gradient(ellipse at 25% 50%, ${color} 0%, transparent 68%)`, opacity: 0.8 }}
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
        background: 'linear-gradient(135deg, rgba(6,17,10,0.98), rgba(11,27,18,0.98))',
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
    ...(isAdmin ? [{ key: 'admin', label: t('nav.admin'), href: toLocalHref('/admin'), originalHref: '/admin', icon: <FiSettings size={15} />, accentHex: '#D32F2F', glowRgba: 'rgba(211,47,47,0.55)', bgRgba: 'rgba(211,47,47,0.10)' }] : []),
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
            background: 'linear-gradient(180deg, rgba(4,10,6,0.99) 0%, rgba(6,17,10,0.98) 50%, rgba(4,10,6,0.99) 100%)',
            borderRight: '1px solid rgba(76,175,80,0.08)',
            boxShadow: '4px 0 40px rgba(0,0,0,0.65), inset -1px 0 0 rgba(255,255,255,0.015)',
          }}
        >
          {/* Right-edge neon stripe */}
          <div
            className="absolute right-0 top-0 bottom-0"
            style={{ width: 1, background: `linear-gradient(180deg, transparent, ${activeItem?.accentHex ?? '#4CAF50'}45, transparent)`, opacity: 0.6 }}
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
            style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        {/* ─── Toggle pill button on the right edge ─── */}
        <motion.button
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute z-30 flex items-center justify-center"
          style={{
            right: -14, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 56, borderRadius: 14,
            background: 'linear-gradient(160deg, rgba(4,10,6,0.98), rgba(6,17,10,0.98))',
            border: '1px solid rgba(76,175,80,0.20)',
            boxShadow: '4px 0 18px rgba(0,0,0,0.55)',
            cursor: 'pointer',
            outline: 'none',
          }}
          whileHover={{
            scale: 1.08,
            borderColor: 'rgba(76,175,80,0.45)',
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <FiChevronRight size={13} style={{ color: 'rgba(76,175,80,0.75)' }} />
          </motion.div>
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
                      <div className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(76,175,80,0.20)', filter: 'blur(10px)', opacity: 0.5 }} />
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
                          style={{ background: 'rgba(76,175,80,0.25)', filter: 'blur(10px)' }}
                          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 3.2, repeat: Infinity }} />
                        <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={36} height={36} className="relative z-10 w-9 h-9 object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={110} height={26} className="h-[20px] w-auto object-contain"
                          style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 8px rgba(76,175,80,0.45)) brightness(1.2)' }} />
                      </div>
                    </div>
                  </Link>

                  {/* Mundial 2026 badge */}
                  <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-default overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.14), rgba(120,53,15,0.08))', border: '1px solid rgba(217,119,6,0.20)' }}
                  >
                    <FiZap size={9} className="shrink-0" style={{ color: '#D4AF37' } as any} />
                    <span className="text-[7.5px] font-black tracking-[0.22em] uppercase flex-1 truncate" style={{ color: 'rgba(212,175,55,0.80)' }}>{t('common.worldCup')}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {['#B31942', '#FFFFFF', '#002868'].map((c, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: i === 1 ? 0.5 : 1 }} />
                      ))}
                    </div>
                  </div>
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
                  className="text-[6.5px] font-black tracking-[0.38em] uppercase px-2 mb-2 mt-1 whitespace-nowrap text-orionix-text-muted"
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
                    <div
                      className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                      style={{
                        background: isActive ? item.bgRgba : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isActive ? item.accentHex + '30' : 'rgba(255,255,255,0.05)'}`,
                        color: isActive ? item.accentHex : isHov ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                        boxShadow: isActive ? `0 0 10px ${item.glowRgba}` : 'none',
                        transition: 'all 0.22s ease',
                      }}
                    >
                      {item.icon}
                    </div>

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
                  className="text-[6.5px] font-black tracking-[0.38em] uppercase px-2 mb-2 whitespace-nowrap text-orionix-text-muted"
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
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
                    style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', boxShadow: '0 0 12px rgba(76,175,80,0.30)' }}>
                    {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: '#4CAF50', border: '1.5px solid rgba(4,10,6,1)', boxShadow: '0 0 4px rgba(76,175,80,0.6)' }} />
                </div>

                {/* Name + status — expanded only */}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div className="flex-1 min-w-0"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-[11px] font-bold truncate leading-none text-orionix-text-secondary">{user?.displayName ?? 'Usuario'}</p>
                      <p className="text-[7.5px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'rgba(76,175,80,0.55)' }}>{t('nav.online')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <FiUser size={10} className="shrink-0" style={{ color: '#6E7C72' } as any} />
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for user when collapsed */}
                <AnimatePresence>
                  {collapsed && hovered === '__user__' && (
                    <NavTooltip label={user?.displayName ?? 'Perfil'} accentHex="#4CAF50" glowRgba="rgba(76,175,80,0.55)" />
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
          background: 'linear-gradient(180deg, rgba(6,17,10,0.88) 0%, rgba(6,17,10,0.98) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 -10px 48px rgba(0,0,0,0.65)',
        }}>
          {/* Dynamic top glow per active route */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 5%, ${activeItem?.accentHex ?? '#4CAF50'}55 50%, transparent 95%)` }} />

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
                    <span
                      className="text-[18px] leading-none"
                      style={{
                        color: isActive ? item.accentHex : 'rgba(255,255,255,0.20)',
                        filter: isActive ? `drop-shadow(0 0 6px ${item.accentHex})` : 'none',
                      }}
                    >
                      {item.icon}
                    </span>
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
              background: 'linear-gradient(135deg, rgba(6,17,10,0.96), rgba(11,27,18,0.98))',
              border: '1px solid rgba(76,175,80,0.32)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              boxShadow: '0 8px 36px rgba(76,175,80,0.20), 0 2px 10px rgba(0,0,0,0.55)',
              cursor: 'pointer',
              outline: 'none',
            }}
            onClick={() => setMobileVisible(true)}
            initial={{ y: 28, opacity: 0, scale: 0.82 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 22, opacity: 0, scale: 0.84 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            whileHover={{ boxShadow: '0 12px 44px rgba(76,175,80,0.30)', scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <FiChevronUp size={14} className="text-orionix-green-bright" />
            <span className="text-[10px] font-black tracking-[0.24em] uppercase text-orionix-green-muted">{t('nav.section')}</span>
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
      <header className="relative overflow-hidden text-white py-4 px-3 sm:px-4 rounded-b-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #06110A 0%, #0B1B12 50%, #102417 100%)', borderBottom: '1px solid rgba(27,94,32,0.40)' }}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,175,80,0.60), transparent)' }} />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
              {title && (
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Image src="/Logo_Pestaña.png" alt="Logo" width={64} height={64} className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" />
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={280} height={60} priority
                    className="h-8 sm:h-10 w-auto max-w-[70vw] sm:max-w-none object-contain drop-shadow-[0_0_10px_rgba(76,175,80,0.2)] flex-shrink-0" />
                </div>
              )}
              {subtitle && <p className="text-[11px] sm:text-xs font-medium mt-1" style={{ color: 'rgba(165,214,167,0.85)' }}>{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#04090A] via-[#0B1B12] to-[#102417] text-white py-4 sm:py-5 lg:py-6 px-3 sm:px-4 rounded-b-2xl shadow-2xl border-b border-green-800/40">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-1 sm:px-2">
        <div className="flex flex-col gap-3 lg:min-h-[80px] lg:flex-row lg:items-center lg:justify-between">
          {centerContent && (
            <Link href="/profile" className="order-2 lg:order-1 w-full lg:w-auto">
              <motion.div whileHover={{ scale: 1.02, y: -2 }}
                className="w-full lg:w-[19rem] rounded-xl px-3 sm:px-4 py-3 backdrop-blur-sm transition-all duration-300 cursor-pointer" style={{ border: '1px solid rgba(27,94,32,0.30)', background: 'linear-gradient(135deg, rgba(46,125,50,0.10), rgba(27,94,32,0.06), rgba(46,125,50,0.08))', boxShadow: '0 8px 32px rgba(46,125,50,0.15)' }}>
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
                    className="h-9 sm:h-10 lg:h-12 w-auto max-w-[72vw] sm:max-w-[65vw] lg:max-w-none object-contain drop-shadow-[0_0_10px_rgba(76,175,80,0.2)] flex-shrink-0" />
                </div>
              )}
              {subtitle && <p className="text-[11px] sm:text-xs text-green-200/85 font-medium">{subtitle}</p>}
            </div>
          </div>
          <div className="hidden lg:block order-3 w-[19rem]" />
        </div>
      </div>
    </header>
  );
};

export default { Navigation, Header };
