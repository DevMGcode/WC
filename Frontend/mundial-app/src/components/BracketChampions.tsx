'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

/* ── Animated background (kept for showBg=true) ── */
const AnimatedBackground = ({ constrained = false }: { constrained?: boolean }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`${constrained ? 'absolute inset-0' : 'fixed inset-0'} -z-10 overflow-hidden bg-slate-950`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
      <motion.div className="absolute w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl"
        animate={{ x: mousePosition.x - 192, y: mousePosition.y - 192 }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        style={{ pointerEvents: 'none', filter: 'blur(80px)' }} />
      <motion.div className="absolute top-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
        style={{ pointerEvents: 'none' }} />
      <motion.div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"
        style={{ pointerEvents: 'none' }} />
      <svg className="absolute inset-0 w-full h-full opacity-5" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid-bg" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <linearGradient id="gridGradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridGradient-bg)" />
        <rect width="100%" height="100%" fill="url(#grid-bg)" className="text-cyan-400" />
      </svg>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
    </div>
  );
};

/* ── Types ── */
interface Team {
  id: number;
  name: string;
  shortName: string;
  flagUrl: string;
  logo?: string;
}
interface Match {
  id: number;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  winner?: Team | null;
  isPlayed?: boolean;
}
interface BracketData {
  octavos: Match[];
  cuartos: Match[];
  semifinales: Match[];
  final: Match[];
}
interface BracketProps {
  data: BracketData;
  showBg?: boolean;
}

/* ── Premium Round Label ── */
const RoundLabel = ({ label, isFinal = false }: { label: string; isFinal?: boolean }) => (
  <div className="text-center mb-2">
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{
        background: isFinal ? 'rgba(251,191,36,0.08)' : 'rgba(34,211,238,0.06)',
        border: `1px solid ${isFinal ? 'rgba(251,191,36,0.28)' : 'rgba(34,211,238,0.20)'}`,
        boxShadow: isFinal ? '0 0 14px rgba(251,191,36,0.14)' : '0 0 12px rgba(34,211,238,0.10)',
      }}>
      <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: isFinal ? '#fbbf24' : '#22d3ee' }}
        animate={{
          boxShadow: isFinal
            ? ['0 0 4px #fbbf2480', '0 0 10px #fbbf24', '0 0 4px #fbbf2480']
            : ['0 0 4px #22d3ee80', '0 0 10px #22d3ee', '0 0 4px #22d3ee80'],
        }}
        transition={{ duration: 2.2, repeat: Infinity }} />
      <span className="text-[8px] font-black tracking-[0.22em] uppercase whitespace-nowrap"
        style={{ color: isFinal ? '#fbbf24' : '#22d3ee' }}>
        {label}
      </span>
    </div>
  </div>
);

