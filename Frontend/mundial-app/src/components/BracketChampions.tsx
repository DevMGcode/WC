'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Componente de fondo animado 3D
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Gradiente base animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
      
      {/* Efecto de luz dinámica que sigue al mouse - Cyan */}
      <motion.div
        className="absolute w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        style={{ pointerEvents: 'none', filter: 'blur(80px)' }}
      />

      {/* Efecto de luz flotante - Teal */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
        animate={{
          x: Math.sin(Date.now() / 5000) * 50,
          y: Math.cos(Date.now() / 3000) * 50,
        }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Efecto de luz adicional - Verde */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          x: Math.sin(Date.now() / 7000) * 40,
        }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Grilla animada de fondo */}
      <svg className="absolute inset-0 w-full h-full opacity-5" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridGradient)" />
        <rect width="100%" height="100%" fill="url(#grid)" className="text-cyan-400" />
      </svg>

      {/* Líneas flotantes horizontales animadas */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px"
          style={{
            width: '200%',
            left: '-50%',
            top: `${15 + i * 25}%`,
            background: `linear-gradient(90deg, transparent, ${
              i % 2 === 0 ? 'rgba(34, 211, 238, 0.3)' : 'rgba(20, 184, 166, 0.2)'
            }, transparent)`,
            opacity: 0.6,
          }}
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 25 + i * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        />
      ))}

      {/* Círculos decorativos flotantes con rotación */}
      <motion.div
        className="absolute top-10 left-5 w-40 h-40 border border-cyan-400/40 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{ pointerEvents: 'none' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-56 h-56 border-2 border-teal-400/25 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Rectángulos flotantes con movimiento 3D */}
      <motion.div
        className="absolute top-1/3 left-1/5 w-32 h-32 border-2 border-cyan-500/30 rounded-lg"
        animate={{ 
          y: [0, 40, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      />

      <motion.div
        className="absolute top-2/3 right-1/5 w-28 h-28 border-2 border-teal-500/25 rounded-full"
        animate={{ 
          y: [0, -50, 0],
          x: [0, 30, 0],
          scale: [1, 0.95, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Pequeños elementos flotantes adicionales */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
          animate={{
            y: [Math.random() * 100, Math.random() * -100],
            x: [Math.random() * 100, Math.random() * -100],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Efecto vignette - bordes oscuros */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)'
        }}
      />

      {/* Overlay sutil para oscurecer sin afectar contraste */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/30" />
    </div>
  );
};

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
}

// Componente para mostrar un equipo
const TeamBadge = ({ 
  team, 
  score, 
  isWinner, 
  size = 'md' 
}: { 
  team: Team | null; 
  score?: number; 
  isWinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  if (!team) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-lg bg-slate-800/40 border border-slate-700/60 backdrop-blur
          ${size === 'sm' ? 'h-10 px-2' : size === 'lg' ? 'h-14 px-3' : 'h-12 px-3'}
        `}
      >
        <span className={`text-slate-500 font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          Pendiente
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center gap-2 rounded-lg px-3 transition-all border
        ${size === 'sm' ? 'h-10 px-2' : size === 'lg' ? 'h-14 px-3' : 'h-12 px-3'}
        ${isWinner 
          ? 'bg-gradient-to-r from-teal-700 to-teal-800 border-teal-500 shadow-lg shadow-teal-500/50' 
          : 'bg-slate-800/60 border-slate-700'
        }
      `}
    >
      <div className={`flex-shrink-0 rounded-full overflow-hidden border-2 ${size === 'sm' ? 'w-8 h-8 border-cyan-400/60' : size === 'lg' ? 'w-12 h-12 border-cyan-400/60' : 'w-10 h-10 border-cyan-400/60'} shadow-lg shadow-cyan-500/30`}>
        <Image
          src={team.flagUrl}
          alt={team.name}
          width={size === 'sm' ? 32 : size === 'lg' ? 48 : 40}
          height={size === 'sm' ? 32 : size === 'lg' ? 48 : 40}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      <span className={`font-bold text-white flex-1 truncate ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {team.shortName}
      </span>

      {score !== undefined && (
        <span className={`font-black flex-shrink-0 ${size === 'sm' ? 'text-xs w-3' : size === 'lg' ? 'text-lg w-5' : 'text-sm w-4'} text-center ${isWinner ? 'text-cyan-100' : 'text-slate-400'}`}>
          {score}
        </span>
      )}
    </motion.div>
  );
};

// Componente para un partido
const MatchBox = ({ 
  match, 
  size = 'md'
}: { 
  match: Match; 
  size?: 'sm' | 'md' | 'lg';
}) => {
  const homeWon = match.winner?.id === match.homeTeam?.id;
  const awayWon = match.winner?.id === match.awayTeam?.id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-1.5 bg-slate-900/60 p-2 rounded-lg backdrop-blur border border-slate-700/50 ${size === 'lg' ? 'w-48 gap-2 p-3' : size === 'sm' ? 'w-40 gap-1.5 p-2' : 'w-44 gap-1.5'}`}
    >
      <TeamBadge
        team={match.homeTeam}
        score={match.homeScore}
        isWinner={homeWon}
        size={size}
      />

      <div className={`h-px bg-gradient-to-r from-cyan-500/40 via-cyan-400/70 to-cyan-500/40`}></div>

      <TeamBadge
        team={match.awayTeam}
        score={match.awayScore}
        isWinner={awayWon}
        size={size}
      />
    </motion.div>
  );
};

// Componente para las líneas de conexión SVG - Nueva distribución
const BracketConnectorsSymmetric = React.forwardRef<HTMLDivElement, { 
  octavosLeftRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  cuartosLeftRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  semifinalesLeftRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  octavosRightRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  cuartosRightRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  semifinalesRightRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  finalRef: React.MutableRefObject<HTMLDivElement | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}>(({ octavosLeftRefs, cuartosLeftRefs, semifinalesLeftRefs, octavosRightRefs, cuartosRightRefs, semifinalesRightRefs, finalRef, containerRef }, ref) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [paths, setPaths] = React.useState<Array<{ d: string; id: string; isFinal: boolean }>>([]);

  React.useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const updatePaths = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newPaths: Array<{ d: string; id: string; isFinal: boolean }> = [];

      const getY = (ref: HTMLDivElement | null) => {
        if (!ref) return 0;
        const rect = ref.getBoundingClientRect();
        return rect.top - containerRect.top + rect.height / 2;
      };

      const getXRight = (ref: HTMLDivElement | null) => {
        if (!ref) return 0;
        const rect = ref.getBoundingClientRect();
        return rect.right - containerRect.left;
      };

      const getXLeft = (ref: HTMLDivElement | null) => {
        if (!ref) return 0;
        const rect = ref.getBoundingClientRect();
        return rect.left - containerRect.left;
      };

      const createPath = (y1: number, y2: number, x1: number, x2: number) => {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} Q ${midX} ${(y1 + y2) / 2} ${x2} ${y2}`;
      };

      // ===== LADO IZQUIERDO: OCTAVOS -> CUARTOS -> SEMIFINAL -> FINAL =====
      
      // OCTAVOS IZQUIERDA (0-3) -> CUARTOS IZQUIERDA (0-1)
      for (let i = 0; i < 4; i += 2) {
        const y1 = getY(octavosLeftRefs.current[i]);
        const y2 = getY(octavosLeftRefs.current[i + 1]);
        const targetIdx = Math.floor(i / 2);
        const yTarget = getY(cuartosLeftRefs.current[targetIdx]);

        const x1 = getXRight(octavosLeftRefs.current[i]);
        const x2 = getXLeft(cuartosLeftRefs.current[targetIdx]);

        newPaths.push({
          d: createPath(y1, yTarget, x1, x2),
          id: `oct-to-cuart-l-${i}`,
          isFinal: false,
        });

        newPaths.push({
          d: createPath(y2, yTarget, x1, x2),
          id: `oct-to-cuart-l-${i + 1}`,
          isFinal: false,
        });
      }

      // CUARTOS IZQUIERDA (0-1) -> SEMIFINAL IZQUIERDA
      for (let i = 0; i < 2; i++) {
        const y1 = getY(cuartosLeftRefs.current[i]);
        const yTarget = getY(semifinalesLeftRefs.current[0]);

        const x1 = getXRight(cuartosLeftRefs.current[i]);
        const x2 = getXLeft(semifinalesLeftRefs.current[0]);

        newPaths.push({
          d: createPath(y1, yTarget, x1, x2),
          id: `cuart-to-semi-l-${i}`,
          isFinal: false,
        });
      }

      // SEMIFINAL IZQUIERDA -> FINAL
      const yLeft = getY(semifinalesLeftRefs.current[0]);
      const xLeft = getXRight(semifinalesLeftRefs.current[0]);
      const yFinal = getY(finalRef.current);
      const xFinal = (getXLeft(finalRef.current) + getXRight(finalRef.current)) / 2;

      newPaths.push({
        d: createPath(yLeft, yFinal, xLeft, xFinal),
        id: 'semi-to-final-left',
        isFinal: true,
      });

      // ===== LADO DERECHO: OCTAVOS -> CUARTOS -> SEMIFINAL -> FINAL =====

      // OCTAVOS DERECHA (4-7) -> CUARTOS DERECHA (2-3)
      for (let i = 0; i < 4; i += 2) {
        const y1 = getY(octavosRightRefs.current[i]);
        const y2 = getY(octavosRightRefs.current[i + 1]);
        const targetIdx = Math.floor(i / 2);
        const yTarget = getY(cuartosRightRefs.current[targetIdx]);

        const x1 = getXLeft(octavosRightRefs.current[i]);
        const x2 = getXRight(cuartosRightRefs.current[targetIdx]);

        newPaths.push({
          d: createPath(y1, yTarget, x1, x2),
          id: `oct-to-cuart-r-${i}`,
          isFinal: false,
        });

        newPaths.push({
          d: createPath(y2, yTarget, x1, x2),
          id: `oct-to-cuart-r-${i + 1}`,
          isFinal: false,
        });
      }

      // CUARTOS DERECHA (2-3) -> SEMIFINAL DERECHA
      for (let i = 0; i < 2; i++) {
        const y1 = getY(cuartosRightRefs.current[i]);
        const yTarget = getY(semifinalesRightRefs.current[0]);

        const x1 = getXRight(cuartosRightRefs.current[i]);
        const x2 = getXLeft(semifinalesRightRefs.current[0]);

        newPaths.push({
          d: createPath(y1, yTarget, x1, x2),
          id: `cuart-to-semi-r-${i}`,
          isFinal: false,
        });
      }

      // SEMIFINAL DERECHA -> FINAL
      const yRight = getY(semifinalesRightRefs.current[0]);
      const xRight = getXLeft(semifinalesRightRefs.current[0]);

      newPaths.push({
        d: createPath(yRight, yFinal, xRight, xFinal),
        id: 'semi-to-final-right',
        isFinal: true,
      });

      setPaths(newPaths);
    };

    updatePaths();
    const timeout = setTimeout(updatePaths, 100);
    window.addEventListener('resize', updatePaths);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePaths);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5, overflow: 'visible' }}
    >
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          stroke={path.isFinal ? '#22c55e' : '#ef4444'}
          strokeWidth={path.isFinal ? 3 : 2.5}
          fill="none"
          strokeDasharray={path.isFinal ? '0' : '6,4'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
});

