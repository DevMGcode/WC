'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTarget, FiAward, FiUsers, FiZap, FiCheck, FiX,
  FiActivity, FiBarChart2, FiTrendingUp, FiClock,
  FiStar, FiPlus, FiLogIn, FiChevronRight, FiShield,
} from 'react-icons/fi';
import { Header } from '@/components/Navigation';
import ShareButton from '@/components/ShareButton';
import {
  useCurrentTournament,
  useTournamentFixtures,
  useUserPredictions,
  useScoreHistory,
  useGlobalRanking,
  useUserLeaguesWithRankings,
} from '@/hooks/useTournamentData';
import { RANKING_PAGE } from '@/constants/tournament';
import { fmtShortDate } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
type ResultStatus = 'EXACT' | 'CORRECT' | 'WRONG' | 'PENDING';

/* ══════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════ */

/* GlowBar — 5px altura para mejor visibilidad */
const GlowBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => (
  <div className="relative h-[5px] rounded-full overflow-hidden w-full" style={{ background: alpha(hex.neutral.white, 0.07) }}>
    <motion.div className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
  </div>
);

const EQBars = ({ color, count = 6, maxH = 12 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        return (
          <motion.div key={i} className="rounded-full"
            style={{ width: 2, background: color, boxShadow: `0 0 3px ${color}` }}
            animate={{ height: [h1, h2, h1] }}
            transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }} />
        );
      })}
    </div>
  );
};

/* PremiumIcon */
const PremiumIcon = ({
  icon, color, glow, bg, size = 'md', delay = 0,
}: {
  icon: React.ReactNode; color: string; glow: string; bg: string;
  size?: 'sm' | 'md' | 'lg'; delay?: number;
}) => {
  const dim      = { sm: 'w-9 h-9',    md: 'w-11 h-11', lg: 'w-14 h-14' }[size];
  const iconSize = { sm: 16,            md: 20,           lg: 26          }[size];
  const radius   = { sm: 'rounded-xl',  md: 'rounded-xl', lg: 'rounded-2xl' }[size];
  return (
    <div className="relative shrink-0">
      <div className={`absolute inset-0 ${radius} pointer-events-none`}
        style={{ background: glow, filter: 'blur(14px)', opacity: 0.28, transform: 'scale(1.15)' }} />
      <motion.div
        className={`relative ${dim} ${radius} flex items-center justify-center overflow-hidden`}
        style={{
          background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.85)})`,
          border: `1px solid ${color}45`,
          boxShadow: `0 0 0 1px ${color}12, inset 0 1px 0 ${color}18`,
        }}
        animate={{ boxShadow: [
          `0 0 10px ${glow}30, inset 0 1px 0 ${color}18`,
          `0 0 22px ${glow}60, inset 0 1px 0 ${color}32`,
          `0 0 10px ${glow}30, inset 0 1px 0 ${color}18`,
        ]}}
        transition={{ duration: 2.6 + delay, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`absolute inset-0 ${radius} pointer-events-none`}
          style={{ background: `linear-gradient(130deg, ${alpha(hex.neutral.white, 0.09)} 0%, ${alpha(hex.neutral.white, 0.04)} 40%, transparent 65%)` }} />
        <div className={`absolute inset-x-0 top-0 h-px ${radius}`}
          style={{ background: `linear-gradient(90deg, transparent, ${color}65, transparent)` }} />
        <span style={{ color, filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 12px ${color}60)`, fontSize: iconSize }}>
          {icon}
        </span>
      </motion.div>
      <motion.div className={`absolute inset-0 ${radius} pointer-events-none`}
        style={{ border: `1px solid ${color}30` }}
        animate={{ opacity: [0, 0.9, 0], scale: [1, 1.40, 1] }}
        transition={{ duration: 3 + delay * 0.5, repeat: Infinity, delay }} />
    </div>
  );
};

/* ══════════════════════════════════════════
   CONFIG
══════════════════════════════════════════ */
const STATUS_CFG: Record<ResultStatus, { label: string; labelKey: string; color: string; glow: string; bg: string }> = {
  EXACT:   { label: 'Exacto',    labelKey: 'predictions.status.exact',   color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55),  bg: alpha(hex.green.hover, 0.10)  },
  CORRECT: { label: 'Correcto',  labelKey: 'predictions.status.correct', color: hex.green.bright, glow: alphaOf('green', 0.55),         bg: alphaOf('green', 0.10)          },
  WRONG:   { label: 'Fallaste',  labelKey: 'predictions.status.wrong',   color: '#f87171',        glow: 'rgba(248,113,113,0.50)',        bg: 'rgba(248,113,113,0.09)'         },
  PENDING: { label: 'Pendiente', labelKey: 'common.pending',             color: hex.gold.base,    glow: alpha(hex.gold.base, 0.55),     bg: alpha(hex.gold.base, 0.09)       },
};

const MEDAL_CFG = [
  { color: hex.gold.base,  glow: alpha(hex.gold.base, 0.60),  bg: alpha(hex.gold.base, 0.10),  border: alpha(hex.gold.base, 0.30),  label: '1°' },
  { color: '#94a3b8',      glow: 'rgba(148,163,184,0.50)',     bg: 'rgba(148,163,184,0.08)',     border: 'rgba(148,163,184,0.25)',     label: '2°' },
  { color: hex.gold.muted, glow: alpha(hex.gold.muted, 0.50), bg: alpha(hex.gold.muted, 0.08), border: alpha(hex.gold.muted, 0.25), label: '3°' },
];

