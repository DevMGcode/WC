'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FiChevronRight, FiZap } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { fmtDate, fmtTime, fmtDay } from '@/utils/format';
import { Flag, SectionHeader, card } from './HomeUtils';
import { localizeTeamName } from '@/lib/i18n/teamNames';

interface UpcomingMatchesProps {
  fixtures: any[];
  t: (key: string) => string;
}

const UpcomingMatches = ({ fixtures, t }: UpcomingMatchesProps) => {
  const locale = useLocale();
  return (
  <motion.div
    data-tour="matches"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl"
    style={card(alphaOf('green', 0.24))}
  >
    {/* Top glow line */}
    <div className="absolute inset-x-0 top-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${hex.green.bright}dd, transparent)` }} />

    {/* Ambient orb */}
    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${alphaOf('green', 0.12)} 0%, transparent 65%)`, filter: 'blur(36px)' }} />

    <div className="relative p-5 sm:p-7">
      <SectionHeader
        label={fixtures.length > 1 ? t('home.upcomingMatches') : t('home.nextMatch')}
        accent={hex.green.bright}
        right={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ border: `1px solid ${alphaOf('green', 0.35)}`, background: alphaOf('green', 0.12) }}>
            {fixtures.length > 0 && (
              <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                style={{ background: alphaOf('green', 0.22), color: hex.green.bright }}>
                {fixtures.length}
              </span>
            )}
            {/* "PENDIENTES" — 12px mínimo */}
            <span className="text-[12px] font-black tracking-[0.14em]" style={{ color: hex.green.soft }}>
              {t('home.pending')}
            </span>
          </div>
        }
      />

      {fixtures.length > 0 ? (
        fixtures.length === 1 ? (
          <>
            {/* Single match — featured layout */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.25)})` }} />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: alphaOf('green', 0.08), border: `1px solid ${alphaOf('green', 0.22)}` }}>
                <span className="text-base">🏟️</span>
                {/* Fecha del partido: 13px */}
                <span className="text-[13px] font-semibold" style={{ color: hex.text.secondary }}>
                  {fmtDate(fixtures[0].kickoffAt, locale)}
                </span>
              </div>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.25)}, transparent)` }} />
            </div>

            <div className="flex items-center justify-around pb-6">
              <motion.div className="flex flex-col items-center gap-3 flex-1" whileHover={{ scale: 1.05 }}>
                <Flag url={fixtures[0].homeTeam.flagUrl} name={fixtures[0].homeTeam.name} size="lg" glow={alphaOf('green', 0.25)} />
                <div className="text-center">
                  {/* Nombre equipo: text-xl = 20px */}
                  <p className="text-xl font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                    {fixtures[0].homeTeam.shortName}
                  </p>
                  {/* Nombre completo: 13px */}
                  <p className="text-[13px] font-medium mt-0.5 hidden sm:block truncate max-w-[100px]" style={{ color: hex.text.secondary }}>
                    {localizeTeamName(fixtures[0].homeTeam.name, locale)}
                  </p>
                </div>
              </motion.div>

              <div className="flex flex-col items-center px-4 shrink-0 gap-2.5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${alphaOf('green', 0.14)}, ${alpha(hex.neutral.black, 0.65)})`,
                    border: `1px solid ${alphaOf('green', 0.28)}`,
                    boxShadow: `0 0 32px ${alphaOf('green', 0.14)}`,
                  }}>
                  {/* VS: 14px */}
                  <span className="text-sm font-black tracking-[0.10em]"
                    style={{ color: alphaOf('green', 0.80) }}>VS</span>
                </div>
                <div className="px-3 py-1.5 rounded-full text-center"
                  style={{ background: alphaOf('gold', 0.12), border: `1px solid ${alphaOf('gold', 0.25)}` }}>
                  {/* "GRUPO" — 11px decorativo */}
                  <span className="text-[11px] font-black tracking-[0.20em]"
                    style={{ color: `${hex.gold.base}aa` }}>GRUPO</span>
                </div>
              </div>

              <motion.div className="flex flex-col items-center gap-3 flex-1" whileHover={{ scale: 1.05 }}>
                <Flag url={fixtures[0].awayTeam.flagUrl} name={fixtures[0].awayTeam.name} size="lg" glow={alphaOf('green', 0.25)} />
                <div className="text-center">
                  <p className="text-xl font-black tracking-wider uppercase" style={{ color: hex.text.primary }}>
                    {fixtures[0].awayTeam.shortName}
                  </p>
                  <p className="text-[13px] font-medium mt-0.5 hidden sm:block truncate max-w-[100px]" style={{ color: hex.text.secondary }}>
                    {localizeTeamName(fixtures[0].awayTeam.name, locale)}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="h-px w-full mb-5"
              style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.20)}, transparent)` }} />

            <Link href={`/fixtures/${fixtures[0].id}`}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 18px 52px ${alphaOf('success', 0.65)}` }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full py-4 rounded-xl font-black text-white tracking-wide overflow-hidden flex items-center justify-center gap-2.5"
                style={{
                  background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base}, ${hex.green.hover})`,
                  boxShadow: `0 6px 28px ${alphaOf('success', 0.40)}`,
                  fontSize: '15px',
                  letterSpacing: '0.07em',
                }}
              >
                <motion.div className="absolute inset-0"
                  style={{ background: `linear-gradient(105deg, transparent 30%, ${alpha(hex.neutral.white, 0.22)} 50%, transparent 70%)` }}
                  animate={{ x: ['-130%', '130%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }} />
                <FiZap className="relative" size={16} />
                <span className="relative">{t('home.makePrediction')}</span>
                <FiChevronRight className="relative" size={15} />
              </motion.button>
            </Link>
          </>
        ) : (
          /* Multi-match list */
          <div className="flex flex-col gap-3">
            {fixtures.map((fixture, i) => (
              <motion.div
                key={fixture.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.07 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-2xl group"
                style={{
                  background: `linear-gradient(145deg, ${alphaOf('green', 0.05)} 0%, ${alpha(hex.bg.elevated, 0.65)} 100%)`,
                  border: `1px solid ${alphaOf('green', 0.14)}`,
                  transition: 'border-color 0.22s ease, transform 0.2s ease',
                }}
              >
                {/* Hover top line */}
                <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${hex.green.bright}99, transparent)` }} />

                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-4">
                  {/* Home team: mobile = bandera horizontal; sm+ = bandera+nombre apilados, fill space */}
                  <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5">
                    <Flag url={fixture.homeTeam.flagUrl} name={fixture.homeTeam.name} size="sm" />
                    <span className="hidden sm:block text-[11px] font-black tracking-wide truncate uppercase text-center w-full"
                      style={{ color: hex.text.primary }}>
                      {fixture.homeTeam.shortName}
                    </span>
                  </div>

                  {/* Time center */}
                  <div className="text-center shrink-0 px-1 sm:px-2 min-w-[64px] sm:min-w-[88px]">
                    <span className="text-[11px] sm:text-[12px] font-semibold block leading-none mb-1.5" style={{ color: hex.text.muted }}>
                      {fmtDay(fixture.kickoffAt, locale)}
                    </span>
                    <div className="px-2 sm:px-2.5 py-1 rounded-lg inline-block"
                      style={{ background: alphaOf('green', 0.12), border: `1px solid ${alphaOf('green', 0.22)}` }}>
                      <span className="text-[13px] sm:text-sm font-black leading-none tabular-nums"
                        style={{ color: hex.green.bright, textShadow: `0 0 14px ${alphaOf('green', 0.55)}` }}>
                        {fmtTime(fixture.kickoffAt, locale)}
                      </span>
                    </div>
                  </div>

                  {/* Away team: mobile = bandera horizontal; sm+ = bandera+nombre apilados, fill space */}
                  <div className="flex items-center justify-start gap-1.5 flex-1 min-w-0 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5">
                    <Flag url={fixture.awayTeam.flagUrl} name={fixture.awayTeam.name} size="sm" />
                    <span className="hidden sm:block text-[11px] font-black tracking-wide truncate uppercase text-center w-full"
                      style={{ color: hex.text.primary }}>
                      {fixture.awayTeam.shortName}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/fixtures/${fixture.id}`} className="shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: `0 8px 26px ${alphaOf('success', 0.58)}` }}
                      whileTap={{ scale: 0.93 }}
                      aria-label={t('common.predict')}
                      className="flex items-center gap-1.5 px-2.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl font-black text-white whitespace-nowrap"
                      style={{
                        background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`,
                        boxShadow: `0 3px 14px ${alphaOf('success', 0.35)}`,
                        fontSize: '12px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <FiZap size={12} />
                      <span className="hidden sm:inline">{t('common.predict')}</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: alphaOf('green', 0.08), border: `1px solid ${alphaOf('green', 0.18)}` }}>
            <span className="text-3xl">⚽</span>
          </div>
          {/* Estado vacío: text-sm = 14px */}
          <p className="text-sm font-semibold" style={{ color: hex.text.secondary }}>{t('home.noFixtures')}</p>
        </div>
      )}
    </div>
  </motion.div>
  );
};

export default UpcomingMatches;
