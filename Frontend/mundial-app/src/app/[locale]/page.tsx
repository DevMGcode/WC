'use client';

/**
 * Home dashboard — migrated to the design-token system.
 *
 * Sub-components are co-located in `./_components/`:
 *   HomeUtils    → micro-components (KPIChip, Flag, Ring, GlowBar, …)
 *   HomeCountdown → ROW 2  countdown / mundial-started banner
 *   UpcomingMatches → ROW 3 left top   (PRÓXIMOS PARTIDOS)
 *   RecentResults   → ROW 3 left bottom (ÚLTIMOS RESULTADOS)
 *   RightColumn     → ROW 3 right       (RENDIMIENTO + CLASIFICACIÓN)
 *   QuickAccessBento → ROW 4            (quick-access grid)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FiActivity, FiCrosshair, FiAward, FiBarChart2, FiZap, FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { Header } from '@/components/Navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  useCurrentTournament,
  useTournamentFixtures,
  useUserPredictions,
  useUserScore,
  useGlobalRanking,
} from '@/hooks/useTournamentData';
import { WORLD_CUP_START, MS, RANKING_PAGE } from '@/constants/tournament';
import { fmtTodayHeader } from '@/utils/format';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, gradients } from '@/lib/design/effects';
import { TabSkeleton } from '@/components/PageSkeleton';

import { KPIChip } from './home/_components/HomeUtils';
import PremiumOnboardingModal from '@/components/premium/PremiumOnboardingModal';
import { AdsterraBanner } from '@/components/ads';

// Lazy load de secciones pesadas — se descargan en paralelo pero no bloquean el render inicial
const HomeCountdown   = dynamic(() => import('./home/_components/HomeCountdown'),   { loading: () => <TabSkeleton /> });
const UpcomingMatches = dynamic(() => import('./home/_components/UpcomingMatches'), { loading: () => <TabSkeleton /> });
const RecentResults   = dynamic(() => import('./home/_components/RecentResults'),   { loading: () => <TabSkeleton /> });
const RightColumn     = dynamic(() => import('./home/_components/RightColumn'),     { loading: () => <TabSkeleton /> });
const QuickAccessBento = dynamic(() => import('./home/_components/QuickAccessBento'), { loading: () => <TabSkeleton /> });

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const t      = useTranslations();
  const locale = useLocale();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();

  const [countdown, setCountdown]           = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mundialStarted, setMundialStarted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const target = WORLD_CUP_START.getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setMundialStarted(true); return; }
      setCountdown({
        days:    Math.floor(diff / MS.day),
        hours:   Math.floor((diff % MS.day)    / MS.hour),
        minutes: Math.floor((diff % MS.hour)   / MS.minute),
        seconds: Math.floor((diff % MS.minute) / MS.second),
      });
    };
    tick();
    const id = setInterval(tick, MS.second);
    return () => clearInterval(id);
  }, []);

  // ── TanStack Query ──
  const userId                                           = user ? Number(user.id) : null;
  const { data: tournament }                             = useCurrentTournament();
  const tid                                              = tournament?.id ?? null;
  const { data: allFixtures = [], isLoading: loading }  = useTournamentFixtures(tid);
  const { data: rawPredictions = [] }                   = useUserPredictions(userId);
  const { data: scoreData }                             = useUserScore(userId, tid);
  const { data: rankingData = [] }                      = useGlobalRanking(tid, RANKING_PAGE.home);

  // ── Derived state ──
  const todayUpcoming = useMemo(() =>
    (allFixtures as any[])
      .filter(f => f.status === 'SCHEDULED' || f.status === 'LIVE')
      .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
      .slice(0, 5),
    [allFixtures]
  );

  const recentResults = useMemo(() => {
    const finished = (allFixtures as any[])
      .filter(f => f.status === 'FINISHED')
      .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());
    if (finished.length === 0) return [];
    // Solo la jornada más reciente: partidos del mismo día (calendario local)
    // que el último finalizado. El historial completo vive en "Mis porras".
    const lastDay = new Date(finished[0].kickoffAt).toDateString();
    return finished.filter(f => new Date(f.kickoffAt).toDateString() === lastDay);
  }, [allFixtures]);

  const myPredictions = useMemo(() => {
    const predMap: Record<number, any> = {};
    recentResults.forEach((r: any) => {
      const p = (rawPredictions as any[]).find((pred: any) => pred.fixtureId === r.id);
      if (p) predMap[r.id] = p;
    });
    return predMap;
  }, [recentResults, rawPredictions]);

  const stats = useMemo(() => ({
    predictions: (rawPredictions as any[]).length,
    exactas:     (scoreData as any)?.exactScores ?? 0,
    puntos:      (scoreData as any)?.totalPoints ?? 0,
    rank:        (scoreData as any)?.rankPosition ?? 0,
  }), [rawPredictions, scoreData]);

  const topRanking = useMemo(() =>
    (rankingData as any[]).slice(0, 5).map((s: any, i: number) => ({
      rank:   s.rankPosition ?? i + 1,
      name:   s.fullName || s.username || 'Usuario',
      points: s.totalPoints ?? 0,
      isMe:   Number(s.userId) === (userId ?? -1),
    })),
    [rankingData, userId]
  );

  const maxRankPts = topRanking.length > 0 ? Math.max(...topRanking.map(r => r.points), 1) : 1;

  if (!authLoading && !isAuthenticated) return null;

  return (
    <div className="w-full relative">

      {/* ═══ BACKGROUND ORBS ═══ */}
      <div className="fixed rounded-full pointer-events-none" style={{
        width: 800, height: 800, top: -280, left: -200,
        background: `radial-gradient(circle, ${alphaOf('success', 0.06)} 0%, transparent 60%)`,
        filter: 'blur(80px)', zIndex: 0, willChange: 'transform', transform: 'translateZ(0)',
      }} />
      <div className="fixed rounded-full pointer-events-none" style={{
        width: 600, height: 600, bottom: -150, right: -150,
        background: `radial-gradient(circle, ${alphaOf('gold', 0.04)} 0%, transparent 60%)`,
        filter: 'blur(80px)', zIndex: 0, willChange: 'transform', transform: 'translateZ(0)',
      }} />

      {/* Pitch grid */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.022 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pgrid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke={hex.green.bright} strokeWidth="0.5" />
          </pattern>
          <radialGradient id="pfade" cx="45%" cy="35%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="pmask"><rect width="100%" height="100%" fill="url(#pfade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#pgrid)" mask="url(#pmask)" />
      </svg>

      {/* ═══ HEADER ═══ */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header
          title="⚽ Orionix Gol"
          subtitle="Dashboard"
          centerContent={
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base"
                  style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`,
                           boxShadow: `0 0 20px ${alphaOf('green', 0.40)}` }}>
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${alphaOf('green', 0.30)}` }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-transparent bg-clip-text leading-none truncate"
                  style={{ backgroundImage: `linear-gradient(90deg, ${hex.green.soft}, ${hex.green.bright})` }}>
                  {user?.displayName}
                </p>
                <p className="text-[11px] leading-none mt-0.5 text-orionix-text-muted truncate">{user?.email}</p>
              </div>
            </div>
          }
        />
      </div>

      {/* ═══ DASHBOARD CONTENT ═══ */}
      <div className="relative z-10 px-4 sm:px-6 py-5 max-w-6xl mx-auto w-full pb-44 md:pb-32">

        {/* Modal de bienvenida Premium — solo Free, una vez por sesión */}
        <PremiumOnboardingModal enabled={isAuthenticated && !isPremium} locale={locale} />

        {/* Loading bar */}
        {loading && (
          <div className="w-full h-[2px] rounded-full overflow-hidden mb-3"
            style={{ background: alphaOf('green', 0.08) }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: gradients.divider('green', 1), width: '38%' }}
              animate={{ x: ['-100%', '360%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}

        {/* ── TOURNAMENT MASTHEAD ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            {/* Título principal: text-2xl / text-3xl para máxima legibilidad */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">
              {t('home.welcome')},{' '}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${hex.green.soft}, ${hex.green.bright})` }}>
                {user?.displayName?.split(' ')[0]}
              </span>{' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.5, delay: 0.9, repeat: Infinity, repeatDelay: 5 }}>
                👋
              </motion.span>
            </h1>
            {/* Fecha: mínimo 13px */}
            <p className="text-[13px] mt-1.5 tracking-wide text-orionix-text-secondary" suppressHydrationWarning>
              {fmtTodayHeader(new Date(), locale)}
            </p>
            {/* CTA "Pásate a Premium" — solo Free. Conversión visible al entrar al dashboard. */}
            {!isPremium && (
              <motion.button
                onClick={() => router.push(`/${locale}/premium`)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-black tracking-wider uppercase text-[11px] sm:text-[12px]"
                style={{
                  background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                  color: hex.neutral.black,
                  boxShadow: `0 6px 18px ${alphaOf('gold', 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.35)}`,
                  border: `1px solid ${alphaOf('gold', 0.65)}`,
                }}
                title="Hazte Premium y desbloquea todo el Mundial">
                <FiZap size={13} style={{ fill: hex.neutral.black }} />
                <span>Pásate a Premium</span>
                <FiArrowRight size={13} />
              </motion.button>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Badge torneo: "FIFA" mínimo 10px, "WORLD CUP" mínimo 13px */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${alphaOf('gold', 0.14)} 0%, ${alpha(hex.neutral.black, 0.55)} 100%)`,
                border: `1px solid ${alphaOf('gold', 0.32)}`,
                boxShadow: `0 4px 16px ${alphaOf('gold', 0.12)}`,
              }}>
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-[10px] font-black tracking-[0.26em] uppercase leading-none"
                  style={{ color: alphaOf('gold', 0.70) }}>FIFA</p>
                <p className="text-[13px] font-black tracking-[0.10em] leading-none mt-0.5" style={{ color: hex.gold.bright }}>WORLD CUP 2026</p>
              </div>
            </div>
            {/* Sedes: código de país mínimo 10px */}
            <div className="hidden sm:flex items-center gap-2.5">
              {[
                { flag: '🇺🇸', code: 'USA', color: hex.host.usaRed },
                { flag: '🇲🇽', code: 'MEX', color: hex.host.mexGreen },
                { flag: '🇨🇦', code: 'CAN', color: hex.host.canRed },
              ].map((n, i) => (
                <React.Fragment key={n.code}>
                  {i > 0 && <span className="text-white/15 text-sm">·</span>}
                  <div className="flex items-center gap-1">
                    <span className="text-sm leading-none">{n.flag}</span>
                    <span className="text-[10px] font-black tracking-[0.14em]" style={{ color: n.color }}>{n.code}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ROW 1 — KPI CHIPS ── */}
        <div data-tour="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <KPIChip icon={<FiActivity />}  value={stats.predictions}                        label={t('home.stats.predictions')} color={hex.green.bright} glow={hex.green.bright} bg={alphaOf('green', 0.07)}        delay={0.08} />
          <KPIChip icon={<FiCrosshair />} value={stats.exactas}                            label={t('home.stats.exact')}        color={hex.green.hover}  glow={hex.green.hover}  bg={alphaOf('success', 0.07)}      delay={0.14} />
          <KPIChip icon={<FiAward />}     value={stats.puntos}                             label={t('home.stats.points')}       color={hex.gold.base}    glow={hex.gold.base}    bg={alphaOf('gold', 0.07)}         delay={0.20} />
          <KPIChip icon={<FiBarChart2 />} value={stats.rank > 0 ? `#${stats.rank}` : '—'} label={t('home.stats.ranking')}     color={hex.green.muted}  glow={hex.green.muted}  bg={alpha(hex.green.muted, 0.07)}  delay={0.26} />
        </div>

        {/* ── ROW 2 — COUNTDOWN / MUNDIAL EN CURSO ── */}
        <HomeCountdown countdown={countdown} mundialStarted={mundialStarted} t={t} />

        {/* ── ROW 3 — BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_316px] gap-5">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            <UpcomingMatches fixtures={todayUpcoming} t={t} />
            <RecentResults fixtures={recentResults} predictions={myPredictions} t={t} />
          </div>

          {/* RIGHT COLUMN */}
          <RightColumn
            stats={stats}
            recentResults={recentResults}
            myPredictions={myPredictions}
            topRanking={topRanking}
            maxRankPts={maxRankPts}
            t={t}
          />
        </div>

        {/* ── ROW 4 — QUICK ACCESS BENTO ── */}
        <QuickAccessBento t={t} />

        {/* ── PUBLICIDAD (solo Free) — responsive ── */}
        <div className="sm:hidden mt-8"><AdsterraBanner slot="mobile320x50" /></div>
        <div className="hidden sm:block mt-8"><AdsterraBanner slot="rect300x250" /></div>
      </div>

      <TourButton steps={getTourSteps(locale, 'dashboard')} />
    </div>
  );
}
