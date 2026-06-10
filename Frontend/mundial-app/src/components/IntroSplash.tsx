'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FiActivity, FiAward, FiUsers, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

const SPLASH_DURATION_MS   = 2500;
const SPLASH_EXIT_DELAY_MS = 600;
const PROGRESS_TICK_MS     = 100;

const getProgress = (ms: number) => Math.min(100, Math.floor((ms / SPLASH_DURATION_MS) * 100));

const FEATURE_CFGS = [
  { icon: <FiActivity />,  color: hex.green.bright, glow: alphaOf('green', 0.55)        },
  { icon: <FiAward />,     color: hex.gold.base,    glow: alpha(hex.gold.base, 0.55)    },
  { icon: <FiUsers />,     color: hex.green.hover,  glow: alpha(hex.green.hover, 0.55)  },
  { icon: <FiBarChart2 />, color: hex.green.soft,   glow: alpha(hex.green.soft, 0.55)   },
  { icon: <FiCalendar />,  color: '#c084fc',        glow: 'rgba(192,132,252,0.55)'      },
];

const HostNations = () => (
  <div className="flex items-center gap-3">
    {[
      { flag: '🇺🇸', name: 'USA',    color: '#B31942' },
      { flag: '🇲🇽', name: 'MÉXICO', color: '#006847' },
      { flag: '🇨🇦', name: 'CANADA', color: '#D80621' },
    ].map((n, i) => (
      <React.Fragment key={n.name}>
        {i > 0 && <div className="w-px h-3" style={{ background: alpha(hex.neutral.white, 0.08) }} />}
        <div className="flex items-center gap-1">
          <span className="text-base leading-none">{n.flag}</span>
          <span className="text-[7px] font-black tracking-[0.22em] uppercase" style={{ color: n.color }}>
            {n.name}
          </span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

type FeatureItem = { icon: React.ReactNode; text: string; color: string; glow: string };
const FeatureSpotlight = ({ featureIdx, features }: { featureIdx: number; features: FeatureItem[] }) => {
  const f = features[featureIdx % features.length];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={featureIdx}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${f.color}0d 0%, ${alpha(hex.bg.primary, 0.85)} 100%)`,
          border: `1px solid ${f.color}28`,
        }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(145deg, ${f.color}20, rgba(1,4,14,0.8))`, border: `1px solid ${f.color}38` }}
        >
          <span style={{ color: f.color, fontSize: 13, display: 'flex' }}>{f.icon}</span>
        </div>
        <span className="text-[11px] font-bold tracking-[0.06em]" style={{ color: `${f.color}cc` }}>
          {f.text}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export function IntroSplash() {
  const t = useTranslations();

  const FEATURES: FeatureItem[] = FEATURE_CFGS.map((cfg, i) => ({
    ...cfg,
    text: t(`splash.feature${i + 1}`),
  }));

  const LOADING_MESSAGES = [
    t('splash.loading1'),
    t('splash.loading2'),
    t('splash.loading3'),
    t('splash.loading4'),
    t('splash.loading5'),
  ];

  const [mounted,   setMounted]   = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [msgIndex,  setMsgIndex]  = useState(0);
  const [featIdx,   setFeatIdx]   = useState(0);
  const [contentIn, setContentIn] = useState(false);

  useEffect(() => {
    setMounted(true);

    // El splash se muestra UNA sola vez por sesión del navegador. En recargas o
    // navegaciones posteriores dentro de la misma sesión se omite por completo,
    // evitando pagar ~3 s de animación en cada carga de página.
    let alreadyShown = false;
    try { alreadyShown = window.sessionStorage.getItem('orionix.introShown') === '1'; } catch {}
    if (alreadyShown) {
      setShowIntro(false);
      return;
    }
    try { window.sessionStorage.setItem('orionix.introShown', '1'); } catch {}

    setShowIntro(true);
    setProgress(0);

    const contentTimer = window.setTimeout(() => setContentIn(true), 400);
    const startedAt    = Date.now();
    let doneTimeout: number | null = null;

    const iv = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const p = getProgress(elapsed);
      setProgress(p);
      setMsgIndex(Math.min(LOADING_MESSAGES.length - 1, Math.floor(p / 20)));
      setFeatIdx(Math.floor(elapsed / 900) % FEATURES.length);
      if (p >= 100) {
        window.clearInterval(iv);
        doneTimeout = window.setTimeout(() => setShowIntro(false), SPLASH_EXIT_DELAY_MS);
      }
    }, PROGRESS_TICK_MS);

    return () => {
      window.clearTimeout(contentTimer);
      window.clearInterval(iv);
      if (doneTimeout) window.clearTimeout(doneTimeout);
    };
  }, []);

  if (!mounted || showIntro === null) return null;

  return (
    <AnimatePresence>
      {showIntro === true && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          style={{ background: hex.bg.primary }}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 55% at 50% 38%, ${alphaOf('green', 0.06)} 0%, transparent 70%)`,
          }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, ${alpha(hex.neutral.black, 0.55)} 100%)`,
          }} />

          {/* ══ MAIN CONTENT ══ */}
          <div className="relative z-10 flex flex-col items-center w-full px-6">

            {/* MUNDIAL badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-[10px] font-bold tracking-[0.26em]"
              style={{
                color: 'rgba(253,230,138,0.92)',
                border: '1px solid rgba(217,119,6,0.32)',
                background: 'linear-gradient(135deg, rgba(120,53,15,0.30) 0%, rgba(30,13,2,0.50) 100%)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              MUNDIAL 2026
            </motion.div>

            {/* Logo */}
            <motion.div
              className="flex items-center justify-center"
              style={{ width: 220, height: 220 }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/Logo_Pestaña.png"
                alt="Orionix Gol"
                width={500} height={500}
                priority
                className="w-[180px] h-auto select-none"
                style={{
                  filter: `drop-shadow(0 0 18px ${alphaOf('green', 0.45)}) drop-shadow(0 4px 16px ${alpha(hex.neutral.black, 0.6)})`,
                }}
              />
            </motion.div>

            {/* Logo text */}
            <motion.div
              className="flex flex-col items-center mt-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 w-40 h-px" style={{
                background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.6)}, transparent)`,
              }} />
              <Image
                src="/texto_logo_pestaña.png"
                alt="Orionix Gol"
                width={640} height={180}
                priority
                className="w-[240px] h-auto select-none"
                style={{
                  mixBlendMode: 'screen',
                  filter: `drop-shadow(0 0 8px ${alphaOf('green', 0.5)}) brightness(1.15)`,
                }}
              />
              <div className="mt-3 w-24 h-px" style={{
                background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.45)}, transparent)`,
              }} />
            </motion.div>

            {/* Feature + host nations */}
            <AnimatePresence>
              {contentIn && (
                <motion.div
                  className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.p
                    className="text-center text-[11px] font-semibold"
                    style={{ color: 'rgba(148,163,184,0.5)' }}
                  >
                    {t('splash.tagline')}{' '}
                    <span style={{ color: alpha(hex.gold.base, 0.65) }}>{t('common.worldCup')}</span>.{' '}
                    {t('splash.compete')}
                  </motion.p>
                  <FeatureSpotlight featureIdx={featIdx} features={FEATURES} />
                  <HostNations />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-[min(78vw,300px)] mt-5">
              <div
                className="relative h-[2px] w-full overflow-hidden rounded-full"
                style={{ background: hex.bg.primary, border: `1px solid ${alphaOf('green', 0.08)}` }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.bright}, ${hex.green.hover})`,
                    boxShadow: `0 0 8px ${alphaOf('green', 0.50)}`,
                  }}
                  transition={{ duration: 0.04, ease: 'linear' }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={msgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[7.5px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: alpha(hex.gold.base, 0.25) }}
                  >
                    {LOADING_MESSAGES[msgIndex]}
                  </motion.span>
                </AnimatePresence>

                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: hex.green.bright }}
                >
                  {progress}%
                </span>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 4, height: 4, background: i === 1 ? alpha(hex.gold.base, 0.45) : alphaOf('green', 0.35) }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
