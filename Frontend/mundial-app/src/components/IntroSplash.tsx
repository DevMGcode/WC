'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FiActivity, FiAward, FiUsers, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { useT } from '@/hooks/useT';

const SPLASH_DURATION_MS   = 6500;
const SPLASH_EXIT_DELAY_MS = 1000;
const PROGRESS_TICK_MS     = 50;

const getProgress = (ms: number) => Math.min(100, Math.floor((ms / SPLASH_DURATION_MS) * 100));

/* ─── Feature icon/color configs (text translated at runtime) ─── */
const FEATURE_CFGS = [
  { icon: <FiActivity />,  color: '#22d3ee', glow: 'rgba(34,211,238,0.55)'  },
  { icon: <FiAward />,     color: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  },
  { icon: <FiUsers />,     color: '#34d399', glow: 'rgba(52,211,153,0.55)'  },
  { icon: <FiBarChart2 />, color: '#38bdf8', glow: 'rgba(56,189,248,0.55)'  },
  { icon: <FiCalendar />,  color: '#c084fc', glow: 'rgba(192,132,252,0.55)' },
];

/* ─── Fire power ring ─── */
const FireRing = ({ delay, size, color }: { delay: number; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      top: '50%', left: '50%',
      marginTop: -size / 2, marginLeft: -size / 2,
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 12px ${color}`,
    }}
    initial={{ scale: 0.3, opacity: 1 }}
    animate={{ scale: 2.8, opacity: 0 }}
    transition={{ duration: 1.6, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 3.8 }}
  />
);

/* ─── Ember particles ─── */
const Ember = ({ index }: { index: number }) => {
  const xBase = ((index * 29) % 100) - 50;
  const size  = 1.5 + (index % 3.5);
  const delay = (index * 0.18) % 3;
  const dur   = 1.2 + (index % 1.8);
  const colors = ['rgba(251,191,36,1)','rgba(249,115,22,0.95)','rgba(253,224,71,0.90)','rgba(239,68,68,0.85)','rgba(254,215,170,0.90)','rgba(252,165,30,0.95)'];
  const c = colors[index % colors.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, bottom: '30%', left: `calc(50% + ${xBase}px)`, background: c, boxShadow: `0 0 ${size * 4}px ${c}`, zIndex: 5 }}
      animate={{ y: [0, -(80 + (index % 70))], x: [0, Math.sin(index * 1.8) * 22], opacity: [0, 1, 0.8, 0], scale: [0.3, 1.4, 0.6, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ─── Speed line ─── */
const SpeedLine = ({ angle, index }: { angle: number; index: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 1, height: 80 + (index % 40),
      top: '50%', left: '50%', marginLeft: -0.5,
      transformOrigin: 'bottom center',
      transform: `rotate(${angle}deg) translateY(-115px)`,
      background: 'linear-gradient(to top, rgba(251,191,36,0.70), transparent)',
      filter: 'blur(0.5px)',
    }}
    animate={{ opacity: [0, 0.9, 0], scaleY: [0.4, 1, 0.4] }}
    transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.14 + 0.5, ease: 'easeInOut' }}
  />
);

/* ─── Background particle ─── */
const Particle = ({ index }: { index: number }) => {
  const x    = (index * 137.508) % 100;
  const size = 1.2 + (index % 2);
  const delay   = (index * 0.28) % 6;
  const duration = 9 + (index % 6);
  const cols: [string, string][] = [
    ['rgba(34,211,238,0.75)',  '0 0 8px rgba(34,211,238,0.9)'],
    ['rgba(56,189,248,0.70)',  '0 0 7px rgba(56,189,248,0.8)'],
    ['rgba(52,211,153,0.65)',  '0 0 7px rgba(52,211,153,0.8)'],
    ['rgba(251,191,36,0.65)',  '0 0 7px rgba(251,191,36,0.8)'],
    ['rgba(16,185,129,0.60)',  '0 0 6px rgba(16,185,129,0.7)'],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -6, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(350 + (index % 180))], x: [0, Math.sin(index * 1.2) * 35], opacity: [0, 0.85, 0.6, 0], scale: [0.5, 1.2, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ─── Scanline CRT overlay ─── */
const Scanlines = () => (
  <div
    className="absolute inset-0 pointer-events-none z-20"
    style={{
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      mixBlendMode: 'overlay',
    }}
  />
);

/* ─── Host nations banner ─── */
const HostNations = () => (
  <motion.div
    className="flex items-center gap-3"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 1.8 }}
  >
    {[
      { flag: '🇺🇸', name: 'USA',    color: '#B31942' },
      { flag: '🇲🇽', name: 'MÉXICO', color: '#006847' },
      { flag: '🇨🇦', name: 'CANADA', color: '#D80621' },
    ].map((n, i) => (
      <React.Fragment key={n.name}>
        {i > 0 && (
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        )}
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ scale: 1.08 }}
        >
          <span className="text-base leading-none">{n.flag}</span>
          <span
            className="text-[7px] font-black tracking-[0.22em] uppercase"
            style={{ color: n.color, textShadow: `0 0 8px ${n.color}80` }}
          >
            {n.name}
          </span>
        </motion.div>
      </React.Fragment>
    ))}
  </motion.div>
);

/* ─── Cycling feature highlight ─── */
type FeatureItem = { icon: React.ReactNode; text: string; color: string; glow: string };
const FeatureSpotlight = ({ featureIdx, features }: { featureIdx: number; features: FeatureItem[] }) => {
  const f = features[featureIdx % features.length];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={featureIdx}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${f.color}0d 0%, rgba(4,12,28,0.85) 100%)`,
          border: `1px solid ${f.color}28`,
          backdropFilter: 'blur(14px)',
          boxShadow: `0 4px 20px ${f.color}0a, inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Premium icon box */}
        <div className="relative shrink-0">
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ background: f.color, filter: 'blur(8px)', opacity: 0.22, transform: 'scale(1.2)' }}
          />
          <motion.div
            className="relative w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(145deg, ${f.color}20, rgba(1,4,14,0.8))`,
              border: `1px solid ${f.color}38`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
            animate={{ boxShadow: [`0 0 6px ${f.color}18`, `0 0 16px ${f.color}38`, `0 0 6px ${f.color}18`] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={{ color: f.color, filter: `drop-shadow(0 0 4px ${f.glow})`, fontSize: 13, display: 'flex' }}>
              {f.icon}
            </span>
          </motion.div>
        </div>
        <span
          className="text-[11px] font-bold tracking-[0.06em]"
          style={{ color: `${f.color}cc`, textShadow: `0 0 10px ${f.glow}40` }}
        >
          {f.text}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export function IntroSplash() {
  const { t } = useT();

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

  const [mounted,    setMounted]    = useState(false);
  const [showIntro,  setShowIntro]  = useState<boolean | null>(null);
  const [progress,   setProgress]   = useState(0);
  const [msgIndex,   setMsgIndex]   = useState(0);
  const [ballReady,  setBallReady]  = useState(false);
  const [textReady,  setTextReady]  = useState(false);
  const [featIdx,    setFeatIdx]    = useState(0);
  const [showInfo,   setShowInfo]   = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowIntro(true);
    setProgress(0);

    const ballTimer = window.setTimeout(() => setBallReady(true), 300);
    const textTimer = window.setTimeout(() => setTextReady(true), 1050);
    const infoTimer = window.setTimeout(() => setShowInfo(true), 1800);

    const startedAt = Date.now();
    let doneTimeout: number | null = null;

    const iv = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const p = getProgress(elapsed);
      setProgress(p);
      setMsgIndex(Math.min(LOADING_MESSAGES.length - 1, Math.floor(p / 20)));
      setFeatIdx(Math.floor(elapsed / 1200) % FEATURES.length);
      if (p >= 100) {
        window.clearInterval(iv);
        doneTimeout = window.setTimeout(() => setShowIntro(false), SPLASH_EXIT_DELAY_MS);
      }
    }, PROGRESS_TICK_MS);

    return () => {
      window.clearTimeout(ballTimer);
      window.clearTimeout(textTimer);
      window.clearTimeout(infoTimer);
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
          exit={{ opacity: 0, transition: { duration: 0.95, ease: 'easeInOut' } }}
          style={{ background: '#020810' }}
        >
          {/* ══ BACKGROUND LAYERS ══ */}

          {/* Stadium spotlight */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 55% 70% at 50% -5%, rgba(217,119,6,0.18) 0%, rgba(120,53,15,0.08) 45%, transparent 72%)',
          }} />

          {/* Cyan ambient bottom */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 40% at 50% 110%, rgba(6,182,212,0.09) 0%, transparent 70%)',
          }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
          }} />

          {/* Scanlines */}
          <Scanlines />

          {/* Pulsing core light */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 480, height: 480,
              top: '50%', left: '50%',
              marginTop: -300, marginLeft: -240,
              background: 'radial-gradient(circle, rgba(251,191,36,0.13) 0%, rgba(180,83,9,0.06) 45%, transparent 70%)',
              filter: 'blur(55px)',
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Tech grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.022 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="splash-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(34,211,238,1)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="splash-gfade" cx="50%" cy="44%" r="46%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="splash-gm"><rect width="100%" height="100%" fill="url(#splash-gfade)" /></mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#splash-grid)" mask="url(#splash-gm)" />
          </svg>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 22 }).map((_, i) => <Particle key={i} index={i} />)}
          </div>

          {/* ══ MAIN CONTENT ══ */}
          <div className="relative z-10 flex flex-col items-center w-full px-6">

            {/* ── MUNDIAL badge ── */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-[10px] font-bold tracking-[0.26em]"
              style={{
                color: 'rgba(253,230,138,0.92)',
                border: '1px solid rgba(217,119,6,0.32)',
                background: 'linear-gradient(135deg, rgba(120,53,15,0.30) 0%, rgba(30,13,2,0.50) 100%)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 0 24px rgba(217,119,6,0.10), inset 0 1px 0 rgba(251,191,36,0.12)',
              }}
            >
              <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              MUNDIAL 2026
            </motion.div>

            {/* ══ BALL HERO ══ */}
            <div className="relative flex items-center justify-center" style={{ width: 320, height: 290 }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <SpeedLine key={angle} angle={angle} index={i} />
              ))}

              <FireRing delay={0.7}  size={200} color="rgba(251,191,36,0.85)" />
              <FireRing delay={1.25} size={200} color="rgba(249,115,22,0.65)" />
              <FireRing delay={1.8}  size={200} color="rgba(251,191,36,0.45)" />

              {Array.from({ length: 18 }).map((_, i) => <Ember key={i} index={i} />)}

              {/* Fire glow pool */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 280, height: 280,
                  top: '50%', left: '50%',
                  marginTop: -140, marginLeft: -140,
                  background: 'radial-gradient(circle at 46% 56%, rgba(251,191,36,0.26) 0%, rgba(249,115,22,0.12) 38%, transparent 65%)',
                  filter: 'blur(30px)',
                }}
                animate={{ scale: [0.85, 1.18, 0.85], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <AnimatePresence>
                {ballReady && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.1, y: -80, rotate: -380, filter: 'blur(30px) brightness(6)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0, filter: 'blur(0px) brightness(1)' }}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Impact flash */}
                    <motion.div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 200, height: 200,
                        top: '50%', left: '50%',
                        marginTop: -100, marginLeft: -100,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.88) 0%, rgba(251,191,36,0.55) 35%, transparent 68%)',
                      }}
                      initial={{ scale: 0.4, opacity: 1 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />

                    <motion.div
                      animate={{ y: [0, -12, 0], rotate: [-3, 3.5, -3] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1, 1.14, 1.05, 1] }}
                        transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.4, 0.52, 0.64, 1], ease: 'easeInOut', delay: 2.5 }}
                      >
                        <motion.div
                          animate={{
                            filter: [
                              'drop-shadow(0 0 12px rgba(217,119,6,0.60)) drop-shadow(0 0 30px rgba(180,83,9,0.38))',
                              'drop-shadow(0 0 26px rgba(251,191,36,1.0)) drop-shadow(0 0 60px rgba(249,115,22,0.90)) drop-shadow(0 0 6px rgba(255,245,200,0.50))',
                              'drop-shadow(0 0 12px rgba(217,119,6,0.60)) drop-shadow(0 0 30px rgba(180,83,9,0.38))',
                            ],
                          }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Image
                            src="/Logo_Pestaña.png"
                            alt="Orionix Gol"
                            width={500} height={500}
                            priority
                            className="w-[230px] h-auto select-none relative"
                            style={{ zIndex: 10 }}
                          />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══ LOGO TEXT ══ */}
            <AnimatePresence>
              {textReady && (
                <motion.div
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 22, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Top accent line */}
                  <motion.div
                    className="mb-3"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: 180, height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.7), rgba(249,115,22,0.5), transparent)',
                      boxShadow: '0 0 8px rgba(251,191,36,0.4)',
                    }}
                  />

                  {/* Logo text image */}
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{ zIndex: 10 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(100deg, transparent 15%, rgba(255,255,255,0.22) 42%, rgba(253,230,138,0.14) 58%, transparent 82%)' }}
                        animate={{ x: ['-140%', '140%'] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5.5, delay: 0.5 }}
                      />
                    </motion.div>

                    <Image
                      src="/texto_logo_pestaña.png"
                      alt="Orionix Gol"
                      width={640} height={180}
                      priority
                      className="w-[280px] h-auto select-none relative"
                      style={{
                        mixBlendMode: 'screen',
                        zIndex: 8,
                        filter: 'drop-shadow(0 0 10px rgba(217,119,6,0.75)) drop-shadow(0 0 24px rgba(180,83,9,0.50)) brightness(1.18)',
                      }}
                    />
                  </div>

                  {/* Bottom accent line */}
                  <motion.div
                    className="mt-3"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: 120, height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)',
                      boxShadow: '0 0 6px rgba(34,211,238,0.3)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ══ APP INFO SECTION ══ */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Tagline */}
                  <motion.p
                    className="text-center text-[11px] font-semibold leading-relaxed"
                    style={{ color: 'rgba(148,163,184,0.55)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {t('splash.tagline')}{' '}
                    <span style={{ color: 'rgba(251,191,36,0.70)' }}>{t('common.worldCup')}</span>.{' '}
                    {t('splash.compete')}
                  </motion.p>

                  {/* Feature spotlight */}
                  <FeatureSpotlight featureIdx={featIdx} features={FEATURES} />

                  {/* Host nations */}
                  <HostNations />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ══ PROGRESS SECTION ══ */}
            <div className="w-[min(78vw,300px)] mt-5">
              {/* Progress bar */}
              <div
                className="relative h-[2px] w-full overflow-hidden rounded-full"
                style={{ background: 'rgba(2,8,18,1)', border: '1px solid rgba(34,211,238,0.08)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #0e7490, #22d3ee, #10b981)',
                    boxShadow: '0 0 10px rgba(34,211,238,0.65), 0 0 22px rgba(16,185,129,0.30)',
                  }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
                {/* Shimmer on bar */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Progress labels */}
              <div className="mt-2 flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={msgIndex}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.24 }}
                    className="text-[7.5px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: 'rgba(251,191,36,0.28)' }}
                  >
                    {LOADING_MESSAGES[msgIndex]}
                  </motion.span>
                </AnimatePresence>

                <motion.span
                  key={progress}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-black tabular-nums"
                  style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34,211,238,0.60)' }}
                >
                  {progress}%
                </motion.span>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 4, height: 4, background: i === 1 ? 'rgba(251,191,36,0.55)' : 'rgba(34,211,238,0.45)' }}
                  animate={{ scale: [1, 1.9, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.24, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
