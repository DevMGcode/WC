'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Navigation';
import { Button } from '@/components/Button';
import { TeamCard } from '@/components/Cards';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Mock teams - en producción vendrá del backend
  const teams = [
    { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
    { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
    { id: 3, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
    { id: 4, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
    { id: 5, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
    { id: 6, name: 'México', shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
    { id: 7, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    { id: 8, name: 'Países Bajos', shortName: 'NED', flagUrl: 'https://flagcdn.com/nl.svg' },
  ];

  const toggleTeam = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('selectedTeams', JSON.stringify(selectedTeams));
    localStorage.setItem('language', language);
    router.push('/');
  };

  const texts = {
    es: {
      welcome: 'Bienvenido al',
      title: 'Orionix Gol',
      subtitle: 'Tu app de predicciones de fútbol',
      language: 'Selecciona tu idioma',
      spanish: 'Español',
      english: 'English',
      favoriteTeams: 'Elige tus equipos favoritos',
      selectTeams: 'Selecciona tus equipos favoritos para recibir noticias y alertas',
      notifications: 'Notificaciones',
      enableNotifications: 'Habilitar notificaciones para recordatorios de partidos',
      ready: 'Está listo para comenzar',
      next: 'Siguiente',
      finish: 'Comenzar',
      back: 'Atrás',
    },
    en: {
      welcome: 'Welcome to',
      title: 'Orionix Gol',
      subtitle: 'Your football prediction app',
      language: 'Select your language',
      spanish: 'Español',
      english: 'English',
      favoriteTeams: 'Choose your favorite teams',
      selectTeams: 'Select your favorite teams to receive news and alerts',
      notifications: 'Notifications',
      enableNotifications: 'Enable notifications for match reminders',
      ready: 'You are ready to start',
      next: 'Next',
      finish: 'Get Started',
      back: 'Back',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen tech-app-bg flex items-center justify-center p-4 pb-32">
      <div className="relative z-10 w-full max-w-lg">
        <AnimatePresence mode="wait">
        {/* Step 1: Language Selection */}
        {step === 1 && (
          <motion.div
            key="onboarding-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-premium rounded-2xl shadow-2xl p-8 text-center border border-cyan-200/40 hover-lift-premium"
          >
            <div className="mb-8">
              <div className="inline-block p-4 bg-cyan-500/15 rounded-full mb-4 border border-cyan-300/35">
                <span className="text-5xl">🌍</span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">
                {t.welcome} {t.title}
              </h1>
              <p className="text-cyan-700 text-lg font-semibold">{t.subtitle}</p>
            </div>

            <div className="space-y-4">
              <p className="text-slate-800 font-bold text-lg">{t.language}</p>
              <div className="flex gap-4">
                <Button
                  variant={language === 'es' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setLanguage('es')}
                >
                  🇪🇸 {t.spanish}
                </Button>
                <Button
                  variant={language === 'en' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setLanguage('en')}
                >
                  🇺🇸 {t.english}
                </Button>
              </div>
            </div>

            <Button className="w-full mt-8" onClick={handleNext}>
              {t.next}
            </Button>
          </motion.div>
        )}

        {/* Step 2: Teams Selection */}
        {step === 2 && (
          <motion.div
            key="onboarding-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-premium rounded-2xl shadow-2xl p-8 border border-cyan-200/40 hover-lift-premium"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-2">{t.favoriteTeams}</h2>
            <p className="text-cyan-700 mb-6">{t.selectTeams}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all transform ${
                    selectedTeams.includes(team.id)
                      ? 'ring-4 ring-cyan-400 scale-105'
                      : 'ring-2 ring-gray-200 hover:ring-cyan-300'
                  }`}
                >
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center p-2">
                    <Image
                      src={team.flagUrl}
                      alt={team.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {selectedTeams.includes(team.id) && (
                    <div className="absolute top-1 right-1 bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xl font-black">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-bold p-1 text-center">
                    {team.shortName}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                {t.back}
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                {t.next}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <motion.div
            key="onboarding-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-premium rounded-2xl shadow-2xl p-8 border border-cyan-200/40 hover-lift-premium"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-6">{t.notifications}</h2>

            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-4 p-4 border-2 border-cyan-200/50 rounded-lg cursor-pointer hover:border-cyan-400 transition-all bg-white/70">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-6 h-6 accent-cyan-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">{t.enableNotifications}</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                {t.back}
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                {t.next}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <motion.div
            key="onboarding-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-premium rounded-2xl shadow-2xl p-8 text-center border border-cyan-200/40 hover-lift-premium"
          >
            <div className="mb-8">
              <div className="inline-block p-4 bg-cyan-500/15 rounded-full mb-4 border border-cyan-300/35">
                <span className="text-5xl">✨</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">{t.ready}</h2>
              <p className="text-cyan-700 font-semibold">Idioma: {language === 'es' ? '🇪🇸' : '🇺🇸'}</p>
              <p className="text-cyan-700 font-semibold">Equipos: {selectedTeams.length}</p>
              <p className="text-cyan-700 font-semibold">
                Notificaciones: {notificationsEnabled ? '✓' : '✗'}
              </p>
            </div>

            <Button className="w-full" onClick={handleFinish}>
              {t.finish}
            </Button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'bg-cyan-500 w-8 shadow-lg shadow-cyan-500/40' : 'bg-slate-400/40 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
