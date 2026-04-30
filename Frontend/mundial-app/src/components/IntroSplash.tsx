'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const SPLASH_DURATION_MS = 10000;
const SPLASH_EXIT_DELAY_MS = 1700;
const PROGRESS_TICK_MS = 60;

const getProgress = (elapsedMs: number) => {
  return Math.min(100, Math.floor((elapsedMs / SPLASH_DURATION_MS) * 100));
};

// Animated particles background
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0,
          }}
          animate={{
            y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
            opacity: [0, 0.6, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export function IntroSplash() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    setShowIntro(true);
    setProgress(0);

    const startedAt = Date.now();
    let doneTimeout: number | null = null;

    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = getProgress(elapsed);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(progressInterval);
        doneTimeout = window.setTimeout(() => {
          setShowIntro(false);
        }, SPLASH_EXIT_DELAY_MS);
      }
    }, PROGRESS_TICK_MS);

    return () => {
      window.clearInterval(progressInterval);
      if (doneTimeout) {
        window.clearTimeout(doneTimeout);
      }
    };
  }, []);

  if (!mounted || showIntro === null) {
    return null;
  }

  return (
    <AnimatePresence>
      {showIntro === true && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
          style={{
            background: 'linear-gradient(135deg, #040912 0%, #0a1828 25%, #051015 50%, #0a1828 75%, #040912 100%)',
          }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-40"
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.25) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.2) 0%, transparent 35%)',
                'radial-gradient(circle at 30% 70%, rgba(34,211,238,0.2) 0%, transparent 35%), radial-gradient(circle at 70% 30%, rgba(16,185,129,0.25) 0%, transparent 35%)',
                'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.25) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.2) 0%, transparent 35%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Grid background */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Particle field */}
          <ParticleField />

          {/* Glow effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            className="relative z-10 text-center px-4"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-8 inline-flex rounded-full border border-cyan-300/50 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 px-5 py-2 text-xs font-bold tracking-[0.25em] text-cyan-100 backdrop-blur-sm shadow-[0_8px_20px_rgba(6,182,212,0.2)]"
            >
              🌍 MUNDIAL 2026
            </motion.div>

            {/* Logo container with animation */}
            <motion.div
              className="mx-auto mb-10 w-[min(80vw,380px)]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-white/8 to-cyan-400/5 p-4 shadow-[0_24px_80px_rgba(6,182,212,0.3)] backdrop-blur-md overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                
                <Image
                  src="/logotipo_Orionix_Gol_transparente.png"
                  alt="Logotipo de Orionix Gol"
                  width={840}
                  height={840}
                  priority
                  className="h-auto w-full rounded-[1.5rem] object-cover drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                />
              </div>
            </motion.div>

            {/* Subtitle with staggered animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="mb-1 text-2xl md:text-3xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                ORIONIX GOL
              </h1>
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-cyan-200/85 mb-8">
                FOOTBALL TECH EXPERIENCE
              </p>
            </motion.div>

            {/* Advanced progress bar */}
            <div className="mx-auto max-w-xs">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-cyan-300/30 backdrop-blur-sm shadow-inner">
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-emerald-400/20 to-cyan-400/20 blur-md"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Progress fill */}
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  style={{ width: `${progress}%` }}
                  transition={{ width: '60ms linear' }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Progress text with value */}
              <motion.div
                className="mt-5 flex items-center justify-center gap-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs font-bold tracking-[0.25em] text-cyan-100/90">
                  CARGANDO
                </span>
                <span className="text-base font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                  {progress}%
                </span>
              </motion.div>
            </div>

            {/* Loading message */}
            <motion.div
              className="mt-8 text-xs font-semibold tracking-[0.15em] text-cyan-200/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              Preparando experiencia premium...
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
