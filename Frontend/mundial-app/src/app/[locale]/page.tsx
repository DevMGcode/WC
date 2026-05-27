'use client';

/**
 * Home dashboard — migrated to the design-token system.
 *
 * The local `C` constants object was removed: every color is now sourced
 * from `tokens.ts` (`hex.*`) and composed with `alpha` / `alphaOf` helpers.
 * The visual layout (bento grid: KPIs → countdown → upcoming/results →
 * performance/ranking → quick access) is unchanged.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiActivity, FiCrosshair, FiAward, FiTrendingUp,
  FiCalendar, FiLayers, FiBarChart2, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Navigation';
import { useT } from '@/hooks/useT';
import { getCurrentTournament, getTournamentFixtures, getUserPredictions } from '@/services/publicTournament';
import { scoringService } from '@/services/predictions';
import ShareButton from '@/components/ShareButton';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, gradients } from '@/lib/design/effects';

const MEDAL = ['🥇', '🥈', '🥉'];

/* ══════════════════════════════════════════
   MICRO COMPONENTS — all colors via tokens
══════════════════════════════════════════ */

const IconBox = ({
  icon, color, size = 'md',
}: { icon: React.ReactNode; color: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dim  = { sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' }[size];
  const px   = { sm: 14, md: 18, lg: 24 }[size];
  const rnd  = { sm: 'rounded-xl', md: 'rounded-2xl', lg: 'rounded-2xl' }[size];
  return (
    <div className={`relative shrink-0 ${dim} ${rnd} flex items-center justify-center overflow-hidden`}
      style={{
        background: `linear-gradient(145deg, ${color}1a 0%, ${alpha(hex.neutral.black, 0.60)} 100%)`,
        border: `1px solid ${color}35`,
        boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.07)}, 0 4px 16px ${alpha(hex.neutral.black, 0.40)}`,
      }}>
      <div className={`absolute inset-x-0 top-0 h-px ${rnd}`}
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
      <span style={{ color, fontSize: px, filter: `drop-shadow(0 0 6px ${color}90)` }}>{icon}</span>
    </div>
  );
};

const Ring = ({
  value, max = 100, size = 72, stroke = 6, color,
  trail,
}: { value: number; max?: number; size?: number; stroke?: number; color: string; trail?: string }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - Math.min(1, value / Math.max(max, 1)));
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ overflow: 'visible' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={trail ?? alpha(hex.neutral.white, 0.05)} strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}44)` }}
      />
    </svg>
  );
};

const GlowBar = ({ value, max = 100, color, height = 3 }: {
  value: number; max?: number; color: string; height?: number;
}) => (
  <div className="relative w-full rounded-full overflow-hidden"
    style={{ height, background: alpha(hex.neutral.white, 0.05) }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 8px ${color}55` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }}
      transition={{ duration: 1.3, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

const KPIChip = ({
  icon, value, label, color, glow, bg, delay,
}: {
  icon: React.ReactNode; value: string | number; label: string;
  color: string; glow: string; bg: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -14, scale: 0.93 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.03 }}
    className="relative overflow-hidden rounded-2xl cursor-default"
    style={{
      background: `linear-gradient(145deg, ${bg} 0%, ${alpha(hex.bg.primary, 0.97)} 100%)`,
      border: `1px solid ${color}28`,
      boxShadow: `0 8px 30px ${alpha(hex.neutral.black, 0.45)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.02)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${color}cc, transparent)` }} />
    <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${glow}28 0%, transparent 70%)`, filter: 'blur(12px)' }} />

    <div className="relative z-10 p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[8px] font-black tracking-[0.30em] uppercase" style={{ color: `${color}65` }}>{label}</p>
        <IconBox icon={icon} color={color} size="sm" />
      </div>
      <p className="text-[2.2rem] font-black tabular-nums leading-none"
        style={{ color, textShadow: `0 0 24px ${glow}55`, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  </motion.div>
);

const Flag = ({ url, name, size = 'md', glow }: {
  url: string; name: string; size?: 'sm' | 'md' | 'lg'; glow?: string;
}) => {
  const sz = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-[72px] h-[72px]' }[size];
  return (
    <div className="relative shrink-0">
      {glow && <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: glow, filter: 'blur(14px)', transform: 'scale(1.45)', opacity: 0.6 }} />}
      <div className={`relative ${sz} rounded-full border-2 overflow-hidden`}
        style={{ borderColor: alpha(hex.neutral.white, 0.12), background: hex.bg.elevated,
                 boxShadow: `0 4px 16px ${alpha(hex.neutral.black, 0.55)}` }}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

const PitchMini = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 32" width={64} height={32} style={{ opacity: 0.28 }}>
    <rect x="1" y="1" width="62" height="30" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
    <line x1="32" y1="1" x2="32" y2="31" stroke={color} strokeWidth="0.9" />
    <circle cx="32" cy="16" r="6.5" fill="none" stroke={color} strokeWidth="0.9" />
    <circle cx="32" cy="16" r="1" fill={color} />
    <rect x="1" y="9" width="11" height="14" rx="1.5" fill="none" stroke={color} strokeWidth="0.8" />
    <rect x="52" y="9" width="11" height="14" rx="1.5" fill="none" stroke={color} strokeWidth="0.8" />
    <rect x="1" y="13" width="5" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.6" />
    <rect x="58" y="13" width="5" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.6" />
  </svg>
);

