'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiTarget, FiAward, FiBarChart2, FiGlobe } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { CountBox, Ember, FireRing } from './LoginParticles';
import type { CountdownTime } from '@/hooks/useCountdown';

const Trophy3D = dynamic(() => import('@/components/Trophy3D'), { ssr: false });

interface FeatureChip { icon: React.ReactNode; label: string; color: string; glow: string; bg: string; border: string; }

// Construye chips traducidos en runtime para que respeten el locale activo.
function buildFeatures(t: (key: string) => string): FeatureChip[] {
  return [
    { icon: <FiTarget />,    label: t('hero.chipPredictions'),    color: hex.green.bright, glow: alphaOf('green', 0.40),       bg: alphaOf('green', 0.08),       border: alphaOf('green', 0.20) },
    { icon: <FiAward />,     label: t('hero.chipPrivateLeagues'), color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),   bg: alpha(hex.gold.base, 0.07),   border: alpha(hex.gold.base, 0.20) },
    { icon: <FiBarChart2 />, label: t('hero.chipStatistics'),     color: hex.green.hover,  glow: alpha(hex.green.hover, 0.40), bg: alpha(hex.green.hover, 0.07), border: alpha(hex.green.hover, 0.20) },
    { icon: <FiGlobe />,     label: t('hero.chipWorldCup'),       color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),   bg: alpha(hex.gold.base, 0.07),   border: alpha(hex.gold.base, 0.20) },
  ];
}

function FeatureChipItem({ chip, index, sm }: { chip: FeatureChip; index: number; sm: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: sm ? 8 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (sm ? 0.25 : 0.95) + index * (sm ? 0.08 : 0.09), duration: sm ? 0.4 : 0.5 }}
      className={`flex items-center ${sm ? 'gap-2 px-2.5 py-1.5' : 'gap-2.5 px-3 py-2'} rounded-full select-none`}
      style={{ background: chip.bg, border: `1px solid ${chip.border}`, backdropFilter: 'blur(12px)' }}
    >
      <div className="relative shrink-0">
        <div className={`absolute inset-0 ${sm ? 'rounded-md' : 'rounded-lg'} pointer-events-none`}
          style={{ background: chip.glow, filter: 'blur(8px)', opacity: 0.25, transform: 'scale(1.2)' }} />
        <motion.div
          className={`relative ${sm ? 'w-5 h-5 rounded-md' : 'w-6 h-6 rounded-lg'} flex items-center justify-center`}
          style={{ background: `linear-gradient(145deg, ${chip.bg}, ${alpha(hex.bg.primary, 0.85)})`, border: `1px solid ${chip.color}35` }}
          animate={{ boxShadow: [`0 0 6px ${chip.color}15`, `0 0 16px ${chip.color}38`, `0 0 6px ${chip.color}15`] }}
          transition={{ duration: 2.5 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span style={{ color: chip.color, fontSize: sm ? 11 : 13, filter: `drop-shadow(0 0 4px ${chip.color})` }}>
            {chip.icon}
          </span>
        </motion.div>
      </div>
      <span className={`text-[${sm ? '10' : '11'}px] font-bold`}
        style={{ color: alpha(hex.accent.slateLight, sm ? 0.85 : 0.88) }}>
        {chip.label}
      </span>
    </motion.div>
  );
}

export interface LoginHeroProps { countdown: CountdownTime; predCount: number; started: boolean; }

