'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useT } from '@/hooks/useT';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTarget, FiAward, FiUsers, FiZap, FiCheck, FiX,
  FiActivity, FiBarChart2, FiTrendingUp, FiClock,
  FiStar, FiPlus, FiLogIn, FiChevronRight, FiShield,
} from 'react-icons/fi';
import { Header } from '@/components/Navigation';
import { getUserPredictions, getFixtureById, getCurrentTournament } from '@/services/publicTournament';
import { scoringService, leagueService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
type ResultStatus = 'EXACT' | 'CORRECT' | 'WRONG' | 'PENDING';

/* ══════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════ */
const GlowBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => (
  <div className="relative h-[3px] rounded-full overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
    <motion.div className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 6px ${color}` }}
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

/* PremiumIcon — identical to dashboard version */
const PremiumIcon = ({
  icon, color, glow, bg, size = 'md', delay = 0,
}: {
  icon: React.ReactNode; color: string; glow: string; bg: string;
  size?: 'sm' | 'md' | 'lg'; delay?: number;
}) => {
  const dim      = { sm: 'w-8 h-8',    md: 'w-10 h-10', lg: 'w-14 h-14' }[size];
  const iconSize = { sm: 14,            md: 18,           lg: 26          }[size];
  const radius   = { sm: 'rounded-lg',  md: 'rounded-xl', lg: 'rounded-2xl' }[size];
  return (
    <div className="relative shrink-0">
      <div className={`absolute inset-0 ${radius} pointer-events-none`}
        style={{ background: glow, filter: 'blur(14px)', opacity: 0.28, transform: 'scale(1.15)' }} />
      <motion.div
        className={`relative ${dim} ${radius} flex items-center justify-center overflow-hidden`}
        style={{
          background: `linear-gradient(145deg, ${bg}, rgba(1,4,14,0.85))`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 0 1px ${color}10, inset 0 1px 0 ${color}15`,
        }}
        animate={{ boxShadow: [
          `0 0 10px ${glow}30, inset 0 1px 0 ${color}15`,
          `0 0 22px ${glow}60, inset 0 1px 0 ${color}30`,
          `0 0 10px ${glow}30, inset 0 1px 0 ${color}15`,
        ]}}
        transition={{ duration: 2.6 + delay, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`absolute inset-0 ${radius} pointer-events-none`}
          style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)' }} />
        <div className={`absolute inset-x-0 top-0 h-px ${radius}`}
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
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
const TABS = [
  { key: 'MY_PREDICTIONS' as const, label: 'Mis Porras',  icon: <FiTarget size={13} />,  color: '#22d3ee', glow: 'rgba(34,211,238,0.55)'  },
  { key: 'RANKING'        as const, label: 'Ranking',      icon: <FiAward size={13} />,   color: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  },
  { key: 'LEAGUES'        as const, label: 'Ligas',        icon: <FiUsers size={13} />,   color: '#34d399', glow: 'rgba(52,211,153,0.55)'  },
];

const STATUS_CFG: Record<ResultStatus, { label: string; labelKey: string; color: string; glow: string; bg: string }> = {
  EXACT:   { label: 'Exacto',    labelKey: 'predictions.status.exact',   color: '#34d399', glow: 'rgba(52,211,153,0.55)',  bg: 'rgba(52,211,153,0.10)'  },
  CORRECT: { label: 'Correcto',  labelKey: 'predictions.status.correct', color: '#22d3ee', glow: 'rgba(34,211,238,0.55)',  bg: 'rgba(34,211,238,0.10)'  },
  WRONG:   { label: 'Fallaste',  labelKey: 'predictions.status.wrong',   color: '#f87171', glow: 'rgba(248,113,113,0.50)', bg: 'rgba(248,113,113,0.08)' },
  PENDING: { label: 'Pendiente', labelKey: 'common.pending',             color: '#fbbf24', glow: 'rgba(251,191,36,0.55)',  bg: 'rgba(251,191,36,0.08)'  },
};