const FormStrip = ({ results, predictions }: {
  results: any[]; predictions: Record<number, any>;
}) => {
  const dots = results.slice(0, 5).map(f => {
    const pred = predictions[f.id];
    if (!pred) return null;
    const { predictedHomeScore: ph, predictedAwayScore: pa } = pred;
    const { homeScore: rh, awayScore: ra } = f;
    if (ph === rh && pa === ra) return { type: 'E', color: hex.green.hover, bg: alphaOf('success', 0.13), label: 'Exacta' };
    if (Math.sign(ph - pa) === Math.sign(rh - ra)) return { type: 'W', color: hex.green.bright, bg: alphaOf('green', 0.09), label: 'Correcto' };
    return { type: 'L', color: hex.status.danger, bg: alphaOf('danger', 0.14), label: 'Fallado' };
  }).filter(Boolean);

  if (!dots.length) return null;

  return (
    <div className="flex items-center gap-2 mt-4 pt-3"
      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
      <span className="text-[7.5px] font-black tracking-[0.24em] uppercase"
        style={{ color: alpha(hex.neutral.white, 0.22) }}>FORMA</span>
      <div className="flex items-center gap-1.5">
        {dots.map((d, i) => (
          <div key={i}
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-black"
            style={{ background: d!.bg, border: `1px solid ${d!.color}45`, color: d!.color }}
            title={d!.label}>
            {d!.type}
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeader = ({
  label, accent = hex.green.bright, right,
}: { label: string; accent?: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}55)` }} />
      <span className="text-[10px] font-black tracking-[0.26em] uppercase text-orionix-text-muted">{label}</span>
    </div>
    {right}
  </div>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const { t } = useT();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'es';
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading]               = useState(true);
  const [todayUpcoming, setTodayUpcoming]   = useState<any[]>([]);
  const [recentResults, setRecentResults]   = useState<any[]>([]);
  const [myPredictions, setMyPredictions]   = useState<Record<number, any>>({});
  const [topRanking, setTopRanking]         = useState<any[]>([]);
  const [stats, setStats]                   = useState({ predictions: 0, exactas: 0, puntos: 0, rank: 0 });
  const [countdown, setCountdown]           = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mundialStarted, setMundialStarted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const target = new Date('2026-06-11T00:00:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setMundialStarted(true); return; }
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) loadDashboard();
  }, [authLoading, isAuthenticated, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const userId = Number(user!.id);
      const tournament = await getCurrentTournament();
      if (!tournament) { setLoading(false); return; }
      const tid = tournament.id;

      const [fixtures, predJson, scoreJson, rankData] = await Promise.all([
        getTournamentFixtures(tid),
        fetch(`/api/v1/public/predictions/user/${userId}`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`/api/v1/public/scores/user/${tid}?userId=${userId}`).then(r => r.ok ? r.json() : { data: null }),
        scoringService.getGlobalRanking(tid, { page: 0, pageSize: 5 }).catch(() => null),
      ]);

      const upcoming = (fixtures as any[])
        .filter(f => f.status === 'SCHEDULED' || f.status === 'LIVE')
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
      const finished = (fixtures as any[])
        .filter(f => f.status === 'FINISHED')
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());

      const upcomingGroup = upcoming.slice(0, 5);
      const finishedGroup = finished.slice(0, 5);

      setTodayUpcoming(upcomingGroup);
      setRecentResults(finishedGroup);

      const preds: any[] = predJson?.data ?? [];
      const predMap: Record<number, any> = {};
      finishedGroup.forEach(r => {
        const p = preds.find((p: any) => p.fixtureId === r.id);
        if (p) predMap[r.id] = p;
      });
      setMyPredictions(predMap);

      const score = scoreJson?.data;
      setStats({
        predictions: preds.length,
        exactas:     score?.exactScores ?? 0,
        puntos:      score?.totalPoints ?? 0,
        rank:        score?.rankPosition ?? 0,
      });

      if (rankData?.data) {
        setTopRanking((rankData.data as any[]).slice(0, 5).map((s: any, i: number) => ({
          rank:   s.rankPosition ?? i + 1,
          name:   s.fullName || s.username || 'Usuario',
          points: s.totalPoints ?? 0,
          isMe:   Number(s.userId) === userId,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !isAuthenticated) return null;

  const fmtDate = (d: any) => {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
      + ' · ' + dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const fmtTime = (d: any) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const fmtDay  = (d: any) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

  // Maps a fixture+prediction to a styled result chip. Colors via tokens.
  const getPredResult = (fixture: any, prediction: any) => {
    if (!prediction || !fixture) return null;
    const { predictedHomeScore: ph, predictedAwayScore: pa } = prediction;
    const { homeScore: rh, awayScore: ra } = fixture;
    if (ph === rh && pa === ra)
      return { label: t('home.result.exactScore'), pts: '+3 pts', color: hex.green.hover, glow: hex.green.hover, border: alphaOf('success', 0.28) };
    if (Math.sign(ph - pa) === Math.sign(rh - ra))
      return { label: t('home.result.correct'), pts: '+1 pt', color: hex.green.bright, glow: hex.green.muted, border: alphaOf('green', 0.25) };
    return { label: t('home.result.wrong'), pts: '0 pts', color: hex.status.danger, glow: '#ef4444', border: alphaOf('danger', 0.28) };
  };

  const accuracyPct = stats.predictions > 0
    ? Math.round((stats.exactas / stats.predictions) * 100)
    : 0;

  const maxRankPts = topRanking.length > 0 ? Math.max(...topRanking.map(r => r.points), 1) : 1;

  const cdUnits = [
    { val: String(countdown.days).padStart(2, '0'),    label: t('home.time.days')    },
    { val: String(countdown.hours).padStart(2, '0'),   label: t('home.time.hours')   },
    { val: String(countdown.minutes).padStart(2, '0'), label: t('home.time.minutes') },
    { val: String(countdown.seconds).padStart(2, '0'), label: t('home.time.seconds') },
  ];

  /* Card surface — single source of truth for the dashboard's dark card */
  const card = (border: string): React.CSSProperties => ({
    background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)} 0%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
    border: `1px solid ${border}`,
    backdropFilter: 'blur(28px)',
    boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.03)}`,
  });

  const pageBg = `radial-gradient(ellipse at 20% 30%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 55%, ${hex.bg.primary} 100%)`;

  return (
    <div className="w-full relative min-h-screen" style={{ background: pageBg }}>

      {/* ═══ BACKGROUND ORBS ═══ */}
      <div className="fixed rounded-full pointer-events-none" style={{
        width: 800, height: 800, top: -280, left: -200,
        background: `radial-gradient(circle, ${alphaOf('success', 0.06)} 0%, transparent 60%)`,
        filter: 'blur(80px)', zIndex: 0,
      }} />
      <div className="fixed rounded-full pointer-events-none" style={{
        width: 600, height: 600, bottom: -150, right: -150,
        background: `radial-gradient(circle, ${alphaOf('gold', 0.04)} 0%, transparent 60%)`,
        filter: 'blur(80px)', zIndex: 0,
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
              <div className="hidden sm:block">
                <p className="text-sm font-black text-transparent bg-clip-text leading-none"
                  style={{ backgroundImage: `linear-gradient(90deg, ${hex.green.soft}, ${hex.green.bright})` }}>
                  {user?.displayName}
                </p>
                <p className="text-[10px] leading-none mt-0.5 text-orionix-text-muted">{user?.email}</p>
              </div>
            </div>
          }
        />
      </div>

      {/* ═══ DASHBOARD CONTENT ═══ */}
      <div className="relative z-10 px-3 sm:px-5 py-4 max-w-6xl mx-auto w-full pb-32">

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
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">
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
            <p className="text-[11px] mt-1 tracking-wide text-orionix-text-muted" suppressHydrationWarning>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${alphaOf('gold', 0.12)} 0%, ${alpha(hex.neutral.black, 0.50)} 100%)`,
                border: `1px solid ${alphaOf('gold', 0.28)}`,
              }}>
              <span className="text-base">🏆</span>
              <div>
                <p className="text-[7px] font-black tracking-[0.30em] uppercase leading-none"
                  style={{ color: alphaOf('gold', 0.55) }}>FIFA</p>
                <p className="text-[10px] font-black tracking-[0.14em] leading-none" style={{ color: hex.gold.base }}>WORLD CUP 2026</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {[
                { flag: '🇺🇸', code: 'USA', color: hex.host.usaRed },
                { flag: '🇲🇽', code: 'MEX', color: hex.host.mexGreen },
                { flag: '🇨🇦', code: 'CAN', color: hex.host.canRed },
              ].map((n, i) => (
                <React.Fragment key={n.code}>
                  {i > 0 && <span className="text-white/10 text-xs">·</span>}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] leading-none">{n.flag}</span>
                    <span className="text-[7px] font-black tracking-[0.18em]" style={{ color: n.color }}>{n.code}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ROW 1 — KPI CHIPS ── */}
        <div data-tour="stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KPIChip icon={<FiActivity />}  value={stats.predictions}                        label={t('home.stats.predictions')} color={hex.green.bright} glow={hex.green.bright} bg={alphaOf('green', 0.07)}   delay={0.08} />
          <KPIChip icon={<FiCrosshair />} value={stats.exactas}                            label={t('home.stats.exact')}        color={hex.green.hover}  glow={hex.green.hover}  bg={alphaOf('success', 0.07)} delay={0.14} />
          <KPIChip icon={<FiAward />}     value={stats.puntos}                             label={t('home.stats.points')}       color={hex.gold.base}    glow={hex.gold.base}    bg={alphaOf('gold', 0.07)}    delay={0.20} />
          <KPIChip icon={<FiBarChart2 />} value={stats.rank > 0 ? `#${stats.rank}` : '—'} label={t('home.stats.ranking')}     color={hex.green.muted}  glow={hex.green.muted}  bg={alpha(hex.green.muted, 0.07)} delay={0.26} />
        </div>

        {/* ── ROW 2 — COUNTDOWN / MUNDIAL EN CURSO ── */}
        <AnimatePresence mode="wait">
          {mundialStarted ? (
            <motion.div
              key="started"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${alphaOf('success', 0.40)} 0%, ${alpha(hex.bg.primary, 0.97)} 50%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
                border: `1px solid ${alphaOf('success', 0.30)}`,
                boxShadow: `0 12px 48px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alphaOf('success', 0.08)}`,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright}, ${hex.green.hover}, ${hex.gold.base})` }} />

              <div className="relative flex flex-col sm:flex-row items-center gap-5 px-6 py-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(145deg, ${alphaOf('gold', 0.20)}, ${alpha(hex.neutral.black, 0.60)})`,
                    border: `1px solid ${alphaOf('gold', 0.28)}`,
                  }}>
                  <span className="text-3xl">🏆</span>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[8px] font-black tracking-[0.40em] uppercase mb-1.5"
                    style={{ color: alphaOf('success', 0.55) }}>{t('home.ongoing')}</p>
                  <p className="text-xl sm:text-2xl font-black leading-tight"
                    style={{
                      background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright})`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                    {t('home.started')}
                  </p>
                  <p className="text-[10px] mt-1.5 tracking-wide text-orionix-text-muted">{t('home.registerPredictions')}</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-full shrink-0"
                  style={{ border: `1px solid ${alphaOf('green', 0.28)}`, background: alphaOf('green', 0.08) }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: hex.green.bright, opacity: 0.9 }} />
                  <span className="text-[9px] font-black tracking-[0.24em] uppercase text-orionix-green-soft">{t('home.live')}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              data-tour="countdown"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${alpha(hex.gold.dark, 0.18)} 0%, ${alpha(hex.bg.primary, 0.97)} 45%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
                border: `1px solid ${alphaOf('gold', 0.22)}`,
                boxShadow: `0 12px 40px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alphaOf('gold', 0.06)}`,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}80, transparent)` }} />
              <div className="absolute -top-12 right-8 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.08)} 0%, transparent 70%)`, filter: 'blur(32px)' }} />

              <div className="relative flex flex-col sm:flex-row items-center gap-4 px-5 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(145deg, ${alphaOf('gold', 0.18)}, ${alpha(hex.neutral.black, 0.55)})`,
                      border: `1px solid ${alphaOf('gold', 0.28)}`,
                    }}>
                    <span className="text-xl leading-none">⏱</span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black tracking-[0.34em] uppercase leading-none mb-0.5"
                      style={{ color: `${hex.gold.base}66` }}>{t('home.worldCupStart')}</p>
                    <p className="text-sm font-black leading-none" style={{ color: hex.gold.bright }}>{t('common.worldCup')}</p>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-10 self-center shrink-0"
                  style={{ background: alphaOf('gold', 0.14) }} />

                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-start">
                  {cdUnits.map(({ val, label }, i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <span className="font-black text-xl sm:text-2xl" style={{ color: alphaOf('gold', 0.30) }}>:</span>}
                      <div className="flex flex-col items-center px-1.5 py-1 rounded-lg min-w-[44px]"
                        style={{
                          background: alphaOf('gold', 0.05),
                          border: `1px solid ${alphaOf('gold', 0.12)}`,
                        }}>
                        <motion.p
                          key={val}
                          className="text-2xl sm:text-3xl font-black tabular-nums leading-none"
                          style={{ color: hex.gold.soft, textShadow: `0 0 22px ${alphaOf('gold', 0.60)}` }}
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.18 }}
                        >{val}</motion.p>
                        <p className="text-[6.5px] font-bold tracking-[0.22em] uppercase mt-0.5"
                          style={{ color: `${hex.gold.base}50` }}>{label}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-[7px] font-black tracking-[0.30em] uppercase"
                    style={{ color: alpha(hex.neutral.white, 0.20) }}>SEDE</p>
                  <div className="flex items-center gap-2">
                    {[
                      { flag: '🇺🇸', code: 'USA', color: hex.host.usaRed },
                      { flag: '🇲🇽', code: 'MEX', color: hex.host.mexGreen },
                      { flag: '🇨🇦', code: 'CAN', color: hex.host.canRed },
                    ].map((n, i) => (
                      <React.Fragment key={n.code}>
                        {i > 0 && <span className="text-white/10 text-xs">·</span>}
                        <div className="flex items-center gap-1">
                          <span className="text-base leading-none">{n.flag}</span>
                          <span className="text-[7px] font-black tracking-[0.18em]" style={{ color: n.color }}>{n.code}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ROW 3 — BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* PRÓXIMOS PARTIDOS */}
            <motion.div
              data-tour="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={card(alphaOf('green', 0.18))}
            >
              <div className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.green.bright}aa, transparent)` }} />
              <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('green', 0.09)} 0%, transparent 65%)`, filter: 'blur(30px)' }} />

              <div className="relative p-5 sm:p-6">
                <SectionHeader
                  label={todayUpcoming.length > 1 ? 'PRÓXIMOS PARTIDOS' : t('home.nextMatch')}
                  accent={hex.green.bright}
                  right={
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ border: `1px solid ${alphaOf('green', 0.28)}`, background: alphaOf('green', 0.08) }}>
                      {todayUpcoming.length > 0 && (
                        <span className="text-[8px] font-black px-1 py-0.5 rounded-full tabular-nums"
                          style={{ background: alphaOf('green', 0.15), color: hex.green.bright }}>
                          {todayUpcoming.length}
                        </span>
                      )}
                      <span className="text-[8px] font-black tracking-widest text-orionix-green-soft">{t('home.pending')}</span>
                    </div>
                  }
                />

                {todayUpcoming.length > 0 ? (
                  todayUpcoming.length === 1 ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-5">
                        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.20)})` }} />
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                          style={{ background: alphaOf('green', 0.06), border: `1px solid ${alphaOf('green', 0.18)}` }}>
                          <span className="text-sm">🏟️</span>
                          <span className="text-[9px] font-semibold text-orionix-text-muted">{fmtDate(todayUpcoming[0].kickoffAt)}</span>
                        </div>
                        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.20)}, transparent)` }} />
                      </div>

                      <div className="flex items-center justify-around pb-5">
                        <motion.div className="flex flex-col items-center gap-3 flex-1" whileHover={{ scale: 1.04 }}>
                          <Flag url={todayUpcoming[0].homeTeam.flagUrl} name={todayUpcoming[0].homeTeam.name} size="lg"
                            glow={alphaOf('green', 0.20)} />
                          <div className="text-center">
                            <p className="text-base font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                              {todayUpcoming[0].homeTeam.shortName}
                            </p>
                            <p className="text-[9px] font-medium mt-0.5 hidden sm:block truncate max-w-[90px] text-orionix-text-muted">
                              {todayUpcoming[0].homeTeam.name}
                            </p>
                          </div>
                        </motion.div>

                        <div className="flex flex-col items-center px-4 shrink-0">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                              background: `linear-gradient(145deg, ${alphaOf('green', 0.10)}, ${alpha(hex.neutral.black, 0.60)})`,
                              border: `1px solid ${alphaOf('green', 0.22)}`,
                              boxShadow: `0 0 30px ${alphaOf('green', 0.10)}`,
                            }}>
                            <span className="text-[13px] font-black tracking-[0.12em]"
                              style={{ color: alphaOf('green', 0.60) }}>VS</span>
                          </div>
                          <div className="mt-2 px-2 py-0.5 rounded-full text-center"
                            style={{ background: alphaOf('gold', 0.08), border: `1px solid ${alphaOf('gold', 0.18)}` }}>
                            <span className="text-[8px] font-black tracking-widest"
                              style={{ color: `${hex.gold.base}80` }}>GRUPO A</span>
                          </div>
                        </div>

                        <motion.div className="flex flex-col items-center gap-3 flex-1" whileHover={{ scale: 1.04 }}>
                          <Flag url={todayUpcoming[0].awayTeam.flagUrl} name={todayUpcoming[0].awayTeam.name} size="lg"
                            glow={alphaOf('green', 0.20)} />
                          <div className="text-center">
                            <p className="text-base font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                              {todayUpcoming[0].awayTeam.shortName}
                            </p>
                            <p className="text-[9px] font-medium mt-0.5 hidden sm:block truncate max-w-[90px] text-orionix-text-muted">
                              {todayUpcoming[0].awayTeam.name}
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      <div className="h-px w-full mb-4"
                        style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.15)}, transparent)` }} />

                      <Link href={`/fixtures/${todayUpcoming[0].id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: `0 14px 44px ${alphaOf('success', 0.55)}` }}
                          whileTap={{ scale: 0.97 }}
                          className="relative w-full py-3.5 rounded-xl font-black text-white tracking-wide overflow-hidden flex items-center justify-center gap-2"
                          style={{
                            background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base}, ${hex.green.hover})`,
                            boxShadow: `0 6px 24px ${alphaOf('success', 0.32)}`,
                            fontSize: '13px',
                          }}
                        >
                          <motion.div className="absolute inset-0"
                            style={{ background: `linear-gradient(105deg, transparent 30%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 70%)` }}
                            animate={{ x: ['-130%', '130%'] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }} />
                          <span className="relative">⚡</span>
                          <span className="relative">{t('home.makePrediction')}</span>
                          <FiChevronRight className="relative" size={14} />
                        </motion.button>
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {todayUpcoming.map((fixture, i) => (
                        <motion.div
                          key={fixture.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ scale: 1.01 }}
                          className="relative overflow-hidden rounded-2xl group"
                          style={{
                            background: alphaOf('green', 0.03),
                            border: `1px solid ${alphaOf('green', 0.10)}`,
                            transition: 'border-color 0.2s ease',
                          }}
                        >
                          <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: `linear-gradient(90deg, transparent, ${hex.green.bright}80, transparent)` }} />

                          <div className="flex items-center gap-2 px-3 py-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name} size="sm" />
                              <span className="text-xs font-black tracking-wide truncate uppercase text-orionix-text-secondary">
                                {fixture.homeTeam.shortName}
                              </span>
                            </div>

                            <div className="text-center shrink-0 px-2 min-w-[76px]">
                              <span className="text-[9.5px] font-semibold block leading-none mb-0.5 text-orionix-text-muted">
                                {fmtDay(fixture.kickoffAt)}
                              </span>
                              <span className="text-sm font-black leading-none"
                                style={{ color: hex.green.bright, textShadow: `0 0 12px ${alphaOf('green', 0.40)}` }}>
                                {fmtTime(fixture.kickoffAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                              <span className="text-xs font-black tracking-wide truncate uppercase text-orionix-text-secondary">
                                {fixture.awayTeam.shortName}
                              </span>
                              <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name} size="sm" />
                            </div>

                            <Link href={`/fixtures/${fixture.id}`} className="shrink-0 ml-2">
                              <motion.button
                                whileHover={{ scale: 1.07, boxShadow: `0 4px 20px ${alphaOf('success', 0.50)}` }}
                                whileTap={{ scale: 0.93 }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-white whitespace-nowrap"
                                style={{
                                  background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`,
                                  boxShadow: `0 3px 12px ${alphaOf('success', 0.28)}`,
                                  fontSize: '10px',
                                }}
                              >
                                ⚡ Porra
                              </motion.button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: alphaOf('green', 0.07), border: `1px solid ${alphaOf('green', 0.15)}` }}>
                      <span className="text-3xl">⚽</span>
                    </div>
                    <p className="text-sm font-semibold text-orionix-text-muted">{t('home.noFixtures')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ÚLTIMOS RESULTADOS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={card(alphaOf('gold', 0.18))}
            >
              <div className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}aa, transparent)` }} />
              <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.09)} 0%, transparent 65%)`, filter: 'blur(30px)' }} />

              <div className="relative p-5 sm:p-6">
                <SectionHeader
                  label={recentResults.length > 1 ? 'ÚLTIMOS RESULTADOS' : t('home.lastResult')}
                  accent={hex.gold.base}
                  right={
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ border: `1px solid ${alphaOf('gold', 0.28)}`, background: alphaOf('gold', 0.08) }}>
                      {recentResults.length > 1 && (
                        <span className="text-[8px] font-black tabular-nums px-1 py-0.5 rounded-full"
                          style={{ background: alphaOf('gold', 0.15), color: hex.gold.base }}>
                          {recentResults.length}
                        </span>
                      )}
                      <span className="text-[8px] font-black tracking-widest text-amber-300">{t('home.finished')}</span>
                    </div>
                  }
                />

                {recentResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recentResults.map((fixture, i) => {
                      const pred = myPredictions[fixture.id];
                      const pr   = getPredResult(fixture, pred);
                      const isSingle = recentResults.length === 1;
                      return (
                        <motion.div
                          key={fixture.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="relative overflow-hidden rounded-2xl"
                          style={{
                            background: pr
                              ? `linear-gradient(135deg, ${pr.glow}07 0%, transparent 100%)`
                              : alpha(hex.neutral.white, 0.02),
                            border: `1px solid ${pr?.border ?? alpha(hex.neutral.white, 0.06)}`,
                          }}
                        >
                          {pr && (
                            <div className="absolute inset-x-0 top-0 h-px"
                              style={{ background: `linear-gradient(90deg, transparent, ${pr.glow}70, transparent)` }} />
                          )}

                          <div className="p-3.5">
                            <div className="flex items-center justify-around">
                              <div className="flex flex-col items-center gap-1.5 flex-1">
                                <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name}
                                  size={isSingle ? 'md' : 'sm'} glow={alphaOf('gold', 0.16)} />
                                <p className={`font-black tracking-wider uppercase ${isSingle ? 'text-sm' : 'text-xs'}`}
                                  style={{ color: hex.text.primary }}>
                                  {fixture.homeTeam.shortName}
                                </p>
                              </div>

                              <div className="text-center px-3 flex-shrink-0">
                                <motion.div
                                  className="flex items-center gap-2"
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.45 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  <span className="font-black tabular-nums leading-none"
                                    style={{ fontSize: isSingle ? 'clamp(2.2rem,6vw,3.2rem)' : '1.7rem',
                                             color: hex.text.primary,
                                             textShadow: `0 0 28px ${alpha(hex.neutral.white, 0.14)}` }}>
                                    {fixture.homeScore}
                                  </span>
                                  <span style={{ color: alpha(hex.neutral.white, 0.16), fontSize: isSingle ? '1.4rem' : '1rem', fontWeight: 900 }}>–</span>
                                  <span className="font-black tabular-nums leading-none"
                                    style={{ fontSize: isSingle ? 'clamp(2.2rem,6vw,3.2rem)' : '1.7rem',
                                             color: hex.text.primary,
                                             textShadow: `0 0 28px ${alpha(hex.neutral.white, 0.14)}` }}>
                                    {fixture.awayScore}
                                  </span>
                                </motion.div>
                                <p className="text-[8.5px] mt-1 text-orionix-text-muted">{fmtDate(fixture.kickoffAt)}</p>
                              </div>

                              <div className="flex flex-col items-center gap-1.5 flex-1">
                                <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name}
                                  size={isSingle ? 'md' : 'sm'} glow={alphaOf('gold', 0.16)} />
                                <p className={`font-black tracking-wider uppercase ${isSingle ? 'text-sm' : 'text-xs'}`}
                                  style={{ color: hex.text.primary }}>
                                  {fixture.awayTeam.shortName}
                                </p>
                              </div>
                            </div>

                            {fixture.scorers && fixture.scorers.length > 0 && (
                              <div className="mt-2.5 pt-2.5"
                                style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                                <div className="flex gap-3">
                                  <div className="flex-1 space-y-0.5 min-w-0">
                                    {fixture.scorers
                                      .filter((s: any) => s.teamId === fixture.homeTeam.id)
                                      .map((s: any) => (
                                        <div key={s.id} className="flex items-center gap-1 text-[9px]"
                                          style={{ color: hex.green.soft }}>
                                          <span className="shrink-0">⚽</span>
                                          <span className="font-bold truncate">{s.playerName}</span>
                                          {s.minute && <span className="shrink-0 opacity-45">{s.minute}&apos;</span>}
                                        </div>
                                    ))}
                                  </div>
                                  <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.07) }} />
                                  <div className="flex-1 space-y-0.5 min-w-0">
                                    {fixture.scorers
                                      .filter((s: any) => s.teamId === fixture.awayTeam.id)
                                      .map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-end gap-1 text-[9px]"
                                          style={{ color: hex.gold.bright }}>
                                          {s.minute && <span className="shrink-0 opacity-45">{s.minute}&apos;</span>}
                                          <span className="font-bold truncate">{s.playerName}</span>
                                          <span className="shrink-0">⚽</span>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {pred ? (
                              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t"
                                style={{ borderColor: alpha(hex.neutral.white, 0.05) }}>
                                <div>
                                  <p className="text-[7.5px] uppercase tracking-[0.24em] text-orionix-text-muted mb-0.5">
                                    {t('home.myPrediction')}
                                  </p>
                                  <p className={`font-black text-orionix-text-secondary ${isSingle ? 'text-2xl' : 'text-lg'}`}>
                                    {pred.predictedHomeScore}
                                    <span className="mx-1 text-sm" style={{ color: alpha(hex.neutral.white, 0.18) }}>–</span>
                                    {pred.predictedAwayScore}
                                  </p>
                                </div>
                                {pr && (
                                  <div className="text-right">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-0.5"
                                      style={{
                                        background: `${pr.color}14`,
                                        border: `1px solid ${pr.color}30`,
                                      }}>
                                      <span className="text-[9px] font-black" style={{ color: pr.color }}>{pr.label}</span>
                                    </div>
                                    <p className={`font-black mt-0.5 ${isSingle ? 'text-xl' : 'text-base'}`}
                                      style={{ color: pr.color, textShadow: `0 0 18px ${pr.glow}` }}>
                                      {pr.pts}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-center text-[9.5px] mt-2.5 pt-2.5 border-t"
                                style={{ borderColor: alpha(hex.neutral.white, 0.05), color: hex.text.muted }}>
                                {t('home.noPrediction')}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: alphaOf('gold', 0.07), border: `1px solid ${alphaOf('gold', 0.15)}` }}>
                      <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-sm font-semibold text-orionix-text-muted">{t('home.noResults')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* RENDIMIENTO */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={card(alphaOf('success', 0.18))}
            >
              <div className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.green.hover}bb, transparent)` }} />
              <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('success', 0.09)} 0%, transparent 65%)`, filter: 'blur(26px)' }} />

              <div className="relative p-5">
                <SectionHeader label={t('home.performance')} accent={hex.green.hover} />

                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <Ring value={accuracyPct} max={100} size={84} stroke={7} color={hex.green.hover} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xl font-black leading-none tabular-nums"
                        style={{ color: hex.green.soft, textShadow: `0 0 16px ${alphaOf('success', 0.80)}` }}>
                        {accuracyPct}%
                      </p>
                      <p className="text-[6px] font-black tracking-[0.2em] uppercase mt-0.5 text-orionix-text-muted">Exactas</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[
                      { label: t('home.stats.predictionsLabel'), value: stats.predictions, max: 64,  color: hex.green.bright },
                      { label: t('home.stats.exact'),            value: stats.exactas,     max: stats.predictions || 1, color: hex.green.hover  },
                      { label: t('home.stats.points'),           value: stats.puntos,      max: 192, color: hex.gold.base    },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[8.5px] font-bold tracking-wide text-orionix-text-muted">{label}</span>
                          <span className="text-[10px] font-black tabular-nums" style={{ color }}>{value}</span>
                        </div>
                        <GlowBar value={value} max={max} color={color} height={3} />
                      </div>
                    ))}
                  </div>
                </div>

                <FormStrip results={recentResults} predictions={myPredictions} />
              </div>
            </motion.div>

            {/* CLASIFICACIÓN GLOBAL */}
            <motion.div
              data-tour="ranking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.50, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl flex-1"
              style={card(alpha(hex.neutral.white, 0.07))}
            >
              <div className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}60, transparent)` }} />
              <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.08)} 0%, transparent 65%)`, filter: 'blur(24px)' }} />

              <div className="relative p-5">
                <SectionHeader
                  label={t('home.globalRanking')}
                  accent={hex.gold.base}
                  right={
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ filter: `drop-shadow(0 0 5px ${hex.gold.base}55)` }}>⚽</span>
                      {stats.rank > 0 && (
                        <ShareButton
                          title="⚽ Orionix Gol — Mundial 2026"
                          text={`🏆 Estoy en el puesto #${stats.rank} del ranking con ${stats.puntos} pts en el Mundial 2026\n¿Puedes superarme? 👇`}
                          label="Compartir"
                          size="sm"
                          variant="icon"
                        />
                      )}
                    </div>
                  }
                />

                <div className="space-y-2">
                  {topRanking.length > 0 ? topRanking.map((p, i) => {
                    const rankColors = [hex.gold.base, hex.text.secondary, '#cd7c3e' /* bronze */];
                    const barColor   = p.isMe ? hex.green.bright : (rankColors[i] ?? alpha(hex.neutral.white, 0.18));
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.56 + i * 0.06 }}
                        className="relative overflow-hidden rounded-2xl p-2.5"
                        style={{
                          background: p.isMe
                            ? alphaOf('green', 0.08)
                            : (i < 3 ? alpha(hex.neutral.white, 0.03) : alpha(hex.neutral.white, 0.02)),
                          border: p.isMe
                            ? `1px solid ${alphaOf('green', 0.24)}`
                            : (i < 3 ? `1px solid ${barColor}20` : `1px solid ${alpha(hex.neutral.white, 0.04)}`),
                        }}
                      >
                        {p.isMe && (
                          <div className="absolute inset-x-0 top-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${hex.green.bright}60, transparent)` }} />
                        )}
                        {i < 3 && !p.isMe && (
                          <div className="absolute inset-x-0 top-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${barColor}40, transparent)` }} />
                        )}

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm w-5 text-center shrink-0 leading-none">
                            {i < 3 ? MEDAL[i] : (
                              <span className="text-[10px] font-black text-orionix-text-muted">{p.rank}</span>
                            )}
                          </span>
                          <span className="flex-1 text-xs font-bold truncate"
                            style={{ color: p.isMe ? hex.green.soft : hex.text.secondary }}>
                            {p.isMe && <span className="mr-0.5" style={{ color: hex.green.bright }}>›</span>}
                            {p.name}
                          </span>
                          <span className="text-xs font-black tabular-nums shrink-0"
                            style={{ color: barColor, textShadow: `0 0 10px ${barColor}80` }}>
                            {p.points}
                          </span>
                          <span className="text-[7.5px] text-orionix-text-muted shrink-0">pts</span>
                        </div>
                        <GlowBar value={p.points} max={maxRankPts} color={barColor} height={2} />
                      </motion.div>
                    );
                  }) : (
                    <p className="text-xs text-center py-8 text-orionix-text-muted">{t('home.noRankingData')}</p>
                  )}
                </div>

                <Link href="/predictions">
                  <motion.button
                    whileHover={{ borderColor: alphaOf('green', 0.35), color: hex.green.bright }}
                    className="w-full mt-4 py-2.5 rounded-xl text-[9px] font-black border transition-all tracking-[0.24em] uppercase text-orionix-text-muted flex items-center justify-center gap-1"
                    style={{ borderColor: alpha(hex.neutral.white, 0.06) }}
                  >
                    {t('home.viewFullRanking')}
                    <FiChevronRight size={11} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── ROW 4 — QUICK ACCESS BENTO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {[
            {
              href: '/fixtures',
              icon: <FiCalendar />,
              label: t('home.quick.matches'),
              desc: 'Consulta el calendario',
              accent: hex.green.bright,
              glow:   alphaOf('green', 0.45),
              bg:     alphaOf('green', 0.07),
            },
            {
              href: '/groups',
              icon: <FiLayers />,
              label: t('home.quick.groups'),
              desc: 'Fase de grupos',
              accent: hex.green.hover,
              glow:   alphaOf('success', 0.45),
              bg:     alphaOf('success', 0.07),
            },
            {
              href: '/predictions',
              icon: <FiTrendingUp />,
              label: t('home.quick.predictions'),
              desc: 'Tus porras',
              accent: hex.gold.base,
              glow:   alphaOf('gold', 0.45),
              bg:     alphaOf('gold', 0.07),
            },
          ].map(({ href, icon, label, desc, accent, glow, bg }, i) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.04, y: -5, boxShadow: `0 20px 48px ${glow}` }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer h-full"
                style={{
                  background: `linear-gradient(155deg, ${bg} 0%, ${alpha(hex.bg.primary, 0.97)} 100%)`,
                  border: `1px solid ${accent}22`,
                  boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}, 0 8px 28px ${alpha(hex.neutral.black, 0.40)}`,
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.64 + i * 0.08 }}
              >
                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` }} />
                <div className="absolute -top-5 -right-5 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, filter: 'blur(12px)', width: 64, height: 64 }} />

                <div className="flex justify-center mb-3.5">
                  <IconBox icon={icon} color={accent} size="lg" />
                </div>

                <p className="text-[10.5px] font-black tracking-[0.18em] uppercase mb-1"
                  style={{ color: accent, textShadow: `0 0 12px ${glow}` }}>
                  {label}
                </p>

                <p className="text-[8px] font-medium mb-3" style={{ color: alpha(hex.neutral.white, 0.25) }}>
                  {desc}
                </p>

                <div className="flex justify-center">
                  <PitchMini color={accent} />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      <TourButton steps={getTourSteps(locale, 'dashboard')} />
    </div>
  );
}
