'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { fmtDate } from '@/utils/format';
import { Flag, SectionHeader, card, getPredResult } from './HomeUtils';

interface RecentResultsProps {
  fixtures: any[];
  predictions: Record<number, any>;
  t: (key: string) => string;
}

/** Determina el lado ganador: 'home' | 'away' | 'draw' */
const getWinner = (homeScore: number, awayScore: number) => {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
};

const RecentResults = ({ fixtures, predictions, t }: RecentResultsProps) => {
  const locale = useLocale();
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl"
    style={card(alphaOf('gold', 0.24))}
  >
    {/* Top gold line */}
    <div className="absolute inset-x-0 top-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}dd, transparent)` }} />
    {/* Ambient orb */}
    <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.12)} 0%, transparent 65%)`, filter: 'blur(32px)' }} />

    <div className="relative p-5 sm:p-7">
      <SectionHeader
        label={fixtures.length > 1 ? t('home.recentResults') : t('home.lastResult')}
        accent={hex.gold.base}
        right={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ border: `1px solid ${alphaOf('gold', 0.35)}`, background: alphaOf('gold', 0.12) }}>
            {fixtures.length > 1 && (
              <span className="text-[11px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                style={{ background: alphaOf('gold', 0.20), color: hex.gold.base }}>
                {fixtures.length}
              </span>
            )}
            {/* Badge estado: 12px */}
            <span className="text-[12px] font-black tracking-[0.12em]" style={{ color: hex.gold.bright }}>
              {t('home.finished')}
            </span>
          </div>
        }
      />

      {fixtures.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {fixtures.map((fixture, i) => {
            const pred     = predictions[fixture.id];
            const pr       = getPredResult(fixture, pred, t);
            const isSingle = fixtures.length === 1;
            const winner   = getWinner(fixture.homeScore, fixture.awayScore);

            return (
              <motion.div
                key={fixture.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: pr
                    ? `linear-gradient(135deg, ${pr.glow}09 0%, ${alpha(hex.bg.elevated, 0.72)} 100%)`
                    : `linear-gradient(145deg, ${alpha(hex.neutral.white, 0.025)} 0%, ${alpha(hex.bg.elevated, 0.65)} 100%)`,
                  border: `1px solid ${pr?.border ?? alpha(hex.neutral.white, 0.08)}`,
                }}
              >
                {pr && (
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${pr.glow}90, transparent)` }} />
                )}

                <div className="p-4 sm:p-5">
                  {/* Teams + Score row */}
                  <div className="flex items-center">
                    {/* Home team */}
                    <div className={`flex flex-col items-center gap-2 flex-1 ${winner === 'home' ? 'opacity-100' : 'opacity-55'}`}>
                      <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name}
                        size={isSingle ? 'md' : 'sm'}
                        glow={winner === 'home' ? alphaOf('gold', 0.25) : undefined} />
                      <div className="text-center">
                        {/* Nombre equipo: 14px (single) / 13px (multi) */}
                        <p className={`font-black tracking-wider uppercase ${isSingle ? 'text-sm' : 'text-[13px]'}`}
                          style={{ color: winner === 'home' ? hex.text.primary : hex.text.secondary }}>
                          {fixture.homeTeam.shortName}
                        </p>
                        {winner === 'home' && (
                          <div className="w-4 h-[2px] rounded-full mx-auto mt-1"
                            style={{ background: hex.gold.base }} />
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center px-2 flex-shrink-0">
                      <motion.div
                        className="flex items-center justify-center gap-1"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex items-center gap-1 px-3 py-2 rounded-xl"
                          style={{
                            background: `linear-gradient(145deg, ${alpha(hex.neutral.white, 0.07)}, ${alpha(hex.neutral.black, 0.55)})`,
                            border: `1px solid ${alpha(hex.neutral.white, 0.12)}`,
                            boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.07)}`,
                          }}>
                          <span className="font-black tabular-nums leading-none"
                            style={{
                              fontSize: isSingle ? 'clamp(2.2rem, 6vw, 3.2rem)' : '1.75rem',
                              color: winner === 'home' ? hex.gold.bright : hex.text.primary,
                              textShadow: winner === 'home' ? `0 0 24px ${alphaOf('gold', 0.65)}` : `0 0 20px ${alpha(hex.neutral.white, 0.14)}`,
                            }}>
                            {fixture.homeScore}
                          </span>
                          <span style={{
                            color: alpha(hex.neutral.white, 0.25),
                            fontSize: isSingle ? '1.4rem' : '1rem',
                            fontWeight: 900,
                            margin: '0 3px'
                          }}>–</span>
                          <span className="font-black tabular-nums leading-none"
                            style={{
                              fontSize: isSingle ? 'clamp(2.2rem, 6vw, 3.2rem)' : '1.75rem',
                              color: winner === 'away' ? hex.gold.bright : hex.text.primary,
                              textShadow: winner === 'away' ? `0 0 24px ${alphaOf('gold', 0.65)}` : `0 0 20px ${alpha(hex.neutral.white, 0.14)}`,
                            }}>
                            {fixture.awayScore}
                          </span>
                        </div>
                      </motion.div>

                      {/* Fecha: 11px */}
                      <p className="text-[11px] mt-1.5 text-center" style={{ color: hex.text.muted }}>
                        {fmtDate(fixture.kickoffAt, locale)}
                      </p>

                      {/* Tiempo de reposición (90' + X) — fuente API o EXTENDER del admin */}
                      {(fixture.extraMinutes ?? 0) > 0 && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                          style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}>
                          <span className="text-[13px] font-black tabular-nums" style={{ color: hex.text.secondary }}>
                            ⏱ 90&apos;&nbsp;+{fixture.extraMinutes}
                          </span>
                        </div>
                      )}

                      {winner === 'draw' && (
                        <div className="mt-1.5 inline-flex px-2.5 py-1 rounded-full"
                          style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.12)}` }}>
                          {/* "EMPATE" — 11px */}
                          <span className="text-[11px] font-black tracking-wider" style={{ color: hex.text.secondary }}>EMPATE</span>
                        </div>
                      )}
                    </div>

                    {/* Away team */}
                    <div className={`flex flex-col items-center gap-2 flex-1 ${winner === 'away' ? 'opacity-100' : 'opacity-55'}`}>
                      <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name}
                        size={isSingle ? 'md' : 'sm'}
                        glow={winner === 'away' ? alphaOf('gold', 0.25) : undefined} />
                      <div className="text-center">
                        <p className={`font-black tracking-wider uppercase ${isSingle ? 'text-sm' : 'text-[13px]'}`}
                          style={{ color: winner === 'away' ? hex.text.primary : hex.text.secondary }}>
                          {fixture.awayTeam.shortName}
                        </p>
                        {winner === 'away' && (
                          <div className="w-4 h-[2px] rounded-full mx-auto mt-1"
                            style={{ background: hex.gold.base }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scorers — 12px mínimo */}
                  {fixture.scorers && fixture.scorers.length > 0 && (
                    <div className="mt-3.5 pt-3.5"
                      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1 min-w-0">
                          {fixture.scorers
                            .filter((s: any) => s.teamId === fixture.homeTeam.id)
                            .map((s: any) => (
                              <div key={s.id} className="flex items-center gap-1.5 text-[12px]"
                                style={{ color: hex.green.soft }}>
                                <span className="shrink-0">⚽</span>
                                <span className="font-bold truncate">{s.playerName}</span>
                                {s.minute && <span className="shrink-0 opacity-55">{s.minute}&apos;</span>}
                              </div>
                          ))}
                        </div>
                        <div className="w-px shrink-0" style={{ background: alpha(hex.neutral.white, 0.08) }} />
                        <div className="flex-1 space-y-1 min-w-0">
                          {fixture.scorers
                            .filter((s: any) => s.teamId === fixture.awayTeam.id)
                            .map((s: any) => (
                              <div key={s.id} className="flex items-center justify-end gap-1.5 text-[12px]"
                                style={{ color: hex.gold.bright }}>
                                {s.minute && <span className="shrink-0 opacity-55">{s.minute}&apos;</span>}
                                <span className="font-bold truncate">{s.playerName}</span>
                                <span className="shrink-0">⚽</span>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prediction result */}
                  {pred ? (
                    <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5"
                      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                      <div className="min-w-0">
                        {/* "TU PORRA" — 11px — tracking compacto en mobile para no romper */}
                        <p className="text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.20em] mb-1.5 whitespace-nowrap" style={{ color: hex.text.muted }}>
                          {t('home.myPrediction')}
                        </p>
                        {/* Score predicho: 24px (single) / 20px (multi) */}
                        <p className={`font-black text-orionix-text-secondary ${isSingle ? 'text-2xl' : 'text-xl'}`}>
                          {pred.predictedHomeScore}
                          <span className="mx-1 text-sm" style={{ color: alpha(hex.neutral.white, 0.22) }}>–</span>
                          {pred.predictedAwayScore}
                        </p>
                      </div>
                      {pr && (
                        <div className="text-right min-w-0 shrink-0">
                          {/* Badge resultado: 11px mobile / 12px sm+, whitespace-nowrap */}
                          <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg mb-1"
                            style={{ background: `${pr.color}18`, border: `1px solid ${pr.color}40` }}>
                            <span className="text-[11px] sm:text-[12px] font-black whitespace-nowrap" style={{ color: pr.color }}>{pr.label}</span>
                          </div>
                          {/* Puntos: 20px (single) / 16px (multi) */}
                          <p className={`font-black mt-0.5 ${isSingle ? 'text-xl' : 'text-base'}`}
                            style={{ color: pr.color, textShadow: `0 0 18px ${pr.glow}` }}>
                            {pr.pts}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* "Sin predicción": 12px */
                    <p className="text-center text-[12px] mt-3.5 pt-3.5 font-medium"
                      style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}`, color: hex.text.muted }}>
                      {t('home.noPrediction')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: alphaOf('gold', 0.08), border: `1px solid ${alphaOf('gold', 0.18)}` }}>
            <span className="text-3xl">🏆</span>
          </div>
          {/* text-sm = 14px */}
          <p className="text-sm font-semibold" style={{ color: hex.text.secondary }}>{t('home.noResults')}</p>
        </div>
      )}
    </div>
  </motion.div>
  );
};

export default RecentResults;
