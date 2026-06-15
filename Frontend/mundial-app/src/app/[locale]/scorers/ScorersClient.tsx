'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiTarget, FiZap } from 'react-icons/fi';
import { Header } from '@/components/Navigation';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, surfaces } from '@/lib/design/effects';
import { useTranslations } from 'next-intl';
import { useTopScorers, useTopAssists } from '@/hooks/useTournamentData';
import { usePremium } from '@/hooks/usePremium';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { AdSlot } from '@/components/ads';

interface PlayerStat {
  playerId: number;
  playerName: string;
  photoUrl:  string;
  teamName:  string;
  teamLogoUrl: string;
  goals:     number;
  assists:   number;
  appearances: number;
  minutesPlayed: number;
  rating:    string;
}

type Tab = 'goals' | 'assists';

/* ── Medal colours ── */
const MEDAL = [
  { bg: 'linear-gradient(135deg,#D4AF37,#F5D06A)', shadow: 'rgba(212,175,55,0.55)', label: '1°' },
  { bg: 'linear-gradient(135deg,#9CA3AF,#D1D5DB)',  shadow: 'rgba(156,163,175,0.45)', label: '2°' },
  { bg: 'linear-gradient(135deg,#92400E,#D97706)',  shadow: 'rgba(146,64,14,0.45)',  label: '3°' },
];

/* ── Player avatar with fallback ── */
function PlayerPhoto({ url, name }: { url: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center font-black text-xl"
        style={{ background: alpha(hex.green.base, 0.15), color: hex.green.soft }}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <Image src={url} alt={name} fill sizes="64px" className="object-cover rounded-full"
      onError={() => setErr(true)} />
  );
}

