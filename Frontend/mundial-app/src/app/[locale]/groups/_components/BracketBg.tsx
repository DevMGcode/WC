'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

/**
 * Fondo decorativo para el bracket en desktop (xl+).
 * Algunos colores (violeta #a78bfa) quedan como literales porque están
 * fuera de la paleta de marca — son acentos tipo aurora para el mood
 * "estadio de noche".
 */
const BracketBg = () => (
  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" style={{ zIndex: 0 }}>

    {/* Base deep-space gradient */}
    <div className="absolute inset-0"
      style={{ background: `radial-gradient(ellipse at 50% 8%, ${hex.bg.secondary} 0%, ${hex.bg.primary} 48%, ${hex.bg.primary} 100%)` }} />

    {/* Nebula blobs */}
    {([
      { x: 10, y: 22, w: 520, h: 320, col: alphaOf('green', 0.10),   blur: 72, dur: 14, dx: [0,44,-26,0], dy: [0,-30,20,0]  },
      { x: 87, y: 20, w: 420, h: 310, col: 'rgba(167,139,250,0.09)', blur: 65, dur: 19, dx: [0,-36,20,0], dy: [0,28,-18,0]  },
      { x: 50, y: 80, w: 640, h: 260, col: alphaOf('gold', 0.07),    blur: 82, dur: 24, dx: [0,24,-32,0], dy: [0,-18, 12,0] },
      { x: 22, y: 74, w: 360, h: 360, col: alphaOf('success', 0.07), blur: 58, dur: 17, dx: [0,-24,34,0], dy: [0,18,-24,0]  },
      { x: 76, y: 64, w: 380, h: 340, col: alphaOf('green', 0.07),   blur: 66, dur: 22, dx: [0,30,-18,0], dy: [0,-30,34,0]  },
    ] as { x:number;y:number;w:number;h:number;col:string;blur:number;dur:number;dx:number[];dy:number[] }[]).map((o, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ width: o.w, height: o.h, left: `${o.x}%`, top: `${o.y}%`,
          background: `radial-gradient(ellipse, ${o.col} 0%, transparent 65%)`,
          filter: `blur(${o.blur}px)`, transform: 'translate(-50%,-50%)' }}
        animate={{ x: o.dx, y: o.dy, scale: [1, 1.20, 0.93, 1] }}
        transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }} />
    ))}

    {/* Neon light pillars */}
    {([
      { x: 13, col: hex.green.bright, op: 0.055, dur: 6,  del: 0.0 },
      { x: 28, col: '#a78bfa',        op: 0.040, dur: 9,  del: 1.8 },
      { x: 50, col: hex.gold.muted,   op: 0.065, dur: 5,  del: 0.6 },
      { x: 72, col: '#a78bfa',        op: 0.040, dur: 10, del: 2.4 },
      { x: 87, col: hex.green.bright, op: 0.055, dur: 7,  del: 1.2 },
    ] as { x:number;col:string;op:number;dur:number;del:number }[]).map((b, i) => (
      <motion.div key={i} className="absolute top-0 bottom-0 w-px"
        style={{ left: `${b.x}%`,
          background: `linear-gradient(180deg, transparent 0%, ${b.col} 25%, ${b.col} 75%, transparent 100%)`,
          filter: 'blur(1px)' }}
        animate={{ opacity: [0, b.op * 3, 0] }}
        transition={{ duration: b.dur, repeat: Infinity, delay: b.del, ease: 'easeInOut' }} />
    ))}

    {/* Aurora sweeps */}
    <motion.div className="absolute inset-0"
      style={{ background: `linear-gradient(115deg, transparent 18%, ${alphaOf('green', 0.045)} 38%, rgba(167,139,250,0.030) 58%, transparent 78%)` }}
      animate={{ x: ['-42%', '42%'] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'linear', repeatType: 'mirror' }} />
    <motion.div className="absolute inset-0"
      style={{ background: `linear-gradient(248deg, transparent 22%, ${alphaOf('gold', 0.030)} 44%, ${alphaOf('success', 0.022)} 62%, transparent 80%)` }}
      animate={{ x: ['32%', '-32%'] }}
      transition={{ duration: 29, repeat: Infinity, ease: 'linear', repeatType: 'mirror' }} />

    {/* Rotating energy rings */}
    {([
      { cx: 50, cy: 47, r: 40, col: hex.green.bright, op: 0.10, sw: 0.18, dash: '2 5', dur: 90,  rev: false },
      { cx: 50, cy: 47, r: 28, col: '#a78bfa',        op: 0.08, sw: 0.13, dash: '3 6', dur: 68,  rev: true  },
      { cx: 50, cy: 47, r: 54, col: hex.gold.muted,   op: 0.05, sw: 0.12, dash: '1 6', dur: 110, rev: true  },
      { cx: 18, cy: 26, r: 14, col: hex.green.bright, op: 0.09, sw: 0.14, dash: '2 4', dur: 48,  rev: false },
      { cx: 82, cy: 70, r: 17, col: hex.gold.muted,   op: 0.07, sw: 0.13, dash: '3 5', dur: 62,  rev: true  },
    ] as { cx:number;cy:number;r:number;col:string;op:number;sw:number;dash:string;dur:number;rev:boolean }[]).map((ring, i) => (
      <motion.svg key={i} className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        animate={{ rotate: ring.rev ? -360 : 360 }}
        style={{ transformOrigin: `${ring.cx}% ${ring.cy}%` }}
        transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}>
        <circle cx={ring.cx} cy={ring.cy} r={ring.r}
          fill="none" stroke={ring.col} strokeWidth={ring.sw}
          strokeDasharray={ring.dash} opacity={ring.op} />
      </motion.svg>
    ))}

    {/* Golden radiance */}
    <motion.div className="absolute"
      style={{ left: '50%', top: '45%', width: 520, height: 520,
        background: `radial-gradient(circle, ${alphaOf('gold', 0.12)} 0%, ${alphaOf('gold', 0.04)} 28%, transparent 58%)`,
        filter: 'blur(38px)', transform: 'translate(-50%,-50%)' }}
      animate={{ scale: [1, 1.32, 1], opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />

    {/* Corner flares */}
    {([
      { cls: 'top-0 left-0',     bg: `radial-gradient(circle at 0% 0%, ${alphaOf('green', 0.16)} 0%, transparent 52%)`    },
      { cls: 'top-0 right-0',    bg: 'radial-gradient(circle at 100% 0%, rgba(167,139,250,0.13) 0%, transparent 52%)'    },
      { cls: 'bottom-0 left-0',  bg: `radial-gradient(circle at 0% 100%, ${alphaOf('success', 0.11)} 0%, transparent 52%)` },
      { cls: 'bottom-0 right-0', bg: `radial-gradient(circle at 100% 100%, ${alphaOf('gold', 0.11)} 0%, transparent 52%)` },
    ] as { cls:string; bg:string }[]).map((c, i) => (
      <motion.div key={i} className={`absolute w-72 h-72 ${c.cls}`}
        style={{ background: c.bg }}
        animate={{ opacity: [0.30, 0.88, 0.30] }}
        transition={{ duration: 5.5 + i * 1.4, repeat: Infinity, delay: i * 0.9 }} />
    ))}

    {/* Inner vignette */}
    <div className="absolute inset-0"
      style={{ background: `radial-gradient(ellipse at 50% 46%, transparent 22%, ${alpha('#01060E', 0.28)} 100%)` }} />
  </div>
);

export default BracketBg;
