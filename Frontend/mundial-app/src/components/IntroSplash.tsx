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
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#040912]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.18),transparent_35%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:30px_30px]" />

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mb-5 inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-cyan-100/90">
              MUNDIAL 2026
            </div>

            <div className="mx-auto mb-6 w-[min(78vw,420px)] rounded-[1.75rem] border border-cyan-300/20 bg-white/5 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.55)] backdrop-blur-sm">
              <Image
                src="/logotipo.jpeg"
                alt="Logotipo de Orionix Gol"
                width={840}
                height={840}
                priority
                className="h-auto w-full rounded-[1.25rem] object-cover"
              />
            </div>

            <p className="mb-7 text-sm font-semibold tracking-[0.2em] text-cyan-200/90 md:text-base">
              FOOTBALL TECH EXPERIENCE
            </p>

            <div className="mx-auto h-1.5 w-56 overflow-hidden rounded-full bg-slate-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${progress}%`, transition: 'width 60ms linear' }}
              />
            </div>

            <div className="mt-3 text-xs font-semibold tracking-[0.25em] text-cyan-100/90">
              CARGANDO {progress}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
