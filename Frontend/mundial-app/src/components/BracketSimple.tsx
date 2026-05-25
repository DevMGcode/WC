'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
          ${size === 'sm' ? 'h-12 px-2' : size === 'lg' ? 'h-16 px-3' : 'h-14 px-3'}
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
        ${size === 'sm' ? 'h-12 px-2' : size === 'lg' ? 'h-16 px-3' : 'h-14 px-3'}
        ${isWinner 
          ? 'bg-gradient-to-r from-teal-700 to-teal-800 border-teal-500 shadow-lg shadow-teal-500/50' 
          : 'bg-slate-800/60 border-slate-700'
        }
      `}
    >
      <div className={`flex-shrink-0 rounded overflow-hidden border border-slate-600 ${size === 'sm' ? 'w-6 h-4' : size === 'lg' ? 'w-8 h-6' : 'w-7 h-5'}`}>
        <Image
          src={team.flagUrl}
          alt={team.name}
          width={size === 'sm' ? 24 : size === 'lg' ? 32 : 28}
          height={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      <span className={`font-bold text-white flex-1 truncate ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {team.shortName}
      </span>

      {score !== undefined && (
        <span className={`font-black flex-shrink-0 ${size === 'sm' ? 'text-xs w-4' : size === 'lg' ? 'text-xl w-6' : 'text-lg w-5'} text-center ${isWinner ? 'text-cyan-100' : 'text-slate-400'}`}>
          {score}
        </span>
      )}
    </motion.div>
  );
};

