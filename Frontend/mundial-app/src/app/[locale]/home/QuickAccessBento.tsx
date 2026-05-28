'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCalendar, FiLayers, FiTrendingUp } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { IconBox, PitchMini } from './_components/HomeUtils';

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
      glow:   alphaOf('green', 0.45),
      bg:     alphaOf('green', 0.07),
    },
    {
      href:   '/groups',
      icon:   <FiLayers />,
      label:  t('home.quick.groups'),
      desc:   'Fase de grupos',
      accent: hex.green.hover,
      glow:   alphaOf('success', 0.45),
      bg:     alphaOf('success', 0.07),
    },
    {
      href:   '/predictions',
      icon:   <FiTrendingUp />,
      label:  t('home.quick.predictions'),
      desc:   'Tus porras',
      accent: hex.gold.base,
      glow:   alphaOf('gold', 0.45),
      bg:     alphaOf('gold', 0.07),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.60, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-3 gap-3 mt-4"
    >
      {items.map(({ href, icon, label, desc, accent, glow, bg }, i) => (
        <Link key={href} href={href}>
          <motion.div
            whileHover={{ scale: 1.04, y: -5, boxShadow: `0 20px 48px ${glow}` }}
            whileTap={{ scale: 0.96 }}
            className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer h-full"
            style={{
              background: `linear-gradient(155deg, ${bg} 0%, ${alpha(hex.bg.primary, 0.97)} 100%)`,
              border: `1px solid ${accent}22`,
              boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}, 0 8px 28px ${alpha(hex.neutral.black, 0.40)}`,
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64 + i * 0.08 }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` }} />
            <div className="absolute -top-5 -right-5 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, filter: 'blur(12px)', width: 64, height: 64 }} />

            <div className="flex justify-center mb-3.5">
              <IconBox icon={icon} color={accent} size="lg" />
            </div>

            <p className="text-[10.5px] font-black tracking-[0.18em] uppercase mb-1"
              style={{ color: accent, textShadow: `0 0 12px ${glow}` }}>
              {label}
            </p>

            <p className="text-[8px] font-medium mb-3" style={{ color: alpha(hex.neutral.white, 0.25) }}>
              {desc}
            </p>

            <div className="flex justify-center">
              <PitchMini color={accent} />
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default QuickAccessBento;
