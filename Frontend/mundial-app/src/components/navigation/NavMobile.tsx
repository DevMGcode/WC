'use client';

import React from 'react';
import Link from 'next/link';
import { FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import type { NavItem } from './navConfig';

interface NavMobileProps {
  navItems: NavItem[];
  mobileVisible: boolean;
  setMobileVisible: (v: boolean) => void;
  activeItem: NavItem | undefined;
  pathname: string;
  locale: string;
  t: (key: string) => string;
}

const MobileNavItem = React.memo(function MobileNavItem({
  item, isActive, locale,
}: { item: NavItem; isActive: boolean; locale: string }) {
  return (
    <Link href={item.href} prefetch={true}>
      <motion.div
        className="relative flex flex-col items-center gap-1 py-2.5 rounded-2xl overflow-hidden"
        whileTap={{ scale: 0.88 }}
        style={{
          background: isActive ? item.bgRgba : 'transparent',
          border: `1px solid ${isActive ? item.accentHex + '28' : 'transparent'}`,
          transition: 'all 0.25s ease',
        }}
      >
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
            color: isActive ? item.accentHex : alpha(hex.neutral.white, 0.20),
            filter: isActive ? `drop-shadow(0 0 6px ${item.accentHex})` : 'none',
          }}
        >
          {item.icon}
        </span>
        <span className="text-[9px] font-black tracking-[0.05em] leading-none"
          style={{
            color: isActive ? item.accentHex : alpha(hex.neutral.white, 0.18),
            textShadow: isActive ? `0 0 8px ${item.glowRgba}` : 'none',
            transition: 'all 0.25s',
          }}>
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
}, (prev, next) => prev.isActive === next.isActive);

export const NavMobile: React.FC<NavMobileProps> = ({
  navItems, mobileVisible, setMobileVisible, activeItem, pathname, locale, t,
}) => {
  return (
    <>
      {/* Bottom nav */}
      <motion.nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        animate={{ y: mobileVisible ? 0 : 100, opacity: mobileVisible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      >
        <div style={{
          background: `linear-gradient(180deg, ${alpha(hex.bg.primary, 0.88)} 0%, ${alpha(hex.bg.primary, 0.98)} 100%)`,
          borderTop: `1px solid ${alpha(hex.neutral.white, 0.05)}`,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: `0 -10px 48px ${alpha(hex.neutral.black, 0.65)}`,
        }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 5%, ${activeItem?.accentHex ?? hex.green.bright}55 50%, transparent 95%)` }} />

          <div className="grid px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
            {navItems.map((item) => (
              <MobileNavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.originalHref === '/' && pathname === `/${locale}`)}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </motion.nav>

      {/* FAB restore pill */}
      <AnimatePresence>
        {!mobileVisible && (
          <motion.button
            className="lg:hidden fixed z-50 flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{
              bottom: 18,
              left: '50%',
              x: '-50%',
              background: `linear-gradient(135deg, ${alpha(hex.bg.primary, 0.96)}, ${alpha(hex.bg.secondary, 0.98)})`,
              border: `1px solid ${alphaOf('green', 0.32)}`,
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              boxShadow: `0 8px 36px ${alphaOf('green', 0.20)}, 0 2px 10px ${alpha(hex.neutral.black, 0.55)}`,
              cursor: 'pointer',
              outline: 'none',
            }}
            onClick={() => setMobileVisible(true)}
            initial={{ y: 28, opacity: 0, scale: 0.82 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 22, opacity: 0, scale: 0.84 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            whileHover={{ boxShadow: `0 12px 44px ${alphaOf('green', 0.30)}`, scale: 1.06 }}
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
