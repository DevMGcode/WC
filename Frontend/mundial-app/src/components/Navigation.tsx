'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiTarget, FiTrendingUp, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/', icon: <FiHome /> },
  { label: 'Calendario', href: '/fixtures', icon: <FiCalendar /> },
  { label: 'Grupos', href: '/groups', icon: <FiTarget /> },
  { label: 'Porras', href: '/predictions', icon: <FiTrendingUp /> },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const visible = window.sessionStorage.getItem('orionix-dock-visible') === 'true';
    setIsDockVisible(visible);
  }, []);

  const showDock = () => {
    if (isDockVisible) return;

    setIsDockVisible(true);
    window.sessionStorage.setItem('orionix-dock-visible', 'true');
  };

  const shouldShowDockPrompt = pathname === '/' && isAuthenticated && !authLoading && !isDockVisible;

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed left-6 xl:left-8 top-48 xl:top-52 z-50">
        {shouldShowDockPrompt && (
          <motion.button
            type="button"
            onClick={showDock}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-[#05233e]/95 px-4 py-2 text-xs font-bold tracking-wide text-cyan-100 shadow-[0_14px_30px_rgba(2,6,23,0.45)]"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
            Haz clic para navegar
          </motion.button>
        )}

        {isDockVisible && (
          <motion.nav
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-b from-[#07192f] via-[#0a2740] to-[#081525] px-2 py-3 shadow-[0_24px_60px_rgba(2,6,23,0.7)]">
              <div className="relative flex flex-col items-center gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex w-[86px] flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all duration-300 ${
                        isActive
                          ? 'scale-[1.03] text-cyan-50 shadow-[0_14px_30px_rgba(6,182,212,0.32)]'
                          : 'text-slate-200 hover:translate-x-0.5 hover:text-cyan-100'
                      }`}
                    >
                      <span
                        className={`absolute inset-0 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? 'border-cyan-200/80 bg-gradient-to-br from-cyan-300/38 via-teal-400/24 to-sky-500/22'
                            : 'border-transparent group-hover:border-cyan-300/40 group-hover:bg-cyan-400/12'
                        }`}
                      />
                      <span className="relative text-2xl">{item.icon}</span>
                      <span className="relative text-xs font-bold tracking-wide">{item.label}</span>
                      {isActive && (
                        <motion.span
                          className="relative h-1.5 w-8 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                          animate={{ opacity: [0.65, 1, 0.65], scale: [0.96, 1.08, 0.96] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.nav>
        )}
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-t-2xl border-t border-cyan-300/35 bg-gradient-to-r from-[#07192f] via-[#0a2740] to-[#081525] px-1.5 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(2,6,23,0.55)]">
          <div className="relative grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-50'
                      : 'text-slate-200'
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'border border-cyan-200/75 bg-gradient-to-br from-cyan-300/34 via-teal-400/22 to-sky-500/20'
                        : 'border border-transparent'
                    }`}
                  />
                  <span className="relative text-lg">{item.icon}</span>
                  <span className="relative text-[10px] font-bold text-center">{item.label}</span>
                  {isActive && (
                    <span className="relative mt-0.5 h-1 w-5 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export const Header: React.FC<{ title?: string; subtitle?: string; centerContent?: React.ReactNode; centered?: boolean }> = ({
  title,
  subtitle,
  centerContent,
  centered = false,
}) => {
  const pathname = usePathname();
  if (centered && !centerContent) {
    return (
      <header className="relative overflow-hidden bg-gradient-to-r from-[#08111f] via-[#0d1b2a] to-[#101a2f] text-white py-4 px-4 rounded-b-2xl shadow-2xl border-b border-cyan-400/30">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-center">
          <div className="text-center">
            {title && (
              <div className="mb-1 inline-flex items-center gap-1.5">
                <Image
                  src="/Logo_Pestaña.png"
                  alt="Logo Icon"
                  width={64}
                  height={64}
                  className="h-10 w-auto object-contain flex-shrink-0"
                />
                <Image
                  src="/texto_logo_pestaña.png"
                  alt="Orionix Gol"
                  width={280}
                  height={60}
                  className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] flex-shrink-0"
                />
              </div>
            )}
            {subtitle && <p className="text-xs text-cyan-200/85 font-medium mt-1">{subtitle}</p>}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#08111f] via-[#0d1b2a] to-[#101a2f] text-white py-6 px-4 rounded-b-2xl shadow-2xl border-b border-cyan-400/30">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-2">
        <div className="flex items-center justify-between">
          {/* Left - User Info */}
          {centerContent && (
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="w-80 flex-shrink-0 rounded-xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/12 via-emerald-400/8 to-cyan-400/10 px-4 py-3 shadow-[0_8px_32px_rgba(6,182,212,0.15)] backdrop-blur-sm hover:border-cyan-300/60 hover:shadow-[0_12px_40px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer"
              >
                {centerContent}
              </motion.div>
            </Link>
          )}

          {/* Center - Logo and Subtitle (Absolute Center) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            {title && (
              <div className="mb-2 inline-flex items-center gap-2.5">
                <Image
                  src="/Logo_Pestaña.png"
                  alt="Logo Icon"
                  width={64}
                  height={64}
                  className="h-12 w-auto object-contain flex-shrink-0"
                />
                <Image
                  src="/texto_logo_pestaña.png"
                  alt="Orionix Gol"
                  width={280}
                  height={60}
                  className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] flex-shrink-0"
                />
              </div>
            )}
            {subtitle && <p className="text-xs text-cyan-200/85 font-medium">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default { Navigation, Header };
