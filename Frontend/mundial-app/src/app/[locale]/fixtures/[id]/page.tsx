'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getFixtureById } from '@/services/publicTournament';
import { predictionService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiTarget, FiZap, FiCheck, FiX, FiEdit2, FiArrowLeft,
  FiMapPin, FiAlertCircle,
} from 'react-icons/fi';

/* ── Scoring rules config ── */
const SCORE_RULES = [
  { pts: 3, label: 'Marcador exacto',   sublabel: 'Resultado y goles exactos', color: '#34d399', icon: <FiZap  size={14} /> },
  { pts: 1, label: 'Resultado correcto', sublabel: 'Ganador o empate correcto', color: '#22d3ee', icon: <FiCheck size={14} /> },
  { pts: 0, label: 'Fallaste',           sublabel: 'No acertaste el resultado', color: '#64748b', icon: <FiX    size={14} /> },
];

/* ── Shared dark card wrapper ── */
const DarkCard = ({
  children, accent = '#22d3ee', className = '', delay = 0,
}: { children: React.ReactNode; accent?: string; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`relative overflow-hidden rounded-2xl ${className}`}
    style={{
      background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
      border: `1px solid ${accent}18`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.50)',
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${accent}65, transparent)` }} />
    {children}
  </motion.div>
);

export default function FixtureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [fixture,     setFixture]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [prediction,  setPrediction]  = useState<any>(null);
  const [predHome,    setPredHome]    = useState(0);
  const [predAway,    setPredAway]    = useState(0);
  const [editing,     setEditing]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [predError,   setPredError]   = useState('');
  const [predSuccess, setPredSuccess] = useState(false);

  useEffect(() => {
    const loadFixture = async () => {
      try {
        const data = await getFixtureById(parseInt(params.id, 10));
        setFixture(data ?? null);
      } finally { setLoading(false); }
    };
    loadFixture();
  }, [params.id]);

  useEffect(() => {
    if (!isAuthenticated || !user || !fixture) return;
    const userId = Number(user.id);
    if (!userId) return;
    predictionService.getUserPredictions(userId)
      .then((preds: any[]) => {
        const existing = preds.find((p: any) => Number(p.fixtureId) === fixture.id);
        if (existing) { setPrediction(existing); setPredHome(existing.predictedHomeScore); setPredAway(existing.predictedAwayScore); }
      })
      .catch(() => {});
  }, [isAuthenticated, user, fixture]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true); setPredError(''); setPredSuccess(false);
    try {
      const userId = Number(user.id);
      if (prediction && !editing) return;
      if (prediction) {
        const updated = await predictionService.updatePrediction(prediction.id, { predictedHomeScore: predHome, predictedAwayScore: predAway });
        setPrediction(updated);
      } else {
        const created = await predictionService.createPrediction({ userId, fixtureId: fixture.id, predictedHomeScore: predHome, predictedAwayScore: predAway });
        setPrediction(created);
      }
      setPredSuccess(true); setEditing(false);
    } catch (err: any) {
      setPredError(err?.response?.data?.error || err?.message || 'Error al guardar la porra');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #060f1e 0%, #030a14 42%, #010408 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
            animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-[10px] text-cyan-400/60 tracking-[0.3em] uppercase font-bold">Cargando</p>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #060f1e 0%, #030a14 42%, #010408 100%)' }}>
        <p className="text-slate-400 font-semibold">Partido no encontrado</p>
      </div>
    );
  }

  const isScheduled = fixture.status === 'SCHEDULED';
  const isLive      = fixture.status === 'LIVE';
  const isFinished  = fixture.status === 'FINISHED';
  const canPredict  = isScheduled && isAuthenticated;
  const showForm    = canPredict && (!prediction || editing);

  const predCorrect = isFinished && prediction &&
    prediction.predictedHomeScore === fixture.homeScore &&
    prediction.predictedAwayScore === fixture.awayScore;

  const predResultCorrect = isFinished && prediction && !predCorrect &&
    fixture.homeScore !== null && fixture.awayScore !== null &&
    Math.sign(prediction.predictedHomeScore - prediction.predictedAwayScore) ===
    Math.sign(fixture.homeScore - fixture.awayScore);

  const resultCfg = predCorrect
    ? { color: '#34d399', border: 'rgba(52,211,153,0.25)', bg: 'rgba(52,211,153,0.06)', label: '¡Marcador exacto!', icon: '🎯', pts: '+3 pts' }
    : predResultCorrect
      ? { color: '#22d3ee', border: 'rgba(34,211,238,0.22)', bg: 'rgba(34,211,238,0.05)', label: 'Resultado correcto', icon: '✅', pts: '+1 pt' }
      : { color: '#f87171', border: 'rgba(248,113,113,0.22)', bg: 'rgba(239,68,68,0.05)', label: 'No acertaste esta vez', icon: '❌', pts: '0 pts' };

  return (
    <div className="w-full relative min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 22% 35%, #060f1e 0%, #030a14 48%, #010508 100%)' }}>

      {/* Ambient blobs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -150, left: -120,
          background: 'radial-gradient(circle, rgba(0,210,185,0.07) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 450, height: 450, bottom: -80, right: -80,
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title="⚽ Detalle del Partido" subtitle={fixture.stageName ?? ''} />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">

        {/* ── FIXTURE CARD (existing component keeps its style) ── */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <FixtureCard
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
            homeScore={fixture.homeScore}
            awayScore={fixture.awayScore}
            kickoffAt={fixture.kickoffAt}
            status={fixture.status}
          />
        </motion.div>

        {/* ── PORRA SECTION ── */}
        <div className="mb-4">

          {/* Not logged in */}
          {!isAuthenticated && (
            <DarkCard accent="#22d3ee" delay={0.08}>
              <div className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'rgba(34,211,238,0.35)', filter: 'blur(14px)', opacity: 0.25, transform: 'scale(1.15)' }} />
                  <motion.div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: 'linear-gradient(145deg, rgba(34,211,238,0.10), rgba(1,4,14,0.85))', border: '1px solid rgba(34,211,238,0.22)' }}
                    animate={{ boxShadow: ['0 0 12px rgba(34,211,238,0.10)', '0 0 28px rgba(34,211,238,0.30)', '0 0 12px rgba(34,211,238,0.10)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <FiTarget size={28} style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.7))' }} />
                  </motion.div>
                </div>
                <p className="text-white font-black text-lg mb-1">¿Cuál será el marcador?</p>
                <p className="text-slate-500 text-sm mb-5">Inicia sesión para hacer tu porra</p>
                <motion.button
                  onClick={() => router.push('/onboarding')}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 6px 24px rgba(0,210,185,0.30)' }}
                >
                  Iniciar sesión
                </motion.button>
              </div>
            </DarkCard>
          )}

          {/* Logged in — LIVE match: porras cerradas */}
          {isAuthenticated && isLive && (
            <DarkCard accent="#ef4444" delay={0.08}>
              <div className="p-6 text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.12), rgba(1,4,14,0.85))', border: '1px solid rgba(239,68,68,0.25)' }}
                  animate={{ boxShadow: ['0 0 12px rgba(239,68,68,0.10)', '0 0 28px rgba(239,68,68,0.35)', '0 0 12px rgba(239,68,68,0.10)'] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <span style={{ fontSize: 28 }}>🔒</span>
                </motion.div>
                <p className="text-white font-black text-base mb-1">Porras cerradas</p>
                <p className="text-slate-500 text-sm">Este partido ya comenzó. No se pueden registrar predicciones.</p>
                {prediction && (
                  <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span className="text-slate-400 text-sm font-bold">Tu porra:</span>
                    <span className="text-white font-black text-lg tabular-nums">
                      {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
                    </span>
                  </div>
                )}
              </div>
            </DarkCard>
          )}

          {/* Logged in — scheduled match */}
          {isAuthenticated && isScheduled && (
            <DarkCard accent="#22d3ee" delay={0.08}>
              <div className="p-5">

                {/* Scoring rules */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {SCORE_RULES.map(({ pts, label, sublabel, color, icon }) => (
                    <div key={pts} className="relative overflow-hidden rounded-xl p-3 text-center"
                      style={{ background: 'rgba(4,12,28,0.80)', border: `1px solid ${color}18` }}>
                      <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
                      <div className="flex justify-center mb-1.5"
                        style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>
                        {icon}
                      </div>
                      <p className="text-lg font-black" style={{ color, textShadow: `0 0 12px ${color}80` }}>
                        {pts}<span className="text-xs font-bold ml-0.5">pts</span>
                      </p>
                      <p className="text-[8px] font-black tracking-wide mt-0.5 leading-tight" style={{ color: `${color}80` }}>{label}</p>
                      <p className="text-[7px] text-slate-600 mt-0.5 leading-tight hidden sm:block">{sublabel}</p>
                    </div>
                  ))}
                </div>

                {/* Porra header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #22d3ee, #06b6d4)' }} />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">Tu Porra</span>
                  </div>
                  {prediction && !editing && (
                    <motion.button
                      onClick={() => setEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-[10px] font-black text-cyan-400/70 hover:text-cyan-300 transition-colors"
                    >
                      <FiEdit2 size={11} /> Editar
                    </motion.button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {/* Saved prediction display */}
                  {prediction && !editing ? (
                    <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-8 py-2">
                      {/* Home */}
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.homeTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-slate-400 text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: '0 0 20px rgba(34,211,238,0.30)' }}>
                          {prediction.predictedHomeScore}
                        </p>
                      </div>
                      <span className="text-slate-700 font-black text-2xl">–</span>
                      {/* Away */}
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.awayTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-slate-400 text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: '0 0 20px rgba(34,211,238,0.30)' }}>
                          {prediction.predictedAwayScore}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* Score input form */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center justify-center gap-6 mb-5">
                        {/* Home score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.homeTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-slate-400 text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredHome(Math.max(0, predHome - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: '0 0 18px rgba(34,211,238,0.50)' }}>{predHome}</span>
                            <motion.button onClick={() => setPredHome(predHome + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.30)' }}>+</motion.button>
                          </div>
                        </div>

                        <span className="text-slate-600 font-black text-2xl">–</span>

                        {/* Away score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.awayTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-slate-400 text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredAway(Math.max(0, predAway - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: '0 0 18px rgba(34,211,238,0.50)' }}>{predAway}</span>
                            <motion.button onClick={() => setPredAway(predAway + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.30)' }}>+</motion.button>
                          </div>
                        </div>
                      </div>

                      {predError && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs text-red-300"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                          <FiAlertCircle size={12} /> {predError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        {editing && (
                          <motion.button
                            onClick={() => { setEditing(false); setPredError(''); }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-xl text-sm font-black text-slate-400"
                            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                          >Cancelar</motion.button>
                        )}
                        <motion.button
                          onClick={handleSubmit}
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex-1 py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 6px 24px rgba(0,210,185,0.30)' }}
                        >
                          <motion.div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.18) 50%, transparent 72%)' }}
                            animate={{ x: ['-120%', '120%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                          <span className="relative">
                            {submitting ? 'Guardando…' : prediction ? 'Actualizar Porra' : '⚡ Confirmar Porra'}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {predSuccess && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-xs text-center mt-3 font-black tracking-wide">
                    ✓ Porra guardada correctamente
                  </motion.p>
                )}
              </div>
            </DarkCard>
          )}

          {/* Logged in — finished match result comparison */}
          {isAuthenticated && isFinished && prediction && (
            <DarkCard accent={resultCfg.color} delay={0.08}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[3px] h-5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${resultCfg.color}, ${resultCfg.color}80)` }} />
                  <span className="text-sm font-black" style={{ color: resultCfg.color }}>
                    {resultCfg.icon} {resultCfg.label}
                  </span>
                </div>
                <div className="flex items-stretch gap-4">
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: 'rgba(4,12,28,0.60)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[8px] font-black text-slate-600 tracking-[0.25em] uppercase mb-2">Tu Porra</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {prediction.predictedHomeScore}
                      <span className="text-slate-700 mx-1 text-xl">–</span>
                      {prediction.predictedAwayScore}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-700 font-black text-sm">vs</span>
                  </div>
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: 'rgba(4,12,28,0.60)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[8px] font-black text-slate-600 tracking-[0.25em] uppercase mb-2">Resultado</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {fixture.homeScore}
                      <span className="text-slate-700 mx-1 text-xl">–</span>
                      {fixture.awayScore}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs font-black" style={{ color: resultCfg.color, textShadow: `0 0 12px ${resultCfg.color}80` }}>
                    {resultCfg.pts}
                  </span>
                </div>
              </div>
            </DarkCard>
          )}

          {/* Logged in — no prediction for finished */}
          {isAuthenticated && isFinished && !prediction && (
            <DarkCard accent="#475569" delay={0.08}>
              <p className="text-slate-600 text-sm text-center py-5">No hiciste una porra para este partido</p>
            </DarkCard>
          )}
        </div>

        {/* ── STADIUM INFO ── */}
        {(fixture.stadiumName || fixture.hostCity) && (
          <DarkCard accent="#34d399" delay={0.16} className="mb-4">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">Información del Partido</span>
                <FiMapPin size={12} style={{ color: '#34d399', marginLeft: 2 }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {fixture.stadiumName && (
                  <div>
                    <p className="text-[9px] font-black text-slate-600 tracking-[0.22em] uppercase mb-1">Estadio</p>
                    <p className="text-sm font-bold text-slate-300">{fixture.stadiumName}</p>
                  </div>
                )}
                {fixture.hostCity && (
                  <div>
                    <p className="text-[9px] font-black text-slate-600 tracking-[0.22em] uppercase mb-1">Ciudad</p>
                    <p className="text-sm font-bold text-slate-300">{fixture.hostCity}{fixture.hostCountry ? `, ${fixture.hostCountry}` : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── EVENTS ── */}
        {fixture.events && fixture.events.length > 0 && (
          <DarkCard accent="#fbbf24" delay={0.22} className="mb-4">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }} />
                <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">Eventos del Partido</span>
              </div>
              <div className="space-y-2">
                {fixture.events.map((event: any) => (
                  <div key={event.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(4,12,28,0.60)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: `3px solid ${event.teamId === fixture.homeTeam.id ? '#06b6d4' : '#f43f5e'}`,
                    }}>
                    <span className="text-xl w-8 text-center">
                      {event.type === 'GOAL'         && '⚽'}
                      {event.type === 'CARD'         && '🟨'}
                      {event.type === 'SUBSTITUTION' && '🔄'}
                      {event.type === 'INJURY'       && '🚑'}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-300 text-sm">{event.playerName}</p>
                      <p className="text-xs text-slate-600">{event.description}</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {event.minute}'
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── BOTTOM BUTTONS ── */}
        <div className="flex gap-3">
          <Link href="/fixtures" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-slate-400 flex items-center justify-center gap-2 cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
            >
              <FiArrowLeft size={14} /> Volver
            </motion.div>
          </Link>
          <Link href="/predictions" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(0,210,185,0.40)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 6px 24px rgba(0,210,185,0.28)' }}
            >
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.18) 50%, transparent 72%)' }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
              <span className="relative flex items-center gap-2"><FiTarget size={13} /> Mis Porras</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
