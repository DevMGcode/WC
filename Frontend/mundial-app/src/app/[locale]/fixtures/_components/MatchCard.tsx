'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FiCalendar, FiClock, FiChevronRight, FiZap, FiCheck } from 'react-icons/fi';
import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { Badge, StatusDot } from '@/components/ui';
import { fmtTime, fmtDay } from '@/utils/format';
import { MATCH_DURATION_MS } from '@/constants/tournament';

/* ══════════════════════════════════════════
   STATUS CONFIG — color semántico por estado
══════════════════════════════════════════ */
export const STATUS_CFG: Record<string, { labelKey: string; color: BrandColor }> = {
  LIVE:      { labelKey: 'fixtures.filters.live',    color: 'danger'  },
  SCHEDULED: { labelKey: 'fixtures.filters.pending', color: 'green'   },
  FINISHED:  { labelKey: 'common.finished',          color: 'success' },
  POSTPONED: { labelKey: 'common.pending',           color: 'neutral' },
};

/* ══════════════════════════════════════════
   EFFECTIVE STATUS — override basado en tiempo
   Si backend no actualizó aún:
     kickoffAt + 120min < now → FINISHED
     kickoffAt <= now < +120min → LIVE
══════════════════════════════════════════ */
export function getEffectiveStatus(fixture: { status: string; kickoffAt: string | Date }): string {
  if (fixture.status === 'FINISHED') return 'FINISHED';
  const kickoff = new Date(fixture.kickoffAt).getTime();
  const now     = Date.now();
  // Si el backend dice LIVE pero ya pasaron más de 150 min desde el kickoff
  // (90' regulares + 30' tiempo extra + buffer), forzamos FINISHED como red de seguridad.
  if (fixture.status === 'LIVE') {
    if (now >= kickoff + 150 * 60 * 1000) return 'FINISHED';
    return 'LIVE';
  }
  if (fixture.status === 'SCHEDULED') {
    if (now >= kickoff + MATCH_DURATION_MS) return 'FINISHED';
    if (now >= kickoff) return 'LIVE';
  }
  return fixture.status;
}

