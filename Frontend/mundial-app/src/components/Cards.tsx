import React from 'react';
import { Team } from '@/types';
import Image from 'next/image';

interface TeamCardProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const sizeStyles = {
  sm: 'w-20 h-28',
  md: 'w-24 h-32',
  lg: 'w-32 h-40',
};

const teamNameSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  size = 'md',
  onClick,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  return (
    <div
      className={`${sizeStyles[size]} tech-panel rounded-xl hover:shadow-cyan-500/25 transition-all duration-300 p-2 flex flex-col items-center justify-center cursor-pointer group`}
      onClick={onClick}
    >
      {/* Bandera */}
      <div className="relative w-full h-3/5 mb-2 rounded-lg overflow-hidden bg-gray-100">
        {team.flagUrl && (
          <Image
            src={team.flagUrl}
            alt={team.name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>

      {/* Nombre del equipo */}
      <p className={`${teamNameSizes[size]} font-bold text-slate-100 text-center truncate w-full`}>
        {team.shortName || team.name}
      </p>

      {/* Botón favorito */}
      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isFavorite ? (
            <span className="text-lg">⭐</span>
          ) : (
            <span className="text-lg">☆</span>
          )}
        </button>
      )}
    </div>
  );
};

interface FixtureCardProps {
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  kickoffAt: Date;
  status: 'SCHEDULED' | 'FINISHED' | 'LIVE' | 'POSTPONED';
  onClick?: () => void;
  showPrediction?: boolean;
  predictions?: { home: number; away: number };
}

export const FixtureCard: React.FC<FixtureCardProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  kickoffAt,
  status,
  onClick,
  showPrediction = false,
  predictions,
}) => {
  const isLive = status === 'LIVE';
  const isFinished = status === 'FINISHED';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
        isLive ? 'ring-2 ring-rose-500 shadow-lg shadow-rose-500/30' : 'shadow-lg shadow-slate-900/20'
      }`}
      onClick={onClick}
    >
      {/* Status badge */}
      <div className={`px-4 py-2 text-center text-white text-sm font-bold ${
        isLive ? 'bg-rose-600 animate-pulse' : isFinished ? 'bg-slate-900' : 'bg-cyan-700'
      }`}>
        {isLive && '🔴 EN VIVO'}
        {isFinished && 'FINALIZADO'}
        {status === 'SCHEDULED' && `${formatDate(kickoffAt)} ${formatTime(kickoffAt)}`}
        {status === 'POSTPONED' && 'POSPUESTO'}
      </div>

      {/* Contenido */}
      <div className="tech-panel p-4">
        {/* Teams */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Home team */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-16 h-12 mb-2 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              {homeTeam.flagUrl && (
                <Image
                  src={homeTeam.flagUrl}
                  alt={homeTeam.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <p className="text-sm font-bold text-center text-slate-100">{homeTeam.shortName}</p>
          </div>

          {/* Score / VS */}
          <div className="text-center flex-shrink-0">
            {isFinished || isLive ? (
              <div className="text-center">
                <p className="text-3xl font-black text-slate-100 tech-text-glow">
                  {homeScore} - {awayScore}
                </p>
                {showPrediction && predictions && (
                  <p className="text-xs text-cyan-300 font-semibold mt-1">
                    {predictions.home} - {predictions.away}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl font-bold text-cyan-300">vs</p>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-16 h-12 mb-2 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              {awayTeam.flagUrl && (
                <Image
                  src={awayTeam.flagUrl}
                  alt={awayTeam.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <p className="text-sm font-bold text-center text-slate-100">{awayTeam.shortName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { TeamCard, FixtureCard };
