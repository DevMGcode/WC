'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getFixtureById } from '@/services/publicTournament';
import { predictionService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiTarget, FiZap, FiCheck, FiX, FiEdit2, FiArrowLeft,
  FiMapPin, FiAlertCircle, FiList, FiBarChart2, FiUsers, FiRepeat,
} from 'react-icons/fi';

import { hex, type BrandColor, resolveBrandHex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';

import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/PageSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AdsterraBanner } from '@/components/ads';

const LineupsTab    = dynamic(() => import('./_components/LineupsTab'),    { loading: () => <TabSkeleton /> });
const StatisticsTab = dynamic(() => import('./_components/StatisticsTab'), { loading: () => <TabSkeleton /> });
const PlayersTab    = dynamic(() => import('./_components/PlayersTab'),    { loading: () => <TabSkeleton /> });
const HeadToHeadTab = dynamic(() => import('./_components/HeadToHeadTab'), { loading: () => <TabSkeleton /> });

import { useMatchLive }   from '@/hooks/useMatchLive';
import { useMatchEvents } from '@/hooks/useMatchEvents';

type DetailTab = 'lineups' | 'stats' | 'players' | 'h2h';

/**
 * Local thin wrapper around the card pattern used on this page. We don't use
 * the generic `<Surface>` primitive here because the accent gradient on top
 * depends on a per-card BrandColor — exposing that via Surface would muddy
 * its API. This keeps the concern co-located with the page that needs it.
 */
