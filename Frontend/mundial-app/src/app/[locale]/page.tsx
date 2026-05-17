'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiActivity, FiCrosshair, FiAward, FiTrendingUp,
  FiCalendar, FiLayers, FiBarChart2, FiZap, FiStar,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Navigation';
import { useT } from '@/hooks/useT';
import { getCurrentTournament, getTournamentFixtures, getUserPredictions } from '@/services/publicTournament';
import { scoringService } from '@/services/predictions';

const MEDAL = ['🥇', '🥈', '🥉'];

/* ══════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════ */

/* Animated EQ bars — deterministic heights, no Math.random() */
const EQBars = ({
  color, count = 9, maxH = 20,
}: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        const h3 = (seq[(i + 2) % seq.length] / 20) * maxH;
        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 2.5, background: color, boxShadow: `0 0 4px ${color}` }}
            animate={{ height: [h1, h2, h3, h2, h1] }}
            transition={{ duration: 1.3 + i * 0.11, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }}
          />
        );
      })}
    </div>
  );
};

/* SVG Ring / donut chart */
const Ring = ({
  value, max = 100, size = 68, stroke = 5, color,
  trail = 'rgba(255,255,255,0.05)',
}: { value: number; max?: number; size?: number; stroke?: number; color: string; trail?: string }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(1, value / Math.max(max, 1));
  const off  = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trail} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}55)` }}
      />
    </svg>
  );
};

/* Horizontal glow progress bar */
const GlowBar = ({
  value, max = 100, color, height = 4,
}: { value: number; max?: number; color: string; height?: number }) => {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div
      className="relative w-full rounded-full overflow-hidden"
      style={{ height, background: 'rgba(255,255,255,0.05)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}80` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
    </div>
  );
};

/* Premium icon box — glassmorphic container with glow and pulse */
const PremiumIcon = ({
  icon, color, glow, bg, size = 'md', delay = 0,
}: {
  icon: React.ReactNode; color: string; glow: string; bg: string;
  size?: 'sm' | 'md' | 'lg'; delay?: number;
}) => {
  const dim = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }[size];
  const iconSize = { sm: 14, md: 18, lg: 26 }[size];
  const radius = { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl' }[size];
  return (
    <div className="relative shrink-0">
      {/* Outer ambient glow */}
      <div className={`absolute inset-0 ${radius} pointer-events-none`}
        style={{ background: glow, filter: 'blur(14px)', opacity: 0.28, transform: 'scale(1.15)' }} />
      {/* Icon container */}
      <motion.div
        className={`relative ${dim} ${radius} flex items-center justify-center`}
        style={{
          background: `linear-gradient(145deg, ${bg}, rgba(1,4,14,0.85))`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.45)`,
        }}
        animate={{ boxShadow: [
          `0 0 0 1px rgba(255,255,255,0.03), 0 0 12px ${color}20`,
          `0 0 0 1px rgba(255,255,255,0.03), 0 0 26px ${color}45`,
          `0 0 0 1px rgba(255,255,255,0.03), 0 0 12px ${color}20`,
        ]}}
        transition={{ duration: 2.6 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Static glass highlight */}
        <div
          className={`absolute inset-0 ${radius} pointer-events-none`}
          style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)' }}
        />
        {/* Top micro-line */}
        <div className={`absolute inset-x-0 top-0 h-px ${radius} pointer-events-none`}
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
        <span style={{ color, filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 12px ${color}60)`, fontSize: iconSize }}>
          {icon}
        </span>
      </motion.div>
      {/* Pulse ring */}
      <motion.div
        className={`absolute inset-0 ${radius} pointer-events-none`}
        style={{ border: `1px solid ${color}30` }}
        animate={{ opacity: [0, 0.9, 0], scale: [1, 1.40, 1] }}
        transition={{ duration: 3 + delay * 0.5, repeat: Infinity, ease: 'easeOut', delay }}
      />
    </div>
  );
};

