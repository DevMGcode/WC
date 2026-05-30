'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { Particle } from './LoginParticles';

const PARTICLE_COUNT = 28;

export default function LoginBackground() {
  return (
    <>
      {/* Stadium spotlight */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 80% at 22% -5%, ${alpha(hex.accent.amber, 0.14)} 0%, rgba(120,53,15,0.06) 48%, transparent 72%)`,
      }} />
      {/* Green glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 45% 60% at 85% 50%, ${alpha(hex.green.hover, 0.08)} 0%, transparent 68%)`,
      }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, ${alpha(hex.neutral.black, 0.55)} 100%)`,
      }} />

      {/* Ambient orb — top left */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -150, background: `radial-gradient(circle, ${alpha(hex.green.hover, 0.10)} 0%, transparent 65%)`, filter: 'blur(70px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Ambient orb — bottom right */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -150, right: -120, background: `radial-gradient(circle, ${alpha(hex.green.base, 0.09)} 0%, transparent 65%)`, filter: 'blur(65px)' }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Tech grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.038]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lgrid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke={hex.green.bright} strokeWidth="0.5" />
          </pattern>
          <radialGradient id="lgfade" cx="30%" cy="50%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="lgm"><rect width="100%" height="100%" fill="url(#lgfade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#lgrid)" mask="url(#lgm)" />
      </svg>

      {/* Aurora sweep */}
      <motion.div className="absolute pointer-events-none inset-0"
        style={{ background: `linear-gradient(108deg, transparent 43%, ${alpha(hex.green.hover, 0.12)} 50%, ${alphaOf('green', 0.05)} 55%, transparent 62%)`, opacity: 0 }}
        animate={{ opacity: [0, 1, 0], x: ['-30%', '30%'] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 6, ease: [0.4, 0, 0.6, 1] }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => <Particle key={i} index={i} />)}
      </div>
    </>
  );
}
