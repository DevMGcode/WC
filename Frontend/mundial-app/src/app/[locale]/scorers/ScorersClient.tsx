'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  nationality?: string;
  position?:  string;
  age?:       number;
  goals:     number;
  assists:   number;
  appearances: number;
  minutesPlayed: number;
  shotsTotal?:    number;
  shotsOnTarget?: number;
  rating:    string;
}

type Tab = 'goals' | 'assists';

/* ── Medal colours ── */
const MEDAL = [
  { bg: 'linear-gradient(135deg,#D4AF37,#F5D06A)', shadow: 'rgba(212,175,55,0.55)', label: '1°' },
  { bg: 'linear-gradient(135deg,#9CA3AF,#D1D5DB)',  shadow: 'rgba(156,163,175,0.45)', label: '2°' },
  { bg: 'linear-gradient(135deg,#92400E,#D97706)',  shadow: 'rgba(146,64,14,0.45)',  label: '3°' },
];

/* Rating "8.3" → "8.3"; vacío / "0" / null → "—" */
function fmtRating(r?: string): string {
  const n = Number(r);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : '—';
}

/* Chip compacto de estadística secundaria (PJ, rating, min/gol).
   `title` muestra un tooltip explicativo al pasar el mouse (cursor-help). */
function MiniStat({ icon, value, accent, title }: { icon: string; value: React.ReactNode; accent?: boolean; title?: string }) {
  return (
    <div title={title}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-help"
      style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
      <span className="text-[8px] font-black tracking-wide uppercase"
        style={{ color: accent ? hex.gold.base : alpha(hex.text.secondary, 0.5) }}>{icon}</span>
      <span className="text-[10px] font-black tabular-nums"
        style={{ color: accent ? hex.gold.bright : hex.text.primary }}>{value}</span>
    </div>
  );
}

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

