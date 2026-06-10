'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCalendar, FiLayers, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { IconBox } from './HomeUtils';

interface QuickAccessBentoProps {
  t: (key: string) => string;
}

const QuickAccessBento = ({ t }: QuickAccessBentoProps) => {
  const items = [
    {
      href:   '/fixtures',
      icon:   <FiCalendar />,
      label:  t('home.quick.matches'),
      desc:   'Consulta el calendario',
      accent: hex.green.bright,
      glow:   alphaOf('green', 0.55),
      bg:     alphaOf('green', 0.09),
    },
    {
      href:   '/groups',
      icon:   <FiLayers />,
      label:  t('home.quick.groups'),
      desc:   'Fase de grupos',
      accent: hex.green.hover,
      glow:   alphaOf('success', 0.55),
      bg:     alphaOf('success', 0.09),
    },
    {
      href:   '/predictions',
      icon:   <FiTrendingUp />,
      label:  t('home.quick.predictions'),
      desc:   'Tus porras',
      accent: hex.gold.base,
      glow:   alphaOf('gold', 0.55),
      bg:     alphaOf('gold', 0.09),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.60, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-3 gap-2 sm:gap-4 mt-6"
    >
      {items.map(({ href, icon, label, desc, accent, glow, bg }, i) => (
        <Link key={href} href={href} className="block">
          <motion.div
            whileHover={{ scale: 1.04, y: -7, boxShadow: `0 28px 56px ${glow}` }}
            whileTap={{ scale: 0.96 }}
            className="relative overflow-hidden rounded-2xl p-3 sm:p-5 text-center cursor-pointer h-full flex flex-col items-center"
            style={{
              background: `linear-gradient(160deg, ${bg} 0%, ${alpha(hex.bg.soft, 0.90)} 45%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
              border: `1px solid ${accent}30`,
              boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.06)}, 0 10px 36px ${alpha(hex.neutral.black, 0.50)}`,
              transition: 'box-shadow 0.28s ease, transform 0.22s ease',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64 + i * 0.08 }}
          >
            {/* Top gradient line */}
            <div className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}bb, transparent)` }} />

            {/* Corner ambient */}
            <div className="absolute -top-6 -right-6 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`, filter: 'blur(14px)', width: 80, height: 80 }} />

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <IconBox icon={icon} color={accent} size="lg" />
            </div>

            {/* Label: 13px — compacto pero legible */}
            <p className="text-[13px] font-black tracking-[0.16em] uppercase mb-2"
              style={{ color: accent, textShadow: `0 0 16px ${glow}` }}>
              {label}
            </p>

            {/* Desc: 12px mínimo, contraste real — oculto en mobile para no romper layout */}
            <p className="hidden sm:block text-[12px] font-medium mb-4 leading-relaxed" style={{ color: alpha(hex.neutral.white, 0.55) }}>
              {desc}
            </p>

            {/* CTA: 11px */}
            <div className="mt-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
              style={{
                background: alpha(accent, 0.12),
                border: `1px solid ${accent}32`,
              }}>
              <span className="text-[11px] font-black tracking-wider" style={{ color: accent }}>
                VER
              </span>
              <FiChevronRight size={10} style={{ color: accent }} />
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default QuickAccessBento;
