'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiActivity, FiCrosshair, FiAward, FiBarChart2, FiCalendar, FiLock, FiLogOut } from 'react-icons/fi';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';
import { EQBars, Ring, GlowBar, SectionLabel } from './ui';
import { fmtMonthYear } from '@/utils/format';

interface Stats {
  predictions: number;
  acertadas: number;
  puntos: number;
  rankGlobal: number;
}

interface ProfileTabProps {
  user: { displayName: string; email: string; joinedAt: Date };
  stats: Stats;
  t: (key: string) => string;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export default function ProfileTab({ user, stats, t, onEditProfile, onChangePassword, onLogout }: ProfileTabProps) {
  const locale = useLocale();
  const accuracyPct = stats.predictions > 0
    ? Math.round((stats.acertadas / stats.predictions) * 100) : 0;

  return (
    <motion.div
      key="profile"
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {/* Hero card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
        style={{
          background: surfaces.card(),
          border: `1px solid ${alphaOf('green', 0.18)}`,
          backdropFilter: 'blur(32px)',
          boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.03)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.65)}, transparent)` }} />
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${alphaOf('green', 0.09)} 0%, transparent 65%)`, filter: 'blur(28px)' }} />

        <div className="relative flex items-center gap-5">
          <div className="relative shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `1.5px solid ${alphaOf('green', 0.35)}` }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            />
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-white"
              style={{
                background: `linear-gradient(145deg, ${alphaOf('green', 0.22)}, ${alpha(hex.green.hover, 0.18)})`,
                border: `1px solid ${alphaOf('green', 0.30)}`,
                boxShadow: `0 0 24px ${alphaOf('green', 0.22)}`,
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              }}
            >
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="font-black text-xl sm:text-2xl leading-tight text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(90deg, ${hex.accent.slateLight}, ${hex.accent.slate})` }}
            >
              {user.displayName}
            </p>
            <p className="text-xs mt-0.5 truncate text-orionix-text-muted">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <FiCalendar size={10} style={{ color: alphaOf('green', 0.60) }} />
              <p className="text-[10px] font-semibold" style={{ color: alphaOf('green', 0.60) }}>
                {t('profile.memberSince')} {fmtMonthYear(user.joinedAt, locale)}
              </p>
            </div>
          </div>

          <motion.button
            onClick={onEditProfile}
            whileHover={{ scale: 1.06, boxShadow: `0 0 20px ${alphaOf('green', 0.30)}` }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide"
            style={{
              background: alphaOf('green', 0.10),
              border: `1px solid ${alphaOf('green', 0.28)}`,
              color: hex.green.bright,
            }}
          >
            <FiEdit3 size={13} />
            <span className="hidden sm:inline">{t('common.edit')}</span>
          </motion.button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <FiActivity />,  value: stats.predictions, label: t('profile.stats.predictions'), color: hex.green.bright, glow: hex.green.bright, bg: alphaOf('green', 0.07),       delay: 0.05 },
          { icon: <FiCrosshair />, value: stats.acertadas,   label: t('profile.stats.exact'),       color: hex.green.hover,  glow: hex.green.hover,  bg: alpha(hex.green.hover, 0.07), delay: 0.10 },
          { icon: <FiAward />,     value: stats.puntos,      label: t('profile.stats.points'),      color: hex.gold.base,    glow: hex.gold.base,    bg: alpha(hex.gold.base, 0.07),   delay: 0.15 },
          { icon: <FiBarChart2 />, value: stats.rankGlobal > 0 ? `#${stats.rankGlobal}` : '—', label: t('profile.stats.ranking'), color: hex.green.soft, glow: hex.green.soft, bg: alpha(hex.green.soft, 0.07), delay: 0.20 },
        ].map(({ icon, value, label, color, glow, bg, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, scale: 1.03 }}
            className="relative overflow-hidden rounded-2xl p-4 cursor-default"
            style={{
              background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.96)})`,
              border: `1px solid ${glow}30`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 28px ${glow}14, inset 0 1px 0 ${alpha(hex.neutral.white, 0.03)}`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black tracking-[0.26em] uppercase" style={{ color: `${glow}80` }}>{label}</p>
              <span style={{ color, fontSize: 13, filter: `drop-shadow(0 0 5px ${glow})` }}>{icon}</span>
            </div>
            <motion.p
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color, textShadow: `0 0 20px ${glow}80` }}
              animate={{ textShadow: [`0 0 16px ${glow}70`, `0 0 30px ${glow}`, `0 0 16px ${glow}70`] }}
              transition={{ duration: 2.8 + delay * 4, repeat: Infinity }}
            >
              {value}
            </motion.p>
            <div className="mt-2">
              <EQBars color={`${glow}80`} count={8} maxH={12} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5"
        style={{
          background: surfaces.card(),
          border: `1px solid ${alpha(hex.green.hover, 0.15)}`,
          backdropFilter: 'blur(28px)',
          boxShadow: `0 24px 60px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.green.hover, 0.55)}, transparent)` }} />
        <SectionLabel color={hex.green.hover}>{t('profile.performance')}</SectionLabel>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Ring value={accuracyPct} max={100} size={80} stroke={6} color={hex.green.hover} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-black leading-none tabular-nums text-orionix-green-soft"
                style={{ textShadow: `0 0 14px ${alpha(hex.green.hover, 0.8)}` }}>
                {accuracyPct}%
              </p>
              <p className="text-[6px] font-black tracking-[0.2em] uppercase mt-0.5 text-orionix-text-muted">{t('profile.stats.exact')}</p>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {[
              { label: t('profile.stats.predictions'), value: stats.predictions, max: 64,                     color: hex.green.bright },
              { label: t('profile.stats.exact'),       value: stats.acertadas,   max: stats.predictions || 1, color: hex.green.hover  },
              { label: t('profile.stats.points'),      value: stats.puntos,      max: 192,                    color: hex.gold.base    },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold tracking-wide text-orionix-text-muted">{label}</span>
                  <span className="text-[10px] font-black tabular-nums" style={{ color }}>{value}</span>
                </div>
                <GlowBar value={value} max={max} color={color} height={3} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div
        className="relative overflow-hidden rounded-3xl p-5"
        style={{
          background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, rgba(14,4,4,0.96))`,
          border: `1px solid ${alpha(hex.accent.red, 0.12)}`,
          backdropFilter: 'blur(28px)',
          boxShadow: `0 24px 60px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.accent.red, 0.35)}, transparent)` }} />
        <SectionLabel color={hex.accent.redSoft}>{t('profile.accountActions')}</SectionLabel>
        <div className="space-y-2">
          {[
            { label: t('profile.changePassword'), icon: <FiLock size={15} />,   color: hex.green.bright,   border: alphaOf('green', 0.20),       bg: alphaOf('green', 0.06),       action: onChangePassword },
            { label: t('profile.logout'),         icon: <FiLogOut size={15} />, color: hex.accent.redSoft, border: alpha(hex.accent.red, 0.20),  bg: alpha(hex.accent.red, 0.06),  action: onLogout },
          ].map(({ label, icon, color, border, bg, action }) => (
            <motion.button
              key={label}
              onClick={action}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color }}>{icon}</span>
                <span className="text-sm font-bold" style={{ color }}>{label}</span>
              </div>
              <span style={{ color: `${color}60`, fontSize: 12 }}>›</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
