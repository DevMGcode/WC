'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiZap, FiBarChart2, FiBell, FiCheck, FiSave, FiChevronDown } from 'react-icons/fi';
import { localeConfig, locales } from '@/i18n/locales';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';
import { SectionLabel, Toggle } from './ui';

interface Notifications {
  fixtureReminders: boolean;
  resultNotifications: boolean;
  leagueUpdates: boolean;
  newsUpdates: boolean;
}

interface SettingsTabProps {
  language: string;
  langOpen: boolean;
  langRef: React.RefObject<HTMLDivElement>;
  setLangOpen: (v: boolean) => void;
  onSelectLanguage: (code: string) => void;
  notifications: Notifications;
  setNotifications: React.Dispatch<React.SetStateAction<Notifications>>;
  onSave: () => void;
  saved: boolean;
  t: (key: string) => string;
}

export default function SettingsTab({
  language, langOpen, langRef, setLangOpen, onSelectLanguage,
  notifications, setNotifications, onSave, saved, t,
}: SettingsTabProps) {
  const activeCfg  = localeConfig[language as keyof typeof localeConfig];
  const GOLD        = hex.gold.base;
  const GOLD_BG     = alpha(hex.gold.base, 0.12);
  const GOLD_BORDER = alpha(hex.gold.base, 0.28);

  return (
    <motion.div
      key="settings"
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {/* Language */}
      <div
        className="relative rounded-3xl p-5"
        style={{
          background: surfaces.card(),
          border: `1px solid ${alphaOf('green', 0.14)}`,
          backdropFilter: 'blur(32px)',
          boxShadow: `0 24px 60px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
          zIndex: langOpen ? 100 : 'auto',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.40)}, transparent)` }} />
        <SectionLabel color={hex.green.bright}>{t('profile.settings.language')}</SectionLabel>

        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200"
            style={{
              background: langOpen ? alphaOf('green', 0.08) : alpha(hex.neutral.white, 0.03),
              border: `1px solid ${langOpen ? alphaOf('green', 0.35) : alpha(hex.neutral.white, 0.08)}`,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-black tracking-widest uppercase w-9 text-center py-1 rounded-lg shrink-0"
                style={{ background: GOLD_BG, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
              >
                {language.toUpperCase()}
              </span>
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-none">{activeCfg?.label}</p>
                <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: alphaOf('green', 0.50) }}>
                  {t('profile.settings.language')}
                </p>
              </div>
            </div>
            <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <FiChevronDown size={15} style={{ color: langOpen ? hex.green.bright : alpha(hex.neutral.white, 0.25) }} />
            </motion.div>
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 mt-2 rounded-2xl z-[200]"
                style={{
                  background: `linear-gradient(160deg, ${alpha(hex.bg.primary, 0.99)} 0%, ${alpha(hex.bg.secondary, 0.99)} 100%)`,
                  border: `1px solid ${alphaOf('green', 0.20)}`,
                  boxShadow: `0 20px 56px ${alpha(hex.neutral.black, 0.70)}, 0 0 0 1px ${alphaOf('green', 0.05)}`,
                  backdropFilter: 'blur(28px)',
                  overflow: 'hidden',
                }}
              >
                <div className="h-px w-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.45)}, ${alphaOf('green', 0.45)}, transparent)` }} />
                <div className="py-1">
                  {locales.map((code, idx) => {
                    const cfg     = localeConfig[code];
                    const isActive = language === code;
                    const isLast   = idx === locales.length - 1;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => { onSelectLanguage(code); setLangOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150"
                        style={{
                          background: isActive ? alphaOf('green', 0.09) : 'transparent',
                          borderBottom: isLast ? 'none' : `1px solid ${alpha(hex.neutral.white, 0.04)}`,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = alpha(hex.neutral.white, 0.04); }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[9px] font-black tracking-widest uppercase w-9 text-center py-1 rounded-lg shrink-0"
                            style={{
                              background: isActive ? GOLD_BG : alpha(hex.neutral.white, 0.04),
                              border: `1px solid ${isActive ? GOLD_BORDER : alpha(hex.neutral.white, 0.07)}`,
                              color: isActive ? GOLD : alpha(hex.gold.base, 0.45),
                            }}
                          >
                            {code.toUpperCase()}
                          </span>
                          <p className="text-sm font-semibold leading-none"
                            style={{ color: isActive ? hex.accent.slateLight : alpha(hex.neutral.white, 0.50) }}>
                            {cfg.label}
                          </p>
                        </div>
                        {isActive && <FiCheck size={13} style={{ color: hex.green.bright, flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications */}
      <div
        className="relative overflow-hidden rounded-3xl p-5"
        style={{
          background: surfaces.card(),
          border: `1px solid ${alpha(hex.gold.base, 0.12)}`,
          backdropFilter: 'blur(32px)',
          boxShadow: `0 24px 60px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.40)}, transparent)` }} />
        <SectionLabel color={hex.gold.base}>{t('profile.settings.notifications')}</SectionLabel>
        <div className="space-y-2">
          {[
            { key: 'fixtureReminders',    label: t('profile.settings.fixtureReminders'),    icon: <FiCalendar size={14} />,  color: hex.green.bright },
            { key: 'resultNotifications', label: t('profile.settings.resultNotifications'), icon: <FiZap size={14} />,       color: hex.gold.base    },
            { key: 'leagueUpdates',       label: t('profile.settings.leagueUpdates'),       icon: <FiBarChart2 size={14} />, color: hex.green.hover  },
            { key: 'newsUpdates',         label: t('profile.settings.newsUpdates'),         icon: <FiBell size={14} />,      color: hex.accent.pink  },
          ].map(notif => {
            const on = notifications[notif.key as keyof Notifications];
            return (
              <div
                key={notif.key}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                style={{
                  background: on ? alpha(hex.neutral.white, 0.03) : alpha(hex.neutral.white, 0.01),
                  border: `1px solid ${on ? alpha(hex.neutral.white, 0.07) : alpha(hex.neutral.white, 0.04)}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: on ? notif.color : alpha(hex.accent.slateDeep, 0.4) }}>{notif.icon}</span>
                  <p className="text-sm font-semibold" style={{ color: on ? hex.accent.slate : hex.accent.slateDark }}>{notif.label}</p>
                </div>
                <Toggle
                  checked={on}
                  onChange={v => setNotifications(p => ({ ...p, [notif.key]: v }))}
                  color={notif.color}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <motion.button
        onClick={onSave}
        whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${alphaOf('green', 0.45)}` }}
        whileTap={{ scale: 0.97 }}
        className="relative w-full py-3.5 rounded-2xl font-black text-sm text-white tracking-wide overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base}, ${hex.green.hover})`, boxShadow: `0 6px 24px ${alphaOf('green', 0.28)}` }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
          animate={{ x: ['-120%', '120%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span key="saved" className="relative flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <FiCheck size={15} /> {t('profile.settings.saved')}
            </motion.span>
          ) : (
            <motion.span key="save" className="relative flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <FiSave size={15} /> {t('profile.settings.save')}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
