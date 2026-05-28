'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { fmtDate, fmtTime, fmtDay } from '@/utils/format';
import { Flag, SectionHeader, card } from './HomeUtils';

interface UpcomingMatchesProps {
  fixtures: any[];
  t: (key: string) => string;
}

const UpcomingMatches = ({ fixtures, t }: UpcomingMatchesProps) => (
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
        label={fixtures.length > 1 ? 'PRÓXIMOS PARTIDOS' : t('home.nextMatch')}
        accent={hex.green.bright}
        right={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ border: `1px solid ${alphaOf('green', 0.28)}`, background: alphaOf('green', 0.08) }}>
            {fixtures.length > 0 && (
              <span className="text-[8px] font-black px-1 py-0.5 rounded-full tabular-nums"
                style={{ background: alphaOf('green', 0.15), color: hex.green.bright }}>
                {fixtures.length}
              </span>
            )}
            <span className="text-[8px] font-black tracking-widest text-orionix-green-soft">{t('home.pending')}</span>
          </div>
        }
      />

      {fixtures.length > 0 ? (
        fixtures.length === 1 ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.20)})` }} />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: alphaOf('green', 0.06), border: `1px solid ${alphaOf('green', 0.18)}` }}>
                <span className="text-sm">🏟️</span>
                <span className="text-[9px] font-semibold text-orionix-text-muted">{fmtDate(fixtures[0].kickoffAt)}</span>
              </div>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.20)}, transparent)` }} />
            </div>

            <div className="flex items-center justify-around pb-5">
              <motion.div className="flex flex-col items-center gap-3 flex-1" whileHover={{ scale: 1.04 }}>
                <Flag url={fixtures[0].homeTeam.flagUrl} name={fixtures[0].homeTeam.name} size="lg" glow={alphaOf('green', 0.20)} />
                <div className="text-center">
                  <p className="text-base font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                    {fixtures[0].homeTeam.shortName}
                  </p>
                  <p className="text-[9px] font-medium mt-0.5 hidden sm:block truncate max-w-[90px] text-orionix-text-muted">
                    {fixtures[0].homeTeam.name}
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
                <Flag url={fixtures[0].awayTeam.flagUrl} name={fixtures[0].awayTeam.name} size="lg" glow={alphaOf('green', 0.20)} />
                <div className="text-center">
                  <p className="text-base font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                    {fixtures[0].awayTeam.shortName}
                  </p>
                  <p className="text-[9px] font-medium mt-0.5 hidden sm:block truncate max-w-[90px] text-orionix-text-muted">
                    {fixtures[0].awayTeam.name}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="h-px w-full mb-4"
              style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.15)}, transparent)` }} />

            <Link href={`/fixtures/${fixtures[0].id}`}>
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
            {fixtures.map((fixture, i) => (
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
);

export default UpcomingMatches;