const SCORING_RULES_KEYS = [
  { pts: 3, icon: <FiZap />,   color: '#34d399', glow: 'rgba(52,211,153,0.55)',  bg: 'rgba(52,211,153,0.08)',  titleKey: 'predictions.rules.exactScore',    descKey: 'predictions.rules.exactScoreDesc'    },
  { pts: 1, icon: <FiCheck />, color: '#22d3ee', glow: 'rgba(34,211,238,0.55)',  bg: 'rgba(34,211,238,0.08)',  titleKey: 'predictions.rules.correctResult',  descKey: 'predictions.rules.correctResultDesc' },
  { pts: 0, icon: <FiX />,     color: '#64748b', glow: 'rgba(100,116,139,0.40)', bg: 'rgba(100,116,139,0.05)', titleKey: 'predictions.rules.wrong',          descKey: 'predictions.rules.wrongDesc'         },
];

const MEDAL_CFG = [
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.60)', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.30)', label: '1°' },
  { color: '#94a3b8', glow: 'rgba(148,163,184,0.50)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)', label: '2°' },
  { color: '#f97316', glow: 'rgba(249,115,22,0.50)', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', label: '3°' },
];

/* ══════════════════════════════════════════
   PREDICTION CARD
══════════════════════════════════════════ */
const FlagCircle = ({ team, won, accent }: { team: any; won: boolean; accent: string }) => (
  <div className="relative shrink-0 w-8 h-8">
    {won && <div className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: accent + '40', filter: 'blur(6px)', transform: 'scale(1.35)' }} />}
    <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-lg"
      style={{ border: `1.5px solid ${won ? accent + '55' : 'rgba(255,255,255,0.10)'}` }}>
      {team?.flagUrl && <Image src={team.flagUrl} alt={team.name ?? ''} fill sizes="32px" className="object-cover" unoptimized />}
    </div>
  </div>
);