/* ── Premium Team Badge ── */
const TeamBadge = ({
  team, score, isWinner, size = 'md',
}: {
  team: Team | null; score?: number; isWinner?: boolean; size?: 'sm' | 'md' | 'lg';
}) => {
  const h        = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-14' : 'h-11';
  const flagCls  = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  const flagSz   = size === 'sm' ? '20px' : size === 'lg' ? '36px' : '28px';
  const textCls  = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';
  const scoreCls = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';

  if (!team || !team.flagUrl) {
    return (
      <div className={`${h} flex items-center gap-2 rounded-lg px-2`}
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className={`shrink-0 ${flagCls} rounded-full flex items-center justify-center`}
          style={{ border: '1.5px dashed rgba(148,163,184,0.18)', background: 'rgba(255,255,255,0.03)' }} />
        <span className={`font-black flex-1 truncate ${textCls}`}
          style={{ color: 'rgba(148,163,184,0.28)', letterSpacing: '0.1em' }}>TBD</span>
      </div>
    );
  }

  return (
    <div className={`${h} flex items-center gap-2 rounded-lg px-2 relative overflow-hidden`}
      style={{
        background: isWinner
          ? 'linear-gradient(90deg, rgba(34,211,238,0.14), rgba(34,211,238,0.04))'
          : 'rgba(255,255,255,0.015)',
        border: `1px solid ${isWinner ? 'rgba(34,211,238,0.38)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 0.2s',
      }}>
      {isWinner && (
        <div className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
          style={{ background: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.90)' }} />
      )}
      <div className={`relative shrink-0 ${flagCls} rounded-full overflow-hidden`}
        style={{
          border: `1.5px solid ${isWinner ? 'rgba(34,211,238,0.55)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isWinner ? '0 0 8px rgba(34,211,238,0.45)' : 'none',
        }}>
        <Image src={team.flagUrl} alt={team.name} fill sizes={flagSz} className="object-cover" unoptimized />
      </div>
      <span className={`font-black flex-1 truncate ${textCls}`}
        style={{
          color: isWinner ? '#22d3ee' : 'rgba(148,163,184,0.78)',
          textShadow: isWinner ? '0 0 12px rgba(34,211,238,0.65)' : 'none',
        }}>
        {team.shortName}
      </span>
      {score !== undefined && (
        <span className={`font-black shrink-0 tabular-nums ${scoreCls} w-5 text-center`}
          style={{
            color: isWinner ? '#22d3ee' : 'rgba(71,85,105,0.65)',
            textShadow: isWinner ? '0 0 10px rgba(34,211,238,0.70)' : 'none',
          }}>
          {score}
        </span>
      )}
    </div>
  );
};

/* ── Premium Match Box ── */
const MatchBox = ({
  match, size = 'md', isFinal = false,
}: {
  match: Match; size?: 'sm' | 'md' | 'lg'; isFinal?: boolean;
}) => {
  const homeWon = !!(match.winner?.id === match.homeTeam?.id && match.isPlayed);
  const awayWon = !!(match.winner?.id === match.awayTeam?.id && match.isPlayed);
  const accent  = isFinal ? '#fbbf24' : '#22d3ee';
  const w       = size === 'sm' ? 'w-36' : size === 'lg' ? 'w-52' : 'w-44';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28 }}
      className={`relative overflow-hidden rounded-xl ${w}`}
      style={{
        background: isFinal
          ? 'linear-gradient(145deg, rgba(14,10,2,0.98), rgba(22,16,4,0.96))'
          : 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.95))',
        border: `1px solid ${accent}${isFinal ? '28' : '18'}`,
        backdropFilter: 'blur(22px)',
        boxShadow: isFinal
          ? `0 10px 36px rgba(0,0,0,0.72), 0 0 28px rgba(251,191,36,0.12)`
          : `0 8px 28px rgba(0,0,0,0.56)`,
      }}>
      {/* Top neon accent line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
      {/* Final ambient glow */}
      {isFinal && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-xl"
          animate={{ opacity: [0, 0.05, 0] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.25), transparent 65%)' }} />
      )}
      {/* Teams */}
      <div className="p-1.5 flex flex-col gap-1">
        <TeamBadge team={match.homeTeam} score={match.homeScore} isWinner={homeWon} size={size} />
        <div className="h-px mx-1.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />
        <TeamBadge team={match.awayTeam} score={match.awayScore} isWinner={awayWon} size={size} />
      </div>
    </motion.div>
  );
};

