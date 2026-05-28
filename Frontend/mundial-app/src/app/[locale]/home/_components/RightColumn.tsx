'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import ShareButton from '@/components/ShareButton';
import { Ring, GlowBar, SectionHeader, FormStrip, card } from './HomeUtils';

const MEDAL = ['🥇', '🥈', '🥉'];

interface Stats {
  predictions: number;
  exactas: number;
  puntos: number;
  rank: number;
}

interface RankEntry {
  rank: number;
  name: string;
  points: number;
  isMe?: boolean;
}

interface RightColumnProps {
  stats: Stats;
  recentResults: any[];
  myPredictions: Record<number, any>;
  topRanking: RankEntry[];
  maxRankPts: number;
  t: (key: string) => string;
}

const RightColumn = ({ stats, recentResults, myPredictions, topRanking, maxRankPts, t }: RightColumnProps) => {
  const accuracyPct = stats.predictions > 0
    ? Math.round((stats.exactas / stats.predictions) * 100)
    : 0;

  return (
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
              const rankColors = [hex.gold.base, hex.text.secondary, '#cd7c3e'];
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
  );
};

export default RightColumn;
