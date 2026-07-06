'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGrid, FiTarget, FiZap, FiAward } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { fmtShortDate, fmtTime } from '@/utils/format';
import { useLocale } from 'next-intl';
import { localizeTeamName } from '@/lib/i18n/teamNames';
import type { Match, KnockoutRound, BracketTab, Team, BracketData } from './types';

/* ══════════════════════════════════════════
   ROUND METADATA
══════════════════════════════════════════ */
export const ROUND_META: Record<BracketTab, { icon: React.ReactNode; color: string; glow: string }> = {
  dieciseisavos: { icon: <FiGrid size={12} />, color: hex.green.soft,   glow: alpha(hex.green.soft, 0.55)    },
  octavos:     { icon: <FiGrid size={12} />,   color: hex.green.bright, glow: alphaOf('green', 0.55)         },
  cuartos:     { icon: <FiTarget size={12} />, color: hex.green.muted,  glow: alpha(hex.green.muted, 0.55)   },
  semifinales: { icon: <FiZap size={12} />,    color: '#a78bfa',        glow: 'rgba(167,139,250,0.55)'       },
  tercerPuesto:{ icon: <FiAward size={12} />,  color: '#cd7f32',        glow: 'rgba(205,127,50,0.55)'        },
  final:       { icon: <FiAward size={12} />,  color: hex.gold.muted,   glow: alphaOf('gold', 0.55)          },
};

export const ROUND_I18N: Record<BracketTab, { labelKey: string; shortLabelKey: string }> = {
  dieciseisavos: { labelKey: 'groups.round32', shortLabelKey: 'groups.round32Short' },
  octavos:     { labelKey: 'groups.round16',   shortLabelKey: 'groups.round16Short'  },
  cuartos:     { labelKey: 'groups.quarter',   shortLabelKey: 'groups.quarterShort'  },
  semifinales: { labelKey: 'groups.semi',      shortLabelKey: 'groups.semiShort'     },
  tercerPuesto:{ labelKey: 'groups.thirdPlace', shortLabelKey: 'groups.thirdPlaceShort' },
  final:       { labelKey: 'groups.final',     shortLabelKey: 'groups.finalShort'    },
};

export const ROUND_GRID: Record<BracketTab, string> = {
  dieciseisavos: 'grid-cols-1 sm:grid-cols-2',
  octavos:     'grid-cols-1 sm:grid-cols-2',
  cuartos:     'grid-cols-1 sm:grid-cols-2',
  semifinales: 'grid-cols-1 sm:grid-cols-2',
  tercerPuesto: 'grid-cols-1 max-w-xs mx-auto',
  final:       'grid-cols-1 max-w-xs mx-auto',
};

/* ══════════════════════════════════════════
   KNOCKOUT CARD
══════════════════════════════════════════ */
interface KnockoutCardProps {
  match: Match;
  round: BracketTab;
  index?: number;
  t: (key: string) => string;
}

