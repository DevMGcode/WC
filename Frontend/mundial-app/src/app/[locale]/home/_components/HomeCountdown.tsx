'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { MS, WORLD_CUP_START } from '@/constants/tournament';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HomeCountdownProps {
  countdown: CountdownState;
  mundialStarted: boolean;
  t: (key: string) => string;
}

const HomeCountdown = ({ countdown, mundialStarted, t }: HomeCountdownProps) => {
  const cdUnits = [
    { val: String(countdown.days).padStart(2, '0'),    label: t('home.time.days')    },
    { val: String(countdown.hours).padStart(2, '0'),   label: t('home.time.hours')   },
    { val: String(countdown.minutes).padStart(2, '0'), label: t('home.time.minutes') },
    { val: String(countdown.seconds).padStart(2, '0'), label: t('home.time.seconds') },
  ];

  return (
    <AnimatePresence mode="wait">
      {mundialStarted ? (
        <motion.div
          key="started"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-4"
          style={{
            background: `linear-gradient(135deg, ${alphaOf('success', 0.40)} 0%, ${alpha(hex.bg.primary, 0.97)} 50%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
            border: `1px solid ${alphaOf('success', 0.30)}`,
            boxShadow: `0 12px 48px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alphaOf('success', 0.08)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright}, ${hex.green.hover}, ${hex.gold.base})` }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 px-6 py-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(145deg, ${alphaOf('gold', 0.20)}, ${alpha(hex.neutral.black, 0.60)})`,
                border: `1px solid ${alphaOf('gold', 0.28)}`,
              }}>
              <span className="text-3xl">🏆</span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-[8px] font-black tracking-[0.40em] uppercase mb-1.5"
                style={{ color: alphaOf('success', 0.55) }}>{t('home.ongoing')}</p>
              <p className="text-xl sm:text-2xl font-black leading-tight"
                style={{
                  background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                {t('home.started')}
              </p>
              <p className="text-[10px] mt-1.5 tracking-wide text-orionix-text-muted">{t('home.registerPredictions')}</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full shrink-0"
              style={{ border: `1px solid ${alphaOf('green', 0.28)}`, background: alphaOf('green', 0.08) }}>
              <span className="w-2 h-2 rounded-full" style={{ background: hex.green.bright, opacity: 0.9 }} />
              <span className="text-[9px] font-black tracking-[0.24em] uppercase text-orionix-green-soft">{t('home.live')}</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="countdown"
          data-tour="countdown"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-4"
          style={{
            background: `linear-gradient(135deg, ${alpha(hex.gold.dark, 0.18)} 0%, ${alpha(hex.bg.primary, 0.97)} 45%, ${alpha(hex.bg.secondary, 0.97)} 100%)`,
            border: `1px solid ${alphaOf('gold', 0.22)}`,
            boxShadow: `0 12px 40px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alphaOf('gold', 0.06)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}80, transparent)` }} />
          <div className="absolute -top-12 right-8 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.08)} 0%, transparent 70%)`, filter: 'blur(32px)' }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-4 px-5 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(145deg, ${alphaOf('gold', 0.18)}, ${alpha(hex.neutral.black, 0.55)})`,
                  border: `1px solid ${alphaOf('gold', 0.28)}`,
                }}>
                <span className="text-xl leading-none">⏱</span>
              </div>
              <div>
                <p className="text-[8px] font-black tracking-[0.34em] uppercase leading-none mb-0.5"
                  style={{ color: `${hex.gold.base}66` }}>{t('home.worldCupStart')}</p>
                <p className="text-sm font-black leading-none" style={{ color: hex.gold.bright }}>{t('common.worldCup')}</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 self-center shrink-0"
              style={{ background: alphaOf('gold', 0.14) }} />

            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-start">
              {cdUnits.map(({ val, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="font-black text-xl sm:text-2xl" style={{ color: alphaOf('gold', 0.30) }}>:</span>}
                  <div className="flex flex-col items-center px-1.5 py-1 rounded-lg min-w-[44px]"
                    style={{ background: alphaOf('gold', 0.05), border: `1px solid ${alphaOf('gold', 0.12)}` }}>
                    <motion.p
                      key={val}
                      className="text-2xl sm:text-3xl font-black tabular-nums leading-none"
                      style={{ color: hex.gold.soft, textShadow: `0 0 22px ${alphaOf('gold', 0.60)}` }}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.18 }}
                    >{val}</motion.p>
                    <p className="text-[6.5px] font-bold tracking-[0.22em] uppercase mt-0.5"
                      style={{ color: `${hex.gold.base}50` }}>{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
              <p className="text-[7px] font-black tracking-[0.30em] uppercase"
                style={{ color: alpha(hex.neutral.white, 0.20) }}>SEDE</p>
              <div className="flex items-center gap-2">
                {[
                  { flag: '🇺🇸', code: 'USA', color: hex.host.usaRed },
                  { flag: '🇲🇽', code: 'MEX', color: hex.host.mexGreen },
                  { flag: '🇨🇦', code: 'CAN', color: hex.host.canRed },
                ].map((n, i) => (
                  <React.Fragment key={n.code}>
                    {i > 0 && <span className="text-white/10 text-xs">·</span>}
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{n.flag}</span>
                      <span className="text-[7px] font-black tracking-[0.18em]" style={{ color: n.color }}>{n.code}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomeCountdown;
