'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface NavHeaderProps {
  title?: string;
  subtitle?: string;
  centerContent?: React.ReactNode;
  centered?: boolean;
}

export const NavHeader: React.FC<NavHeaderProps> = ({ title, subtitle, centerContent, centered = false }) => {
  if (centered && !centerContent) {
    return (
      <header className="relative overflow-hidden text-white py-4 px-3 sm:px-4 rounded-b-2xl shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${hex.bg.primary} 0%, ${hex.bg.secondary} 50%, ${hex.bg.elevated} 100%)`, borderBottom: `1px solid ${alpha(hex.green.dark, 0.40)}` }}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.60)}, transparent)` }} />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
              {title && (
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Image src="/Logo_Pestaña.png" alt="Logo" width={64} height={64} priority className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" />
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={280} height={60} priority
                    className="h-8 sm:h-10 w-auto max-w-[70vw] sm:max-w-none object-contain flex-shrink-0"
                    style={{ filter: `drop-shadow(0 0 10px ${alphaOf('green', 0.2)})` }} />
                </div>
              )}
              {subtitle && <p className="text-[11px] sm:text-xs font-medium mt-1" style={{ color: alpha(hex.green.soft, 0.85) }}>{subtitle}</p>}
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
                className="w-full lg:w-[19rem] rounded-xl px-3 sm:px-4 py-3 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                style={{ border: `1px solid ${alpha(hex.green.dark, 0.30)}`, background: `linear-gradient(135deg, ${alpha(hex.green.base, 0.10)}, ${alpha(hex.green.dark, 0.06)}, ${alpha(hex.green.base, 0.08)})`, boxShadow: `0 8px 32px ${alpha(hex.green.base, 0.15)}` }}>
                {centerContent}
              </motion.div>
            </Link>
          )}
          <div className="order-1 lg:order-2 text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <div className="inline-flex flex-col items-center">
              {title && (
                <div className="mb-1 sm:mb-2 flex items-center justify-center gap-2">
                  <Image src="/Logo_Pestaña.png" alt="Logo" width={64} height={64} priority className="h-9 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0" />
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={280} height={60} priority
                    className="h-9 sm:h-10 lg:h-12 w-auto max-w-[72vw] sm:max-w-[65vw] lg:max-w-none object-contain flex-shrink-0"
                    style={{ filter: `drop-shadow(0 0 10px ${alphaOf('green', 0.2)})` }} />
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
