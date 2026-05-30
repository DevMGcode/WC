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
const MEDAL_COLORS = [hex.gold.base, hex.text.secondary, '#cd7c3e'];

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
    <div className="flex flex-col gap-5">

      {/* ── RENDIMIENTO ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={card(alphaOf('success', 0.24))}
      >
        <div className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${hex.green.hover}dd, transparent)` }} />
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${alphaOf('success', 0.12)} 0%, transparent 65%)`, filter: 'blur(28px)' }} />

        <div className="relative p-5 sm:p-6">
          <SectionHeader label={t('home.performance')} accent={hex.green.hover} />

          <div className="flex items-center gap-5">
            {/* Ring más grande: 96px */}
            <div className="relative shrink-0">
              <Ring value={accuracyPct} max={100} size={96} stroke={8} color={hex.green.hover} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {/* Porcentaje: text-2xl */}
                <p className="text-2xl font-black leading-none tabular-nums"
                  style={{ color: hex.green.soft, textShadow: `0 0 20px ${alphaOf('success', 0.90)}` }}>
                  {accuracyPct}%
                </p>
                {/* Label: 10px — compacto pero visible */}
                <p className="text-[10px] font-black tracking-[0.18em] uppercase mt-1" style={{ color: hex.text.muted }}>
                  Exactas
                </p>
              </div>
            </div>

            {/* Bars */}
            <div className="flex-1 space-y-4">
              {[
                { label: t('home.stats.predictionsLabel'), value: stats.predictions, max: 64,  color: hex.green.bright },
                { label: t('home.stats.exact'),            value: stats.exactas,     max: stats.predictions || 1, color: hex.green.hover },
                { label: t('home.stats.points'),           value: stats.puntos,      max: 192, color: hex.gold.base },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-2">
                    {/* Label barra: text-xs = 12px */}
                    <span className="text-xs font-bold tracking-wide" style={{ color: hex.text.secondary }}>{label}</span>
                    {/* Valor: text-sm = 14px */}
                    <span className="text-sm font-black tabular-nums" style={{ color }}>{value}</span>
                  </div>
                  <GlowBar value={value} max={max} color={color} height={5} />
                </div>
              ))}
            </div>
          </div>

          <FormStrip results={recentResults} predictions={myPredictions} />
        </div>
      </motion.div>

      {/* ── CLASIFICACIÓN GLOBAL ── */}
      <motion.div
        data-tour="ranking"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: 0.50, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl flex-1"
        style={card(alphaOf('gold', 0.18))}
      >
        <div className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}99, transparent)` }} />
        <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.12)} 0%, transparent 65%)`, filter: 'blur(26px)' }} />

        <div className="relative p-5 sm:p-6">
          <SectionHeader
            label={t('home.globalRanking')}
            accent={hex.gold.base}
            right={
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ filter: `drop-shadow(0 0 6px ${hex.gold.base}66)` }}>⚽</span>
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

          <div className="space-y-2.5">
            {topRanking.length > 0 ? topRanking.map((p, i) => {
              const barColor = p.isMe ? hex.green.bright : (MEDAL_COLORS[i] ?? alpha(hex.neutral.white, 0.22));
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.56 + i * 0.07 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
                  className="relative overflow-hidden rounded-2xl p-3"
                  style={{
                    background: p.isMe
                      ? `linear-gradient(145deg, ${alphaOf('green', 0.12)}, ${alpha(hex.bg.elevated, 0.82)})`
                      : (i < 3
                        ? `linear-gradient(145deg, ${alpha(barColor, 0.07)}, ${alpha(hex.bg.elevated, 0.72)})`
                        : alpha(hex.neutral.white, 0.025)),
                    border: p.isMe
                      ? `1px solid ${alphaOf('green', 0.32)}`
                      : (i < 3 ? `1px solid ${alpha(barColor, 0.25)}` : `1px solid ${alpha(hex.neutral.white, 0.06)}`),
                  }}
                >
                  {(p.isMe || i < 3) && (
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${barColor}60, transparent)` }} />
                  )}

                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Posición / medalla */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: i < 3 ? alpha(barColor, 0.16) : alpha(hex.neutral.white, 0.05),
                        border: `1px solid ${i < 3 ? alpha(barColor, 0.30) : alpha(hex.neutral.white, 0.07)}`,
                      }}>
                      {i < 3 ? (
                        <span className="text-base leading-none">{MEDAL[i]}</span>
                      ) : (
                        <span className="text-[12px] font-black" style={{ color: hex.text.secondary }}>{p.rank}</span>
                      )}
                    </div>

                    {/* Nombre jugador: 12px */}
                    <span className="flex-1 text-[12px] font-bold truncate"
                      style={{ color: p.isMe ? hex.green.soft : hex.text.primary }}>
                      {p.isMe && (
                        <span className="mr-1.5 text-[11px] font-black px-1.5 py-0.5 rounded"
                          style={{ background: alphaOf('green', 0.18), color: hex.green.bright }}>
                          TÚ
                        </span>
                      )}
                      {p.name}
                    </span>

                    {/* Puntos: 14px */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black tabular-nums leading-none"
                        style={{ color: barColor, textShadow: `0 0 12px ${barColor}80` }}>
                        {p.points}
                      </span>
                      <span className="text-[11px] font-bold ml-0.5" style={{ color: hex.text.muted }}>pts</span>
                    </div>
                  </div>

                  {/* Barra */}
                  <GlowBar value={p.points} max={maxRankPts} color={barColor} height={4} />
                </motion.div>
              );
            }) : (
              <p className="text-sm text-center py-10" style={{ color: hex.text.muted }}>{t('home.noRankingData')}</p>
            )}
          </div>

          <Link href="/predictions?tab=ranking">
            <motion.button
              whileHover={{ borderColor: alphaOf('green', 0.45), color: hex.green.bright }}
              className="w-full mt-5 py-3.5 rounded-xl font-black border transition-all uppercase flex items-center justify-center gap-1.5"
              style={{
                borderColor: alpha(hex.neutral.white, 0.10),
                color: hex.text.secondary,
                /* "Ver ranking completo": 12px */
                fontSize: '12px',
                letterSpacing: '0.20em',
              }}
            >
              {t('home.viewFullRanking')}
              <FiChevronRight size={13} />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RightColumn;