BracketConnectorsSymmetric.displayName = 'BracketConnectorsSymmetric';

export const Bracket = ({ data }: BracketProps) => {
  const [isVertical, setIsVertical] = useState(false);
  
  // DECLARAR TODOS LOS REFS AQUÍ - ANTES DE CUALQUIER CONDICIONAL
  const containerRef = React.useRef<HTMLDivElement>(null);
  const octavosLeftRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const cuartosLeftRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const semifinalesLeftRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const octavosRightRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const cuartosRightRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const semifinalesRightRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const finalRef = React.useRef<HTMLDivElement | null>(null);
  
  React.useEffect(() => {
    const checkOrientation = () => {
      setIsVertical(window.innerWidth < 1280);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // MISMO LAYOUT HORIZONTAL PARA TODAS LAS RESOLUCIONES
  return (
    <div className="w-full relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 w-full overflow-x-auto pb-8">
        <div className="inline-block min-w-max p-8 relative w-full" ref={containerRef}>
          <BracketConnectorsSymmetric
            octavosLeftRefs={octavosLeftRefs}
            cuartosLeftRefs={cuartosLeftRefs}
            semifinalesLeftRefs={semifinalesLeftRefs}
            octavosRightRefs={octavosRightRefs}
            cuartosRightRefs={cuartosRightRefs}
            semifinalesRightRefs={semifinalesRightRefs}
            finalRef={finalRef}
            containerRef={containerRef}
          />

        <div className="flex gap-6 items-center justify-center relative" style={{ zIndex: 10 }}>
          
          {/* OCTAVOS IZQUIERDA (0-3) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-1"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                OCTAVOS
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {data.octavos.slice(0, 4).map((match, idx) => (
                <motion.div
                  key={match.id}
                  ref={(el) => {
                    if (el) octavosLeftRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <MatchBox match={match} size="sm" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CUARTOS IZQUIERDA (0-1) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-1 items-center"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                CUARTOS
              </div>
            </div>
            <div className="flex flex-col gap-24">
              {data.cuartos.slice(0, 2).map((match, idx) => (
                <motion.div
                  key={match.id}
                  ref={(el) => {
                    if (el) cuartosLeftRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                >
                  <MatchBox match={match} size="sm" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SEMIFINAL IZQUIERDA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-1 items-center h-full justify-center"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                SEMIFINAL
              </div>
            </div>
            <div
              ref={(el) => {
                if (el) semifinalesLeftRefs.current[0] = el;
              }}
            >
              <MatchBox match={data.semifinales[0]} size="sm" />
            </div>
          </motion.div>

          {/* CENTRO - FINAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-2 px-4"
          >
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-3 py-0.5 rounded font-bold text-xs tracking-widest">
                FINAL
              </div>
            </div>
            <div ref={finalRef}>
              <MatchBox match={data.final[0]} size="md" />
            </div>
          </motion.div>

          {/* SEMIFINAL DERECHA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-1 items-center h-full justify-center"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                SEMIFINAL
              </div>
            </div>
            <div
              ref={(el) => {
                if (el) semifinalesRightRefs.current[0] = el;
              }}
            >
              <MatchBox match={data.semifinales[1]} size="sm" />
            </div>
          </motion.div>

          {/* CUARTOS DERECHA (2-3) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-1 items-center"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                CUARTOS
              </div>
            </div>
            <div className="flex flex-col gap-24">
              {data.cuartos.slice(2, 4).map((match, idx) => (
                <motion.div
                  key={match.id}
                  ref={(el) => {
                    if (el) cuartosRightRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                >
                  <MatchBox match={match} size="sm" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* OCTAVOS DERECHA (4-7) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-1"
          >
            <div className="text-center mb-1">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-2 py-0.5 rounded font-bold text-xs tracking-widest">
                OCTAVOS
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {data.octavos.slice(4, 8).map((match, idx) => (
                <motion.div
                  key={match.id}
                  ref={(el) => {
                    if (el) octavosRightRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
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
