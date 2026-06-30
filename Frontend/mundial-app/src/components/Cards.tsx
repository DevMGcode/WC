'use client';

import React from 'react';
import { Team } from '@/types';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { fmtTime, fmtShortDate } from '@/utils/format';
import LocalTimeHint from './LocalTimeHint';
import { localizeTeamName } from '@/lib/i18n/teamNames';

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

const TeamCardInner: React.FC<TeamCardProps> = ({
  team,
  size = 'md',
  onClick,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  return (
    <div
      className={`${sizeStyles[size]} tech-panel rounded-xl hover:shadow-green-500/25 transition-all duration-300 p-2 flex flex-col items-center justify-center cursor-pointer group`}
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
      <p className={`${teamNameSizes[size]} font-bold text-white text-center truncate w-full`}>
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
export const TeamCard = React.memo(TeamCardInner);

interface FixtureCardProps {
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  /** Marcador de la tanda de penales (si el partido se definió por penales). */
  homePenalty?: number | null;
  awayPenalty?: number | null;
  kickoffAt: Date;
  status: 'SCHEDULED' | 'FINISHED' | 'LIVE' | 'POSTPONED' | 'CANCELLED';
  elapsedMinutes?: number | null;
  isHalftime?: boolean;
  onClick?: () => void;
  showPrediction?: boolean;
  predictions?: { home: number; away: number };
  /** Locale del usuario para formatear fechas. Si no se pasa, fmtX cae al lang del <html>. */
  locale?: string;
}

const FixtureCardInner: React.FC<FixtureCardProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homePenalty,
  awayPenalty,
  kickoffAt,
  status,
  elapsedMinutes,
  isHalftime = false,
  onClick,
  showPrediction = false,
  predictions,
  locale,
}) => {
  const t = useTranslations();
  const activeLocale = useLocale();
  const effectiveLocale = locale ?? activeLocale;
  const homeLocalized = localizeTeamName(homeTeam.name, effectiveLocale);
  const awayLocalized = localizeTeamName(awayTeam.name, effectiveLocale);
  const isLive = status === 'LIVE';
  const isFinished = status === 'FINISHED';

  return (
    <div
      className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
        isLive ? 'ring-2 ring-rose-500 shadow-lg shadow-rose-500/30' : 'shadow-lg shadow-black/20'
      }`}
      onClick={onClick}
    >
      {/* Status badge */}
      <div className={`px-4 py-2 text-center text-white text-sm font-bold ${
        isLive ? 'bg-rose-600 animate-pulse' : isFinished ? 'bg-[#06110A]' : 'bg-green-700'
      }`}>
        {isLive && (isHalftime
          ? `⏸ DESCANSO`
          : `🔴 ${t('status.live')}${elapsedMinutes != null ? ` · ${elapsedMinutes}'` : ''}`)}
        {isFinished && t('status.finished')}
        {status === 'SCHEDULED' && (
          <>
            <div>
              {fmtShortDate(kickoffAt, locale)} {fmtTime(kickoffAt, locale)}
              <span style={{ opacity: 0.7, fontSize: '0.75em', marginLeft: 4 }}>Bogotá</span>
            </div>
            <LocalTimeHint date={kickoffAt} locale={locale} />
          </>
        )}
        {status === 'POSTPONED' && t('status.postponed')}
        {status === 'CANCELLED' && t('status.cancelled')}
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
            <p className="text-sm font-bold text-center text-white">{homeTeam.shortName}</p>
            <p className="text-[10px] text-center text-white/60 mt-0.5 truncate max-w-[80px]">{homeLocalized}</p>
          </div>

          {/* Score / VS */}
          <div className="text-center flex-shrink-0">
            {isFinished || isLive ? (
              <div className="text-center">
                <p className="text-3xl font-black text-white tech-text-glow">
                  {homeScore} - {awayScore}
                </p>
                {homePenalty != null && awayPenalty != null && (
                  <p className="text-[11px] font-black tracking-wide mt-0.5"
                    style={{ color: '#D4A72C' }}>
                    Penales {homePenalty}-{awayPenalty}
                  </p>
                )}
                {showPrediction && predictions && (
                  <p className="text-xs text-green-300 font-semibold mt-1">
                    {predictions.home} - {predictions.away}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl font-bold text-green-300">vs</p>
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
            <p className="text-sm font-bold text-center text-white">{awayTeam.shortName}</p>
            <p className="text-[10px] text-center text-white/60 mt-0.5 truncate max-w-[80px]">{awayLocalized}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export const FixtureCard = React.memo(FixtureCardInner);

export default { TeamCard, FixtureCard };
