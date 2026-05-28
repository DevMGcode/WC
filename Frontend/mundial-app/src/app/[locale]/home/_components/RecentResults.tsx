'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { fmtDate } from '@/utils/format';
import { Flag, SectionHeader, card, getPredResult } from './HomeUtils';

interface RecentResultsProps {
  fixtures: any[];
  predictions: Record<number, any>;
  t: (key: string) => string;
}

const RecentResults = ({ fixtures, predictions, t }: RecentResultsProps) => (
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
        label={fixtures.length > 1 ? 'ÚLTIMOS RESULTADOS' : t('home.lastResult')}
        accent={hex.gold.base}
        right={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ border: `1px solid ${alphaOf('gold', 0.28)}`, background: alphaOf('gold', 0.08) }}>
            {fixtures.length > 1 && (
              <span className="text-[8px] font-black tabular-nums px-1 py-0.5 rounded-full"
                style={{ background: alphaOf('gold', 0.15), color: hex.gold.base }}>
                {fixtures.length}
              </span>
            )}
            <span className="text-[8px] font-black tracking-widest text-amber-300">{t('home.finished')}</span>
          </div>
        }
      />

      {fixtures.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fixtures.map((fixture, i) => {
            const pred     = predictions[fixture.id];
            const pr       = getPredResult(fixture, pred, t);
            const isSingle = fixtures.length === 1;
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
                          style={{
                            fontSize: isSingle ? 'clamp(2.2rem,6vw,3.2rem)' : '1.7rem',
                            color: hex.text.primary,
                            textShadow: `0 0 28px ${alpha(hex.neutral.white, 0.14)}`,
                          }}>
                          {fixture.homeScore}
                        </span>
                        <span style={{ color: alpha(hex.neutral.white, 0.16), fontSize: isSingle ? '1.4rem' : '1rem', fontWeight: 900 }}>–</span>
                        <span className="font-black tabular-nums leading-none"
                          style={{
                            fontSize: isSingle ? 'clamp(2.2rem,6vw,3.2rem)' : '1.7rem',
                            color: hex.text.primary,
                            textShadow: `0 0 28px ${alpha(hex.neutral.white, 0.14)}`,
                          }}>
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
                            style={{ background: `${pr.color}14`, border: `1px solid ${pr.color}30` }}>
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
);

export default RecentResults;