/* ── Premium SVG Connector Lines ── */
const BracketConnectorsSymmetric = React.forwardRef<HTMLDivElement, {
  octavosLeftRefs:    React.MutableRefObject<(HTMLDivElement | null)[]>;
  cuartosLeftRefs:    React.MutableRefObject<(HTMLDivElement | null)[]>;
  semifinalesLeftRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  octavosRightRefs:   React.MutableRefObject<(HTMLDivElement | null)[]>;
  cuartosRightRefs:   React.MutableRefObject<(HTMLDivElement | null)[]>;
  semifinalesRightRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  finalRef:           React.MutableRefObject<HTMLDivElement | null>;
  containerRef:       React.MutableRefObject<HTMLDivElement | null>;
}>(({ octavosLeftRefs, cuartosLeftRefs, semifinalesLeftRefs, octavosRightRefs, cuartosRightRefs, semifinalesRightRefs, finalRef, containerRef }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [paths, setPaths] = React.useState<Array<{ d: string; id: string; isFinal: boolean }>>([]);

  React.useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const updatePaths = () => {
      const container = containerRef.current;
      if (!container) return;

      const cRect = container.getBoundingClientRect();
      const newPaths: Array<{ d: string; id: string; isFinal: boolean }> = [];

      const getY      = (r: HTMLDivElement | null) => r ? r.getBoundingClientRect().top  - cRect.top  + r.getBoundingClientRect().height / 2 : 0;
      const getXRight = (r: HTMLDivElement | null) => r ? r.getBoundingClientRect().right - cRect.left : 0;
      const getXLeft  = (r: HTMLDivElement | null) => r ? r.getBoundingClientRect().left  - cRect.left : 0;

      const mkPath = (y1: number, y2: number, x1: number, x2: number) => {
        const mx = (x1 + x2) / 2;
        return `M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2} ${x2} ${y2}`;
      };

      /* ── LEFT: oct(0-3) → cua(0-1) → semi-L → final ── */
      for (let i = 0; i < 4; i += 2) {
        const ti = Math.floor(i / 2);
        const yT = getY(cuartosLeftRefs.current[ti]);
        const x1 = getXRight(octavosLeftRefs.current[i]);
        const x2 = getXLeft(cuartosLeftRefs.current[ti]);
        newPaths.push({ d: mkPath(getY(octavosLeftRefs.current[i]),   yT, x1, x2), id: `ol${i}`,   isFinal: false });
        newPaths.push({ d: mkPath(getY(octavosLeftRefs.current[i+1]), yT, x1, x2), id: `ol${i+1}`, isFinal: false });
      }
      for (let i = 0; i < 2; i++) {
        newPaths.push({ d: mkPath(getY(cuartosLeftRefs.current[i]), getY(semifinalesLeftRefs.current[0]),
          getXRight(cuartosLeftRefs.current[i]), getXLeft(semifinalesLeftRefs.current[0])), id: `cl${i}`, isFinal: false });
      }
      const yFinal = getY(finalRef.current);
      const xFinal = (getXLeft(finalRef.current) + getXRight(finalRef.current)) / 2;
      newPaths.push({ d: mkPath(getY(semifinalesLeftRefs.current[0]), yFinal, getXRight(semifinalesLeftRefs.current[0]), xFinal), id: 'sfl', isFinal: true });

      /* ── RIGHT: oct(4-7) → cua(2-3) → semi-R → final ── */
      for (let i = 0; i < 4; i += 2) {
        const ti = Math.floor(i / 2);
        const yT = getY(cuartosRightRefs.current[ti]);
        const x1 = getXLeft(octavosRightRefs.current[i]);
        const x2 = getXRight(cuartosRightRefs.current[ti]);
        newPaths.push({ d: mkPath(getY(octavosRightRefs.current[i]),   yT, x1, x2), id: `or${i}`,   isFinal: false });
        newPaths.push({ d: mkPath(getY(octavosRightRefs.current[i+1]), yT, x1, x2), id: `or${i+1}`, isFinal: false });
      }
      for (let i = 0; i < 2; i++) {
        newPaths.push({ d: mkPath(getY(cuartosRightRefs.current[i]), getY(semifinalesRightRefs.current[0]),
          getXLeft(cuartosRightRefs.current[i]), getXRight(semifinalesRightRefs.current[0])), id: `cr${i}`, isFinal: false });
      }
      newPaths.push({ d: mkPath(getY(semifinalesRightRefs.current[0]), yFinal, getXLeft(semifinalesRightRefs.current[0]), xFinal), id: 'sfr', isFinal: true });

      setPaths(newPaths);
    };

    updatePaths();

    // Fire at multiple intervals to cover tab-switch animations and layout settling
    const timers = [80, 200, 400, 700, 1100, 1800].map(ms => setTimeout(updatePaths, ms));

    // Recalculate whenever the bracket scrolls into view
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        updatePaths();
        setTimeout(updatePaths, 150);
        setTimeout(updatePaths, 450);
      }
    }, { threshold: 0.05 });
    if (containerRef.current) io.observe(containerRef.current);

    // Recalculate on any size change of the container
    const ro = new ResizeObserver(updatePaths);
    if (containerRef.current) ro.observe(containerRef.current);

    window.addEventListener('resize', updatePaths);
    return () => {
      timers.forEach(clearTimeout);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', updatePaths);
    };
  }, []);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5, overflow: 'visible' }}>
      <defs>
        <filter id="bc-glow-cyan" x="-60%" y="-100%" width="220%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
        </filter>
        <filter id="bc-glow-gold" x="-60%" y="-100%" width="220%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
        </filter>
      </defs>
      {paths.map((path) => {
        const color   = path.isFinal ? '#fbbf24' : '#22d3ee';
        const dashArr = path.isFinal ? '10 6' : '5 4';
        const period  = path.isFinal ? 16 : 9;
        return (
          <g key={path.id}>
            {/* Bloom glow */}
            <path d={path.d} stroke={color} strokeWidth={10} fill="none"
              strokeLinecap="round" opacity={0.10}
              filter={`url(#bc-glow-${path.isFinal ? 'gold' : 'cyan'})`} />
            {/* Ghost base track */}
            <path d={path.d} stroke={color} strokeWidth={1} fill="none"
              strokeLinecap="round" opacity={0.07} />
            {/* Animated flowing neon dashes */}
            <motion.path
              d={path.d}
              stroke={color}
              strokeWidth={path.isFinal ? 1.8 : 1.4}
              fill="none"
              strokeDasharray={dashArr}
              strokeLinecap="round"
              style={{ opacity: path.isFinal ? 0.92 : 0.68 }}
              animate={{ strokeDashoffset: [period, 0] }}
              transition={{ duration: path.isFinal ? 0.9 : 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </g>
        );
      })}
    </svg>
  );
});