const KnockoutCard = ({ match, round, index = 0, t }: KnockoutCardProps) => {
  const locale   = useLocale();
  const meta     = { ...ROUND_META[round], shortLabel: t(ROUND_I18N[round].shortLabelKey) };
  const isFinal  = round === 'final';
  const homeWon  = Boolean(match.isPlayed && match.winner?.id === match.homeTeam?.id);
  const awayWon  = Boolean(match.isPlayed && match.winner?.id === match.awayTeam?.id);
  const accent   = isFinal ? hex.gold.muted : meta.color;
  const accentGlow = isFinal ? alphaOf('gold', 0.55) : meta.glow;
  // Solo los partidos REALES (id de fixture > 0) enlazan a su página de detalle.
  // Los placeholders del cuadro ("Gan. 89", "Perdedor 101") tienen id negativo y no enlazan.
  const href = match.id > 0 ? `/${locale}/fixtures/${match.id}` : null;

  const TeamRow = ({ team, score, won, side }: { team: Team; score?: number; won: boolean; side: 'home' | 'away' }) => (
    <div className="flex items-center gap-3 px-4 py-3 relative"
      style={{
        background: won ? `linear-gradient(${side === 'home' ? '90deg' : '270deg'}, ${accent}12, transparent)` : 'transparent',
        transition: 'background 0.2s',
      }}>
      {won && side === 'home' && (
        <motion.div className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accentGlow}` }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} />
      )}
      <div className="relative shrink-0 w-7 h-7">
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: won ? accentGlow : alpha(hex.neutral.white, 0.08),
                   filter: 'blur(5px)', opacity: won ? 0.45 : 0.12 }} />
        <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-lg"
          style={{ border: `1.5px solid ${won ? accent + '50' : alpha(hex.neutral.white, 0.10)}` }}>
          {team?.flagUrl && (
            <Image src={team.flagUrl} alt={team.name} fill sizes="28px" className="object-cover" unoptimized />
          )}
        </div>
      </div>
      <span className="flex-1 text-[12px] font-black truncate leading-none"
        style={{ color: won ? accent : alpha(hex.text.secondary, 0.75), textShadow: won ? `0 0 12px ${accentGlow}` : 'none' }}>
        {localizeTeamName(team?.name, locale) || '?'}
      </span>
      {match.isPlayed && match.homePenalty != null && match.awayPenalty != null && (
        <span className="text-[10px] font-black uppercase tracking-wide shrink-0 tabular-nums whitespace-nowrap"
          style={{ color: won ? accent : alpha(hex.text.muted, 0.6) }}>
          {t('common.penalties')} {side === 'home' ? match.homePenalty : match.awayPenalty}
        </span>
      )}
      {match.isPlayed && score !== undefined && (
        <motion.span
          className="text-xl font-black tabular-nums w-7 text-center shrink-0 leading-none"
          style={{ color: won ? accent : alpha(hex.text.muted, 0.70), textShadow: won ? `0 0 14px ${accentGlow}` : 'none' }}
          animate={won ? { textShadow: [`0 0 8px ${accentGlow}50`, `0 0 20px ${accentGlow}`, `0 0 8px ${accentGlow}50`] } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {score}
        </motion.span>
      )}
      {won && (
        <motion.div className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: accent, boxShadow: `0 0 6px ${accentGlow}` }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }} />
      )}
    </div>
  );

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: isFinal
          ? `linear-gradient(145deg, ${alpha('#0E0A02', 0.98)}, ${alpha('#161004', 0.97)})`
          : `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.97)})`,
        border: `1px solid ${accent}${isFinal ? '30' : '18'}`,
        backdropFilter: 'blur(28px)',
        boxShadow: isFinal
          ? `0 0 0 1px ${alphaOf('gold', 0.06)}, 0 20px 60px ${alpha(hex.neutral.black, 0.70)}, 0 0 32px ${alphaOf('gold', 0.12)}`
          : `0 16px 48px ${alpha(hex.neutral.black, 0.60)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.01)}`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />
      {isFinal && match.winner && (
        <div className="absolute -top-2 right-3 z-10">
          <motion.span className="text-base"
            animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 2.8, repeat: Infinity }}>👑</motion.span>
        </div>
      )}
      {isFinal && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{ opacity: [0, 0.06, 0] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${alphaOf('gold', 0.20)}, transparent 65%)` }} />
      )}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: `1px solid ${alpha(hex.neutral.white, 0.04)}`, background: alpha(hex.neutral.black, 0.15) }}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}>
          <span style={{ color: accent, filter: `drop-shadow(0 0 4px ${accentGlow})`, display: 'flex' }}>
            {meta.icon}
          </span>
          <span className="text-[8px] font-black tracking-[0.22em] uppercase" style={{ color: accent }}>
            {meta.shortLabel}
          </span>
        </div>
        <span className="text-[8px] font-bold tracking-widest uppercase"
          style={{ color: match.isPlayed ? `${accent}70` : alpha(hex.text.muted, 0.45) }}>
          {match.isPlayed ? t('common.finished') : t('common.pending')}
        </span>
      </div>
      {match.kickoff && (
        <div className="px-4 pt-2 text-center text-[10px] font-bold tabular-nums tracking-wide"
          style={{ color: alpha(hex.text.muted, 0.78) }}>
          {fmtShortDate(match.kickoff)} · {fmtTime(match.kickoff)}
        </div>
      )}
      <div>
        <TeamRow team={match.homeTeam} score={match.homeScore} won={homeWon} side="home" />
        <div className="h-px mx-4" style={{ background: `linear-gradient(90deg, transparent, ${accent}15, transparent)` }} />
        <TeamRow team={match.awayTeam} score={match.awayScore} won={awayWon} side="away" />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(108deg, transparent 25%, ${alpha(hex.neutral.white, 0.018)} 50%, transparent 75%)` }} />
    </motion.div>
  );

  // Partido real → enlace a su página de detalle (mejora SEO: enlaces internos
  // rastreables + cada cruce del cuadro apunta a su ficha). Placeholder → sin enlace.
  if (!href) return card;
  return (
    <Link href={href} className="block"
      aria-label={`${localizeTeamName(match.homeTeam?.name, locale) || '?'} vs ${localizeTeamName(match.awayTeam?.name, locale) || '?'} — ${meta.shortLabel}`}>
      {card}
    </Link>
  );
};

export default KnockoutCard;

/* ══════════════════════════════════════════
   CHAMPION BANNER
══════════════════════════════════════════ */
interface ChampionBannerProps {
  winner: Team;
  t: (key: string) => string;
}

export const ChampionBanner = ({ winner, t }: ChampionBannerProps) => {
  const locale = useLocale();
  return (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl mt-6"
    style={{
      background: `linear-gradient(145deg, ${alpha('#120C02', 0.98)}, ${alpha('#1C1404', 0.97)})`,
      border: borders.brand('gold', 0.30),
      boxShadow: `0 0 60px ${alphaOf('gold', 0.16)}, 0 24px 80px ${alpha(hex.neutral.black, 0.70)}`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: gradients.divider('gold', 0.80) }} />
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
      style={{ background: gradients.cornerGlow('gold', 0.12), filter: 'blur(30px)' }} />
    {Array.from({ length: 14 }).map((_, i) => (
      <motion.div key={i} className="absolute rounded-full pointer-events-none"
        style={{ width: 3, height: 3, left: `${(i * 137.5) % 100}%`, top: '0%',
          background: [hex.gold.muted, hex.green.bright, hex.green.hover, '#f87171', '#a78bfa'][i % 5] }}
        animate={{ y: [0, 120], opacity: [0, 1, 0], x: [0, Math.sin(i * 1.4) * 24] }}
        transition={{ duration: 2.8, delay: i * 0.14, repeat: Infinity, ease: 'easeOut' }} />
    ))}
    <div className="relative flex flex-col sm:flex-row items-center justify-center gap-5 p-6 sm:p-8">
      <motion.div className="text-4xl" animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.18, 1, 1.18, 1] }}
        transition={{ duration: 3.5, repeat: Infinity }}>🏆</motion.div>
      <div className="text-center sm:text-left">
        <p className="text-[8px] font-black tracking-[0.40em] text-amber-500/60 uppercase mb-1">{t('groups.champion')}</p>
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-full"
              style={{ background: alphaOf('gold', 0.30), filter: 'blur(8px)', transform: 'scale(1.3)' }} />
            <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-2xl"
              style={{ border: borders.brand('gold', 0.55).replace('1px', '2px') }}>
              {winner.flagUrl && <Image src={winner.flagUrl} alt={winner.name} fill sizes="44px" className="object-cover" unoptimized />}
            </div>
          </div>
          <motion.p className="text-2xl sm:text-3xl font-black text-amber-200"
            style={{ textShadow: `0 0 24px ${alphaOf('gold', 0.80)}` }}
            animate={{ textShadow: [`0 0 14px ${alphaOf('gold', 0.60)}`, `0 0 36px ${alphaOf('gold', 1)}`, `0 0 14px ${alphaOf('gold', 0.60)}`] }}
            transition={{ duration: 2.4, repeat: Infinity }}>
            {localizeTeamName(winner.name, locale) || winner.name}
          </motion.p>
        </div>
        <div className="h-px my-3" style={{ background: gradients.divider('gold', 0.25) }} />
        <p className="text-[8px] tracking-[0.30em] text-amber-600/40 uppercase font-bold">Mundial 2026 · USA · México · Canadá</p>
      </div>
    </div>
  </motion.div>
  );
};