/* ══════════════════════════════════════════
   PREDICTION CARD
══════════════════════════════════════════ */

/* FlagCircle — 40px para mejor visibilidad */
const FlagCircle = ({ team, won, accent }: { team: any; won: boolean; accent: string }) => (
  <div className="relative shrink-0 w-10 h-10">
    {won && <div className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: accent + '40', filter: 'blur(7px)', transform: 'scale(1.35)' }} />}
    <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-lg"
      style={{ border: `2px solid ${won ? accent + '60' : alpha(hex.neutral.white, 0.12)}` }}>
      {team?.flagUrl && <Image src={team.flagUrl} alt={team.name ?? ''} fill sizes="40px" className="object-cover" unoptimized />}
    </div>
  </div>
);

const PredictionCard = ({ pred, index, t, locale }: { pred: any; index: number; t: (key: string) => string; locale: string }) => {
  const status  = (pred.resultStatus ?? 'PENDING') as ResultStatus;
  const sCfg    = STATUS_CFG[status];
  const { fixture } = pred;
  if (!fixture) return null;

  const isFinished = fixture.status === 'FINISHED';
  const homeWon    = isFinished && typeof fixture.homeScore === 'number' && typeof fixture.awayScore === 'number' && fixture.homeScore > fixture.awayScore;
  const awayWon    = isFinished && typeof fixture.homeScore === 'number' && typeof fixture.awayScore === 'number' && fixture.awayScore > fixture.homeScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
        border: `1px solid ${sCfg.color}25`,
        backdropFilter: 'blur(28px)',
        boxShadow: `0 18px 52px ${alpha(hex.neutral.black, 0.65)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
      }}>
      {/* Top neon line */}
      <div className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${sCfg.color}66, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${alpha(hex.neutral.white, 0.06)}`, background: alpha(hex.neutral.black, 0.12) }}>
        <div className="flex items-center gap-2">
          <FiClock size={11} style={{ color: alpha(hex.neutral.white, 0.35) }} />
          {/* Fecha: 11px — identificador de contexto */}
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: hex.text.secondary }}>
            {fixture.kickoffAt ? fmtShortDate(fixture.kickoffAt, locale) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Badge estado: 11px + puntos 12px */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: sCfg.bg, border: `1px solid ${sCfg.color}32` }}>
            <span className="text-[11px] font-black tracking-[0.16em] uppercase" style={{ color: sCfg.color }}>
              {sCfg.labelKey ? t(sCfg.labelKey) : sCfg.label}
            </span>
            {status !== 'PENDING' && (
              <span className="text-[12px] font-black tabular-nums"
                style={{ color: sCfg.color, textShadow: `0 0 8px ${sCfg.glow}` }}>
                {pred.pointsAwarded} pts
              </span>
            )}
          </div>
          <ShareButton
            variant="icon"
            size="sm"
            title="⚽ Orionix Gol — Mundial 2026"
            text={`⚽ Predije ${pred.predictedHomeScore}-${pred.predictedAwayScore} en ${fixture.homeTeam?.name ?? '?'} vs ${fixture.awayTeam?.name ?? '?'}\n🔮 ¿Acertaré? Juega conmigo en Orionix Gol 👇`}
            label="Compartir porra"
          />
        </div>
      </div>

      {/* Teams */}
      <div className="px-5 pt-4 pb-2">
        {[
          { team: fixture.homeTeam, real: fixture.homeScore, won: homeWon },
          { team: fixture.awayTeam, real: fixture.awayScore, won: awayWon },
        ].map(({ team, real, won }, ti) => (
          <React.Fragment key={ti}>
            {ti === 1 && <div className="h-px my-2.5" style={{ background: `linear-gradient(90deg, transparent, ${sCfg.color}18, transparent)` }} />}
            <div className="flex items-center gap-3.5">
              <FlagCircle team={team} won={won} accent={sCfg.color} />
              {/* Nombre equipo: text-sm = 14px */}
              <span className="flex-1 text-sm font-black truncate"
                style={{ color: won ? sCfg.color : alpha(hex.neutral.white, 0.65), textShadow: won ? `0 0 12px ${sCfg.glow}` : 'none' }}>
                {team?.name ?? '?'}
              </span>
              {isFinished && typeof real === 'number' && (
                <motion.span className="text-2xl font-black tabular-nums w-7 text-center shrink-0"
                  style={{ color: won ? sCfg.color : alpha(hex.neutral.white, 0.30), textShadow: won ? `0 0 14px ${sCfg.glow}` : 'none' }}
                  animate={won ? { textShadow: [`0 0 8px ${sCfg.glow}50`, `0 0 20px ${sCfg.glow}`, `0 0 8px ${sCfg.glow}50`] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity }}>
                  {real}
                </motion.span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Footer: tu porra */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-4"
        style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}`, marginTop: 4 }}>
        <div className="flex items-center gap-3">
          <PremiumIcon icon={<FiTarget />} color={sCfg.color} glow={sCfg.glow} bg={sCfg.bg} size="sm" />
          <div>
            {/* "Tu predicción" label: 11px */}
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: hex.text.muted }}>{t('fixtures.yourPrediction')}</p>
            {/* Score predicho: text-xl = 20px */}
            <p className="text-xl font-black tabular-nums leading-none mt-0.5"
              style={{ color: sCfg.color, textShadow: `0 0 10px ${sCfg.glow}55` }}>
              {pred.predictedHomeScore} – {pred.predictedAwayScore}
            </p>
          </div>
        </div>
        {isFinished && typeof fixture.homeScore === 'number' && (
          <div className="text-right">
            {/* "Resultado" label: 11px */}
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: hex.text.muted }}>{t('fixtures.result')}</p>
            {/* Score real: text-xl = 20px */}
            <p className="text-xl font-black tabular-nums leading-none mt-0.5" style={{ color: alpha(hex.neutral.white, 0.55) }}>
              {fixture.homeScore} – {fixture.awayScore}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function PredictionsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const t            = useTranslations();
  const locale       = useLocale();
  const { user }     = useAuth();

  const initialTab = (() => {
    const tab = searchParams.get('tab')?.toLowerCase();
    if (tab === 'ranking') return 'RANKING' as const;
    if (tab === 'leagues' || tab === 'ligas') return 'LEAGUES' as const;
    return 'MY_PREDICTIONS' as const;
  })();
  const [activeTab,       setActiveTab]       = useState<'MY_PREDICTIONS' | 'RANKING' | 'LEAGUES'>(initialTab);
  const [showLeagueModal, setShowLeagueModal] = useState(false);

  const userId = user ? Number(user.id) : null;
  const { data: tournament }               = useCurrentTournament();
  const tournamentId                       = tournament?.id ?? null;

  const { data: allFixtures = [], isLoading: fixturesLoading } = useTournamentFixtures(tournamentId);
  const { data: rawPredictions = [], isLoading: predsLoading } = useUserPredictions(userId);
  const { data: scoreHistory = [], isLoading: histLoading }   = useScoreHistory(userId, tournamentId);
  const { data: rankingItems = [], isLoading: rankLoading }   = useGlobalRanking(tournamentId, RANKING_PAGE.predictions);
  const { data: leaguesData = [], isLoading: leaguesLoading } = useUserLeaguesWithRankings(userId);

  const loading =
    activeTab === 'MY_PREDICTIONS' ? fixturesLoading || predsLoading || histLoading :
    activeTab === 'RANKING'        ? rankLoading :
    leaguesLoading;

  const fixtureMap = useMemo(() => {
    const m: Record<number, any> = {};
    (allFixtures as any[]).forEach(f => { m[f.id] = f; });
    return m;
  }, [allFixtures]);

  const scoreMap = useMemo(() => {
    const m: Record<number, { pointsAwarded: number; ruleCode: string }> = {};
    (scoreHistory as any[]).forEach((s: any) => {
      m[s.predictionId] = { pointsAwarded: s.pointsAwarded ?? 0, ruleCode: s.ruleCode ?? 'PENDING' };
    });
    return m;
  }, [scoreHistory]);

  const myPredictions = useMemo(() =>
    (rawPredictions as any[])
      .map((pred: any) => {
        const fixture = fixtureMap[pred.fixtureId];
        if (!fixture) return null;
        const score         = scoreMap[pred.id];
        const pointsAwarded = score?.pointsAwarded ?? 0;
        const ruleCode      = score?.ruleCode ?? 'PENDING';
        const resultStatus: ResultStatus =
          ruleCode === 'EXACT_SCORE' ? 'EXACT' :
          ruleCode === 'WINNER_ONLY' ? 'CORRECT' :
          ruleCode === 'PENDING'     ? 'PENDING' : 'WRONG';
        return {
          id: pred.id,
          fixture: {
            id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam,
            homeScore: fixture.homeScore, awayScore: fixture.awayScore,
            kickoffAt: fixture.kickoffAt, status: fixture.status,
          },
          predictedHomeScore: pred.predictedHomeScore,
          predictedAwayScore: pred.predictedAwayScore,
          pointsAwarded, resultStatus, submittedAt: pred.submittedAt,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
    [rawPredictions, fixtureMap, scoreMap]
  );

  const globalRanking = useMemo(() =>
    (rankingItems as any[]).map((score: any, idx: number) => ({
      rank:        score.rankPosition ?? idx + 1,
      user:        score.fullName || score.username,
      points:      score.totalPoints ?? 0,
      predictions: score.matchesScored ?? 0,
    })),
    [rankingItems]
  );

  const myLeagues = leaguesData as any[];

  const stats = useMemo(() => {
    const valid    = myPredictions;
    const finished = valid.filter((p: any) => p?.fixture?.status === 'FINISHED');
    const correct  = finished.filter((p: any) =>
      p?.predictedHomeScore === p?.fixture?.homeScore && p?.predictedAwayScore === p?.fixture?.awayScore
    );
    return { total: valid.length, finished: finished.length, correct: correct.length };
  }, [myPredictions]);

  const accuracy = stats.finished > 0 ? Math.round((stats.correct / stats.finished) * 100) : 0;

  /* Tabs — íconos 15px, labels text-sm */
  const TRANSLATED_TABS = [
    { key: 'MY_PREDICTIONS' as const, label: t('predictions.tabs.myPredictions'), icon: <FiTarget size={15} />,  color: hex.green.bright, glow: alphaOf('green', 0.55)       },
    { key: 'RANKING'        as const, label: t('predictions.tabs.ranking'),        icon: <FiAward size={15} />,   color: hex.gold.base,    glow: alpha(hex.gold.base, 0.55)   },
    { key: 'LEAGUES'        as const, label: t('predictions.tabs.leagues'),        icon: <FiUsers size={15} />,   color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55) },
  ];

  const STAT_CARDS = [
    { label: t('predictions.tabs.myPredictions'), value: stats.total,    suffix: '',  icon: <FiActivity />,    color: hex.gold.base,    glow: alpha(hex.gold.base, 0.55),    bg: alpha(hex.gold.base, 0.08)    },
    { label: t('common.finished'),                value: stats.finished, suffix: '',  icon: <FiCheck />,       color: hex.green.bright, glow: alphaOf('green', 0.55),         bg: alphaOf('green', 0.08)          },
    { label: t('predictions.status.exact'),       value: stats.correct,  suffix: '',  icon: <FiZap />,         color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55),  bg: alpha(hex.green.hover, 0.08)  },
    { label: t('profile.performance'),            value: accuracy,       suffix: '%', icon: <FiTrendingUp />,  color: '#a78bfa',        glow: 'rgba(167,139,250,0.55)',        bg: 'rgba(167,139,250,0.08)'        },
  ];

  const SCORING_RULES_KEYS = [
    { pts: 3, icon: <FiZap />,   color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55),  bg: alpha(hex.green.hover, 0.08),  titleKey: 'predictions.rules.exactScore',    descKey: 'predictions.rules.exactScoreDesc'    },
    { pts: 1, icon: <FiCheck />, color: hex.green.bright, glow: alphaOf('green', 0.55),         bg: alphaOf('green', 0.08),         titleKey: 'predictions.rules.correctResult',  descKey: 'predictions.rules.correctResultDesc' },
    { pts: 0, icon: <FiX />,     color: '#64748b',        glow: 'rgba(100,116,139,0.40)',        bg: 'rgba(100,116,139,0.05)',        titleKey: 'predictions.rules.wrong',          descKey: 'predictions.rules.wrongDesc'         },
  ];

  const maxRankPts = globalRanking[0]?.points ?? 1;

  return (
    <div className="w-full relative">

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -100,
          background: `radial-gradient(circle, ${alphaOf('green', 0.06)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 480, height: 480, bottom: -60, right: -60,
          background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.05)} 0%, transparent 65%)`,
          filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 15, repeat: Infinity, delay: 4 }} />

      {/* Header */}
      <div className="relative z-10">
        <Header title="Orionix Gol" subtitle={t('predictions.subtitle')} centered />
      </div>

      {/* ── STICKY TAB BAR — más prominente y legible ── */}
      <div data-tour="predictions-tabs" className="sticky top-0 z-40"
        style={{
          background: alpha(hex.bg.primary, 0.95),
          borderBottom: `1px solid ${alphaOf('green', 0.14)}`,
          backdropFilter: 'blur(24px)',
          boxShadow: `0 4px 36px ${alpha(hex.neutral.black, 0.60)}`,
        }}>
        {/* Bottom accent line */}
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.30)}, ${alpha(hex.gold.base, 0.18)}, transparent)` }} />

        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-1.5">
          {TRANSLATED_TABS.map(({ key, label, icon, color, glow }) => {
            const isActive = activeTab === key;
            return (
              <motion.button key={key} onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl overflow-hidden"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${color}18, ${alpha(hex.bg.elevated, 0.85)})`
                    : 'transparent',
                  border: `1px solid ${isActive ? color + '35' : 'transparent'}`,
                  outline: 'none', cursor: 'pointer',
                  boxShadow: isActive ? `0 4px 16px ${alpha(hex.neutral.black, 0.30)}` : 'none',
                }}
                whileHover={{ backgroundColor: alpha(hex.neutral.white, 0.04) }}
                whileTap={{ scale: 0.96 }}>
                {/* Active top line */}
                {isActive && (
                  <motion.div className="absolute inset-x-0 top-0 h-[2px]"
                    layoutId="tabTopLine"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}77, transparent)` }} />
                )}
                <span style={{ color: isActive ? color : alpha(hex.neutral.white, 0.50), filter: isActive ? `drop-shadow(0 0 5px ${glow})` : 'none', display: 'flex' }}>
                  {icon}
                </span>
                {/* Label tab: text-sm = 14px */}
                <span className="text-sm font-black tracking-[0.07em]"
                  style={{ color: isActive ? color : alpha(hex.neutral.white, 0.50), textShadow: isActive ? `0 0 12px ${glow}` : 'none' }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
          <div className="flex-1" />
          <EQBars color={alphaOf('green', 0.35)} count={7} maxH={14} />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-32">
        {loading ? (
          <div className="flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-4">
              <motion.div className="w-12 h-12 rounded-full border-2"
                style={{ borderColor: alphaOf('green', 0.20), borderTopColor: hex.green.bright }}
                animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
              {/* Loading: 12px */}
              <p className="text-[12px] font-bold tracking-[0.26em] uppercase" style={{ color: alphaOf('green', 0.60) }}>{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ══════════ MIS PORRAS ══════════ */}
            {activeTab === 'MY_PREDICTIONS' && (
              <motion.div key="my-predictions" className="space-y-5"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}>

                {/* Section title */}
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${hex.green.bright}, #10b981)`, boxShadow: `0 0 10px ${alphaOf('green', 0.50)}` }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.myPredictions')}</h2>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.25)}, transparent)` }} />
                </div>

                {/* Stats grid */}
                <div data-tour="predictions-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STAT_CARDS.map((s, i) => (
                    <motion.div key={s.label}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden rounded-2xl p-4"
                      style={{
                        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
                        border: `1px solid ${s.color}20`,
                        backdropFilter: 'blur(24px)',
                        boxShadow: `0 14px 40px ${alpha(hex.neutral.black, 0.55)}`,
                      }}>
                      {/* Top line */}
                      <div className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
                      <div className="flex items-start justify-between mb-3">
                        <PremiumIcon icon={s.icon} color={s.color} glow={s.glow} bg={s.bg} size="sm" delay={i * 0.3} />
                        <EQBars color={s.color + '55'} count={4} maxH={10} />
                      </div>
                      {/* Número KPI */}
                      <motion.p className="text-3xl font-black tabular-nums leading-none mb-1.5"
                        style={{ color: s.color, textShadow: `0 0 20px ${s.glow}` }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 + 0.2 }}>
                        {s.value}{s.suffix}
                      </motion.p>
                      {/* Label stat: 12px mínimo */}
                      <p className="text-[12px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: hex.text.secondary }}>{s.label}</p>
                      <GlowBar value={s.value} max={Math.max(s.value, 1)} color={s.color} />
                    </motion.div>
                  ))}
                </div>

                {/* Scoring rules */}
                <motion.div
                  data-tour="predictions-rules"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl p-5"
                  style={{
                    background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
                    border: `1px solid ${alphaOf('green', 0.14)}`,
                    backdropFilter: 'blur(24px)',
                    boxShadow: `0 14px 44px ${alpha(hex.neutral.black, 0.55)}`,
                  }}>
                  <div className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.55)}, ${alpha(hex.green.hover, 0.38)}, transparent)` }} />

                  <div className="flex items-center gap-3.5 mb-5">
                    <PremiumIcon icon={<FiShield />} color={hex.green.bright} glow={alphaOf('green', 0.55)} bg={alphaOf('green', 0.08)} size="sm" />
                    <div>
                      {/* "SISTEMA DE PUNTUACIÓN" — 11px */}
                      <p className="text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: alphaOf('green', 0.65) }}>{t('predictions.scoringOf')}</p>
                      {/* Título bloque: text-sm = 14px */}
                      <p className="text-sm font-black text-white leading-none mt-0.5">{t('predictions.scoringTitle')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {SCORING_RULES_KEYS.map((rule, i) => (
                      <div key={i} className="flex-1 relative overflow-hidden rounded-xl p-4"
                        style={{
                          background: `linear-gradient(135deg, ${rule.bg}, ${alpha(hex.bg.primary, 0.65)})`,
                          border: `1px solid ${rule.color}28`,
                        }}>
                        <div className="absolute inset-x-0 top-0 h-px"
                          style={{ background: `linear-gradient(90deg, transparent, ${rule.color}45, transparent)` }} />
                        <div className="flex items-center justify-between mb-3">
                          <PremiumIcon icon={rule.icon} color={rule.color} glow={rule.glow} bg={rule.bg} size="sm" delay={i * 0.4} />
                          <div className="text-right">
                            <span className="text-4xl font-black tabular-nums leading-none"
                              style={{ color: rule.color, textShadow: `0 0 20px ${rule.glow}` }}>
                              {rule.pts}
                            </span>
                            {/* "pts": 10px — decorativo mínimo */}
                            <p className="text-[10px] font-black tracking-[0.16em] uppercase -mt-0.5" style={{ color: hex.text.muted }}>pts</p>
                          </div>
                        </div>
                        {/* Título regla: text-sm = 14px */}
                        <p className="text-sm font-black text-white leading-tight mb-1">{t(rule.titleKey)}</p>
                        {/* Descripción regla: 12px */}
                        <p className="text-[12px] leading-relaxed" style={{ color: hex.text.secondary }}>{t(rule.descKey)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Predictions list */}
                {myPredictions.length > 0 ? (
                  <div data-tour="predictions-list" className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      {/* Contador: 12px */}
                      <p className="text-[12px] font-black tracking-[0.18em] uppercase" style={{ color: hex.text.secondary }}>
                        {t('predictions.predictionsRegistered', { count: myPredictions.length })}
                      </p>
                    </div>
                    {myPredictions.map((pred, idx) => (
                      <PredictionCard key={pred.id} pred={pred} index={idx} t={t} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <motion.div data-tour="predictions-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4 py-16">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl"
                        style={{ background: alphaOf('green', 0.08), filter: 'blur(16px)', transform: 'scale(1.2)' }} />
                      <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: alphaOf('green', 0.07), border: `1px solid ${alphaOf('green', 0.20)}` }}>
                        <FiTarget size={28} style={{ color: alphaOf('green', 0.50) }} />
                      </div>
                    </div>
                    <div className="text-center">
                      {/* Empty state: text-sm = 14px */}
                      <p className="text-sm font-black tracking-[0.18em] uppercase mb-1.5" style={{ color: hex.text.secondary }}>{t('predictions.noPredictionsYet')}</p>
                      {/* Subtexto: 13px */}
                      <p className="text-[13px]" style={{ color: hex.text.muted }}>{t('predictions.visitCalendar')}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: `0 8px 28px ${alphaOf('green', 0.30)}` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push('/fixtures')}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-black tracking-[0.10em] uppercase"
                      style={{
                        background: `linear-gradient(135deg, ${alphaOf('green', 0.16)}, ${alpha(hex.bg.elevated, 0.90)})`,
                        border: `1px solid ${alphaOf('green', 0.32)}`,
                        color: hex.green.bright,
                        /* Botón: text-sm = 14px */
                        fontSize: '14px',
                      }}>
                      <FiChevronRight size={14} /> {t('predictions.viewMatches')}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════ RANKING ══════════ */}
            {activeTab === 'RANKING' && (
              <motion.div key="ranking" className="space-y-5"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}>

                {/* Section title */}
                <div className="flex items-center gap-3 mb-1">
                  <motion.div className="w-1 h-7 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${hex.gold.base}, #f59e0b)` }}
                    animate={{ boxShadow: [`0 0 6px ${alpha(hex.gold.base, 0.4)}`, `0 0 20px ${alpha(hex.gold.base, 0.9)}`, `0 0 6px ${alpha(hex.gold.base, 0.4)}`] }}
                    transition={{ duration: 2.2, repeat: Infinity }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.ranking')}</h2>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.30)}, transparent)` }} />
                  {/* Badge jugadores: 12px */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: alpha(hex.gold.base, 0.08), border: `1px solid ${alpha(hex.gold.base, 0.22)}` }}>
                    <FiAward size={11} style={{ color: hex.gold.bright }} />
                    <span className="text-[12px] font-black" style={{ color: hex.gold.bright }}>{globalRanking.length} {t('predictions.players')}</span>
                  </div>
                </div>

                {/* Top 3 podium */}
                {globalRanking.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    {globalRanking.slice(0, 3).map((player, idx) => {
                      const mc = MEDAL_CFG[idx];
                      return (
                        <motion.div key={player.rank}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: idx * 0.10, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                          className="relative overflow-hidden rounded-2xl flex flex-col items-center py-6 px-3"
                          style={{
                            background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.88)} 0%, ${alpha(mc.bg, 0.60)} 40%, ${alpha(hex.bg.secondary, 0.95)} 100%)`,
                            border: `1px solid ${mc.border}`,
                            backdropFilter: 'blur(24px)',
                            boxShadow: `0 16px 44px ${alpha(hex.neutral.black, 0.60)}, 0 0 28px ${mc.glow}22`,
                          }}>
                          <div className="absolute inset-x-0 top-0 h-[2px]"
                            style={{ background: `linear-gradient(90deg, transparent, ${mc.color}70, transparent)` }} />
                          <motion.div className="w-11 h-11 rounded-full flex items-center justify-center mb-3 text-sm font-black"
                            style={{ background: mc.bg, border: `2px solid ${mc.color}55`, color: mc.color,
                              boxShadow: `0 0 18px ${mc.glow}` }}
                            animate={{ boxShadow: [`0 0 10px ${mc.glow}40`, `0 0 24px ${mc.glow}`, `0 0 10px ${mc.glow}40`] }}
                            transition={{ duration: 2.5 + idx * 0.4, repeat: Infinity }}>
                            {mc.label}
                          </motion.div>
                          {/* Nombre podio: text-sm = 14px */}
                          <p className="text-sm font-black text-center truncate w-full leading-tight"
                            style={{ color: mc.color, textShadow: `0 0 12px ${mc.glow}` }}>{player.user}</p>
                          <motion.p className="text-3xl font-black tabular-nums mt-1.5"
                            style={{ color: mc.color, textShadow: `0 0 18px ${mc.glow}` }}
                            animate={{ textShadow: [`0 0 8px ${mc.glow}50`, `0 0 24px ${mc.glow}`, `0 0 8px ${mc.glow}50`] }}
                            transition={{ duration: 3, repeat: Infinity }}>
                            {player.points}
                          </motion.p>
                          {/* "pts": 11px */}
                          <p className="text-[11px] font-bold tracking-[0.18em] uppercase -mt-0.5 mb-3" style={{ color: hex.text.muted }}>pts</p>
                          <div className="w-full">
                            <GlowBar value={player.points} max={maxRankPts} color={mc.color} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Rest of ranking */}
                {globalRanking.length > 3 && (
                  <div className="relative overflow-hidden rounded-2xl"
                    style={{
                      background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.88)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
                      border: `1px solid ${alpha(hex.neutral.white, 0.07)}`,
                      backdropFilter: 'blur(24px)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.35)}, transparent)` }} />
                    {globalRanking.slice(3).map((player, idx) => {
                      const isMe = player.user === (user as any)?.username || player.user === (user as any)?.fullName;
                      return (
                        <motion.div key={player.rank}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.04 }}
                          whileHover={{ backgroundColor: alpha(hex.neutral.white, 0.03) }}
                          className="flex items-center gap-3 px-5 py-3.5 relative"
                          style={{
                            borderBottom: idx < globalRanking.length - 4 ? `1px solid ${alpha(hex.neutral.white, 0.04)}` : 'none',
                            background: isMe ? alphaOf('green', 0.05) : 'transparent',
                            borderLeft: isMe ? `3px solid ${alphaOf('green', 0.45)}` : '3px solid transparent',
                          }}>
                          {/* Posición: 12px */}
                          <span className="w-7 text-center text-[12px] font-black tabular-nums shrink-0" style={{ color: hex.text.muted }}>
                            {player.rank}
                          </span>
                          <div className="flex-1 min-w-0">
                            {/* Nombre: text-sm = 14px */}
                            <p className="text-sm font-black truncate"
                              style={{ color: isMe ? hex.green.bright : alpha(hex.neutral.white, 0.80) }}>{player.user}</p>
                            <div className="mt-1.5">
                              <GlowBar value={player.points} max={maxRankPts} color={isMe ? hex.green.bright : '#475569'} />
                            </div>
                          </div>
                          {/* Puntos: text-sm */}
                          <span className="text-sm font-black tabular-nums shrink-0"
                            style={{ color: isMe ? hex.green.bright : alpha(hex.neutral.white, 0.60) }}>
                            {player.points}
                          </span>
                          {/* "pts": 11px */}
                          <span className="text-[11px] font-bold shrink-0" style={{ color: hex.text.muted }}>pts</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {globalRanking.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: alpha(hex.gold.base, 0.08), border: `1px solid ${alpha(hex.gold.base, 0.20)}` }}>
                      <FiBarChart2 size={24} style={{ color: alpha(hex.gold.base, 0.45) }} />
                    </div>
                    {/* text-sm = 14px */}
                    <p className="text-sm font-bold tracking-[0.18em] uppercase" style={{ color: hex.text.secondary }}>{t('predictions.rankingUnavailable')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════ LIGAS ══════════ */}
            {activeTab === 'LEAGUES' && (
              <motion.div key="leagues" className="space-y-4"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}>

                {/* Section title */}
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${hex.green.hover}, #10b981)`, boxShadow: `0 0 10px ${alpha(hex.green.hover, 0.45)}` }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.myLeagues')}</h2>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(hex.green.hover, 0.25)}, transparent)` }} />
                </div>

                {myLeagues.map((league, idx) => (
                  <motion.div key={league.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                      background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
                      border: `1px solid ${alpha(hex.green.hover, 0.18)}`,
                      backdropFilter: 'blur(28px)',
                      boxShadow: `0 18px 52px ${alpha(hex.neutral.black, 0.65)}`,
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.green.hover, 0.55)}, transparent)` }} />

                    {/* League header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <PremiumIcon icon={<FiShield />} color={hex.green.hover} glow={alpha(hex.green.hover, 0.55)} bg={alpha(hex.green.hover, 0.08)} size="sm" delay={idx * 0.2} />
                        <div>
                          {/* Nombre liga: text-base = 16px */}
                          <p className="text-base font-black text-white leading-none">{league.name}</p>
                          {/* Info miembros/código: 12px */}
                          <p className="text-[12px] mt-1 tracking-wide" style={{ color: hex.text.secondary }}>
                            {league.memberCount}{league.maxMembers ? `/${league.maxMembers}` : ''} {t('predictions.members')} · #{league.code}
                          </p>
                        </div>
                      </div>
                      {/* Badge posición: 12px */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: alpha(hex.green.hover, 0.10), border: `1px solid ${alpha(hex.green.hover, 0.28)}` }}>
                        <span className="text-[12px] font-black" style={{ color: hex.green.bright }}>{t('predictions.position')} #{league.myRank || '—'}</span>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 px-5 pb-4">
                      {[
                        { label: t('predictions.myPts'),      value: league.myPoints,                              color: hex.green.bright, icon: <FiActivity size={12} /> },
                        { label: t('predictions.leader'),     value: league.leader.name,                           color: hex.gold.base,    icon: <FiStar size={12} />, isText: true },
                        { label: t('predictions.difference'), value: `-${league.leader.points - league.myPoints}`, color: '#f87171',        icon: <FiTrendingUp size={12} />, isText: true },
                      ].map((item, i) => (
                        <div key={i} className="relative overflow-hidden rounded-xl p-3 text-center"
                          style={{
                            background: alpha(hex.bg.primary, 0.65),
                            border: `1px solid ${item.color}20`,
                          }}>
                          <div className="flex items-center justify-center gap-1 mb-1.5"
                            style={{ color: item.color + '80' }}>
                            {item.icon}
                          </div>
                          {/* Valor stat: 20px si número, text-sm si texto */}
                          <p className="font-black leading-none truncate"
                            style={{
                              color: item.color,
                              fontSize: (item as any).isText ? '13px' : '20px',
                              textShadow: `0 0 10px ${item.color}50`,
                            }}>
                            {item.value}
                          </p>
                          {!(item as any).isText && (
                            <p className="text-[11px] font-bold -mt-0.5" style={{ color: hex.text.muted }}>pts</p>
                          )}
                          {/* Label stat: 12px */}
                          <p className="text-[12px] font-bold tracking-[0.14em] uppercase mt-1.5" style={{ color: hex.text.muted }}>{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* GlowBar posición */}
                    <div className="px-5 pb-3">
                      <GlowBar value={league.myPoints} max={Math.max(league.leader.points, 1)} color={hex.green.hover} />
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-5 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 8px 26px ${alpha(hex.green.hover, 0.30)}` }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/predictions/leagues/${league.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black tracking-[0.10em] uppercase"
                        style={{
                          background: `linear-gradient(135deg, ${alpha(hex.green.hover, 0.16)}, ${alpha(hex.bg.elevated, 0.90)})`,
                          border: `1px solid ${alpha(hex.green.hover, 0.32)}`,
                          color: hex.green.hover,
                          /* Botón: text-sm = 14px */
                          fontSize: '14px',
                        }}>
                        {t('predictions.viewLeague')} <FiChevronRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {/* Create / Join card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: myLeagues.length * 0.07 + 0.1 }}
                  className="relative overflow-hidden rounded-2xl p-5"
                  style={{
                    background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
                    border: `1px solid ${alphaOf('green', 0.16)}`,
                    backdropFilter: 'blur(28px)',
                    boxShadow: `0 14px 44px ${alpha(hex.neutral.black, 0.55)}`,
                  }}>
                  <div className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.48)}, ${alpha(hex.green.hover, 0.30)}, transparent)` }} />
                  <div className="flex items-center gap-3.5 mb-5">
                    <PremiumIcon icon={<FiUsers />} color={hex.green.bright} glow={alphaOf('green', 0.55)} bg={alphaOf('green', 0.08)} size="md" />
                    <div>
                      {/* "COMPETICIÓN": 11px */}
                      <p className="text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: alphaOf('green', 0.65) }}>{t('predictions.competition')}</p>
                      {/* Título: text-sm = 14px */}
                      <p className="text-sm font-black text-white leading-none mt-0.5">{t('predictions.createOrJoin')}</p>
                    </div>
                  </div>
                  {/* Descripción: text-sm = 14px */}
                  <p className="text-sm mb-5" style={{ color: hex.text.secondary }}>{t('predictions.competeFriends')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: `0 6px 22px ${alphaOf('green', 0.25)}` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowLeagueModal(false); router.push('/predictions/create-league'); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-black tracking-[0.08em] uppercase"
                      style={{
                        background: `linear-gradient(135deg, ${alphaOf('green', 0.18)}, ${alpha(hex.bg.elevated, 0.90)})`,
                        border: `1px solid ${alphaOf('green', 0.32)}`,
                        color: hex.green.bright,
                        fontSize: '14px',
                      }}>
                      <FiPlus size={15} /> {t('predictions.createLeague')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: `0 6px 22px ${alpha(hex.green.hover, 0.22)}` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowLeagueModal(false); router.push('/predictions/join-league'); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-black tracking-[0.08em] uppercase"
                      style={{
                        background: `linear-gradient(135deg, ${alpha(hex.green.hover, 0.14)}, ${alpha(hex.bg.elevated, 0.90)})`,
                        border: `1px solid ${alpha(hex.green.hover, 0.30)}`,
                        color: hex.green.hover,
                        fontSize: '14px',
                      }}>
                      <FiLogIn size={15} /> {t('predictions.join')}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      <TourButton steps={getTourSteps(locale, 'predictions')} />

      {/* ── LEAGUE MODAL ── */}
      <AnimatePresence>
        {showLeagueModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: alpha(hex.neutral.black, 0.78), backdropFilter: 'blur(10px)' }}
            onClick={() => setShowLeagueModal(false)}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden rounded-2xl p-6 max-w-sm w-full mx-4"
              style={{
                background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.96)} 0%, ${alpha(hex.bg.elevated, 0.98)} 100%)`,
                border: `1px solid ${alphaOf('green', 0.22)}`,
                backdropFilter: 'blur(28px)',
                boxShadow: `0 36px 88px ${alpha(hex.neutral.black, 0.85)}`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.65)}, transparent)` }} />
              <div className="flex items-center gap-3.5 mb-5">
                <PremiumIcon icon={<FiUsers />} color={hex.green.bright} glow={alphaOf('green', 0.55)} bg={alphaOf('green', 0.08)} size="md" />
                <h2 className="text-lg font-black text-white">{t('predictions.newLeague')}</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: t('predictions.createLeague'), icon: <FiPlus size={15} />, color: hex.green.bright, glow: alphaOf('green', 0.55), route: '/predictions/create-league' },
                  { label: t('predictions.joinLeague'),   icon: <FiLogIn size={15} />, color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55), route: '/predictions/join-league' },
                ].map((opt) => (
                  <motion.button key={opt.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowLeagueModal(false); router.push(opt.route); }}
                    className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl font-black tracking-[0.08em] uppercase relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${opt.color}16, ${alpha(hex.bg.primary, 0.90)})`,
                      border: `1px solid ${opt.color}32`,
                      color: opt.color,
                      /* Botón modal: text-sm = 14px */
                      fontSize: '14px',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${opt.color}55, transparent)` }} />
                    {opt.icon} {opt.label}
                  </motion.button>
                ))}
              </div>
              {/* Cancelar: 12px */}
              <motion.button
                whileHover={{ color: hex.text.secondary }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLeagueModal(false)}
                className="w-full mt-3 py-2.5 text-[12px] font-bold tracking-[0.20em] uppercase transition-colors"
                style={{ color: hex.text.muted }}>
                {t('common.cancel')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