// Componente para un partido completo
const MatchBox = ({ 
  match, 
  showWinner = true,
  size = 'md'
}: { 
  match: Match; 
  showWinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const homeWon = match.winner?.id === match.homeTeam?.id;
  const awayWon = match.winner?.id === match.awayTeam?.id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-2 bg-slate-900/60 p-2 rounded-lg backdrop-blur border border-slate-700/50 ${size === 'lg' ? 'w-56 gap-2.5 p-3' : size === 'sm' ? 'w-32 gap-1 p-1.5' : 'w-44'}`}
    >
      <TeamBadge
        team={match.homeTeam}
        score={match.homeScore}
        isWinner={homeWon}
        size={size}
      />

      <div className={`h-px bg-gradient-to-r from-cyan-500/40 via-cyan-400/70 to-cyan-500/40 ${size === 'lg' ? '' : 'my-0.5'}`}></div>

      <TeamBadge
        team={match.awayTeam}
        score={match.awayScore}
        isWinner={awayWon}
        size={size}
      />
    </motion.div>
  );
};

// Componente para dibujar las líneas de conexión
const BracketConnectors = ({ 
  octavosRefs,
  cuartosRefs,
  semifinalesRefs,
  finalRef,
  containerRef
}: any) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [paths, setPaths] = React.useState<Array<{ d: string; id: string }>>([]);

  React.useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const updatePaths = () => {
      const container = containerRef.current;
      if (!container) return;

      const newPaths: Array<{ d: string; id: string }> = [];
      const svgRect = svgRef.current!.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const getY = (ref: HTMLDivElement | null) => {
        if (!ref) return 0;
        const rect = ref.getBoundingClientRect();
        return rect.top - containerRect.top + rect.height / 2;
      };

      // Posiciones X aproximadas basadas en el layout (gap-16 = 64px)
      // Octavos termina aprox en x=210, Cuartos comienza aprox en x=290
      // Cuartos termina aprox en x=500, Semifinales comienza aprox en x=580
      // Semifinales termina aprox en x=790, Final comienza aprox en x=870

      const octavosEnd = 210;
      const cuartosStart = 290;
      const cuartosEnd = 500;
      const semifinalesStart = 580;
      const semifinalesEnd = 790;
      const finalStart = 870;

      // OCTAVOS -> CUARTOS (2 pairs)
      const pairs = [
        [0, 1, 0], // octavos 0,1 -> cuartos 0
        [2, 3, 1], // octavos 2,3 -> cuartos 1
        [4, 5, 2], // octavos 4,5 -> cuartos 2
        [6, 7, 3], // octavos 6,7 -> cuartos 3
      ];

      pairs.forEach(([idx1, idx2, targetIdx]) => {
        const y1 = getY(octavosRefs.current[idx1]);
        const y2 = getY(octavosRefs.current[idx2]);
        const yTarget = getY(cuartosRefs.current[targetIdx]);
        const midY = (y1 + y2) / 2;

        // Línea 1: octavos[idx1] -> cuartos[targetIdx]
        const d1 = `M ${octavosEnd} ${y1} Q ${(octavosEnd + cuartosStart) / 2} ${(y1 + yTarget) / 2} ${cuartosStart} ${yTarget}`;
        newPaths.push({ d: d1, id: `oct-to-cuart-${idx1}` });

        // Línea 2: octavos[idx2] -> cuartos[targetIdx]
        const d2 = `M ${octavosEnd} ${y2} Q ${(octavosEnd + cuartosStart) / 2} ${(y2 + yTarget) / 2} ${cuartosStart} ${yTarget}`;
        newPaths.push({ d: d2, id: `oct-to-cuart-${idx2}` });
      });

      // CUARTOS -> SEMIFINALES
      const cuartoPairs = [
        [0, 1, 0], // cuartos 0,1 -> semifinales 0
        [2, 3, 1], // cuartos 2,3 -> semifinales 1
      ];

      cuartoPairs.forEach(([idx1, idx2, targetIdx]) => {
        const y1 = getY(cuartosRefs.current[idx1]);
        const y2 = getY(cuartosRefs.current[idx2]);
        const yTarget = getY(semifinalesRefs.current[targetIdx]);

        const d1 = `M ${cuartosEnd} ${y1} Q ${(cuartosEnd + semifinalesStart) / 2} ${(y1 + yTarget) / 2} ${semifinalesStart} ${yTarget}`;
        newPaths.push({ d: d1, id: `cuart-to-semi-${idx1}` });

        const d2 = `M ${cuartosEnd} ${y2} Q ${(cuartosEnd + semifinalesStart) / 2} ${(y2 + yTarget) / 2} ${semifinalesStart} ${yTarget}`;
        newPaths.push({ d: d2, id: `cuart-to-semi-${idx2}` });
      });

      // SEMIFINALES -> FINAL
      const y1 = getY(semifinalesRefs.current[0]);
      const y2 = getY(semifinalesRefs.current[1]);
      const yFinal = getY(finalRef.current);

      const d1 = `M ${semifinalesEnd} ${y1} Q ${(semifinalesEnd + finalStart) / 2} ${(y1 + yFinal) / 2} ${finalStart} ${yFinal}`;
      newPaths.push({ d: d1, id: 'semi-to-final-0' });

      const d2 = `M ${semifinalesEnd} ${y2} Q ${(semifinalesEnd + finalStart) / 2} ${(y2 + yFinal) / 2} ${finalStart} ${yFinal}`;
      newPaths.push({ d: d2, id: 'semi-to-final-1' });

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
          stroke="#ef4444"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8,4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

export const Bracket = ({ data }: BracketProps) => {
  const [isVertical, setIsVertical] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const octavosRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const cuartosRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const semifinalesRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const finalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const checkOrientation = () => {
      setIsVertical(window.innerWidth < 1024);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (isVertical) {
    return (
      <div className="w-full space-y-8 px-3">
        {/* OCTAVOS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 OCTAVOS
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.octavos.map((match) => (
              <div key={match.id} className="flex justify-center">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* CUARTOS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 CUARTOS
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.cuartos.map((match) => (
              <div key={match.id} className="flex justify-center">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* SEMIFINALES */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 SEMIFINALES
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.semifinales.map((match) => (
              <div key={match.id} className="flex justify-center">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* FINAL */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 FINAL 🏆
          </div>
          <div className="flex justify-center">
            <MatchBox match={data.final[0]} size="sm" />
          </div>
        </motion.div>
      </div>
    );
  }

  // VISTA DESKTOP
  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="inline-block min-w-max p-8 relative" ref={containerRef}>
        {/* SVG para líneas de conexión */}
        <BracketConnectors
          octavosRefs={octavosRefs}
          cuartosRefs={cuartosRefs}
          semifinalesRefs={semifinalesRefs}
          finalRef={finalRef}
          containerRef={containerRef}
        />

        <div className="flex gap-16 relative" style={{ zIndex: 10 }}>
          {/* OCTAVOS */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-6 py-2 rounded-lg font-bold tracking-widest text-sm">
                OCTAVOS
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '900px' }}>
              {data.octavos.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) octavosRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="md" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* CUARTOS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-6 py-2 rounded-lg font-bold tracking-widest text-sm">
                CUARTOS
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '900px' }}>
              {data.cuartos.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) cuartosRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="md" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* SEMIFINALES */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-6 py-2 rounded-lg font-bold tracking-widest text-sm">
                SEMIFINALES
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '900px' }}>
              {data.semifinales.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) semifinalesRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="md" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* FINAL */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-6 py-2 rounded-lg font-bold tracking-widest text-sm">
                🏆 FINAL 🏆
              </div>
            </div>
            <div className="flex flex-col justify-center items-center" style={{ minHeight: '900px' }}>
              <div ref={finalRef}>
                <MatchBox match={data.final[0]} size="lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
