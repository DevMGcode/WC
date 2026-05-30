'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

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
        /* ── TORNEO EN CURSO ── */
        <motion.div
          key="started"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-5"
          style={{
            background: `linear-gradient(135deg, ${alphaOf('success', 0.38)} 0%, ${alpha(hex.bg.soft, 0.95)} 50%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
            border: `1px solid ${alphaOf('success', 0.35)}`,
            boxShadow: `0 16px 56px ${alpha(hex.neutral.black, 0.60)}, inset 0 1px 0 ${alphaOf('success', 0.10)}`,
          }}
        >
          {/* Top multicolor line */}
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright}, ${hex.green.hover}, ${hex.gold.base})` }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 px-6 py-6">
            {/* Trophy icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(145deg, ${alphaOf('gold', 0.22)}, ${alpha(hex.neutral.black, 0.60)})`,
                border: `1px solid ${alphaOf('gold', 0.30)}`,
                boxShadow: `0 0 28px ${alphaOf('gold', 0.18)}`,
              }}>
              <span className="text-4xl">🏆</span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              {/* "EN CURSO" — 11px decorativo uppercase */}
              <p className="text-[11px] font-black tracking-[0.36em] uppercase mb-2"
                style={{ color: alphaOf('success', 0.70) }}>{t('home.ongoing')}</p>
              {/* Título principal: 22px / text-2xl */}
              <p className="text-xl sm:text-2xl font-black leading-tight"
                style={{
                  background: `linear-gradient(90deg, ${hex.gold.base}, ${hex.green.hover}, ${hex.green.bright})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                {t('home.started')}
              </p>
              {/* Subtítulo: 14px mínimo */}
              <p className="text-sm mt-2" style={{ color: hex.text.secondary }}>{t('home.registerPredictions')}</p>
            </div>

            {/* Badge LIVE — 12px */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{ border: `1px solid ${alphaOf('green', 0.35)}`, background: alphaOf('green', 0.12) }}>
              <motion.span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: hex.green.bright }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[12px] font-black tracking-[0.20em] uppercase text-orionix-green-soft">{t('home.live')}</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── COUNTDOWN ── */
        <motion.div
          key="countdown"
          data-tour="countdown"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-5"
          style={{
            background: `linear-gradient(135deg, ${alpha(hex.gold.dark, 0.22)} 0%, ${alpha(hex.bg.soft, 0.94)} 40%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
            border: `1px solid ${alphaOf('gold', 0.28)}`,
            boxShadow: `0 16px 52px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alphaOf('gold', 0.08)}`,
          }}
        >
          {/* Top gold glow line */}
          <div className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}99, transparent)` }} />
          {/* Ambient orb */}
          <div className="absolute -top-16 right-8 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.10)} 0%, transparent 70%)`, filter: 'blur(36px)' }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 px-5 sm:px-7 py-5 sm:py-6">

            {/* Ícono + título */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(145deg, ${alphaOf('gold', 0.20)}, ${alpha(hex.neutral.black, 0.55)})`,
                  border: `1px solid ${alphaOf('gold', 0.30)}`,
                  boxShadow: `0 0 20px ${alphaOf('gold', 0.15)}`,
                }}>
                <span className="text-2xl leading-none">⏱</span>
              </div>
              <div>
                {/* "INICIO DEL MUNDIAL" — 11px decorativo */}
                <p className="text-[11px] font-black tracking-[0.28em] uppercase leading-none mb-1"
                  style={{ color: `${hex.gold.base}80` }}>{t('home.worldCupStart')}</p>
                {/* "FIFA WORLD CUP" — 14px mínimo */}
                <p className="text-sm font-black leading-none" style={{ color: hex.gold.bright }}>{t('common.worldCup')}</p>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className="hidden sm:block w-px h-12 self-center shrink-0"
              style={{ background: alphaOf('gold', 0.18) }} />

            {/* Dígitos del countdown — números grandes (3xl/4xl) */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-center sm:justify-start">
              {cdUnits.map(({ val, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <span className="font-black text-2xl sm:text-3xl pb-5 shrink-0"
                      style={{ color: alphaOf('gold', 0.35) }}>:</span>
                  )}
                  <div className="flex flex-col items-center px-2.5 py-2 rounded-xl min-w-[52px] sm:min-w-[60px]"
                    style={{
                      background: alphaOf('gold', 0.07),
                      border: `1px solid ${alphaOf('gold', 0.16)}`,
                      boxShadow: `inset 0 1px 0 ${alpha(hex.neutral.white, 0.05)}`,
                    }}>
                    <motion.p
                      key={val}
                      className="font-black tabular-nums leading-none"
                      style={{
                        fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
                        color: hex.gold.soft,
                        textShadow: `0 0 26px ${alphaOf('gold', 0.65)}`,
                      }}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.18 }}
                    >{val}</motion.p>
                    {/* Label unidad: mínimo 11px, contraste visible */}
                    <p className="text-[11px] font-bold tracking-[0.18em] uppercase mt-1"
                      style={{ color: `${hex.gold.base}80` }}>{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Sedes: código país 11px */}
            <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
              <p className="text-[10px] font-black tracking-[0.26em] uppercase"
                style={{ color: alpha(hex.neutral.white, 0.35) }}>SEDE</p>
              <div className="flex items-center gap-2.5">
                {[
                  { flag: '🇺🇸', code: 'USA', color: hex.host.usaRed },
                  { flag: '🇲🇽', code: 'MEX', color: hex.host.mexGreen },
                  { flag: '🇨🇦', code: 'CAN', color: hex.host.canRed },
                ].map((n, i) => (
                  <React.Fragment key={n.code}>
                    {i > 0 && <span className="text-white/15 text-sm">·</span>}
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{n.flag}</span>
                      <span className="text-[11px] font-black tracking-[0.14em]" style={{ color: n.color }}>{n.code}</span>
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