BracketConnectorsSymmetric.displayName = 'BracketConnectorsSymmetric';

/* ── Bracket ── */
export const Bracket = ({ data, showBg = false }: BracketProps) => {
  const containerRef          = React.useRef<HTMLDivElement>(null);
  const octavosLeftRefs       = React.useRef<(HTMLDivElement | null)[]>([]);
  const cuartosLeftRefs       = React.useRef<(HTMLDivElement | null)[]>([]);
  const semifinalesLeftRefs   = React.useRef<(HTMLDivElement | null)[]>([]);
  const octavosRightRefs      = React.useRef<(HTMLDivElement | null)[]>([]);
  const cuartosRightRefs      = React.useRef<(HTMLDivElement | null)[]>([]);
  const semifinalesRightRefs  = React.useRef<(HTMLDivElement | null)[]>([]);
  const finalRef              = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full relative">
      <div className="relative z-10 w-full pb-6">
        <div className="p-4 relative w-full max-w-7xl mx-auto" ref={containerRef} style={{ minHeight: 600 }}>
          {showBg && <AnimatedBackground constrained />}
          <BracketConnectorsSymmetric
            octavosLeftRefs={octavosLeftRefs}       cuartosLeftRefs={cuartosLeftRefs}
            semifinalesLeftRefs={semifinalesLeftRefs} octavosRightRefs={octavosRightRefs}
            cuartosRightRefs={cuartosRightRefs}     semifinalesRightRefs={semifinalesRightRefs}
            finalRef={finalRef}                     containerRef={containerRef}
          />

          <div className="flex gap-3 items-center justify-center relative" style={{ zIndex: 10 }}>

            {/* OCTAVOS LEFT (0–3) */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col gap-1">
              <RoundLabel label="Octavos" />
              <div className="flex flex-col gap-2">
                {data.octavos.slice(0, 4).map((match, idx) => (
                  <motion.div key={match.id}
                    ref={(el) => { if (el) octavosLeftRefs.current[idx] = el; }}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}>
                    <MatchBox match={match} size="sm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CUARTOS LEFT (0–1) */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-1 items-center">
              <RoundLabel label="Cuartos" />
              <div className="flex flex-col gap-24">
                {data.cuartos.slice(0, 2).map((match, idx) => (
                  <motion.div key={match.id}
                    ref={(el) => { if (el) cuartosLeftRefs.current[idx] = el; }}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.03 }}>
                    <MatchBox match={match} size="sm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* SEMIFINAL LEFT */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-1 items-center h-full justify-center">
              <RoundLabel label="Semifinal" />
              <div ref={(el) => { if (el) semifinalesLeftRefs.current[0] = el; }}>
                <MatchBox match={data.semifinales[0]} size="sm" />
              </div>
            </motion.div>

            {/* FINAL (CENTER) */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-2 px-4">
              <RoundLabel label="Final" isFinal />
              <div ref={finalRef}>
                <MatchBox match={data.final[0]} size="md" isFinal />
              </div>
            </motion.div>

            {/* SEMIFINAL RIGHT */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-1 items-center h-full justify-center">
              <RoundLabel label="Semifinal" />
              <div ref={(el) => { if (el) semifinalesRightRefs.current[0] = el; }}>
                <MatchBox match={data.semifinales[1]} size="sm" />
              </div>
            </motion.div>

            {/* CUARTOS RIGHT (2–3) */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-1 items-center">
              <RoundLabel label="Cuartos" />
              <div className="flex flex-col gap-24">
                {data.cuartos.slice(2, 4).map((match, idx) => (
                  <motion.div key={match.id}
                    ref={(el) => { if (el) cuartosRightRefs.current[idx] = el; }}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.03 }}>
                    <MatchBox match={match} size="sm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* OCTAVOS RIGHT (4–7) */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col gap-1">
              <RoundLabel label="Octavos" />
              <div className="flex flex-col gap-2">
                {data.octavos.slice(4, 8).map((match, idx) => (
                  <motion.div key={match.id}
                    ref={(el) => { if (el) octavosRightRefs.current[idx] = el; }}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}>
                    <MatchBox match={match} size="sm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