/* KPI chip — top row */
const KPIChip = ({
  icon, value, label, color, glow, bg, delay, bars,
}: {
  icon: React.ReactNode; value: string | number; label: string;
  color: string; glow: string; bg: string; delay: number; bars?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -16, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.03 }}
    className="relative overflow-hidden rounded-2xl cursor-default"
    style={{
      background: `linear-gradient(145deg, ${bg}, rgba(2,8,20,0.95))`,
      border: `1px solid ${glow}35`,
      backdropFilter: 'blur(24px)',
      boxShadow: `0 8px 32px ${glow}18, inset 0 1px 0 rgba(255,255,255,0.04)`,
    }}
  >
    {/* Top neon line */}
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
    {/* Corner glow */}
    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${glow}30 0%, transparent 70%)`, filter: 'blur(10px)' }} />

    <div className="relative z-10 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[9px] font-black tracking-[0.28em] uppercase mb-1.5"
            style={{ color: `${glow}80` }}>{label}</p>
          <motion.p
            className="text-2xl sm:text-3xl font-black tabular-nums leading-none"
            style={{ color, textShadow: `0 0 20px ${glow}90, 0 0 40px ${glow}35` }}
            animate={{ textShadow: [`0 0 18px ${glow}80`, `0 0 32px ${glow}`, `0 0 18px ${glow}80`] }}
            transition={{ duration: 2.8 + delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {value}
          </motion.p>
        </div>
        <PremiumIcon icon={icon} color={color} glow={glow} bg={bg} size="md" delay={delay} />
      </div>
      <EQBars color={glow} count={bars ?? 9} maxH={16} />
    </div>
  </motion.div>
);

/* Team flag bubble */
const Flag = ({ url, name, size = 'md', glow }: {
  url: string; name: string; size?: 'sm' | 'md' | 'lg'; glow?: string;
}) => {
  const sz = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-16 h-16' }[size];
  return (
    <div className="relative">
      {glow && (
        <div className="absolute inset-0 rounded-full"
          style={{ background: glow, filter: 'blur(12px)', transform: 'scale(1.3)' }} />
      )}
      <div className={`relative ${sz} rounded-full border-2 border-white/10 shadow-2xl overflow-hidden bg-slate-800 shrink-0`}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

/* Ambient floating particle */
const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1 + (index % 2);
  const delay = (index * 0.28) % 7;
  const duration = 9 + (index % 7);
  const cols: [string, string][] = [
    ['rgba(34,211,238,0.60)', '0 0 8px rgba(34,211,238,0.75)'],
    ['rgba(52,211,153,0.50)', '0 0 7px rgba(52,211,153,0.65)'],
    ['rgba(251,191,36,0.45)', '0 0 7px rgba(251,191,36,0.60)'],
    ['rgba(56,189,248,0.55)', '0 0 7px rgba(56,189,248,0.65)'],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -4, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(420 + (index % 200))], x: [0, Math.sin(index * 1.4) * 38], opacity: [0, 0.85, 0.5, 0], scale: [0.4, 1.3, 0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const { t } = useT();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading]             = useState(true);
  const [todayUpcoming, setTodayUpcoming] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [myPredictions, setMyPredictions] = useState<Record<number, any>>({});
  const [topRanking, setTopRanking]       = useState<any[]>([]);
  const [stats, setStats]               = useState({ predictions: 0, exactas: 0, puntos: 0, rank: 0 });
  const [countdown, setCountdown]       = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mundialStarted, setMundialStarted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const target = new Date('2026-06-11T00:00:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setMundialStarted(true);
        return;
      }
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

      // Show next 5 upcoming fixtures (across any day)
      const upcomingGroup = upcoming.slice(0, 5);
      // Show last 5 finished fixtures regardless of day
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
      setStats({ predictions: preds.length, exactas: score?.exactScores ?? 0, puntos: score?.totalPoints ?? 0, rank: score?.rankPosition ?? 0 });

      if (rankData?.data) {
        setTopRanking((rankData.data as any[]).slice(0, 5).map((s: any, i: number) => ({
          rank: s.rankPosition ?? i + 1,
          name: s.fullName || s.username || 'Usuario',
          points: s.totalPoints ?? 0,
          isMe: Number(s.userId) === userId,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #060f1e 0%, #030a14 42%, #010408 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
            animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-[10px] text-cyan-400/60 tracking-[0.3em] uppercase font-bold">{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const fmtDate = (d: any) => {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
      + ' · ' + dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getPredResult = (fixture: any, prediction: any) => {
    if (!prediction || !fixture) return null;
    const { predictedHomeScore: ph, predictedAwayScore: pa } = prediction;
    const { homeScore: rh, awayScore: ra } = fixture;
    if (ph === rh && pa === ra) return { label: t('home.result.exactScore'), pts: '+3 pts', color: 'text-emerald-400', glow: '#34d399', border: 'rgba(52,211,153,0.30)' };
    if (Math.sign(ph - pa) === Math.sign(rh - ra)) return { label: t('home.result.correct'), pts: '+1 pt', color: 'text-sky-400', glow: '#38bdf8', border: 'rgba(56,189,248,0.30)' };
    return { label: t('home.result.wrong'), pts: '0 pts', color: 'text-red-400', glow: '#ef4444', border: 'rgba(239,68,68,0.30)' };
  };

  const accuracyPct = stats.predictions > 0
    ? Math.round((stats.exactas / stats.predictions) * 100)
    : 0;

  const maxRankPts = topRanking.length > 0 ? Math.max(...topRanking.map(r => r.points), 1) : 1;

  /* ── Countdown units ── */
  const cdUnits = [
    { val: String(countdown.days).padStart(2, '0'),    label: t('home.time.days')    },
    { val: String(countdown.hours).padStart(2, '0'),   label: t('home.time.hours')   },
    { val: String(countdown.minutes).padStart(2, '0'), label: t('home.time.minutes') },
    { val: String(countdown.seconds).padStart(2, '0'), label: t('home.time.seconds') },
  ];

  return (
    <div className="w-full relative min-h-screen" style={{ background: 'radial-gradient(ellipse at 22% 35%, #060f1e 0%, #030a14 48%, #010508 100%)' }}>

      {/* ══ BACKGROUND ══ */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 700, height: 700, top: -200, left: -150, background: 'radial-gradient(circle, rgba(0,210,185,0.08) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 550, height: 550, bottom: -100, right: -100, background: 'radial-gradient(circle, rgba(0,140,255,0.07) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 4 }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 350, height: 350, top: '50%', right: '20%', background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)', filter: 'blur(55px)', zIndex: 0 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 7 }} />

      {/* Tech grid */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.028]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(34,211,238,1)" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="hgfade" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="hgm"><rect width="100%" height="100%" fill="url(#hgfade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hgrid)" mask="url(#hgm)" />
      </svg>

      {/* Aurora sweep */}
      <motion.div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        background: 'linear-gradient(115deg, transparent 38%, rgba(0,210,185,0.09) 50%, rgba(34,211,238,0.04) 56%, transparent 64%)', opacity: 0 }}
        animate={{ opacity: [0, 1, 0], x: ['-25%', '25%'] }}
        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 9, ease: [0.4, 0, 0.6, 1] }} />

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 18 }).map((_, i) => <Particle key={i} index={i} />)}
      </div>

      {/* ══ HEADER ══ */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header
          title="⚽ Orionix Gol"
          subtitle="Dashboard"
          centerContent={
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white font-black text-base shadow-[0_0_18px_rgba(34,211,238,0.45)]">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>
                <motion.div className="absolute inset-0 rounded-full border border-cyan-300/40"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-emerald-200 leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">{user?.email}</p>
              </div>
            </div>
          }
        />
      </div>

      {/* ══ DASHBOARD CONTENT ══ */}
      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-6xl mx-auto w-full pb-32">

        {/* ── WELCOME ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">
              {t('home.welcome')},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
                {user?.displayName?.split(' ')[0]}
              </span>{' '}
              <motion.span animate={{ rotate: [0, 14, -8, 14, 0] }} transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}>
                👋
              </motion.span>
            </h1>
            <p className="text-[11px] text-slate-600 mt-1 tracking-wide">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ border: '1px solid rgba(52,211,153,0.22)', background: 'rgba(52,211,153,0.07)' }}
          >
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }} />
            <span className="text-[9px] font-black text-emerald-300 tracking-[0.2em] uppercase">{t('home.live')}</span>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════
            ROW 1 — KPI CHIPS
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KPIChip icon={<FiActivity />}   value={stats.predictions}              label={t('home.stats.predictions')} color="#22d3ee" glow="#22d3ee" bg="rgba(34,211,238,0.07)"  delay={0.08} bars={9} />
          <KPIChip icon={<FiCrosshair />}  value={stats.exactas}                  label={t('home.stats.exact')}        color="#34d399" glow="#34d399" bg="rgba(52,211,153,0.07)"  delay={0.14} bars={8} />
          <KPIChip icon={<FiAward />}      value={stats.puntos}                   label={t('home.stats.points')}       color="#fbbf24" glow="#fbbf24" bg="rgba(251,191,36,0.07)"  delay={0.20} bars={10} />
          <KPIChip icon={<FiBarChart2 />}  value={stats.rank > 0 ? `#${stats.rank}` : '—'} label={t('home.stats.ranking')} color="#38bdf8" glow="#38bdf8" bg="rgba(56,189,248,0.07)" delay={0.26} bars={7} />
        </div>

        {/* ══════════════════════════════════════════════
            ROW 2 — COUNTDOWN / MUNDIAL STARTED BANNER
        ══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {mundialStarted ? (
            /* ── MUNDIAL EN CURSO ── */
            <motion.div
              key="started"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,48,12,0.35) 0%, rgba(4,12,28,0.97) 40%, rgba(4,18,12,0.97) 100%)',
                border: '1px solid rgba(52,211,153,0.28)',
                boxShadow: '0 12px 50px rgba(0,0,0,0.50), 0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(52,211,153,0.08)',
              }}
            >
              {/* Top neon stripe — gold → green */}
              <div className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: 'linear-gradient(90deg, #fbbf24, #34d399, #22d3ee, #34d399, #fbbf24)' }} />
              {/* Ambient blobs */}
              <motion.div className="absolute -top-12 left-8 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%)', filter: 'blur(32px)' }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3.5, repeat: Infinity }} />
              <motion.div className="absolute -bottom-10 right-6 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(26px)' }}
                animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4.2, repeat: Infinity, delay: 1.5 }} />

              <div className="relative flex flex-col sm:flex-row items-center gap-5 px-5 py-5">
                {/* Trophy + pulse ring */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 56, height: 56, border: '1.5px solid rgba(251,191,36,0.35)' }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
                  <motion.span
                    className="text-4xl relative z-10"
                    animate={{ y: [0, -5, 0], rotate: [-4, 4, -4] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🏆
                  </motion.span>
                </div>

                {/* Center text */}
                <div className="flex-1 text-center sm:text-left">
                  <motion.p
                    className="text-[8px] font-black tracking-[0.38em] uppercase mb-1"
                    style={{ color: 'rgba(52,211,153,0.60)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t('home.ongoing')}
                  </motion.p>
                  <motion.p
                    className="text-xl sm:text-2xl font-black leading-tight"
                    style={{
                      background: 'linear-gradient(90deg, #fbbf24, #34d399, #22d3ee)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    {t('home.started')}
                  </motion.p>
                  <p className="text-[10px] text-slate-500 mt-1 tracking-wide">
                    {t('home.registerPredictions')}
                  </p>
                </div>

                {/* Live pill */}
                <motion.div
                  className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{ border: '1px solid rgba(52,211,153,0.30)', background: 'rgba(52,211,153,0.08)' }}
                  animate={{ boxShadow: ['0 0 8px rgba(52,211,153,0.10)', '0 0 22px rgba(52,211,153,0.30)', '0 0 8px rgba(52,211,153,0.10)'] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <motion.span className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.25, 1], scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }} />
                  <span className="text-[9px] font-black text-emerald-300 tracking-[0.22em] uppercase">{t('home.live')}</span>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ── COUNTDOWN ── */
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(120,53,15,0.22) 0%, rgba(4,12,28,0.96) 40%, rgba(8,20,44,0.96) 100%)',
                border: '1px solid rgba(217,119,6,0.20)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(251,191,36,0.06)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.65), transparent)' }} />
              <div className="absolute -top-10 right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)', filter: 'blur(30px)' }} />

              <div className="relative flex flex-col sm:flex-row items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-2 shrink-0">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />
                  <div>
                    <p className="text-[8px] font-black tracking-[0.32em] text-amber-400/60 uppercase">{t('home.worldCupStart')}</p>
                    <p className="text-sm font-black text-amber-200 leading-none">{t('common.worldCup')}</p>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-8 self-center" style={{ background: 'rgba(251,191,36,0.12)' }} />

                <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start">
                  {cdUnits.map(({ val, label }, i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <span className="text-amber-600/40 font-black text-lg">:</span>}
                      <div className="text-center">
                        <motion.p
                          key={val}
                          className="text-2xl sm:text-3xl font-black tabular-nums leading-none text-amber-200"
                          style={{ textShadow: '0 0 20px rgba(251,191,36,0.70)' }}
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {val}
                        </motion.p>
                        <p className="text-[7px] font-bold tracking-[0.22em] text-amber-500/50 uppercase mt-0.5">{label}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="hidden md:flex items-end gap-2 shrink-0">
                  <EQBars color="rgba(251,191,36,0.55)" count={12} maxH={24} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════
            ROW 3 — MAIN BENTO GRID
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* ─── NEXT MATCH ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                border: '1px solid rgba(34,211,238,0.18)',
                backdropFilter: 'blur(32px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,211,238,0.04), inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.70), transparent)' }} />
              {/* Corner orb */}
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 65%)', filter: 'blur(28px)' }} />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)', filter: 'blur(22px)' }} />

              <div className="relative p-5 sm:p-6">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22d3ee, #06b6d4)' }} />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">
                      {todayUpcoming.length > 1 ? 'PRÓXIMOS PARTIDOS' : t('home.nextMatch')}
                    </span>
                    {todayUpcoming.length > 0 && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,211,238,0.10)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.20)' }}>
                        {todayUpcoming.length}
                      </span>
                    )}
                  </div>
                  <motion.div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ border: '1px solid rgba(34,211,238,0.28)', background: 'rgba(34,211,238,0.08)' }}
                    animate={{ boxShadow: ['0 0 6px rgba(34,211,238,0.08)', '0 0 18px rgba(34,211,238,0.25)', '0 0 6px rgba(34,211,238,0.08)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                      animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />
                    <span className="text-[8px] font-black text-cyan-300 tracking-widest">{t('home.pending')}</span>
                  </motion.div>
                </div>

                {todayUpcoming.length > 0 ? (
                  todayUpcoming.length === 1 ? (
                    /* ── Single match: big layout ── */
                    <>
                      <div className="flex items-center justify-around py-4">
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <motion.div whileHover={{ scale: 1.08 }}>
                            <Flag url={todayUpcoming[0].homeTeam.flagUrl} name={todayUpcoming[0].homeTeam.name} size="lg" glow="rgba(34,211,238,0.18)" />
                          </motion.div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-200 tracking-wider">{todayUpcoming[0].homeTeam.shortName}</p>
                            <p className="text-[9px] text-slate-600 font-medium mt-0.5 hidden sm:block truncate max-w-[80px]">{todayUpcoming[0].homeTeam.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center px-3 flex-shrink-0">
                          <motion.div className="text-lg font-black tabular-nums"
                            style={{ color: 'rgba(34,211,238,0.30)', letterSpacing: '0.1em' }}
                            animate={{ opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 2.2, repeat: Infinity }}>
                            VS
                          </motion.div>
                          <p className="text-[9px] text-slate-600 text-center leading-relaxed mt-1 max-w-[90px]">{fmtDate(todayUpcoming[0].kickoffAt)}</p>
                          <motion.div className="mt-2 text-lg" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>🏟️</motion.div>
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <motion.div whileHover={{ scale: 1.08 }}>
                            <Flag url={todayUpcoming[0].awayTeam.flagUrl} name={todayUpcoming[0].awayTeam.name} size="lg" glow="rgba(34,211,238,0.18)" />
                          </motion.div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-200 tracking-wider">{todayUpcoming[0].awayTeam.shortName}</p>
                            <p className="text-[9px] text-slate-600 font-medium mt-0.5 hidden sm:block truncate max-w-[80px]">{todayUpcoming[0].awayTeam.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-px w-full mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.12), transparent)' }} />
                      <Link href={`/fixtures/${todayUpcoming[0].id}`}>
                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(0,210,185,0.50)' }}
                          whileTap={{ scale: 0.97 }}
                          className="relative w-full py-3 rounded-xl text-sm font-black text-white tracking-wide overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4, #0ea5e9)', boxShadow: '0 6px 24px rgba(0,210,185,0.30)' }}
                        >
                          <motion.div className="absolute inset-0"
                            style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.20) 50%, transparent 72%)' }}
                            animate={{ x: ['-120%', '120%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                          <span className="relative">{t('home.makePrediction')}</span>
                        </motion.button>
                      </Link>
                    </>
                  ) : (
                    /* ── Multiple matches: interactive card list ── */
                    <div className="flex flex-col gap-2">
                      {todayUpcoming.map((fixture, i) => {
                        const kickoff = new Date(fixture.kickoffAt);
                        const dayLabel = kickoff.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
                        const timeLabel = kickoff.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                        return (
                          <motion.div
                            key={fixture.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.01 }}
                            className="relative overflow-hidden rounded-xl group"
                            style={{
                              background: 'rgba(34,211,238,0.03)',
                              border: '1px solid rgba(34,211,238,0.10)',
                              transition: 'border-color 0.2s ease, background 0.2s ease',
                            }}
                          >
                            {/* Hover top accent line */}
                            <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.60), transparent)' }} />
                            <div className="flex items-center gap-2 px-3 py-2.5">
                              {/* Home team */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name} size="sm" />
                                <span className="text-xs font-black text-slate-200 tracking-wide truncate">{fixture.homeTeam.shortName}</span>
                              </div>
                              {/* Date + Time — bigger & prominent */}
                              <div className="text-center shrink-0 px-2 min-w-[72px]">
                                <span className="text-[10px] font-semibold text-slate-500 block leading-none whitespace-nowrap mb-0.5">{dayLabel}</span>
                                <span className="text-sm font-black text-cyan-400 whitespace-nowrap leading-none" style={{ textShadow: '0 0 10px rgba(34,211,238,0.45)' }}>{timeLabel}</span>
                              </div>
                              {/* Away team */}
                              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                <span className="text-xs font-black text-slate-200 tracking-wide truncate">{fixture.awayTeam.shortName}</span>
                                <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name} size="sm" />
                              </div>
                              {/* CTA — clear text button */}
                              <Link href={`/fixtures/${fixture.id}`} className="shrink-0 ml-1">
                                <motion.button
                                  whileHover={{ scale: 1.06, boxShadow: '0 4px 20px rgba(0,210,185,0.50)' }}
                                  whileTap={{ scale: 0.93 }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-black text-white whitespace-nowrap"
                                  style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 3px 10px rgba(0,210,185,0.25)', fontSize: '10px' }}
                                >
                                  ⚡ Porra
                                </motion.button>
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <motion.span className="text-5xl" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>⚽</motion.span>
                    <p className="text-sm font-semibold text-slate-600 mt-3">{t('home.noFixtures')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ─── LAST RESULT ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(14,9,2,0.97))',
                border: '1px solid rgba(251,191,36,0.16)',
                backdropFilter: 'blur(32px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.70), transparent)' }} />
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 65%)', filter: 'blur(28px)' }} />

              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }} />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">
                      {recentResults.length > 1 ? 'ÚLTIMOS RESULTADOS' : t('home.lastResult')}
                    </span>
                    {recentResults.length > 1 && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.10)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.20)' }}>
                        {recentResults.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ border: '1px solid rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.08)' }}>
                    <span className="text-[8px] font-black text-amber-300 tracking-widest">{t('home.finished')}</span>
                  </div>
                </div>

                {recentResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recentResults.map((fixture, i) => {
                      const pred = myPredictions[fixture.id];
                      const pr = getPredResult(fixture, pred);
                      const isSingle = recentResults.length === 1;
                      return (
                        <motion.div
                          key={fixture.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="relative overflow-hidden rounded-xl"
                          style={{
                            background: pr
                              ? `linear-gradient(135deg, ${pr.glow}06 0%, rgba(0,0,0,0) 100%)`
                              : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${pr?.border ?? 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          {pr && <div className="absolute inset-x-0 top-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${pr.glow}70, transparent)` }} />}
                          <div className="p-3">
                            {/* Score row */}
                            <div className="flex items-center justify-around py-1">
                              <div className="flex flex-col items-center gap-1.5 flex-1">
                                <motion.div whileHover={{ scale: 1.1 }}>
                                  <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name} size={isSingle ? 'md' : 'sm'} glow="rgba(251,191,36,0.18)" />
                                </motion.div>
                                <p className={`font-black text-slate-300 tracking-wider ${isSingle ? 'text-sm' : 'text-xs'}`}>{fixture.homeTeam.shortName}</p>
                              </div>
                              <div className="text-center px-2 flex-shrink-0">
                                <motion.p
                                  className="font-black text-white leading-none"
                                  style={{ fontSize: isSingle ? 'clamp(2rem,5vw,3rem)' : '1.5rem', textShadow: '0 0 30px rgba(255,255,255,0.18)' }}
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.45 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  {fixture.homeScore}<span className="mx-2 text-slate-700">–</span>{fixture.awayScore}
                                </motion.p>
                                <p className="text-[9px] text-slate-600 mt-1">{fmtDate(fixture.kickoffAt)}</p>
                              </div>
                              <div className="flex flex-col items-center gap-1.5 flex-1">
                                <motion.div whileHover={{ scale: 1.1 }}>
                                  <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name} size={isSingle ? 'md' : 'sm'} glow="rgba(251,191,36,0.18)" />
                                </motion.div>
                                <p className={`font-black text-slate-300 tracking-wider ${isSingle ? 'text-sm' : 'text-xs'}`}>{fixture.awayTeam.shortName}</p>
                              </div>
                            </div>
                            {/* Goleadores — dos columnas local | visitante */}
                            {fixture.scorers && fixture.scorers.length > 0 && (
                              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex gap-2">
                                  {/* Local — cyan */}
                                  <div className="flex-1 space-y-0.5 min-w-0">
                                    {fixture.scorers
                                      .filter((s: any) => s.teamId === fixture.homeTeam.id)
                                      .map((s: any) => (
                                        <div key={s.id} className="flex items-center gap-1 text-[9px]" style={{ color: '#22d3ee' }}>
                                          <span className="shrink-0">⚽</span>
                                          <span className="font-bold truncate">{s.playerName}</span>
                                          {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                                        </div>
                                    ))}
                                  </div>
                                  {/* Divisor */}
                                  <div className="w-px shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
                                  {/* Visitante — rose */}
                                  <div className="flex-1 space-y-0.5 min-w-0">
                                    {fixture.scorers
                                      .filter((s: any) => s.teamId === fixture.awayTeam.id)
                                      .map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-end gap-1 text-[9px]" style={{ color: '#fb7185' }}>
                                          {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                                          <span className="font-bold truncate">{s.playerName}</span>
                                          <span className="shrink-0">⚽</span>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Prediction row */}
                            {pred ? (
                              <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <div>
                                  <p className="text-[8px] text-slate-600 uppercase tracking-[0.22em]">{t('home.myPrediction')}</p>
                                  <p className={`font-black text-slate-200 mt-0.5 ${isSingle ? 'text-2xl' : 'text-lg'}`}>
                                    {pred.predictedHomeScore}<span className="text-slate-700 mx-1 text-sm">–</span>{pred.predictedAwayScore}
                                  </p>
                                </div>
                                {pr && (
                                  <div className="text-right">
                                    <p className={`text-[10px] font-bold ${pr.color}`}>{pr.label}</p>
                                    <p className={`font-black mt-0.5 ${pr.color} ${isSingle ? 'text-xl' : 'text-lg'}`}
                                      style={{ textShadow: `0 0 18px ${pr.glow}` }}>{pr.pts}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-center text-[10px] text-slate-700 mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>{t('home.noPrediction')}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <motion.span className="text-5xl" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity }}>🏆</motion.span>
                    <p className="text-sm font-semibold text-slate-600 mt-3">{t('home.noResults')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* ─── ACCURACY RING + STATS ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(4,14,30,0.97))',
                border: '1px solid rgba(52,211,153,0.15)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.55), transparent)' }} />
              <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)', filter: 'blur(24px)' }} />

              <div className="relative p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">{t('home.performance')}</span>
                </div>

                {/* Ring + stats side by side */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <Ring value={accuracyPct} max={100} size={80} stroke={6} color="#34d399" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-black text-emerald-300 leading-none tabular-nums"
                        style={{ textShadow: '0 0 14px rgba(52,211,153,0.8)' }}>
                        {accuracyPct}%
                      </p>
                      <p className="text-[6px] font-black text-slate-600 tracking-[0.2em] uppercase mt-0.5">Exactas</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: t('home.stats.predictionsLabel'), value: stats.predictions, max: 64,   color: '#22d3ee' },
                      { label: t('home.stats.exact'),            value: stats.exactas,     max: stats.predictions || 1, color: '#34d399' },
                      { label: t('home.stats.points'),           value: stats.puntos,      max: 192,  color: '#fbbf24' },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wide">{label}</span>
                          <span className="text-[10px] font-black tabular-nums" style={{ color }}>{value}</span>
                        </div>
                        <GlowBar value={value} max={max} color={color} height={3} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── RANKING CARD ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl flex-1"
              style={{
                background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(6,12,30,0.97))',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.40), transparent)' }} />
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)', filter: 'blur(22px)' }} />

              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }} />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">{t('home.globalRanking')}</span>
                  </div>
                  <EQBars color="rgba(251,191,36,0.45)" count={6} maxH={14} />
                </div>

                <div className="space-y-1.5">
                  {topRanking.length > 0 ? topRanking.map((p, i) => {
                    const rankColors = ['#fbbf24', '#94a3b8', '#cd7c3e'];
                    const barColor = p.isMe ? '#22d3ee' : (rankColors[i] ?? 'rgba(255,255,255,0.20)');
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.58 + i * 0.06 }}
                        className="relative overflow-hidden rounded-xl p-2.5"
                        style={{
                          background: p.isMe ? 'rgba(34,211,238,0.07)' : 'rgba(255,255,255,0.02)',
                          border: p.isMe ? '1px solid rgba(34,211,238,0.22)' : '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {p.isMe && (
                          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.50), transparent)' }} />
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm w-5 text-center shrink-0">
                            {i < 3 ? MEDAL[i] : <span className="text-slate-600 text-xs font-bold">{p.rank}</span>}
                          </span>
                          <span className={`flex-1 text-xs font-bold truncate ${p.isMe ? 'text-cyan-300' : 'text-slate-400'}`}>
                            {p.isMe && <span className="text-cyan-500 mr-0.5">›</span>}{p.name}
                          </span>
                          <span
                            className="text-xs font-black tabular-nums shrink-0"
                            style={{ color: barColor, textShadow: `0 0 10px ${barColor}80` }}
                          >
                            {p.points}
                          </span>
                        </div>
                        <GlowBar value={p.points} max={maxRankPts} color={barColor} height={2} />
                      </motion.div>
                    );
                  }) : (
                    <p className="text-slate-700 text-xs text-center py-6">{t('home.noRankingData')}</p>
                  )}
                </div>

                <Link href="/predictions">
                  <motion.button
                    whileHover={{ borderColor: 'rgba(34,211,238,0.35)', color: '#22d3ee' }}
                    className="w-full mt-4 py-2 rounded-xl text-[9px] font-black text-slate-600 border border-white/[0.05] transition-all tracking-[0.22em] uppercase"
                  >
                    {t('home.viewFullRanking')}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ROW 4 — QUICK ACCESS BENTO
        ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {[
            { href: '/fixtures',    icon: <FiCalendar />,   label: t('home.quick.matches'),     accent: '#22d3ee', glow: 'rgba(34,211,238,0.45)', bg: 'rgba(34,211,238,0.07)',  eqColor: 'rgba(34,211,238,0.50)' },
            { href: '/groups',      icon: <FiLayers />,     label: t('home.quick.groups'),       accent: '#34d399', glow: 'rgba(52,211,153,0.45)', bg: 'rgba(52,211,153,0.07)',  eqColor: 'rgba(52,211,153,0.50)' },
            { href: '/predictions', icon: <FiTrendingUp />, label: t('home.quick.predictions'),  accent: '#fbbf24', glow: 'rgba(251,191,36,0.45)', bg: 'rgba(251,191,36,0.07)', eqColor: 'rgba(251,191,36,0.50)' },
          ].map(({ href, icon, label, accent, glow, bg, eqColor }, i) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.04, y: -4, boxShadow: `0 16px 40px ${glow}30` }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer"
                style={{
                  background: `linear-gradient(145deg, ${bg}, rgba(2,8,20,0.95))`,
                  border: `1px solid ${accent}25`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.35)`,
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.66 + i * 0.07 }}
              >
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`, filter: 'blur(10px)' }} />

                <div className="flex justify-center mb-3">
                  <PremiumIcon icon={icon} color={accent} glow={glow} bg={bg} size="lg" delay={i * 0.3} />
                </div>
                <p className="text-[10px] font-black tracking-[0.20em] uppercase mb-2"
                  style={{ color: accent, textShadow: `0 0 10px ${glow}` }}>
                  {label}
                </p>
                <div className="flex justify-center">
                  <EQBars color={eqColor} count={7} maxH={12} />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