/* ── Top-3 podium card ── */
function PodiumCard({ player, rank, stat }: { player: PlayerStat; rank: number; stat: number }) {
  const medal = MEDAL[rank];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      className="relative flex flex-col items-center rounded-2xl overflow-hidden p-4 pb-5"
      style={{
        background: surfaces.card(),
        border: `1px solid ${rank === 0 ? alpha(hex.gold.base, 0.45) : alpha(hex.neutral.white, 0.08)}`,
        boxShadow: rank === 0 ? `0 0 32px ${alpha(hex.gold.base, 0.18)}, 0 8px 24px rgba(2,6,23,0.5)` : '0 4px 16px rgba(2,6,23,0.4)',
      }}>
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${rank === 0 ? hex.gold.base : hex.neutral.white}40, transparent)` }} />

      {/* Medal badge */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white mb-3 shrink-0"
        style={{ background: medal.bg, boxShadow: `0 4px 14px ${medal.shadow}` }}>
        {medal.label}
      </div>

      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full mb-3 shrink-0"
        style={{ border: `2px solid ${rank === 0 ? alpha(hex.gold.base, 0.55) : alpha(hex.neutral.white, 0.12)}`, boxShadow: `0 0 18px ${medal.shadow}` }}>
        <PlayerPhoto url={player.photoUrl} name={player.playerName} />
      </div>

      {/* Name */}
      <p className="text-[11px] font-black text-center leading-snug mb-1 line-clamp-2"
        style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
        {player.playerName}
      </p>

      {/* Team */}
      <div className="flex items-center gap-1 mb-3">
        {player.teamLogoUrl && (
          <div className="relative w-4 h-4 shrink-0">
            <Image src={player.teamLogoUrl} alt={player.teamName} fill sizes="16px" className="object-contain" />
          </div>
        )}
        <span className="text-[9px] font-bold tracking-widest uppercase truncate max-w-[80px]"
          style={{ color: alpha(hex.text.secondary, 0.5) }}>
          {player.teamName}
        </span>
      </div>

      {/* Stat */}
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black leading-none"
          style={{ fontFamily: 'var(--font-display)', background: medal.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {stat}
        </span>
        <span className="text-[9px] font-black tracking-widest uppercase"
          style={{ color: alpha(hex.text.secondary, 0.45) }}>
          {stat === 1 ? 'gol' : 'goles'}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Row for rank 4+ ── */
function PlayerRow({ player, rank, stat, delay }: { player: PlayerStat; rank: number; stat: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 26 }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 group"
      style={{ background: alpha(hex.neutral.white, 0.025), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>

      {/* Rank */}
      <span className="text-xs font-black w-6 text-center shrink-0" style={{ color: alpha(hex.text.secondary, 0.35), fontFamily: 'var(--font-display)' }}>
        {rank}
      </span>

      {/* Avatar */}
      <div className="relative w-9 h-9 rounded-full shrink-0" style={{ border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
        <PlayerPhoto url={player.photoUrl} name={player.playerName} />
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-black leading-none truncate" style={{ color: hex.text.primary }}>{player.playerName}</p>
        <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 truncate" style={{ color: alpha(hex.text.secondary, 0.42) }}>{player.teamName}</p>
      </div>

      {/* Stat */}
      <span className="text-lg font-black shrink-0" style={{ color: hex.green.bright, fontFamily: 'var(--font-display)' }}>
        {stat}
      </span>
    </motion.div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl h-52 animate-pulse" style={{ background: alpha(hex.neutral.white, 0.04) }} />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: alpha(hex.neutral.white, 0.03), animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ScorersClient() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>('goals');
  const { isPremium } = usePremium();

  // Free → top 10, Premium → top 50. El backend igual fuerza el cap, pero pedimos
  // explícitamente el número correcto para no traer datos extras y agilizar el cache.
  const desiredLimit = isPremium ? 50 : 10;
  const { data: rawScorers, isLoading: loadingScorers, isError: errScorers } = useTopScorers({ limit: desiredLimit });
  // Top asistentes: solo Premium. enabled:false evita el fetch para usuarios Free.
  const { data: rawAssists, isLoading: loadingAssists, isError: errAssists  } = useTopAssists(
    { limit: isPremium ? 50 : 10, enabled: isPremium }
  );

  // Defensivo: nullish coalescing porque el endpoint puede devolver null si está vacío o 422
  const scorers = (rawScorers ?? []) as PlayerStat[];
  const assists = (rawAssists ?? []) as PlayerStat[];

  const loading = loadingScorers || loadingAssists;
  const error   = (errScorers || errAssists) ? t('common.connectionError') : '';
  const data    = tab === 'goals' ? scorers : assists;
  const statKey = tab === 'goals' ? 'goals' : 'assists';
  const top3    = data.slice(0, 3);
  const rest    = data.slice(3);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'goals',   label: t('scorers.tabs.goals'),   icon: <FiTarget size={13} />,  color: hex.green.bright },
    { key: 'assists', label: t('scorers.tabs.assists'),  icon: <FiZap size={13} />,     color: hex.gold.base },
  ];

  return (
    <div className="w-full min-h-screen relative"
      style={{ background: `radial-gradient(ellipse at 20% 20%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 60%, ${hex.bg.primary} 100%)` }}>

      {/* Ambient orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -150, right: -100, background: `radial-gradient(circle, ${alphaOf('gold', 0.06)} 0%, transparent 70%)`, filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, left: -60, background: `radial-gradient(circle, ${alphaOf('green', 0.06)} 0%, transparent 70%)`, filter: 'blur(65px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 13, repeat: Infinity, delay: 3 }} />

      <div className="relative z-10">
        <Header title="⚽ Orionix Gol" subtitle={t('scorers.subtitle')} centered />
      </div>

      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-2xl mx-auto w-full pb-32">

        {/* ── Page title ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${alphaOf('gold', 0.15)}, ${alphaOf('gold', 0.05)})`, border: `1px solid ${alpha(hex.gold.base, 0.35)}`, boxShadow: `0 0 20px ${alpha(hex.gold.base, 0.15)}` }}>
            <FiAward size={18} style={{ color: hex.gold.base }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-none tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('scorers.title')}
            </h1>
            <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              {t('scorers.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2 p-1 rounded-2xl mb-6"
          style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
          {tabs.map(({ key, label, icon, color }) => {
            const active = tab === key;
            return (
              <motion.button key={key} onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all"
                style={{
                  background: active ? alpha(color, 0.12) : 'transparent',
                  border: `1px solid ${active ? alpha(color, 0.35) : 'transparent'}`,
                  color: active ? color : alpha(hex.text.secondary, 0.45),
                  boxShadow: active ? `0 0 16px ${alpha(color, 0.12)}` : 'none',
                }}
                whileTap={{ scale: 0.97 }}>
                {icon}{label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Banner de plan — solo visible para usuarios Free ── */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: alpha(hex.neutral.white, 0.04),
              border: `1px solid ${alpha(hex.neutral.white, 0.08)}`,
            }}
          >
            <FiAward size={12} style={{ color: alpha(hex.text.secondary, 0.55) }} />
            <p className="text-[11px] tracking-wide" style={{ color: hex.text.secondary }}>
              {tab === 'goals'
                ? <>Mostrando <strong>Top 10</strong> del plan gratuito. Hazte Premium para ver hasta <strong>Top 50</strong> + filtros por equipo.</>
                : <>Top asistentes es <strong>exclusivo del Pase Mundial</strong>.</>
              }
            </p>
          </motion.div>
        )}

        {/* ── Si Free intenta ver asistentes, mostramos paywall ── */}
        {tab === 'assists' && !isPremium ? (
          <PremiumGate
            feature="el top asistentes del Mundial"
            description="Las estadísticas de asistencias son exclusivas del Pase Mundial. Desbloquea el ranking completo y filtros por equipo."
          >
            <div />
          </PremiumGate>
        ) : loading ? (
          <Skeleton />
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm font-bold text-center" style={{ color: hex.status.danger }}>{error}</p>
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: alphaOf('gold', 0.08), border: borders.brand('gold', 0.22) }}>
              <FiAward size={28} style={{ color: alpha(hex.gold.base, 0.5) }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black mb-1" style={{ color: alpha(hex.text.secondary, 0.6) }}>{t('scorers.noData')}</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: alpha(hex.text.secondary, 0.35) }}>{t('scorers.noDataSub')}</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Top 3 podium */}
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {top3.map((player, i) => (
                    <PodiumCard key={player.playerId} player={player} rank={i} stat={player[statKey as keyof PlayerStat] as number} />
                  ))}
                </div>
              )}

              {/* Publicidad entre podio y resto del ranking */}
              <AdSlot />

              {/* Divider */}
              {rest.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(hex.neutral.white, 0.06)}, transparent)` }} />
                  <span className="text-[8px] font-black tracking-[0.3em] uppercase" style={{ color: alpha(hex.text.secondary, 0.3) }}>
                    {t('scorers.others')}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.06)})` }} />
                </div>
              )}

              {/* Rest of ranking */}
              <div className="space-y-2">
                {rest.map((player, i) => (
                  <PlayerRow
                    key={player.playerId}
                    player={player}
                    rank={i + 4}
                    stat={player[statKey as keyof PlayerStat] as number}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