const DarkCard = ({
  children, accent = 'green', className = '', delay = 0,
}: {
  children: React.ReactNode;
  accent?: BrandColor;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`relative overflow-hidden rounded-2xl ${className}`}
    style={{
      background:  `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.97)})`,
      border:      `1px solid ${alphaOf(accent, 0.095)}`,
      boxShadow:   `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: gradients.divider(accent, 0.65) }} />
    {children}
  </motion.div>
);

export default function FixtureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t      = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const fixtureId = parseInt(params.id, 10);

  /* Tabs y reglas de puntuación dependen de t() ⇒ se construyen dentro del
   * componente para reaccionar al cambio de locale. */
  const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: 'lineups',  label: t('fixture.tabs.lineups')   ?? 'Alineaciones', icon: <FiList    size={12} /> },
    { key: 'stats',    label: t('fixture.tabs.stats')     ?? 'Estadísticas', icon: <FiBarChart2 size={12} /> },
    { key: 'players',  label: t('fixture.tabs.players')   ?? 'Jugadores',    icon: <FiUsers   size={12} /> },
    { key: 'h2h',      label: t('fixture.tabs.h2h')       ?? 'H2H',          icon: <FiRepeat  size={12} /> },
  ];

  const SCORE_RULES: { pts: number; label: string; sublabel: string; color: BrandColor; icon: React.ReactNode }[] = [
    { pts: 3, label: t('fixture.rules.exactLabel'),   sublabel: t('fixture.rules.exactSub'),   color: 'green',   icon: <FiZap   size={14} /> },
    { pts: 1, label: t('fixture.rules.correctLabel'), sublabel: t('fixture.rules.correctSub'), color: 'success', icon: <FiCheck size={14} /> },
    { pts: 0, label: t('fixture.rules.wrongLabel'),   sublabel: t('fixture.rules.wrongSub'),   color: 'neutral', icon: <FiX     size={14} /> },
  ];

  const [fixture,     setFixture]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [prediction,  setPrediction]  = useState<any>(null);
  const [predHome,    setPredHome]    = useState(0);
  const [predAway,    setPredAway]    = useState(0);
  const [editing,     setEditing]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [predError,   setPredError]   = useState('');
  const [predSuccess, setPredSuccess] = useState(false);
  const [detailTab,   setDetailTab]   = useState<DetailTab>('lineups');

  // WebSocket — tiempo real (solo activo cuando el partido está LIVE)
  const liveDelta  = useMatchLive(fixture?.status === 'LIVE' ? fixtureId : null);
  const liveEvents = useMatchEvents(fixture?.status === 'LIVE' ? fixtureId : null);

  // Scores y status en vivo (WebSocket tiene prioridad sobre el snapshot HTTP)
  const liveHomeScore    = liveDelta?.homeScore    ?? fixture?.homeScore;
  const liveAwayScore    = liveDelta?.awayScore    ?? fixture?.awayScore;
  const liveStatus       = liveDelta?.status       ?? fixture?.status;
  const elapsedMinutes   = liveDelta?.elapsedMinutes ?? null;

  useEffect(() => {
    const loadFixture = async () => {
      try {
        const data = await getFixtureById(fixtureId);
        setFixture(data ?? null);
      } finally { setLoading(false); }
    };
    loadFixture();
  }, [fixtureId]);

  useEffect(() => {
    if (!isAuthenticated || !user || !fixture) return;
    predictionService.getUserPredictionForFixture(fixture.id)
      .then((pred) => {
        if (pred) { setPrediction(pred); setPredHome(pred.predictedHomeScore); setPredAway(pred.predictedAwayScore); }
      })
      .catch(() => {});
  }, [isAuthenticated, user, fixture]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true); setPredError(''); setPredSuccess(false);
    try {
      const userId = Number(user.id);
      if (prediction && !editing) return;
      if (prediction) {
        const updated = await predictionService.updatePrediction(prediction.id, { predictedHomeScore: predHome, predictedAwayScore: predAway });
        setPrediction(updated);
      } else {
        const created = await predictionService.createPrediction({ userId, fixtureId: fixture.id, predictedHomeScore: predHome, predictedAwayScore: predAway });
        setPrediction(created);
      }
      setPredSuccess(true); setEditing(false);
    } catch (err: any) {
      setPredError(err?.response?.data?.error || err?.message || t('fixture.saveError'));
    } finally { setSubmitting(false); }
  };

  // Shared page background (radial gradient using tokens)
  const pageBg = `radial-gradient(ellipse at 22% 35%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 48%, ${hex.bg.primary} 100%)`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: pageBg }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-12 h-12 rounded-full border-2"
            style={{ borderColor: alphaOf('green', 0.20), borderTopColor: hex.green.base }}
            animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold"
            style={{ color: alphaOf('green', 0.6) }}>Cargando</p>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: pageBg }}>
        <p className="text-orionix-text-muted font-semibold">{t('fixture.notFound')}</p>
      </div>
    );
  }

  const isScheduled = liveStatus === 'SCHEDULED';
  const isLive      = liveStatus === 'LIVE';
  const isFinished  = liveStatus === 'FINISHED';

  const predCorrect = isFinished && prediction &&
    prediction.predictedHomeScore === fixture.homeScore &&
    prediction.predictedAwayScore === fixture.awayScore;

  const predResultCorrect = isFinished && prediction && !predCorrect &&
    fixture.homeScore !== null && fixture.awayScore !== null &&
    Math.sign(prediction.predictedHomeScore - prediction.predictedAwayScore) ===
    Math.sign(fixture.homeScore - fixture.awayScore);

  // Result config — uses BrandColor instead of hex literals
  const resultCfg: { color: BrandColor; label: string; icon: string; pts: string } =
    predCorrect      ? { color: 'green',   label: t('fixture.exactScore'),  icon: '🎯', pts: '+3 pts' }
    : predResultCorrect ? { color: 'success', label: t('fixture.correctScore'),  icon: '✅', pts: '+1 pt'  }
    :                     { color: 'danger',  label: t('fixture.wrongScore'), icon: '❌', pts: '0 pts'  };

  return (
    <div className="w-full relative">

      {/* Ambient blobs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -150, left: -120,
          background: `radial-gradient(circle, ${alphaOf('green', 0.07)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 450, height: 450, bottom: -80, right: -80,
          background: `radial-gradient(circle, ${alphaOf('green', 0.06)} 0%, transparent 65%)`,
          filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('fixture.headerTitle')} subtitle={fixture.stageName ?? ''} />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">

        {/* ── FIXTURE CARD ── */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <FixtureCard
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
            homeScore={liveHomeScore}
            awayScore={liveAwayScore}
            kickoffAt={fixture.kickoffAt}
            status={liveStatus}
            elapsedMinutes={isLive ? elapsedMinutes : undefined}
          />
        </motion.div>

        {/* ── PORRA SECTION ── */}
        <div className="mb-4">

          {/* Not logged in */}
          {!isAuthenticated && (
            <DarkCard accent="green" delay={0.08}>
              <div className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: alphaOf('green', 0.35), filter: 'blur(14px)', opacity: 0.25, transform: 'scale(1.15)' }} />
                  <motion.div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: `linear-gradient(145deg, ${alphaOf('green', 0.10)}, ${alpha(hex.bg.primary, 0.85)})`,
                             border: borders.brand('green', 0.22) }}
                    animate={{ boxShadow: [`0 0 12px ${alphaOf('green', 0.10)}`, `0 0 28px ${alphaOf('green', 0.30)}`, `0 0 12px ${alphaOf('green', 0.10)}`] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <FiTarget size={28} style={{ color: hex.green.bright, filter: `drop-shadow(0 0 6px ${alphaOf('green', 0.7)})` }} />
                  </motion.div>
                </div>
                <p className="text-white font-black text-lg mb-1">{t('fixture.whatScore')}</p>
                <p className="text-orionix-text-muted text-sm mb-5">{t('fixture.loginToPredict')}</p>
                <motion.button
                  onClick={() => router.push('/onboarding')}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-xl text-sm font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                           boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                >
                  Iniciar sesión
                </motion.button>
              </div>
            </DarkCard>
          )}

          {/* Logged in — LIVE match: porras cerradas */}
          {isAuthenticated && isLive && (
            <DarkCard accent="danger" delay={0.08}>
              <div className="p-6 text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(145deg, ${alphaOf('danger', 0.12)}, ${alpha(hex.bg.primary, 0.85)})`,
                           border: borders.brand('danger', 0.25) }}
                  animate={{ boxShadow: [`0 0 12px ${alphaOf('danger', 0.10)}`, `0 0 28px ${alphaOf('danger', 0.35)}`, `0 0 12px ${alphaOf('danger', 0.10)}`] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <span style={{ fontSize: 28 }}>🔒</span>
                </motion.div>
                <p className="text-white font-black text-base mb-1">{t('fixture.closed')}</p>
                <p className="text-orionix-text-muted text-sm">{t('fixture.alreadyStarted')}</p>
                {prediction && (
                  <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: alphaOf('danger', 0.06), border: borders.brand('danger', 0.15) }}>
                    <span className="text-orionix-text-muted text-sm font-bold">Tu porra:</span>
                    <span className="text-white font-black text-lg tabular-nums">
                      {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
                    </span>
                  </div>
                )}
              </div>
            </DarkCard>
          )}

          {/* Logged in — scheduled match */}
          {isAuthenticated && isScheduled && (
            <DarkCard accent="green" delay={0.08}>
              <div className="p-5">

                {/* Scoring rules */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {SCORE_RULES.map(({ pts, label, sublabel, color, icon }) => {
                    const c = resolveBrandHex(color);
                    return (
                      <div key={pts} className="relative overflow-hidden rounded-xl p-3 text-center"
                        style={{ background: alpha(hex.bg.primary, 0.80), border: `1px solid ${alphaOf(color, 0.09)}` }}>
                        <div className="absolute inset-x-0 top-0 h-px"
                          style={{ background: gradients.divider(color, 0.5) }} />
                        <div className="flex justify-center mb-1.5"
                          style={{ color: c, filter: `drop-shadow(0 0 4px ${c})` }}>
                          {icon}
                        </div>
                        <p className="text-lg font-black" style={{ color: c, textShadow: `0 0 12px ${alphaOf(color, 0.5)}` }}>
                          {pts}<span className="text-xs font-bold ml-0.5">pts</span>
                        </p>
                        <p className="text-[8px] font-black tracking-wide mt-0.5 leading-tight"
                          style={{ color: alphaOf(color, 0.5) }}>{label}</p>
                        <p className="text-[7px] text-orionix-text-muted mt-0.5 leading-tight hidden sm:block">{sublabel}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Porra header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.hover})` }} />
                    <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.yourPrediction')}</span>
                  </div>
                  {prediction && !editing && (
                    <motion.button
                      onClick={() => setEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-[10px] font-black text-green-400/70 hover:text-green-300 transition-colors"
                    >
                      <FiEdit2 size={11} /> Editar
                    </motion.button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {/* Saved prediction display */}
                  {prediction && !editing ? (
                    <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-8 py-2">
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.homeTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-orionix-text-muted text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: `0 0 20px ${alphaOf('green', 0.30)}` }}>
                          {prediction.predictedHomeScore}
                        </p>
                      </div>
                      <span className="text-orionix-text-muted font-black text-2xl">–</span>
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.awayTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-orionix-text-muted text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: `0 0 20px ${alphaOf('green', 0.30)}` }}>
                          {prediction.predictedAwayScore}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* Score input form */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center justify-center gap-6 mb-5">
                        {/* Home score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.homeTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-orionix-text-muted text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredHome(Math.max(0, predHome - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: `0 0 18px ${alphaOf('green', 0.50)}` }}>{predHome}</span>
                            <motion.button onClick={() => setPredHome(predHome + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alphaOf('green', 0.15), border: borders.brand('green', 0.30) }}>+</motion.button>
                          </div>
                        </div>

                        <span className="text-orionix-text-muted font-black text-2xl">–</span>

                        {/* Away score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.awayTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-orionix-text-muted text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredAway(Math.max(0, predAway - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: `0 0 18px ${alphaOf('green', 0.50)}` }}>{predAway}</span>
                            <motion.button onClick={() => setPredAway(predAway + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alphaOf('green', 0.15), border: borders.brand('green', 0.30) }}>+</motion.button>
                          </div>
                        </div>
                      </div>

                      {predError && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs text-red-300"
                          style={{ background: alphaOf('danger', 0.08), border: borders.brand('danger', 0.18) }}>
                          <FiAlertCircle size={12} /> {predError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        {editing && (
                          <motion.button
                            onClick={() => { setEditing(false); setPredError(''); }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-muted"
                            style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
                          >Cancelar</motion.button>
                        )}
                        <motion.button
                          onClick={handleSubmit}
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex-1 py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                                   boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                        >
                          <motion.div className="absolute inset-0 pointer-events-none"
                            style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                            animate={{ x: ['-120%', '120%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                          <span className="relative">
                            {submitting ? t('fixture.saving') : prediction ? t('fixture.updatePrediction') : t('fixture.confirmPrediction')}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {predSuccess && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-xs text-center mt-3 font-black tracking-wide">
                    {t('fixture.savedOk')}
                  </motion.p>
                )}
              </div>
            </DarkCard>
          )}

          {/* Logged in — finished match result comparison */}
          {isAuthenticated && isFinished && prediction && (
            <DarkCard accent={resultCfg.color} delay={0.08}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[3px] h-5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${alphaOf(resultCfg.color, 1)}, ${alphaOf(resultCfg.color, 0.5)})` }} />
                  <span className="text-sm font-black" style={{ color: alphaOf(resultCfg.color, 1) }}>
                    {resultCfg.icon} {resultCfg.label}
                  </span>
                </div>
                <div className="flex items-stretch gap-4">
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: alpha(hex.bg.primary, 0.60), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                    <p className="text-[8px] font-black text-orionix-text-muted tracking-[0.25em] uppercase mb-2">{t('fixture.yourPrediction')}</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {prediction.predictedHomeScore}
                      <span className="text-orionix-text-muted mx-1 text-xl">–</span>
                      {prediction.predictedAwayScore}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-orionix-text-muted font-black text-sm">vs</span>
                  </div>
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: alpha(hex.bg.primary, 0.60), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                    <p className="text-[8px] font-black text-orionix-text-muted tracking-[0.25em] uppercase mb-2">Resultado</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {fixture.homeScore}
                      <span className="text-orionix-text-muted mx-1 text-xl">–</span>
                      {fixture.awayScore}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs font-black"
                    style={{ color: alphaOf(resultCfg.color, 1), textShadow: `0 0 12px ${alphaOf(resultCfg.color, 0.5)}` }}>
                    {resultCfg.pts}
                  </span>
                </div>
              </div>
            </DarkCard>
          )}

          {/* Logged in — no prediction for finished */}
          {isAuthenticated && isFinished && !prediction && (
            <DarkCard accent="neutral" delay={0.08}>
              <p className="text-orionix-text-muted text-sm text-center py-5">{t('fixture.noPrediction')}</p>
            </DarkCard>
          )}
        </div>

        {/* ── STADIUM INFO ── */}
        {(fixture.stadiumName || fixture.hostCity) && (
          <DarkCard accent="success" delay={0.16} className="mb-4">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})` }} />
                <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.matchInfo')}</span>
                <FiMapPin size={12} style={{ color: hex.green.bright, marginLeft: 2 }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {fixture.stadiumName && (
                  <div>
                    <p className="text-[9px] font-black text-orionix-text-muted tracking-[0.22em] uppercase mb-1">Estadio</p>
                    <p className="text-sm font-bold text-orionix-text-secondary">{fixture.stadiumName}</p>
                  </div>
                )}
                {fixture.hostCity && (
                  <div>
                    <p className="text-[9px] font-black text-orionix-text-muted tracking-[0.22em] uppercase mb-1">Ciudad</p>
                    <p className="text-sm font-bold text-orionix-text-secondary">{fixture.hostCity}{fixture.hostCountry ? `, ${fixture.hostCountry}` : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── GOLEADORES ── */}
        {isFinished && fixture.scorers && fixture.scorers.length > 0 && (
          <DarkCard accent="gold" delay={0.22} className="mb-4">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${hex.gold.bright}, ${hex.gold.muted})` }} />
                  <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.scorers')}</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: alphaOf('gold', 0.10), color: hex.gold.bright, border: borders.brand('gold', 0.20) }}>
                    {fixture.scorers.length}
                  </span>
                </div>
                {fixture.scorers.some((s: any) => s.mismatch) && (
                  <span className="text-[8px] font-bold text-amber-400/60 flex items-center gap-1">
                    ⚠ Corregido por API
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {fixture.scorers.map((scorer: any) => {
                  const isHome = scorer.teamId === fixture.homeTeam.id;
                  const accentColor: BrandColor = isHome ? 'green' : 'danger';
                  const accentHex = isHome ? hex.green.bright : hex.status.danger;
                  return (
                    <motion.div
                      key={scorer.id}
                      initial={{ opacity: 0, x: isHome ? -8 : 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: alpha(hex.bg.primary, 0.60),
                        border: `1px solid ${alpha(hex.neutral.white, 0.04)}`,
                        borderLeft: `3px solid ${accentHex}`,
                      }}
                    >
                      <span className="text-lg">⚽</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-orionix-text-secondary text-sm truncate">{scorer.playerName}</p>
                        {scorer.teamName && (
                          <p className="text-[10px] text-orionix-text-muted">{scorer.teamFifaCode ?? scorer.teamName}</p>
                        )}
                        {scorer.mismatch && scorer.apiPlayerName && (
                          <p className="text-[9px] text-amber-500/70 mt-0.5">
                            ✎ Corregido: era «{scorer.apiPlayerName}» según API
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {scorer.minute && (
                          <span className="text-[10px] font-black text-orionix-text-muted px-2 py-1 rounded-lg"
                            style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                            {scorer.minute}&apos;
                          </span>
                        )}
                        {scorer.verified && (
                          <span className="text-[8px] font-black text-emerald-500/70">✓</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── DETAIL TABS (Lineups / Stats / Players / H2H) ── */}
        <DarkCard accent="green" delay={0.28} className="mb-4">
          <div className="p-4">
            {/* Tab bar */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
              {DETAIL_TABS.map(tab => {
                const active = detailTab === tab.key;
                return (
                  <motion.button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-black tracking-wide uppercase transition-all"
                    style={{
                      background: active ? `${hex.green.bright}15` : 'transparent',
                      border: `1px solid ${active ? `${hex.green.bright}30` : 'transparent'}`,
                      color: active ? hex.green.bright : alpha(hex.text.secondary, 0.4),
                    }}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={detailTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <ErrorBoundary fallbackMessage={t('fixture.sectionDataError')}>
                  {detailTab === 'lineups'  && <LineupsTab    fixtureId={fixture.id} />}
                  {detailTab === 'stats'    && <StatisticsTab fixtureId={fixture.id} />}
                  {detailTab === 'players'  && (
                    <PlayersTab
                      fixtureId={fixture.id}
                      homeTeamId={fixture.homeTeam?.id ?? 0}
                      awayTeamId={fixture.awayTeam?.id ?? 0}
                    />
                  )}
                  {detailTab === 'h2h'      && (
                    <HeadToHeadTab
                      homeTeamId={fixture.homeTeam?.id ?? 0}
                      awayTeamId={fixture.awayTeam?.id ?? 0}
                      homeTeamName={fixture.homeTeam?.name ?? ''}
                      awayTeamName={fixture.awayTeam?.name ?? ''}
                    />
                  )}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>
        </DarkCard>

        {/* ── PUBLICIDAD (solo Free) — antes de los botones inferiores ── */}
        <AdsterraBanner slot="rect300x250" className="mb-4" />

        {/* ── BOTTOM BUTTONS ── */}
        <div className="flex gap-3">
          <Link href="/fixtures" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-orionix-text-muted flex items-center justify-center gap-2 cursor-pointer"
              style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
            >
              <FiArrowLeft size={14} /> {t('fixture.back')}
            </motion.div>
          </Link>
          <Link href="/predictions" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: `0 12px 36px ${alphaOf('green', 0.40)}` }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                       boxShadow: `0 6px 24px ${alphaOf('green', 0.28)}` }}
            >
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
              <span className="relative flex items-center gap-2"><FiTarget size={13} /> {t('fixture.myPredictions')}</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
