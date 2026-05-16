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

// Componente para mostrar un equipo en el bracket
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
      {/* Logo */}
      <div className={`relative flex-shrink-0 rounded overflow-hidden border border-slate-600 ${size === 'sm' ? 'w-6 h-4' : size === 'lg' ? 'w-8 h-6' : 'w-7 h-5'}`}>
        <Image
          src={team.flagUrl}
          alt={team.name}
          fill
          sizes={size === 'sm' ? '24px' : size === 'lg' ? '32px' : '28px'}
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Nombre */}
      <span className={`font-bold text-white flex-1 truncate ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {team.shortName}
      </span>

      {/* Goles */}
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
const BracketConnectors = ({ octavosPositions, cuartosPositions, semifinalesPositions, finalPosition }: any) => {
  const createPath = (y1: number, y2: number, xStart: number, xEnd: number) => {
    const midX = (xStart + xEnd) / 2;
    return `M ${xStart} ${y1} Q ${midX} ${(y1 + y2) / 2} ${xEnd} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {/* OCTAVOS a CUARTOS */}
      {/* Conexión 0-1 -> 0 */}
      {octavosPositions[0] && octavosPositions[1] && cuartosPositions[0] && (
        <path
          d={createPath(
            octavosPositions[0],
            cuartosPositions[0],
            270,
            370
          )}
          stroke="#ef4444"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {octavosPositions[1] && cuartosPositions[0] && (
        <path
          d={createPath(
            octavosPositions[1],
            cuartosPositions[0],
            270,
            370
          )}
          stroke="#ef4444"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Conexión 2-3 -> 1 */}
      {octavosPositions[2] && octavosPositions[3] && cuartosPositions[1] && (
        <>
          <path
            d={createPath(
              octavosPositions[2],
              cuartosPositions[1],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              octavosPositions[3],
              cuartosPositions[1],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Conexión 4-5 -> 2 */}
      {octavosPositions[4] && octavosPositions[5] && cuartosPositions[2] && (
        <>
          <path
            d={createPath(
              octavosPositions[4],
              cuartosPositions[2],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              octavosPositions[5],
              cuartosPositions[2],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Conexión 6-7 -> 3 */}
      {octavosPositions[6] && octavosPositions[7] && cuartosPositions[3] && (
        <>
          <path
            d={createPath(
              octavosPositions[6],
              cuartosPositions[3],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              octavosPositions[7],
              cuartosPositions[3],
              270,
              370
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* CUARTOS a SEMIFINALES */}
      {/* Conexión 0-1 -> 0 */}
      {cuartosPositions[0] && cuartosPositions[1] && semifinalesPositions[0] && (
        <>
          <path
            d={createPath(
              cuartosPositions[0],
              semifinalesPositions[0],
              500,
              600
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              cuartosPositions[1],
              semifinalesPositions[0],
              500,
              600
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Conexión 2-3 -> 1 */}
      {cuartosPositions[2] && cuartosPositions[3] && semifinalesPositions[1] && (
        <>
          <path
            d={createPath(
              cuartosPositions[2],
              semifinalesPositions[1],
              500,
              600
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              cuartosPositions[3],
              semifinalesPositions[1],
              500,
              600
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* SEMIFINALES a FINAL */}
      {/* Conexión 0-1 -> final */}
      {semifinalesPositions[0] && semifinalesPositions[1] && finalPosition && (
        <>
          <path
            d={createPath(
              semifinalesPositions[0],
              finalPosition,
              730,
              830
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={createPath(
              semifinalesPositions[1],
              finalPosition,
              730,
              830
            )}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

export const Bracket = ({ data }: BracketProps) => {
  const [isVertical, setIsVertical] = useState(false);
  const [octavosPositions, setOctavosPositions] = useState<number[]>([]);
  const [cuartosPositions, setCuartosPositions] = useState<number[]>([]);
  const [semifinalesPositions, setSemifinalesPositions] = useState<number[]>([]);
  const [finalPosition, setFinalPosition] = useState<number>(0);

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

  React.useEffect(() => {
    if (!isVertical) {
      // Calcular posiciones de OCTAVOS
      const octavosPos = octavosRefs.current.map((ref) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          return rect.top + rect.height / 2;
        }
        return 0;
      });
      setOctavosPositions(octavosPos);

      // Calcular posiciones de CUARTOS
      const cuartosPos = cuartosRefs.current.map((ref) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          return rect.top + rect.height / 2;
        }
        return 0;
      });
      setCuartosPositions(cuartosPos);

      // Calcular posiciones de SEMIFINALES
      const semifinalesPos = semifinalesRefs.current.map((ref) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          return rect.top + rect.height / 2;
        }
        return 0;
      });
      setSemifinalesPositions(semifinalesPos);

      // Calcular posición de FINAL
      if (finalRef.current) {
        const rect = finalRef.current.getBoundingClientRect();
        setFinalPosition(rect.top + rect.height / 2);
      }
    }
  }, [isVertical, data]);

  if (isVertical) {
    // VISTA MÓVIL - Apilada verticalmente
    return (
      <div className="w-full space-y-8 px-3">
        {/* OCTAVOS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 OCTAVOS
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.octavos.map((match) => (
              <div key={match.id} className="flex justify-center relative">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Separador entre fases */}
        <div className="flex justify-center py-3">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* CUARTOS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 CUARTOS
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.cuartos.map((match) => (
              <div key={match.id} className="flex justify-center relative">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Separador entre fases */}
        <div className="flex justify-center py-3">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* SEMIFINALES */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 SEMIFINALES
          </div>
          <div className="grid grid-cols-1 gap-3">
            {data.semifinales.map((match) => (
              <div key={match.id} className="flex justify-center relative">
                <MatchBox match={match} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Separador entre fases */}
        <div className="flex justify-center py-3">
          <div className="text-cyan-400 text-2xl">↓</div>
        </div>

        {/* FINAL */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-center">
            🏆 FINAL
          </div>
          <div className="flex justify-center">
            <MatchBox match={data.final[0]} size="sm" />
          </div>
        </motion.div>
      </div>
    );
  }

  // VISTA DESKTOP - Con conexiones visuales
  return (
    <div className="w-full overflow-hidden pb-8">
      <div className="w-full h-auto p-2 relative" style={{ display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
        <BracketConnectors
          octavosPositions={octavosPositions}
          cuartosPositions={cuartosPositions}
          semifinalesPositions={semifinalesPositions}
          finalPosition={finalPosition}
        />

        <div className="flex gap-3 relative" style={{ zIndex: 2, flexShrink: 0 }}>
          {/* OCTAVOS - 8 partidos */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-1 rounded-lg font-bold tracking-widest text-xs">
                OCTAVOS
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '600px' }}>
              {data.octavos.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) octavosRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Flecha */}
          <div className="flex items-center text-red-500 text-2xl font-bold">→</div>

          {/* CUARTOS - 4 partidos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-1 rounded-lg font-bold tracking-widest text-xs">
                CUARTOS
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '600px' }}>
              {data.cuartos.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) cuartosRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Flecha */}
          <div className="flex items-center text-red-500 text-2xl font-bold">→</div>

          {/* SEMIFINALES - 2 partidos */
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-1 rounded-lg font-bold tracking-widest text-xs">
                SEMIFINALES
              </div>
            </div>
            <div className="flex flex-col justify-around" style={{ minHeight: '600px' }}>
              {data.semifinales.map((match, idx) => (
                <div
                  key={match.id}
                  ref={(el) => {
                    if (el) semifinalesRefs.current[idx] = el;
                  }}
                >
                  <MatchBox match={match} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Flecha */}
          <div className="flex items-center text-red-500 text-2xl font-bold">→</div>

          {/* FINAL - 1 partido */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-4 py-1 rounded-lg font-bold tracking-widest text-xs">
                🏆 FINAL 🏆
              </div>
            </div>
            <div className="flex flex-col justify-center items-center" style={{ minHeight: '600px' }}>
              <div
                ref={(el) => {
                  finalRef.current = el;
                }}
              >
                <MatchBox match={data.final[0]} size="lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