/* ══════════════════════════════════════════
   FLAG BUBBLE
══════════════════════════════════════════ */
const FlagBubble = ({ url, name, size = 60, color = 'green' as BrandColor, soft = false }: {
  url: string; name: string; size?: number; color?: BrandColor; soft?: boolean;
}) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: alphaOf(color, soft ? 0.14 : 0.22), filter: 'blur(12px)', transform: 'scale(1.3)' }}
      animate={{ opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
      style={{ border: `1.5px solid ${alpha(hex.neutral.white, 0.12)}`, background: hex.bg.elevated }}>
      {url && <img src={url} alt={name} className="w-full h-full object-cover" />}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   MATCH CARD
══════════════════════════════════════════ */
interface MatchCardProps {
  fixture: any;
  index: number;
  isFirst?: boolean;
  t: (key: string) => string;
}

const MatchCard = ({ fixture, index, isFirst, t }: MatchCardProps) => {
  const locale = useLocale();
  const effectiveStatus = getEffectiveStatus(fixture);
  const isLive     = effectiveStatus === 'LIVE';
  const isFinished = effectiveStatus === 'FINISHED';
  const cfg        = STATUS_CFG[effectiveStatus] ?? STATUS_CFG.SCHEDULED;

  const timeStr = fmtTime(fixture.kickoffAt, locale);
  const dateStr = fmtDay(fixture.kickoffAt, locale);

  const glow        = alphaOf(cfg.color, 0.60);
  const cardTintBg  = alphaOf(cfg.color, isFinished || isLive ? 0.04 : 0.02);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.42, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.012 }}
      className="group"
      {...(isFirst ? { 'data-tour': 'calendar-match' } : {})}
    >
      <Link href={`fixtures/${fixture.id}`}>
        <div className="relative overflow-hidden rounded-2xl cursor-pointer"
          style={{
            background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)} 0%, ${alpha(hex.bg.secondary, 0.97)} 60%, ${cardTintBg} 100%)`,
            border: `1px solid ${alphaOf(cfg.color, isLive ? 0.35 : 0.095)}`,
            backdropFilter: 'blur(28px)',
            boxShadow: isLive
              ? `0 0 0 1px ${alphaOf(cfg.color, 0.08)}, 0 20px 56px ${alpha(hex.neutral.black, 0.65)}, 0 0 40px ${alphaOf(cfg.color, 0.10)}`
              : `0 20px 48px ${alpha(hex.neutral.black, 0.55)}, 0 0 0 1px ${alpha(hex.neutral.white, 0.015)}, 0 0 20px ${alphaOf(cfg.color, 0.08)}`,
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Left accent bar */}
          <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
            style={{ background: gradients.dividerV(cfg.color, 1), boxShadow: `0 0 8px ${glow}` }} />

          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: gradients.divider(cfg.color, 0.6) }} />

          {/* Live pulsing overlay */}
          {isLive && (
            <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
              animate={{ opacity: [0, 0.10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${alphaOf('danger', 0.28)}, transparent 65%)` }} />
          )}

          {/* Hover shimmer */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100"
            style={{ background: `linear-gradient(108deg, transparent 30%, ${alpha(hex.neutral.white, 0.022)} 50%, transparent 70%)`,
                     transition: 'opacity 0.28s' }} />

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: borders.divider() }}>
            <Badge color={cfg.color} size="xs">
              {isLive && <StatusDot color={cfg.color} size={6} />}
              {t(cfg.labelKey)}
            </Badge>

            {fixture.round && (
              <span className="text-[8px] font-black tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                style={{ color: alpha(hex.text.secondary, 0.40),
                         background: alpha(hex.neutral.white, 0.03),
                         border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
                {fixture.round}
              </span>
            )}

            <motion.span className="shrink-0"
              style={{ color: hex.text.muted, transition: 'color 0.2s' }}
              animate={isLive ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}>
              <FiChevronRight size={14} />
            </motion.span>
          </div>

          {/* ── TEAMS + SCORE ── */}
          <div className="flex items-center justify-around px-5 py-7 gap-3">
            <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
              <FlagBubble url={fixture.homeTeam?.flagUrl} name={fixture.homeTeam?.name} size={66}
                color={cfg.color} soft={!isFinished && !isLive} />
              <p className="text-[11px] font-black tracking-widest text-center leading-none truncate w-full uppercase text-orionix-text-secondary">
                {fixture.homeTeam?.shortName}
              </p>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 px-3">
              {isFinished || isLive ? (
                <motion.div className="flex items-center gap-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  {/* Score box */}
                  <div className="flex items-center gap-1 px-3 py-2 rounded-2xl"
                    style={{
                      background: `linear-gradient(145deg, ${alphaOf(cfg.color, 0.10)}, ${alpha(hex.bg.elevated, 0.85)})`,
                      border: `1px solid ${alphaOf(cfg.color, 0.22)}`,
                      boxShadow: `0 4px 24px ${alphaOf(cfg.color, 0.18)}, inset 0 1px 0 ${alphaOf(cfg.color, 0.10)}`,
                    }}>
                    <span className="font-black tabular-nums leading-none"
                      style={{
                        fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
                        color: hex.neutral.white,
                        textShadow: `0 0 28px ${glow}, 0 0 56px ${alphaOf(cfg.color, 0.38)}`,
                      }}>
                      {fixture.homeScore ?? 0}
                    </span>
                    <span className="font-black mx-1"
                      style={{ color: alpha(hex.neutral.white, 0.15), fontSize: 'clamp(1.6rem,4.5vw,2.4rem)' }}>–</span>
                    <span className="font-black tabular-nums leading-none"
                      style={{
                        fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
                        color: hex.neutral.white,
                        textShadow: `0 0 28px ${glow}, 0 0 56px ${alphaOf(cfg.color, 0.38)}`,
                      }}>
                      {fixture.awayScore ?? 0}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <motion.div className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${alphaOf(cfg.color, 0.16)}` }}
                      animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.4, repeat: Infinity }} />
                    <motion.p className="font-black leading-none text-lg"
                      style={{ color: alphaOf(cfg.color, 0.31), letterSpacing: '0.10em' }}
                      animate={{ opacity: [0.35, 0.70, 0.35] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      VS
                    </motion.p>
                  </div>
                  <p className="text-[10px] font-black tabular-nums"
                    style={{ color: alphaOf(cfg.color, 1), textShadow: `0 0 8px ${glow}` }}>
                    {timeStr}
                  </p>
                </div>
              )}
              {isLive && (
                <motion.div className="flex items-center gap-1 mt-1"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}>
                  <StatusDot color="danger" size={4} pulse={false} />
                  <p className="text-[7px] font-black tracking-[0.35em] uppercase"
                    style={{ color: hex.status.danger, textShadow: `0 0 10px ${alphaOf('danger', 0.5)}` }}>
                    {t('fixtures.filters.live')}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
              <FlagBubble url={fixture.awayTeam?.flagUrl} name={fixture.awayTeam?.name} size={66}
                color={cfg.color} soft={!isFinished && !isLive} />
              <p className="text-[11px] font-black tracking-widest text-center leading-none truncate w-full uppercase text-orionix-text-secondary">
                {fixture.awayTeam?.shortName}
              </p>
            </div>
          </div>

          {/* ── GOLEADORES (solo FINISHED con scorers) ── */}
          {isFinished && fixture.scorers && fixture.scorers.length > 0 && (() => {
            const homeId    = fixture.homeTeam?.id;
            const awayId    = fixture.awayTeam?.id;
            const homeScore = fixture.homeScore ?? 0;
            const awayScore = fixture.awayScore ?? 0;
            // Cap: nunca mostrar más goles por equipo de los que indica el marcador oficial
            const cappedScorers = [
              ...fixture.scorers
                .filter((s: any) => s.teamId === homeId)
                .sort((a: any, b: any) => (a.minute ?? 0) - (b.minute ?? 0))
                .slice(0, homeScore),
              ...fixture.scorers
                .filter((s: any) => s.teamId === awayId)
                .sort((a: any, b: any) => (a.minute ?? 0) - (b.minute ?? 0))
                .slice(0, awayScore),
            ];
            if (cappedScorers.length === 0) return null;
            const homeScorers = cappedScorers.filter((s: any) => s.teamId === homeId);
            const awayScorers = cappedScorers.filter((s: any) => s.teamId === awayId);
            return (
            <div className="px-4 pb-3">
              <div className="rounded-xl px-3 py-2.5"
                style={{ background: alpha(hex.neutral.black, 0.28), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[8px] font-black tracking-[0.22em] uppercase"
                    style={{ color: alpha(hex.gold.muted, 0.55) }}>Goleadores</span>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: alpha(hex.gold.muted, 0.08), color: alpha(hex.gold.muted, 0.7),
                             border: `1px solid ${alpha(hex.gold.muted, 0.18)}` }}>
                    {cappedScorers.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1 min-w-0">
                    {homeScorers.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-1 text-[9px] text-orionix-green-bright">
                        <span className="shrink-0">⚽</span>
                        <span className="font-bold truncate">{s.playerName}</span>
                        {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                      </div>
                    ))}
                  </div>
                  <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.07) }} />
                  <div className="flex-1 space-y-1 min-w-0">
                    {awayScorers.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-end gap-1 text-[9px]"
                        style={{ color: hex.gold.bright }}>
                        {s.minute && <span className="shrink-0 opacity-50">{s.minute}&apos;</span>}
                        <span className="font-bold truncate">{s.playerName}</span>
                        <span className="shrink-0">⚽</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3"
            style={{ borderTop: borders.divider(), background: alpha(hex.neutral.black, 0.22) }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <FiCalendar size={9} style={{ color: alpha(hex.text.secondary, 0.25) }} />
                <span className="text-[8px] font-semibold capitalize text-orionix-text-muted">{dateStr}</span>
              </div>
              {!isLive && !isFinished && (
                <>
                  <div className="w-px h-2.5" style={{ background: alpha(hex.neutral.white, 0.06) }} />
                  <div className="flex items-center gap-1.5">
                    <FiClock size={9} style={{ color: alpha(hex.text.secondary, 0.25) }} />
                    <span className="text-[8px] font-semibold text-orionix-text-muted">{timeStr}</span>
                  </div>
                </>
              )}
              {/* Tiempo de reposición (90' + X) — fuente API o EXTENDER del admin */}
              {(isFinished || isLive) && (fixture.extraMinutes ?? 0) > 0 && (
                <>
                  <div className="w-px h-2.5" style={{ background: alpha(hex.neutral.white, 0.06) }} />
                  <div className="flex items-center gap-1.5">
                    <FiClock size={11} style={{ color: alpha(hex.text.secondary, 0.40) }} />
                    <span className="text-[11px] font-black tabular-nums text-orionix-text-secondary">
                      90&apos;&nbsp;+{fixture.extraMinutes}
                    </span>
                  </div>
                </>
              )}
            </div>
            {!isFinished && !isLive && (
              <motion.div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: alphaOf('green', 0.06), border: borders.brand('green', 0.18),
                         color: alphaOf('green', 0.65) }}
                whileHover={{ scale: 1.05, backgroundColor: alphaOf('green', 0.12) }}>
                <FiZap size={8} />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase">{t('fixtures.predict')}</span>
              </motion.div>
            )}
            {isFinished && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: alphaOf('success', 0.06), border: borders.brand('success', 0.18) }}>
                <FiCheck size={8} className="text-orionix-green-hover" />
                <span className="text-[7px] font-black tracking-[0.18em] uppercase text-orionix-green-bright">{t('fixtures.final')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(MatchCard);