/* ── Top-3 podium card — #1 destacado (featured) ── */
function PodiumCard({ player, rank, stat, statLabel, featured }: {
  player: PlayerStat; rank: number; stat: number; statLabel: string; featured: boolean;
}) {
  const medal  = MEDAL[rank];
  const rating = fmtRating(player.rating);
  // Minutos por gol/asistencia: solo tiene sentido si hay al menos 1.
  const minPer = stat > 0 ? Math.round(player.minutesPlayed / stat) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      className={`relative flex flex-col items-center rounded-2xl overflow-hidden ${featured ? 'p-4 pb-5' : 'p-3 pb-4'}`}
      style={{
        background: surfaces.card(),
        border: `1px solid ${featured ? alpha(hex.gold.base, 0.5) : alpha(hex.neutral.white, 0.08)}`,
        boxShadow: featured
          ? `0 0 40px ${alpha(hex.gold.base, 0.22)}, 0 10px 28px rgba(2,6,23,0.55)`
          : '0 4px 16px rgba(2,6,23,0.4)',
      }}>
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${featured ? hex.gold.base : hex.neutral.white}40, transparent)` }} />

      {/* Corona del líder */}
      {featured && <div className="absolute top-1.5 right-2 text-sm" aria-label="Líder">👑</div>}

      {/* Medal badge */}
      <div className={`rounded-full flex items-center justify-center font-black text-white mb-2 shrink-0 ${featured ? 'w-9 h-9 text-[13px]' : 'w-7 h-7 text-[10px]'}`}
        style={{ background: medal.bg, boxShadow: `0 4px 14px ${medal.shadow}` }}>
        {medal.label}
      </div>

      {/* Avatar */}
      <div className={`relative rounded-full mb-2 shrink-0 ${featured ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-14 sm:h-14'}`}
        style={{ border: `2px solid ${featured ? alpha(hex.gold.base, 0.6) : alpha(hex.neutral.white, 0.12)}`, boxShadow: `0 0 18px ${medal.shadow}` }}>
        <PlayerPhoto url={player.photoUrl} name={player.playerName} />
      </div>

      {/* Name */}
      <p className={`font-black text-center leading-snug mb-1 line-clamp-2 ${featured ? 'text-[12px]' : 'text-[10px]'}`}
        style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
        {player.playerName}
      </p>

      {/* Team */}
      <div className="flex items-center gap-1 mb-2">
        {player.teamLogoUrl && (
          <div className="relative w-3.5 h-3.5 shrink-0">
            <Image src={player.teamLogoUrl} alt={player.teamName} fill sizes="14px" className="object-contain" />
          </div>
        )}
        <span className="text-[8px] font-bold tracking-widest uppercase truncate max-w-[80px]"
          style={{ color: alpha(hex.text.secondary, 0.5) }}>
          {player.teamName}
        </span>
      </div>

      {/* Stat principal */}
      <div className="flex items-baseline gap-1">
        <span className={`font-black leading-none ${featured ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}
          style={{ fontFamily: 'var(--font-display)', background: medal.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {stat}
        </span>
        <span className="text-[8px] font-black tracking-widest uppercase"
          style={{ color: alpha(hex.text.secondary, 0.45) }}>
          {statLabel}
        </span>
      </div>

      {/* Mini-stats reales (datos que ya llegan del backend) */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
        <MiniStat icon="PJ" value={player.appearances} title="Partidos jugados" />
        {rating !== '—' && <MiniStat icon="★" value={rating} accent title="Valoración del jugador (0 a 10)" />}
        {featured && minPer && <MiniStat icon="MIN" value={minPer} title={`Minutos por ${statLabel === 'goles' ? 'gol' : 'asistencia'}`} />}
      </div>
    </motion.div>
  );
}

/* ── Row for rank 4+ ── */
function PlayerRow({ player, rank, stat, maxStat, delay }: {
  player: PlayerStat; rank: number; stat: number; maxStat: number; delay: number;
}) {
  const rating = fmtRating(player.rating);
  // % respecto al líder, para la barra de progreso (clamp a 100).
  const pct = maxStat > 0 ? Math.min(100, Math.round((stat / maxStat) * 100)) : 0;
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

      {/* Name + team + barra de progreso (vs. líder) */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-black leading-none truncate" style={{ color: hex.text.primary }}>{player.playerName}</p>
        <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 truncate" style={{ color: alpha(hex.text.secondary, 0.42) }}>{player.teamName}</p>
        <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: alpha(hex.neutral.white, 0.06) }}
          title={`${stat} de ${maxStat} del líder`}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${alphaOf('green', 0.5)}, ${hex.green.bright})` }} />
        </div>
      </div>

      {/* Rating — visible también en móvil (a petición) */}
      {rating !== '—' && (
        <div className="flex shrink-0">
          <MiniStat icon="★" value={rating} title="Valoración del jugador (0 a 10)" />
        </div>
      )}

      {/* Stat */}
      <span className="text-lg font-black shrink-0 w-7 text-right" style={{ color: hex.green.bright, fontFamily: 'var(--font-display)' }}>
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

  // Header sticky: medimos su altura para pegar las pestañas justo debajo.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
  // Orden con desempate estilo Bota de Oro del Mundial (criterio FIFA):
  // 1) goles/asist.  ·  2) la otra métrica  ·  3) menos minutos (más eficiente).
  const ranked  = [...data].sort((a, b) => {
    const pa = (a[statKey as keyof PlayerStat] as number) ?? 0;
    const pb = (b[statKey as keyof PlayerStat] as number) ?? 0;
    if (pb !== pa) return pb - pa;
    const sa = statKey === 'goals' ? (a.assists ?? 0) : (a.goals ?? 0);
    const sb = statKey === 'goals' ? (b.assists ?? 0) : (b.goals ?? 0);
    if (sb !== sa) return sb - sa;
    return (a.minutesPlayed ?? 0) - (b.minutesPlayed ?? 0);
  });
  const top3    = ranked.slice(0, 3);
  const rest    = ranked.slice(3);
  // Tope para las barras de progreso de las filas: stat del líder.
  const maxStat = (ranked[0]?.[statKey as keyof PlayerStat] as number) ?? 1;

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

      <div ref={headerRef} className="sticky top-0 z-40">
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

        {/* ── Tabs (sticky, justo bajo el header) ── */}
        <div className="sticky z-30 mb-6 py-1"
          style={{ top: headerH, background: alpha(hex.bg.primary, 0.92),
                   backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2 p-1 rounded-2xl"
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
        </div>

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

              {/* Top 3 podium — #1 destacado al centro (orden visual 2-1-3) */}
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 items-end mb-5">
                  {[1, 0, 2].map((idx) => {
                    const player = top3[idx];
                    if (!player) return <div key={`empty-${idx}`} />;
                    return (
                      <PodiumCard key={player.playerId} player={player} rank={idx}
                        stat={player[statKey as keyof PlayerStat] as number}
                        statLabel={tab === 'goals' ? 'goles' : 'asist.'}
                        featured={idx === 0} />
                    );
                  })}
                </div>
              )}

              {/* Leyenda de abreviaturas — visible también en móvil (sin hover) */}
              {top3.length > 0 && (
                <p className="text-[9px] text-center tracking-wide mb-4 -mt-1"
                  style={{ color: alpha(hex.text.secondary, 0.45) }}>
                  <span className="font-black" style={{ color: alpha(hex.text.secondary, 0.65) }}>PJ</span> = partidos
                  {'  ·  '}
                  <span className="font-black" style={{ color: hex.gold.base }}>★</span> = valoración
                  {'  ·  '}
                  <span className="font-black" style={{ color: alpha(hex.text.secondary, 0.65) }}>MIN</span> = min/{tab === 'goals' ? 'gol' : 'asist.'}
                </p>
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
                    maxStat={maxStat}
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