const PredictionCard = ({ pred, index, t }: { pred: any; index: number; t: (key: string) => string }) => {
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
        background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
        border: `1px solid ${sCfg.color}20`,
        backdropFilter: 'blur(28px)',
        boxShadow: `0 16px 48px rgba(0,0,0,0.60)`,
      }}>
      {/* Top neon line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${sCfg.color}55, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-1.5">
          <FiClock size={9} style={{ color: 'rgba(100,116,139,0.55)' }} />
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">
            {fixture.kickoffAt
              ? new Date(fixture.kickoffAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })
              : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: sCfg.bg, border: `1px solid ${sCfg.color}28` }}>
            <span className="text-[8px] font-black tracking-[0.22em] uppercase" style={{ color: sCfg.color }}>
              {sCfg.labelKey ? t(sCfg.labelKey) : sCfg.label}
            </span>
            {status !== 'PENDING' && (
              <span className="text-[10px] font-black tabular-nums"
                style={{ color: sCfg.color, textShadow: `0 0 8px ${sCfg.glow}` }}>
                {pred.pointsAwarded} pts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="px-4 pt-3 pb-1">
        {[
          { team: fixture.homeTeam, real: fixture.homeScore, won: homeWon },
          { team: fixture.awayTeam, real: fixture.awayScore, won: awayWon },
        ].map(({ team, real, won }, ti) => (
          <React.Fragment key={ti}>
            {ti === 1 && <div className="h-px my-2" style={{ background: `linear-gradient(90deg, transparent, ${sCfg.color}15, transparent)` }} />}
            <div className="flex items-center gap-3">
              <FlagCircle team={team} won={won} accent={sCfg.color} />
              <span className="flex-1 text-[12px] font-black truncate"
                style={{ color: won ? sCfg.color : 'rgba(148,163,184,0.78)', textShadow: won ? `0 0 12px ${sCfg.glow}` : 'none' }}>
                {team?.name ?? '?'}
              </span>
              {isFinished && typeof real === 'number' && (
                <motion.span className="text-xl font-black tabular-nums w-6 text-center shrink-0"
                  style={{ color: won ? sCfg.color : 'rgba(71,85,105,0.60)', textShadow: won ? `0 0 14px ${sCfg.glow}` : 'none' }}
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
      <div className="flex items-center justify-between px-4 pt-3 pb-3.5">
        <div className="flex items-center gap-2">
          <PremiumIcon icon={<FiTarget />} color={sCfg.color} glow={sCfg.glow} bg={sCfg.bg} size="sm" />
          <div>
            <p className="text-[8px] font-bold tracking-[0.20em] uppercase text-slate-700">{t('fixtures.yourPrediction')}</p>
            <p className="text-base font-black tabular-nums leading-none"
              style={{ color: sCfg.color, textShadow: `0 0 10px ${sCfg.glow}50` }}>
              {pred.predictedHomeScore} – {pred.predictedAwayScore}
            </p>
          </div>
        </div>
        {isFinished && typeof fixture.homeScore === 'number' && (
          <div className="text-right">
            <p className="text-[8px] font-bold tracking-[0.20em] uppercase text-slate-700">{t('fixtures.result')}</p>
            <p className="text-base font-black tabular-nums text-slate-500 leading-none">
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
  const router = useRouter();
  const { t } = useT();
  const { user } = useAuth();
  const [activeTab,       setActiveTab]       = useState<'MY_PREDICTIONS' | 'RANKING' | 'LEAGUES'>('MY_PREDICTIONS');
  const [myPredictions,   setMyPredictions]   = useState<any[]>([]);
  const [globalRanking,   setGlobalRanking]   = useState<any[]>([]);
  const [myLeagues,       setMyLeagues]       = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [tournamentId,    setTournamentId]    = useState<number>(2);
  const [stats, setStats] = useState({ total: 0, finished: 0, correct: 0 });

  useEffect(() => {
    getCurrentTournament().then((tournament) => { if (tournament?.id) setTournamentId(tournament.id); });
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [activeTab, user, tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = Number(user?.id ?? 0);
      if (!userId) return;

      if (activeTab === 'MY_PREDICTIONS') {
        const rawPredictions = await getUserPredictions(userId);
        const scoreMap: Record<number, { pointsAwarded: number; ruleCode: string }> = {};
        try {
          const histRes = await fetch(`/api/v1/public/scores/history/${tournamentId}?userId=${userId}`);
          if (histRes.ok) {
            const histData = await histRes.json();
            const scores: any[] = histData?.data ?? [];
            scores.forEach((s: any) => {
              scoreMap[s.predictionId] = { pointsAwarded: s.pointsAwarded ?? 0, ruleCode: s.ruleCode ?? 'PENDING' };
            });
          }
        } catch { /* silently ignore */ }

        const predictions = await Promise.all(
          rawPredictions.map(async (pred: any) => {
            const fixture = await getFixtureById(pred.fixtureId);
            const score = scoreMap[pred.id];
            const pointsAwarded = score?.pointsAwarded ?? 0;
            const ruleCode      = score?.ruleCode ?? 'PENDING';
            const resultStatus: ResultStatus =
              ruleCode === 'EXACT_SCORE' ? 'EXACT' :
              ruleCode === 'WINNER_ONLY' ? 'CORRECT' :
              ruleCode === 'PENDING'     ? 'PENDING' : 'WRONG';

            return {
              id: pred.id,
              fixture: fixture ? {
                id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam,
                homeScore: fixture.homeScore, awayScore: fixture.awayScore,
                kickoffAt: fixture.kickoffAt, status: fixture.status,
              } : null,
              predictedHomeScore: pred.predictedHomeScore,
              predictedAwayScore: pred.predictedAwayScore,
              pointsAwarded, resultStatus, submittedAt: pred.submittedAt,
            };
          })
        );

        const valid    = predictions.filter(p => p.fixture !== null);
        const finished = valid.filter(p => p.fixture?.status === 'FINISHED');
        const correct  = finished.filter(p =>
          p.predictedHomeScore === p.fixture?.homeScore && p.predictedAwayScore === p.fixture?.awayScore
        );
        setMyPredictions(valid);
        setStats({ total: valid.length, finished: finished.length, correct: correct.length });

      } else if (activeTab === 'RANKING') {
        const response = await scoringService.getGlobalRanking(tournamentId, { page: 0, pageSize: 10 });
        const items: any[] = response?.data ?? [];
        setGlobalRanking(items.map((score: any, idx: number) => ({
          rank: score.rankPosition ?? idx + 1,
          user: score.fullName || score.username,
          points: score.totalPoints ?? 0,
          predictions: score.matchesScored ?? 0,
        })));

      } else if (activeTab === 'LEAGUES') {
        const leagues = await leagueService.getUserLeagues(userId);
        const leaguesWithRanking = await Promise.all(
          leagues.map(async (league: any) => {
            try {
              const ranking = await leagueService.getLeagueRanking(league.id);
              const myLeagueScore = ranking.find((r: any) => Number(r.userId) === userId);
              const leader = ranking[0];
              return {
                id: league.id, name: league.name, code: league.code,
                memberCount: league.memberCount, maxMembers: league.maxMembers,
                myRank: myLeagueScore?.rankPosition || 0,
                myPoints: myLeagueScore?.userScore?.totalPoints || 0,
                leader: { name: leader?.userId || 'N/A', points: leader?.userScore?.totalPoints || 0 },
              };
            } catch { return null; }
          })
        );
        setMyLeagues(leaguesWithRanking.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const accuracy = stats.finished > 0 ? Math.round((stats.correct / stats.finished) * 100) : 0;

  const TRANSLATED_TABS = [
    { key: 'MY_PREDICTIONS' as const, label: t('predictions.tabs.myPredictions'), icon: <FiTarget size={13} />,  color: '#22d3ee', glow: 'rgba(34,211,238,0.55)'  },
    { key: 'RANKING'        as const, label: t('predictions.tabs.ranking'),        icon: <FiAward size={13} />,   color: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  },
    { key: 'LEAGUES'        as const, label: t('predictions.tabs.leagues'),        icon: <FiUsers size={13} />,   color: '#34d399', glow: 'rgba(52,211,153,0.55)'  },
  ];

  const STAT_CARDS = [
    { label: t('predictions.tabs.myPredictions'), value: stats.total,    suffix: '',  icon: <FiActivity />,    color: '#fbbf24', glow: 'rgba(251,191,36,0.55)',  bg: 'rgba(251,191,36,0.08)'  },
    { label: t('common.finished'),                value: stats.finished, suffix: '',  icon: <FiCheck />,       color: '#22d3ee', glow: 'rgba(34,211,238,0.55)',  bg: 'rgba(34,211,238,0.08)'  },
    { label: t('predictions.status.exact'),       value: stats.correct,  suffix: '',  icon: <FiZap />,         color: '#34d399', glow: 'rgba(52,211,153,0.55)',  bg: 'rgba(52,211,153,0.08)'  },
    { label: t('profile.performance'),            value: accuracy,       suffix: '%', icon: <FiTrendingUp />,  color: '#a78bfa', glow: 'rgba(167,139,250,0.55)', bg: 'rgba(167,139,250,0.08)' },
  ];

  const maxRankPts = globalRanking[0]?.points ?? 1;

  return (
    <div className="w-full relative min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 22% 30%, #060f1e 0%, #030a14 50%, #010508 100%)' }}>

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -100,
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)',
          filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 480, height: 480, bottom: -60, right: -60,
          background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)',
          filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 15, repeat: Infinity, delay: 4 }} />

      {/* Header */}
      <div className="relative z-10">
        <Header title="Orionix Gol" subtitle={t('predictions.subtitle')} centered />
      </div>

      {/* ── STICKY TAB BAR ── */}
      <div className="sticky top-0 z-40"
        style={{ background: 'rgba(3,9,22,0.92)', borderBottom: '1px solid rgba(34,211,238,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 32px rgba(0,0,0,0.55)' }}>
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.22), rgba(251,191,36,0.12), transparent)' }} />
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2">
          {TRANSLATED_TABS.map(({ key, label, icon, color, glow }) => {
            const isActive = activeTab === key;
            return (
              <motion.button key={key} onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden"
                style={{
                  background: isActive ? `linear-gradient(135deg, ${color}15, rgba(2,8,20,0.85))` : 'transparent',
                  border: `1px solid ${isActive ? color + '30' : 'transparent'}`,
                  outline: 'none', cursor: 'pointer',
                }}
                whileTap={{ scale: 0.96 }}>
                {isActive && (
                  <motion.div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}65, transparent)` }} />
                )}
                <span style={{ color: isActive ? color : 'rgba(100,116,139,0.60)', filter: isActive ? `drop-shadow(0 0 5px ${glow})` : 'none', display: 'flex' }}>
                  {icon}
                </span>
                <span className="text-[11px] font-black tracking-[0.10em]"
                  style={{ color: isActive ? color : 'rgba(100,116,139,0.60)', textShadow: isActive ? `0 0 10px ${glow}` : 'none' }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
          <div className="flex-1" />
          <EQBars color="rgba(34,211,238,0.30)" count={7} maxH={14} />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-5 py-5 pb-32">
        {loading ? (
          <div className="flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-4">
              <motion.div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
                animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
              <p className="text-[10px] text-cyan-400/60 tracking-[0.3em] uppercase font-bold">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ══════════ MIS PORRAS ══════════ */}
            {activeTab === 'MY_PREDICTIONS' && (
              <motion.div key="my-predictions" className="space-y-4"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}>

                {/* Section title */}
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22d3ee, #10b981)' }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.myPredictions')}</h2>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.25), transparent)' }} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STAT_CARDS.map((s, i) => (
                    <motion.div key={s.label}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="relative overflow-hidden rounded-2xl p-4"
                      style={{
                        background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.96))',
                        border: `1px solid ${s.color}15`, backdropFilter: 'blur(24px)',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.50)',
                      }}>
                      <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                      <div className="flex items-start justify-between mb-3">
                        <PremiumIcon icon={s.icon} color={s.color} glow={s.glow} bg={s.bg} size="sm" delay={i * 0.3} />
                        <EQBars color={s.color + '50'} count={4} maxH={10} />
                      </div>
                      <motion.p className="text-2xl font-black tabular-nums leading-none mb-1"
                        style={{ color: s.color, textShadow: `0 0 18px ${s.glow}` }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 + 0.2 }}>
                        {s.value}{s.suffix}
                      </motion.p>
                      <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-slate-600 mb-2">{s.label}</p>
                      <GlowBar value={s.value} max={Math.max(s.value, 1)} color={s.color} />
                    </motion.div>
                  ))}
                </div>

                {/* Scoring rules */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
                    border: '1px solid rgba(34,211,238,0.10)', backdropFilter: 'blur(24px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.50)',
                  }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.45), rgba(52,211,153,0.30), transparent)' }} />

                  <div className="flex items-center gap-3 mb-4">
                    <PremiumIcon icon={<FiShield />} color="#22d3ee" glow="rgba(34,211,238,0.55)" bg="rgba(34,211,238,0.08)" size="sm" />
                    <div>
                      <p className="text-[8px] font-black tracking-[0.28em] uppercase text-cyan-400/60">{t('predictions.scoringOf')}</p>
                      <p className="text-sm font-black text-white leading-none">{t('predictions.scoringTitle')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {SCORING_RULES_KEYS.map((rule, i) => (
                      <div key={i} className="flex-1 relative overflow-hidden rounded-xl p-3"
                        style={{
                          background: `linear-gradient(135deg, ${rule.bg}, rgba(1,4,14,0.60))`,
                          border: `1px solid ${rule.color}22`,
                        }}>
                        <div className="absolute inset-x-0 top-0 h-px"
                          style={{ background: `linear-gradient(90deg, transparent, ${rule.color}40, transparent)` }} />
                        <div className="flex items-center justify-between mb-2">
                          <PremiumIcon icon={rule.icon} color={rule.color} glow={rule.glow} bg={rule.bg} size="sm" delay={i * 0.4} />
                          <div className="text-right">
                            <span className="text-3xl font-black tabular-nums leading-none"
                              style={{ color: rule.color, textShadow: `0 0 18px ${rule.glow}` }}>
                              {rule.pts}
                            </span>
                            <p className="text-[7px] font-black tracking-[0.2em] uppercase text-slate-600 -mt-1">pts</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-white leading-none mb-0.5">{t(rule.titleKey)}</p>
                        <p className="text-[8px] text-slate-600 leading-tight">{t(rule.descKey)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Predictions list */}
                {myPredictions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-black tracking-[0.28em] uppercase text-slate-600">
                        {myPredictions.length} {t('predictions.predictionsRegistered')}
                      </p>
                    </div>
                    {myPredictions.map((pred, idx) => (
                      <PredictionCard key={pred.id} pred={pred} index={idx} t={t} />
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4 py-16">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl"
                        style={{ background: 'rgba(34,211,238,0.08)', filter: 'blur(16px)', transform: 'scale(1.2)' }} />
                      <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)' }}>
                        <FiTarget size={28} style={{ color: 'rgba(34,211,238,0.45)' }} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black tracking-[0.30em] uppercase text-slate-600 mb-1">{t('predictions.noPredictionsYet')}</p>
                      <p className="text-[9px] text-slate-700">{t('predictions.visitCalendar')}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push('/fixtures')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black tracking-[0.12em] uppercase"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(2,8,20,0.90))',
                        border: '1px solid rgba(34,211,238,0.30)', color: '#22d3ee',
                      }}>
                      <FiChevronRight size={12} /> {t('predictions.viewMatches')}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════ RANKING ══════════ */}
            {activeTab === 'RANKING' && (
              <motion.div key="ranking" className="space-y-4"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}>

                {/* Section title */}
                <div className="flex items-center gap-3 mb-1">
                  <motion.div className="w-[3px] h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }}
                    animate={{ boxShadow: ['0 0 6px rgba(251,191,36,0.4)', '0 0 18px rgba(251,191,36,0.9)', '0 0 6px rgba(251,191,36,0.4)'] }}
                    transition={{ duration: 2.2, repeat: Infinity }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.ranking')}</h2>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.30), transparent)' }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.20)' }}>
                    <FiAward size={10} style={{ color: '#fbbf24' }} />
                    <span className="text-[8px] font-black text-amber-400 tracking-[0.2em]">{globalRanking.length} {t('predictions.players')}</span>
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
                          className="relative overflow-hidden rounded-2xl flex flex-col items-center py-5 px-3"
                          style={{
                            background: `linear-gradient(145deg, ${mc.bg}, rgba(1,4,14,0.90))`,
                            border: `1px solid ${mc.border}`, backdropFilter: 'blur(24px)',
                            boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 24px ${mc.glow}20`,
                          }}>
                          <div className="absolute inset-x-0 top-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${mc.color}65, transparent)` }} />
                          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 text-sm font-black"
                            style={{ background: mc.bg, border: `1.5px solid ${mc.color}50`, color: mc.color,
                              boxShadow: `0 0 16px ${mc.glow}` }}
                            animate={{ boxShadow: [`0 0 10px ${mc.glow}40`, `0 0 22px ${mc.glow}`, `0 0 10px ${mc.glow}40`] }}
                            transition={{ duration: 2.5 + idx * 0.4, repeat: Infinity }}>
                            {mc.label}
                          </motion.div>
                          <p className="text-[11px] font-black text-center truncate w-full leading-tight"
                            style={{ color: mc.color }}>{player.user}</p>
                          <motion.p className="text-2xl font-black tabular-nums mt-1"
                            style={{ color: mc.color, textShadow: `0 0 16px ${mc.glow}` }}
                            animate={{ textShadow: [`0 0 8px ${mc.glow}50`, `0 0 22px ${mc.glow}`, `0 0 8px ${mc.glow}50`] }}
                            transition={{ duration: 3, repeat: Infinity }}>
                            {player.points}
                          </motion.p>
                          <p className="text-[7px] font-bold tracking-[0.22em] uppercase text-slate-600 -mt-1">pts</p>
                          <div className="w-full mt-3">
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
                      background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.96))',
                      border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.30), transparent)' }} />
                    {globalRanking.slice(3).map((player, idx) => {
                      const isMe = player.user === (user as any)?.username || player.user === (user as any)?.fullName;
                      return (
                        <motion.div key={player.rank}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.04 }}
                          className="flex items-center gap-3 px-4 py-3 relative"
                          style={{
                            borderBottom: idx < globalRanking.length - 4 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            background: isMe ? 'rgba(34,211,238,0.04)' : 'transparent',
                            borderLeft: isMe ? '2px solid rgba(34,211,238,0.40)' : '2px solid transparent',
                          }}>
                          <span className="w-6 text-center text-[10px] font-black text-slate-600 tabular-nums shrink-0">
                            {player.rank}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black truncate"
                              style={{ color: isMe ? '#22d3ee' : 'rgba(148,163,184,0.80)' }}>{player.user}</p>
                            <div className="mt-1">
                              <GlowBar value={player.points} max={maxRankPts} color={isMe ? '#22d3ee' : '#475569'} />
                            </div>
                          </div>
                          <span className="text-sm font-black tabular-nums shrink-0"
                            style={{ color: isMe ? '#22d3ee' : 'rgba(100,116,139,0.60)' }}>
                            {player.points}
                          </span>
                          <span className="text-[7px] font-bold text-slate-700 shrink-0">pts</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {globalRanking.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
                      <FiBarChart2 size={24} style={{ color: 'rgba(251,191,36,0.40)' }} />
                    </div>
                    <p className="text-[10px] text-slate-700 font-bold tracking-[0.2em] uppercase">{t('predictions.rankingUnavailable')}</p>
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
                  <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                  <h2 className="text-xl font-black text-white tracking-wide">{t('predictions.myLeagues')}</h2>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.25), transparent)' }} />
                </div>

                {myLeagues.map((league, idx) => (
                  <motion.div key={league.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
                      border: '1px solid rgba(52,211,153,0.14)', backdropFilter: 'blur(28px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.60)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.50), transparent)' }} />

                    {/* League header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                      <div className="flex items-center gap-3">
                        <PremiumIcon icon={<FiShield />} color="#34d399" glow="rgba(52,211,153,0.55)" bg="rgba(52,211,153,0.08)" size="sm" delay={idx * 0.2} />
                        <div>
                          <p className="text-sm font-black text-white leading-none">{league.name}</p>
                          <p className="text-[9px] text-slate-600 mt-0.5 tracking-wide">
                            {league.memberCount}{league.maxMembers ? `/${league.maxMembers}` : ''} {t('predictions.members')} · #{league.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <span className="text-[8px] font-black text-emerald-400">{t('predictions.position')} #{league.myRank || '—'}</span>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                      {[
                        { label: t('predictions.myPts'),     value: league.myPoints,                        color: '#22d3ee', icon: <FiActivity size={10} /> },
                        { label: t('predictions.leader'),    value: league.leader.name,                    color: '#fbbf24', icon: <FiStar size={10} />, isText: true },
                        { label: t('predictions.difference'), value: `-${league.leader.points - league.myPoints}`, color: '#f87171', icon: <FiTrendingUp size={10} />, isText: true },
                      ].map((item, i) => (
                        <div key={i} className="relative overflow-hidden rounded-xl p-3 text-center"
                          style={{
                            background: `rgba(1,4,14,0.60)`,
                            border: `1px solid ${item.color}18`,
                          }}>
                          <div className="flex items-center justify-center gap-1 mb-1.5"
                            style={{ color: item.color + '70' }}>
                            {item.icon}
                          </div>
                          <p className="font-black leading-none truncate"
                            style={{ color: item.color, fontSize: (item as any).isText ? '10px' : '18px',
                              textShadow: `0 0 10px ${item.color}50` }}>
                            {item.value}
                          </p>
                          {!(item as any).isText && (
                            <p className="text-[7px] text-slate-700 font-bold -mt-0.5">pts</p>
                          )}
                          <p className="text-[8px] font-bold tracking-[0.18em] uppercase text-slate-700 mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* GlowBar for my position */}
                    <div className="px-4 pb-2">
                      <GlowBar value={league.myPoints} max={Math.max(league.leader.points, 1)} color="#34d399" />
                    </div>

                    {/* CTA */}
                    <div className="px-4 pb-4 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/predictions/leagues/${league.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black tracking-[0.12em] uppercase"
                        style={{
                          background: 'linear-gradient(135deg, rgba(52,211,153,0.14), rgba(2,8,20,0.90))',
                          border: '1px solid rgba(52,211,153,0.28)', color: '#34d399',
                        }}>
                        {t('predictions.viewLeague')} <FiChevronRight size={12} />
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
                    background: 'linear-gradient(145deg, rgba(4,12,28,0.98), rgba(5,14,34,0.97))',
                    border: '1px solid rgba(34,211,238,0.14)', backdropFilter: 'blur(28px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.50)',
                  }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.40), rgba(52,211,153,0.25), transparent)' }} />
                  <div className="flex items-center gap-3 mb-5">
                    <PremiumIcon icon={<FiUsers />} color="#22d3ee" glow="rgba(34,211,238,0.55)" bg="rgba(34,211,238,0.08)" size="md" />
                    <div>
                      <p className="text-[8px] font-black tracking-[0.28em] uppercase text-cyan-400/60">{t('predictions.competition')}</p>
                      <p className="text-sm font-black text-white leading-none">{t('predictions.createOrJoin')}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-4 tracking-wide">{t('predictions.competeFriends')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowLeagueModal(false); router.push('/predictions/create-league'); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black tracking-[0.10em] uppercase"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(2,8,20,0.90))',
                        border: '1px solid rgba(34,211,238,0.32)', color: '#22d3ee',
                      }}>
                      <FiPlus size={13} /> {t('predictions.createLeague')}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowLeagueModal(false); router.push('/predictions/join-league'); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black tracking-[0.10em] uppercase"
                      style={{
                        background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(2,8,20,0.90))',
                        border: '1px solid rgba(52,211,153,0.28)', color: '#34d399',
                      }}>
                      <FiLogIn size={13} /> {t('predictions.join')}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* ── LEAGUE MODAL ── */}
      <AnimatePresence>
        {showLeagueModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowLeagueModal(false)}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden rounded-2xl p-6 max-w-sm w-full mx-4"
              style={{
                background: 'linear-gradient(145deg, rgba(4,12,28,0.99), rgba(5,14,34,0.98))',
                border: '1px solid rgba(34,211,238,0.18)', backdropFilter: 'blur(28px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.80)',
              }}>
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.60), transparent)' }} />
              <div className="flex items-center gap-3 mb-5">
                <PremiumIcon icon={<FiUsers />} color="#22d3ee" glow="rgba(34,211,238,0.55)" bg="rgba(34,211,238,0.08)" size="md" />
                <h2 className="text-lg font-black text-white">{t('predictions.newLeague')}</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: t('predictions.createLeague'), icon: <FiPlus size={14} />, color: '#22d3ee', glow: 'rgba(34,211,238,0.55)', route: '/predictions/create-league' },
                  { label: t('predictions.joinLeague'),   icon: <FiLogIn size={14} />, color: '#34d399', glow: 'rgba(52,211,153,0.55)', route: '/predictions/join-league' },
                ].map((opt) => (
                  <motion.button key={opt.label} whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowLeagueModal(false); router.push(opt.route); }}
                    className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-[12px] font-black tracking-[0.10em] uppercase relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${opt.color}14, rgba(2,8,20,0.90))`,
                      border: `1px solid ${opt.color}30`, color: opt.color,
                    }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${opt.color}50, transparent)` }} />
                    {opt.icon} {opt.label}
                  </motion.button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setShowLeagueModal(false)}
                className="w-full mt-3 py-2.5 text-[10px] font-bold tracking-[0.22em] uppercase text-slate-700 hover:text-slate-500 transition-colors">
                {t('common.cancel')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
