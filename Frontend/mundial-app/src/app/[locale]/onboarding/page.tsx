'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGlobe, FiCheck, FiBell, FiHeart, FiArrowRight, FiArrowLeft,
  FiZap, FiCalendar, FiBarChart2, FiStar, FiPlus,
} from 'react-icons/fi';
import { getTeams } from '@/services/publicTournament';

type OnboardingTeam = { id: number; name: string; shortName: string; flagUrl?: string };

/* ══════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════ */

const EQBars = ({ color, count = 7, maxH = 14 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        const h3 = (seq[(i + 2) % seq.length] / 20) * maxH;
        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 2.5, background: color, boxShadow: `0 0 4px ${color}` }}
            animate={{ height: [h1, h2, h3, h2, h1] }}
            transition={{ duration: 1.3 + i * 0.11, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }}
          />
        );
      })}
    </div>
  );
};

const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1 + (index % 2);
  const delay = (index * 0.28) % 7;
  const duration = 9 + (index % 7);
  const cols: [string, string][] = [
    ['rgba(34,211,238,0.60)', '0 0 8px rgba(34,211,238,0.75)'],
    ['rgba(52,211,153,0.50)', '0 0 7px rgba(52,211,153,0.65)'],
    ['rgba(251,191,36,0.45)', '0 0 7px rgba(251,191,36,0.60)'],
    ['rgba(56,189,248,0.55)', '0 0 7px rgba(56,189,248,0.65)'],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -4, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(380 + (index % 180))], x: [0, Math.sin(index * 1.4) * 32], opacity: [0, 0.85, 0.5, 0], scale: [0.4, 1.3, 0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* Spring toggle */
const Toggle = ({ checked, onChange, color = '#22d3ee' }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) => (
  <motion.button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="relative shrink-0 w-11 h-6 rounded-full cursor-pointer"
    style={{
      background: checked ? `linear-gradient(90deg, ${color}90, ${color})` : 'rgba(255,255,255,0.07)',
      border: `1px solid ${checked ? color + '55' : 'rgba(255,255,255,0.10)'}`,
      boxShadow: checked ? `0 0 12px ${color}40` : 'none',
      transition: 'background 250ms, border-color 250ms, box-shadow 250ms',
    }}
    whileTap={{ scale: 0.94 }}
  >
    <motion.div
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
      animate={{ x: checked ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    />
  </motion.button>
);

/* Dark card wrapper */
const DarkCard = ({ children, accentColor = '#22d3ee' }: { children: React.ReactNode; accentColor?: string }) => (
  <div
    className="relative overflow-hidden rounded-2xl"
    style={{
      background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
      border: `1px solid ${accentColor}18`,
      backdropFilter: 'blur(32px)',
      boxShadow: `0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />
    {children}
  </div>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [notifications, setNotifications] = useState({
    fixtureReminders:    true,
    resultNotifications: true,
    leagueUpdates:       true,
    newsUpdates:         false,
  });
  const [teams, setTeams] = useState<OnboardingTeam[]>([
    { id: 1, name: 'Argentina',    shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
    { id: 2, name: 'Brasil',       shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
    { id: 3, name: 'España',       shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
    { id: 4, name: 'Alemania',     shortName: 'GER', flagUrl: 'https://flagcdn.com/de.svg' },
    { id: 5, name: 'Francia',      shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
    { id: 6, name: 'México',       shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
    { id: 7, name: 'Colombia',     shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    { id: 8, name: 'Países Bajos', shortName: 'NED', flagUrl: 'https://flagcdn.com/nl.svg' },
    { id: 9, name: 'Portugal',     shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' },
  ]);

  useEffect(() => {
    getTeams().then(res => {
      if (res.length > 0) {
        setTeams(res.map((t: any) => ({
          id: t.id, name: t.name,
          shortName: t.shortName || t.fifaCode || t.name.slice(0, 3).toUpperCase(),
          flagUrl: t.flagUrl,
        })));
      }
    }).catch(() => { /* keep fallback */ });
  }, []);

  const toggleTeam = (id: number) =>
    setSelectedTeams(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleFinish = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('selectedTeams', JSON.stringify(selectedTeams));
    localStorage.setItem('language', language);
    router.push('/');
  };

  const TOTAL_STEPS = 4;

  const notifItems = [
    { key: 'fixtureReminders',    label: language === 'es' ? 'Recordatorios de partidos' : 'Match reminders',   icon: <FiCalendar size={14} />,  color: '#22d3ee' },
    { key: 'resultNotifications', label: language === 'es' ? 'Resultados en tiempo real' : 'Real-time results', icon: <FiZap size={14} />,       color: '#fbbf24' },
    { key: 'leagueUpdates',       label: language === 'es' ? 'Actualizaciones de ligas'  : 'League updates',    icon: <FiBarChart2 size={14} />,  color: '#34d399' },
    { key: 'newsUpdates',         label: language === 'es' ? 'Noticias y novedades'      : 'News & updates',    icon: <FiBell size={14} />,      color: '#f472b6' },
  ] as const;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 28% 40%, #060f1e 0%, #030a14 48%, #010508 100%)' }}
    >
      {/* ── AMBIENT ORBS ── */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -120, background: 'radial-gradient(circle, rgba(0,210,185,0.08) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 480, height: 480, bottom: -80, right: -80, background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 4 }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 320, height: 320, top: '55%', right: '15%', background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 65%)', filter: 'blur(55px)', zIndex: 0 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 7 }} />

      {/* Tech grid */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.024]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ob-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(34,211,238,1)" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="ob-fade" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="ob-mask"><rect width="100%" height="100%" fill="url(#ob-fade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#ob-grid)" mask="url(#ob-mask)" />
      </svg>

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 12 }).map((_, i) => <Particle key={i} index={i} />)}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 w-full max-w-lg px-4 py-8 flex flex-col gap-6 items-center">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'rgba(34,211,238,0.30)', filter: 'blur(14px)' }}
                animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3.2, repeat: Infinity }}
              />
              <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={44} height={44} className="relative z-10 w-11 h-11 object-contain" />
            </div>
            <Image
              src="/texto_logo_pestaña.png"
              alt="Orionix Gol"
              width={160}
              height={38}
              className="h-9 w-auto object-contain"
              style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.55)) brightness(1.25)' }}
            />
          </div>

          {/* Mundial 2026 badge */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full mt-1"
            style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.14), rgba(120,53,15,0.08))', border: '1px solid rgba(217,119,6,0.22)' }}
            animate={{ boxShadow: ['0 0 6px rgba(217,119,6,0.06)', '0 0 18px rgba(217,119,6,0.22)', '0 0 6px rgba(217,119,6,0.06)'] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <FiZap size={9} className="text-amber-400" />
            <span className="text-[8px] font-black tracking-[0.26em] text-amber-300/75 uppercase">Mundial 2026 · USA · México · Canadá</span>
          </motion.div>
        </motion.div>

        {/* PROGRESS BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 w-full max-w-xs"
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const done = i + 1 <= step;
            return (
              <motion.div
                key={i}
                className="h-1 rounded-full flex-1"
                style={{
                  background: done ? 'linear-gradient(90deg, #4CAF50, #388E3C)' : 'rgba(255,255,255,0.07)',
                  boxShadow: done ? '0 0 8px rgba(76,175,80,0.50)' : 'none',
                  transition: 'box-shadow 0.4s, background 0.4s',
                }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}
          <span className="text-[9px] font-black text-orionix-text-muted tracking-widest shrink-0 ml-1">
            {step}/{TOTAL_STEPS}
          </span>
        </motion.div>

        {/* STEP CONTENT */}
        <div className="w-full">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: LANGUAGE ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <DarkCard accentColor="#22d3ee">
                  <div className="p-6">
                    {/* Step label */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22d3ee, #10b981)' }} />
                      <span className="text-[10px] font-black text-orionix-text-secondary tracking-[0.24em] uppercase">Bienvenido</span>
                      <div className="flex-1" />
                      <EQBars color="rgba(34,211,238,0.40)" count={5} maxH={12} />
                    </div>

                    <h1 className="text-2xl font-black text-white mb-1 leading-tight">
                      {language === 'es' ? 'Selecciona tu idioma' : 'Select your language'}
                    </h1>
                    <p className="text-[11px] text-orionix-text-muted mb-6 tracking-wide">
                      {language === 'es' ? 'Puedes cambiarlo después en tu perfil' : 'You can change it later in your profile'}
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { code: 'es' as const, label: 'Español', sub: 'Español (España)' },
                        { code: 'en' as const, label: 'English', sub: 'English (US)' },
                      ].map(lang => {
                        const active = language === lang.code;
                        return (
                          <motion.button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all"
                            style={{
                              background: active ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${active ? 'rgba(34,211,238,0.30)' : 'rgba(255,255,255,0.06)'}`,
                              boxShadow: active ? '0 0 16px rgba(34,211,238,0.08)' : 'none',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <FiGlobe size={15} style={{ color: active ? '#22d3ee' : 'rgba(100,116,139,0.5)' }} />
                              <div>
                                <p className="text-sm font-black" style={{ color: active ? '#e2e8f0' : '#64748b' }}>{lang.label}</p>
                                <p className="text-[10px]" style={{ color: 'rgba(100,116,139,0.45)' }}>{lang.sub}</p>
                              </div>
                            </div>
                            <AnimatePresence>
                              {active && (
                                <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                                  <FiCheck size={14} style={{ color: '#22d3ee' }} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </DarkCard>
              </motion.div>
            )}

            {/* ── STEP 2: FAVORITE TEAMS ── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <DarkCard accentColor="#f472b6">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #ec4899)' }} />
                      <span className="text-[10px] font-black text-orionix-text-secondary tracking-[0.24em] uppercase">
                        {language === 'es' ? 'Equipos' : 'Teams'}
                      </span>
                      {selectedTeams.length > 0 && (
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded-full text-[8px] font-black"
                          style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.30)', color: '#f472b6' }}
                        >
                          {selectedTeams.length} seleccionados
                        </motion.span>
                      )}
                    </div>

                    <h2 className="text-xl font-black text-white mb-1">
                      {language === 'es' ? 'Equipos favoritos' : 'Favorite teams'}
                    </h2>
                    <p className="text-[11px] text-orionix-text-muted mb-5 tracking-wide">
                      {language === 'es'
                        ? 'Selecciona los equipos que quieres seguir'
                        : 'Select the teams you want to follow'}
                    </p>

                    <div className="grid grid-cols-3 gap-2.5">
                      {teams.map(team => {
                        const selected = selectedTeams.includes(team.id);
                        return (
                          <motion.div
                            key={team.id}
                            onClick={() => toggleTeam(team.id)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="relative cursor-pointer rounded-xl overflow-hidden"
                            style={{
                              background: selected ? 'rgba(244,114,182,0.10)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${selected ? 'rgba(244,114,182,0.35)' : 'rgba(255,255,255,0.06)'}`,
                              boxShadow: selected ? '0 0 16px rgba(244,114,182,0.12)' : 'none',
                            }}
                          >
                            <div className="aspect-square p-2 flex items-center justify-center">
                              {team.flagUrl && (
                                <img
                                  src={team.flagUrl}
                                  alt={team.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  style={{ opacity: selected ? 1 : 0.65 }}
                                />
                              )}
                            </div>
                            <p className="text-[9px] font-black text-center pb-1.5 tracking-wider"
                              style={{ color: selected ? '#f472b6' : '#475569' }}>
                              {team.shortName}
                            </p>
                            {/* Selected checkmark */}
                            <AnimatePresence>
                              {selected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: 'rgba(244,114,182,0.90)', boxShadow: '0 0 8px rgba(244,114,182,0.60)' }}
                                >
                                  <FiCheck size={11} style={{ color: '#fff' }} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </DarkCard>
              </motion.div>
            )}

            {/* ── STEP 3: NOTIFICATIONS ── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <DarkCard accentColor="#fbbf24">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }} />
                      <span className="text-[10px] font-black text-orionix-text-secondary tracking-[0.24em] uppercase">
                        {language === 'es' ? 'Notificaciones' : 'Notifications'}
                      </span>
                      <div className="flex-1" />
                      <EQBars color="rgba(251,191,36,0.40)" count={5} maxH={12} />
                    </div>

                    <h2 className="text-xl font-black text-white mb-1">
                      {language === 'es' ? 'Mantente al día' : 'Stay up to date'}
                    </h2>
                    <p className="text-[11px] text-orionix-text-muted mb-5 tracking-wide">
                      {language === 'es'
                        ? 'Configura qué alertas quieres recibir'
                        : 'Configure which alerts you want to receive'}
                    </p>

                    <div className="space-y-2">
                      {notifItems.map(notif => {
                        const on = notifications[notif.key];
                        return (
                          <div
                            key={notif.key}
                            className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                            style={{
                              background: on ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                              border: `1px solid ${on ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span style={{ color: on ? notif.color : 'rgba(100,116,139,0.35)' }}>{notif.icon}</span>
                              <p className="text-sm font-semibold" style={{ color: on ? '#94a3b8' : '#475569' }}>{notif.label}</p>
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
                </DarkCard>
              </motion.div>
            )}

            {/* ── STEP 4: READY ── */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <DarkCard accentColor="#34d399">
                  <div className="p-6 text-center">
                    {/* Animated success ring */}
                    <div className="flex justify-center mb-5">
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ border: '1.5px solid rgba(52,211,153,0.35)' }}
                          animate={{ scale: [1, 1.55, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(145deg, rgba(52,211,153,0.18), rgba(34,211,238,0.12))', border: '1px solid rgba(52,211,153,0.35)', boxShadow: '0 0 28px rgba(52,211,153,0.22)' }}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 28 }}
                        >
                          <FiCheck size={28} style={{ color: '#34d399', filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' }} />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-center mb-2">
                      <div className="w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                      <h2 className="text-2xl font-black text-white">
                        {language === 'es' ? '¡Todo listo!' : 'All set!'}
                      </h2>
                    </div>
                    <p className="text-[11px] text-orionix-text-muted mb-6 tracking-wide">
                      {language === 'es' ? 'Tu cuenta está configurada y lista' : 'Your account is set up and ready'}
                    </p>

                    {/* Summary chips */}
                    <div className="flex flex-col gap-2 text-left mb-2">
                      {[
                        {
                          label: language === 'es' ? 'Idioma' : 'Language',
                          value: language === 'es' ? 'Español' : 'English',
                          color: '#22d3ee',
                          icon: <FiGlobe size={12} />,
                        },
                        {
                          label: language === 'es' ? 'Equipos favoritos' : 'Favorite teams',
                          value: selectedTeams.length > 0
                            ? `${selectedTeams.length} ${language === 'es' ? 'seleccionados' : 'selected'}`
                            : language === 'es' ? 'Ninguno' : 'None',
                          color: '#f472b6',
                          icon: <FiHeart size={12} />,
                        },
                        {
                          label: language === 'es' ? 'Notificaciones activas' : 'Active notifications',
                          value: `${Object.values(notifications).filter(Boolean).length}/4`,
                          color: '#fbbf24',
                          icon: <FiBell size={12} />,
                        },
                      ].map(item => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                          style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}
                        >
                          <div className="flex items-center gap-2">
                            <span style={{ color: `${item.color}80` }}>{item.icon}</span>
                            <span className="text-[10px] font-bold text-orionix-text-muted">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-black" style={{ color: item.color }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DarkCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── NAVIGATION BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3 w-full"
        >
          {/* Back button */}
          {step > 1 && (
            <motion.button
              onClick={() => setStep(s => s - 1)}
              whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-bold text-orionix-text-secondary transition-all shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              <FiArrowLeft size={14} />
              {language === 'es' ? 'Atrás' : 'Back'}
            </motion.button>
          )}

          {/* Next / Finish button */}
          {step < TOTAL_STEPS ? (
            <motion.button
              onClick={() => setStep(s => s + 1)}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,210,185,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C, #2E7D32)', boxShadow: '0 6px 24px rgba(76,175,80,0.28)' }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.18) 50%, transparent 72%)' }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />
              <span className="relative">{language === 'es' ? 'Siguiente' : 'Next'}</span>
              <FiArrowRight size={14} className="relative" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinish}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(52,211,153,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981, #34d399)', boxShadow: '0 6px 24px rgba(52,211,153,0.28)' }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.18) 50%, transparent 72%)' }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />
              <FiZap size={14} className="relative" />
              <span className="relative">{language === 'es' ? 'Comenzar' : 'Get Started'}</span>
            </motion.button>
          )}
        </motion.div>

        {/* Skip link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleFinish}
          className="text-[10px] font-bold text-orionix-text-muted hover:text-orionix-text-secondary transition-colors tracking-[0.18em] uppercase"
        >
          {language === 'es' ? 'Omitir configuración' : 'Skip setup'}
        </motion.button>

      </div>
    </div>
  );
}