export default function LoginHero({ countdown, predCount, started }: LoginHeroProps) {
  const t = useTranslations('auth');
  const FEATURES = buildFeatures(t);
  return (
    <>
      {/* ── MOBILE HEADER (hidden lg+) ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex lg:hidden flex-col items-center gap-4 w-full pt-2"
      >
        {/* Logo completo mobile */}
        <motion.div className="flex flex-col items-center gap-2">
          <motion.div className="relative shrink-0" style={{ width: 160, height: 160 }}
            animate={{ filter: [`drop-shadow(0 0 14px ${alpha(hex.gold.base, 0.60)})`, `drop-shadow(0 0 28px ${alpha(hex.gold.base, 0.90)})`, `drop-shadow(0 0 14px ${alpha(hex.gold.base, 0.60)})`] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
            <Image src="/logotipo_Orionix_Gol_transparente.png" alt="Orionix Gol" fill sizes="160px"
              style={{ objectFit: 'contain' }} />
          </motion.div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.55)})` }} />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase"
              style={{ color: hex.gold.base, textShadow: `0 0 16px ${alpha(hex.gold.base, 0.50)}` }}>
              MUNDIAL 2026
            </span>
            <div style={{ width: 20, height: 1, background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.55)}, transparent)` }} />
          </div>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURES.map((chip, i) => <FeatureChipItem key={chip.label} chip={chip} index={i} sm />)}
        </div>
      </motion.div>

      {/* ── DESKTOP HERO (hidden mobile) ── */}
      <motion.div
        initial={{ opacity: 0, x: -55 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-1 flex-col items-center gap-4"
      >
        {/* Logo completo desktop */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.85 }}
          className="flex flex-col items-center gap-0">
          {/* Halo dorado pulsante detrás del logo */}
          <div className="relative flex items-center justify-center">
            <motion.div className="absolute rounded-full pointer-events-none"
              style={{ width: 300, height: 300, background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.04)} 0%, transparent 68%)`, filter: 'blur(28px)' }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="relative" style={{ width: 220, height: 220 }}
              animate={{ filter: [
                `drop-shadow(0 0 8px ${alpha(hex.gold.base, 0.18)})`,
                `drop-shadow(0 0 16px ${alpha(hex.gold.base, 0.30)}) drop-shadow(0 0 32px ${alpha(hex.gold.base, 0.10)})`,
                `drop-shadow(0 0 8px ${alpha(hex.gold.base, 0.18)})`,
              ]}}
              transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}>
              <Image src="/logotipo_Orionix_Gol_transparente.png" alt="Orionix Gol" fill sizes="220px"
                style={{ objectFit: 'contain' }} />
            </motion.div>
          </div>
          {/* MUNDIAL 2026 debajo del logo */}
          <div className="flex items-center gap-3" style={{ marginTop: -18 }}>
            <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              style={{ width: 36, height: 1.5, background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.65)})`, borderRadius: 1 }} />
            <span className="text-[13px] font-black tracking-[0.35em] uppercase"
              style={{ color: hex.gold.base, textShadow: `0 0 20px ${alpha(hex.gold.base, 0.55)}` }}>
              MUNDIAL 2026
            </span>
            <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              style={{ width: 36, height: 1.5, background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.65)}, transparent)`, borderRadius: 1 }} />
          </div>
        </motion.div>

        {/* Tagline — animated letter by letter */}
        <div className="flex items-center gap-3">
          <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.60)})` }} />
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: alphaOf('green', 0.50) }}>
            {t('hero.tagline').split('').map((char, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.035, duration: 0.25 }}>{char}</motion.span>
            ))}
          </p>
          <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.60)}, transparent)` }} />
        </div>

        {/* Trophy 3D Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center w-full" style={{ height: 480 }}
        >
          {/* Amber glow halo */}
          <motion.div className="absolute pointer-events-none rounded-full"
            style={{ width: 300, height: 300, top: '50%', left: '50%', marginTop: -150, marginLeft: -150, background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.18)} 0%, ${alpha(hex.accent.orange, 0.08)} 45%, transparent 70%)`, filter: 'blur(36px)', zIndex: 0 }}
            animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Trophy canvas */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <motion.div className="absolute -inset-[3px] rounded-2xl pointer-events-none"
              style={{ border: `1px solid ${alphaOf('green', 0.14)}` }}
              animate={{ boxShadow: [
                `0 0 18px ${alphaOf('green', 0.12)}, 0 0 40px ${alpha(hex.gold.base, 0.06)}`,
                `0 0 36px ${alphaOf('green', 0.28)}, 0 0 70px ${alpha(hex.gold.base, 0.14)}`,
                `0 0 18px ${alphaOf('green', 0.12)}, 0 0 40px ${alpha(hex.gold.base, 0.06)}`,
              ]}} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Trophy3D />
          </div>
          {/* Fire rings */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            <FireRing delay={0.8} size={220} color={alpha(hex.gold.base, 0.50)} />
            <FireRing delay={1.8} size={220} color={alpha(hex.accent.orange, 0.32)} />
          </div>
          {/* Embers */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
            {Array.from({ length: 12 }).map((_, i) => <Ember key={i} index={i} />)}
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.7 }}
          className="flex flex-col items-center gap-2">
          {started ? (
            /* Mundial en curso: el contador ya no aplica — invitación a jugar */
            <>
              <p className="text-[8px] font-bold tracking-[0.32em] uppercase" style={{ color: alpha(hex.gold.base, 0.42) }}>
                {t('hero.liveLabel')}
              </p>
              <motion.p
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.25, duration: 0.6 }}
                className="text-xl sm:text-2xl font-black tracking-[0.04em] text-center uppercase"
                style={{
                  background: `linear-gradient(95deg, ${hex.gold.bright} 0%, ${hex.gold.base} 35%, ${hex.green.bright} 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 18px ${alphaOf('gold', 0.30)})`,
                }}>
                {t('hero.liveTagline')}
              </motion.p>
              <div className="h-px w-32" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('gold', 0.40)}, transparent)` }} />
            </>
          ) : (
            <>
              <p className="text-[8px] font-bold tracking-[0.32em] uppercase" style={{ color: alpha(hex.gold.base, 0.42) }}>
                {t('hero.countdownLabel')}
              </p>
              <div className="flex items-end gap-2">
                <CountBox value={countdown.days}    label={t('hero.days')} />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.hours}   label={t('hero.hours')} />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.minutes} label={t('hero.minutes')} />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.seconds} label={t('hero.seconds')} />
              </div>
            </>
          )}
          {predCount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
              className="flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: hex.green.bright }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              <span className="text-[9px] font-semibold tracking-wider" style={{ color: alpha(hex.green.hover, 0.50) }}>
                {t('hero.predictionsMade', { count: predCount })}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Feature chips */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3">
          {FEATURES.map((chip, i) => <FeatureChipItem key={chip.label} chip={chip} index={i} sm={false} />)}
        </motion.div>

        {/* CTA registro gratuito */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="flex flex-col items-center gap-2">
          <motion.div
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
            style={{ background: alpha(hex.gold.base, 0.07), border: `1px solid ${alpha(hex.gold.base, 0.25)}` }}
            animate={{ boxShadow: [`0 0 10px ${alpha(hex.gold.base, 0.08)}`, `0 0 22px ${alpha(hex.gold.base, 0.20)}`, `0 0 10px ${alpha(hex.gold.base, 0.08)}`] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <motion.div className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: hex.gold.bright }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-[11px] font-black tracking-[0.22em] uppercase"
              style={{ color: hex.gold.base }}>
              Registro gratuito
            </span>
            <span className="text-[10px]" style={{ color: alpha(hex.accent.slateLight, 0.40) }}>·</span>
            <span className="text-[11px] font-semibold" style={{ color: alpha(hex.accent.slateLight, 0.55) }}>
              Sin tarjeta de crédito
            </span>
          </motion.div>
          <p className="text-[10px] text-center" style={{ color: alpha(hex.accent.slateLight, 0.35) }}>
            Sigue el Mundial en vivo · Compite con amigos · Sube en el ranking
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}
