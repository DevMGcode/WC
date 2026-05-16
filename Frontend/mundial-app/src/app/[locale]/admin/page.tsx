'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiCalendar, FiBarChart2, FiSettings, FiRefreshCw, FiCheck, FiTrash2, FiWifi } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentTournament } from '@/services/publicTournament';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/* ─── Animated counter ──────────────────────────────────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 900;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconBall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);
const IconExternal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ─── Analytics Tab ─────────────────────────────────────────────────────── */
interface AppStats { totalUsers: number | null; totalPredictions: number | null; }

function AnalyticsTab() {
  const [stats, setStats] = useState<AppStats>({ totalUsers: null, totalPredictions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/v1/public/predictions/count').then(r => r.ok ? r.json() : null),
      fetch('/api/v1/public/users/count').then(r => r.ok ? r.json() : null),
    ]).then(([predRes, userRes]) => {
      setStats({
        totalPredictions: predRes.status === 'fulfilled' && predRes.value?.data != null ? predRes.value.data : null,
        totalUsers: userRes.status === 'fulfilled' && userRes.value?.data != null ? userRes.value.data : null,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Usuarios registrados', sublabel: 'Total en la plataforma', value: stats.totalUsers, icon: <IconUsers />, from: '#06b6d4', to: '#0ea5e9', glow: 'rgba(6,182,212,0.3)' },
    { label: 'Predicciones totales', sublabel: 'Porras registradas', value: stats.totalPredictions, icon: <IconBall />, from: '#10b981', to: '#059669', glow: 'rgba(16,185,129,0.3)' },
  ];

  return (
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
      {/* Stats: 2 cols en mobile, columna izquierda en desktop */}
      <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3 md:content-start">
        {statCards.map(({ label, sublabel, value, icon, from, to, glow }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            className="relative rounded-2xl overflow-hidden group"
            style={{ background: `linear-gradient(145deg, rgba(9,20,38,0.95), rgba(14,30,56,0.9))`, border: `1px solid ${from}40`, boxShadow: `0 0 30px ${glow}30, 0 8px 24px rgba(2,6,23,0.5)` }}>
            {/* Glow radial de fondo */}
            <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
              style={{ background: `radial-gradient(circle at 40% 40%, ${from} 0%, transparent 65%)` }} />
            {/* Línea superior decorativa */}
            <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${from}, transparent)` }} />
            <div className="relative p-5 flex flex-col items-center text-center gap-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 16px ${glow}` }}>
                {icon}
              </div>
              <div>
                {loading ? (
                  <div className="h-10 w-16 rounded-lg animate-pulse mx-auto" style={{ background: 'rgba(148,163,184,0.12)' }} />
                ) : (
                  <div className="text-5xl font-black leading-none" style={{ fontFamily: 'var(--font-display)', background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {value !== null ? <AnimatedNumber value={value} /> : '—'}
                  </div>
                )}
                <p className="text-xs font-bold mt-1" style={{ color: '#e2e8f0', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{sublabel}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GA4 Card: 2 columnas restantes en desktop */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="md:col-span-2 relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(9,20,38,0.95), rgba(14,30,56,0.9))', border: '1px solid rgba(249,115,22,0.35)', boxShadow: '0 0 30px rgba(249,115,22,0.1), 0 8px 24px rgba(2,6,23,0.5)' }}>
        <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }} />
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 30%, #f97316 0%, transparent 60%)' }} />

        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'linear-gradient(135deg,#f97316,#facc15)', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
              📊
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm" style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>GOOGLE ANALYTICS 4</p>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Seguimiento de visitas y comportamiento</p>
            </div>
            <div className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full`}
              style={{
                background: GA_ID ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                border: `1px solid ${GA_ID ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                color: GA_ID ? '#34d399' : '#fbbf24',
              }}>
              <span className={`w-1.5 h-1.5 rounded-full ${GA_ID ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {GA_ID ? 'Activo' : 'Sin configurar'}
            </div>
          </div>

          {GA_ID ? (
            <>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>ID</span>
                <span className="font-mono text-xs font-bold" style={{ color: '#22d3ee' }}>{GA_ID}</span>
              </div>
              <motion.a
                href="https://analytics.google.com/analytics/web/#/a394949491p537871988/reports/intelligenthome"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(90deg,#f97316,#fb923c,#facc15)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                VER DASHBOARD DE ANALYTICS <IconExternal />
              </motion.a>
            </>
          ) : (
            <div className="rounded-xl p-3.5 text-xs font-medium"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.9)' }}>
              Agrega <span className="font-mono">NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX</span> en <span className="font-mono">.env.local</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface FixtureAdmin {
  id: number; name: string; status: string;
  homeTeam: { id?: number; name: string; shortName?: string; flagUrl?: string };
  awayTeam: { id?: number; name: string; shortName?: string; flagUrl?: string };
  homeScore: number | null; awayScore: number | null; kickoffAt: string;
  stageName?: string; groupCode?: string;
  externalProviderId?: number | null;
}

/* ─── Fixture Card ──────────────────────────────────────────────────────── */
function FixtureCard({
  fixture, isSuccess, isEditing, homeScore, awayScore, saving, error,
  onEdit, onCancel, onSave, onHomeChange, onAwayChange, onExtend, idx,
}: {
  fixture: FixtureAdmin; isSuccess: boolean; isEditing: boolean;
  homeScore: string; awayScore: string; saving: boolean; error: string;
  onEdit: () => void; onCancel: () => void; onSave: () => void;
  onHomeChange: (v: string) => void; onAwayChange: (v: string) => void;
  onExtend: () => void; idx: number;
}) {
  const isFinished = fixture.status === 'FINISHED';
  const isLive     = fixture.status === 'LIVE';
  const isPending  = !isFinished;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: idx * 0.04, type: 'spring', stiffness: 280, damping: 26 }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: isSuccess
          ? 'linear-gradient(145deg, rgba(6,40,30,0.95), rgba(9,50,38,0.9))'
          : isFinished
          ? 'linear-gradient(145deg, rgba(9,18,36,0.95), rgba(12,24,46,0.9))'
          : 'linear-gradient(145deg, rgba(20,14,6,0.95), rgba(28,18,6,0.9))',
        border: `1px solid ${isSuccess ? 'rgba(52,211,153,0.5)' : isFinished ? 'rgba(56,189,248,0.18)' : 'rgba(251,191,36,0.3)'}`,
        boxShadow: isSuccess
          ? '0 0 28px rgba(52,211,153,0.15), 0 8px 24px rgba(2,6,23,0.5)'
          : isPending
          ? '0 0 28px rgba(251,191,36,0.08), 0 8px 24px rgba(2,6,23,0.5)'
          : '0 8px 24px rgba(2,6,23,0.45)',
      }}>
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: isSuccess ? 'linear-gradient(90deg, transparent, #34d399, transparent)' : isFinished ? 'linear-gradient(90deg, transparent, #38bdf8, transparent)' : 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

      {/* Pulso de fondo en pendientes */}
      {isPending && !isEditing && (
        <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />
      )}

      <div className="relative p-4">
        {/* Top row: ID + estado */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md"
            style={{ color: 'rgba(148,163,184,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            #{fixture.id}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              color: isSuccess ? '#34d399' : isFinished ? '#38bdf8' : '#fbbf24',
              background: isSuccess ? 'rgba(52,211,153,0.1)' : isFinished ? 'rgba(56,189,248,0.1)' : 'rgba(251,191,36,0.1)',
              border: `1px solid ${isSuccess ? 'rgba(52,211,153,0.25)' : isFinished ? 'rgba(56,189,248,0.2)' : 'rgba(251,191,36,0.25)'}`,
            }}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-400' : isFinished ? 'bg-sky-400' : 'bg-amber-400 animate-pulse'}`} />
            {isSuccess ? 'Guardado' : isFinished ? 'Finalizado' : 'Pendiente'}
          </div>
        </div>

        {/* Scoreboard central */}
        <div className="flex items-center gap-3 mb-2">
          <p className="flex-1 text-right font-black leading-tight truncate"
            style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontSize: '1rem' }}>
            {fixture.homeTeam.name}
          </p>

          {/* Score box */}
          <div className="shrink-0 flex items-center justify-center px-4 py-2.5 rounded-2xl"
            style={{
              background: isFinished && !isEditing ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${isFinished && !isEditing ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.08)'}`,
              minWidth: 88,
              boxShadow: isFinished && !isEditing ? '0 0 16px rgba(34,211,238,0.1)' : 'none',
            }}>
            {isFinished && fixture.homeScore !== null && !isEditing ? (
              <span className="font-black text-2xl tracking-wider" style={{ color: '#22d3ee', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
                {fixture.homeScore}<span style={{ color: 'rgba(148,163,184,0.35)', margin: '0 4px' }}>—</span>{fixture.awayScore}
              </span>
            ) : (
              <span className="text-sm font-black" style={{ color: 'rgba(148,163,184,0.35)', fontFamily: 'var(--font-display)' }}>VS</span>
            )}
          </div>

          <p className="flex-1 font-black leading-tight truncate"
            style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontSize: '1rem' }}>
            {fixture.awayTeam.name}
          </p>
        </div>

        {/* Fecha */}
        <p className="text-center text-[11px] mb-4" style={{ color: 'rgba(148,163,184,0.38)' }}>
          {new Date(fixture.kickoffAt).toLocaleDateString('es', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>

        {/* Success banner */}
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 text-xs font-bold"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
            <IconCheck /> Resultado guardado — ranking actualizado
          </motion.div>
        )}

        {/* Formulario edición */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-4 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-black text-center mb-4 tracking-[0.15em]" style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'var(--font-display)' }}>
                  MARCADOR FINAL
                </p>
                <div className="flex items-center gap-3 mb-4">
                  {[
                    { label: fixture.homeTeam.name, value: homeScore, onChange: onHomeChange },
                    { label: fixture.awayTeam.name, value: awayScore, onChange: onAwayChange },
                  ].map((team, i) => (
                    <React.Fragment key={i}>
                      {i === 1 && <span className="text-2xl font-black shrink-0" style={{ color: 'rgba(148,163,184,0.3)', marginTop: 24 }}>—</span>}
                      <div className="flex-1">
                        <p className="text-[10px] text-center truncate mb-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{team.label}</p>
                        <input type="number" min="0" max="20" value={team.value} onChange={e => team.onChange(e.target.value)}
                          className="w-full text-center text-4xl font-black py-3 rounded-xl outline-none transition-all focus:scale-105"
                          style={{ background: 'rgba(34,211,238,0.06)', border: '1.5px solid rgba(34,211,238,0.3)', color: '#22d3ee', fontFamily: 'var(--font-display)', boxShadow: '0 0 20px rgba(34,211,238,0.1)' }}
                          placeholder="0" />
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs font-medium text-center mb-3" style={{ color: '#f87171' }}>
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-2">
                  <motion.button onClick={onCancel} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)' }}>
                    <IconX /> Cancelar
                  </motion.button>
                  <motion.button onClick={onSave} disabled={saving} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', boxShadow: '0 4px 18px rgba(16,185,129,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                    <IconCheck /> {saving ? 'GUARDANDO…' : 'CONFIRMAR'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones acción */}
        {!isEditing && (
          <div className={`flex gap-2 ${(isLive || isFinished) ? 'flex-col' : ''}`}>
            <motion.button onClick={onEdit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all"
              style={{
                background: isFinished ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, rgba(34,211,238,0.12), rgba(16,185,129,0.12))',
                border: `1px solid ${isFinished ? 'rgba(255,255,255,0.09)' : 'rgba(34,211,238,0.3)'}`,
                color: isFinished ? 'rgba(148,163,184,0.7)' : '#22d3ee',
                fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                boxShadow: isFinished ? 'none' : '0 0 16px rgba(34,211,238,0.08)',
              }}>
              <IconEdit />
              {isFinished ? 'EDITAR RESULTADO' : 'INGRESAR RESULTADO'}
            </motion.button>
            {(isLive || isFinished) && (
              <motion.button onClick={onExtend} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.28)',
                  color: '#fbbf24',
                }}>
                ⏱ EXTENDER PARTIDO
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ─── Schedule Tab helpers ───────────────────────────────────────────────── */
interface TeamItem   { id: number; name: string; shortName: string; flagUrl?: string; }
interface StageItem  { id: number; code: string; name: string; sortOrder: number; }
interface GroupItem  { id: number; code: string; name: string; }

const SCHED_SELECT: React.CSSProperties = {
  background: 'rgba(9,18,36,0.95)',
  border: '1px solid rgba(34,211,238,0.18)',
  color: '#e2e8f0',
  borderRadius: 10,
  padding: '9px 11px',
  width: '100%',
  fontSize: 12,
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const STATUS_CFG_SCHED: Record<string, { label: string; color: string; bg: string; border: string; dot: string; cardBg: string; cardBorder: string; line: string }> = {
  SCHEDULED: { label: 'Programado', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)', dot: 'bg-amber-400 animate-pulse', cardBg: 'linear-gradient(145deg,rgba(20,14,6,0.96),rgba(28,18,6,0.92))',  cardBorder: 'rgba(251,191,36,0.28)', line: '#fbbf2455' },
  LIVE:      { label: 'En Vivo',    color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.32)',dot: 'bg-red-400 animate-pulse',   cardBg: 'linear-gradient(145deg,rgba(24,6,6,0.96),rgba(34,8,8,0.92))',    cardBorder: 'rgba(248,113,113,0.35)',line: '#f8717155' },
  FINISHED:  { label: 'Finalizado', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.22)', dot: 'bg-sky-400',                  cardBg: 'linear-gradient(145deg,rgba(9,18,36,0.96),rgba(12,24,46,0.92))',  cardBorder: 'rgba(56,189,248,0.2)',  line: '#38bdf855' },
  POSTPONED: { label: 'Pospuesto', color: '#94a3b8',  bg: 'rgba(148,163,184,0.08)',border: 'rgba(148,163,184,0.2)', dot: 'bg-slate-400',                cardBg: 'linear-gradient(145deg,rgba(9,18,36,0.96),rgba(12,24,46,0.92))',  cardBorder: 'rgba(148,163,184,0.18)',line: '#94a3b833' },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG_SCHED[status] ?? STATUS_CFG_SCHED.POSTPONED;
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'var(--font-display)' }}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label.toUpperCase()}
    </div>
  );
}

function FlagBig({ url, name }: { url?: string; name: string }) {
  if (!url) return (
    <div className="w-9 h-6 rounded-md flex items-center justify-center text-sm shrink-0"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>🏳</div>
  );
  return <img src={url} alt={name} className="w-9 h-6 rounded-md object-cover shrink-0"
    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/* ─── ConfigTab — football-data.org integration ─────────────────────────── */
function ConfigTab() {
  const [apiKey,       setApiKey]       = useState('');
  const [configured,   setConfigured]   = useState(false);
  const [maskedKey,    setMaskedKey]    = useState('');
  const [saving,       setSaving]       = useState(false);
  const [syncing,      setSyncing]      = useState(false);
  const [cleaning,        setCleaning]        = useState(false);
  const [confirmClean,    setConfirmClean]    = useState(false);
  const [cleaningApi,     setCleaningApi]     = useState(false);
  const [confirmCleanApi, setConfirmCleanApi] = useState(false);
  const [restoring,          setRestoring]          = useState(false);
  const [confirmRestore,     setConfirmRestore]     = useState(false);
  const [recalculating,      setRecalculating]      = useState(false);
  const [syncResult,   setSyncResult]   = useState<{ created: number; updated: number; errors: string[] } | null>(null);
  const [message,      setMessage]      = useState('');
  const [error,        setError]        = useState('');

  useEffect(() => { loadConfig(); }, []);

  const token = () => localStorage.getItem('authToken') ?? '';

  const loadConfig = async () => {
    try {
      const res  = await fetch('/api/v1/public/admin/config', { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setConfigured(data?.data?.configured ?? false);
      setMaskedKey(data?.data?.apiKeyMasked ?? '');
    } catch { /* no-op */ }
  };

  const saveKey = async () => {
    if (!apiKey.trim()) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await fetch('/api/v1/public/admin/config/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (!res.ok) throw new Error('Error guardando');
      setMessage('API key guardada correctamente'); setApiKey('');
      await loadConfig();
    } catch { setError('Error al guardar la API key'); }
    finally { setSaving(false); }
  };

  const deleteKey = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      await fetch('/api/v1/public/admin/config/api-key', { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      setMessage('API key eliminada'); setConfigured(false); setMaskedKey('');
      await loadConfig();
    } catch { setError('Error al eliminar'); }
    finally { setSaving(false); }
  };

  const sync = async () => {
    setSyncing(true); setSyncResult(null); setError(''); setMessage('');
    try {
      const res  = await fetch('/api/v1/public/admin/config/sync', { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || 'Error al sincronizar'); return; }
      setSyncResult(data?.data);
    } catch { setError('Error de conexión'); }
    finally { setSyncing(false); }
  };

  const cleanDemo = async () => {
    setCleaning(true); setError(''); setMessage(''); setConfirmClean(false);
    try {
      const res  = await fetch('/api/v1/public/admin/config/demo-fixtures', { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) { setError('Error al limpiar'); return; }
      const d = data?.data ?? {};
      setMessage(`Eliminados: ${d.fixturesDeleted ?? 0} partidos y ${d.standingsDeleted ?? 0} standings de grupos`);
    } catch { setError('Error de conexión'); }
    finally { setCleaning(false); }
  };

  const recalculateStandings = async () => {
    setRecalculating(true); setError(''); setMessage('');
    try {
      const res = await fetch('/api/v1/public/admin/config/recalculate-standings', { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) { setError('Error al recalcular standings'); return; }
      setMessage('Standings recalculados correctamente desde los resultados de partidos');
    } catch { setError('Error de conexión'); }
    finally { setRecalculating(false); }
  };

  const restoreDemo = async () => {
    setRestoring(true); setError(''); setMessage(''); setConfirmRestore(false);
    try {
      const res = await fetch('/api/v1/public/admin/config/restore-demo', { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) { setError('Error al restaurar datos demo'); return; }
      setMessage('Datos demo restaurados correctamente');
    } catch { setError('Error de conexión'); }
    finally { setRestoring(false); }
  };

  const cleanApi = async () => {
    setCleaningApi(true); setError(''); setMessage(''); setConfirmCleanApi(false);
    try {
      const res  = await fetch('/api/v1/public/admin/config/api-fixtures', { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) { setError('Error al limpiar datos API'); return; }
      const d = data?.data ?? {};
      setMessage(`Eliminados: ${d.fixturesDeleted ?? 0} partidos sincronizados desde la API`);
    } catch { setError('Error de conexión'); }
    finally { setCleaningApi(false); }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* Status card */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: `1px solid ${configured ? 'rgba(52,211,153,0.25)' : 'rgba(192,132,252,0.20)'}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: configured ? 'linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)' : 'linear-gradient(90deg,transparent,rgba(192,132,252,0.5),transparent)' }} />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: configured ? 'rgba(52,211,153,0.12)' : 'rgba(192,132,252,0.10)', border: `1px solid ${configured ? 'rgba(52,211,153,0.30)' : 'rgba(192,132,252,0.25)'}` }}>
            <FiWifi size={18} style={{ color: configured ? '#34d399' : '#c084fc' }} />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-wide">football-data.org</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                style={{ background: configured ? '#34d399' : '#94a3b8' }}
                animate={configured ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: configured ? '#34d399' : 'rgba(148,163,184,0.5)' }}>
                {configured ? 'Conectado · Plan Free' : 'Sin configurar'}
              </span>
            </div>
          </div>
          {configured && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.20)' }}>
              <FiCheck size={10} style={{ color: '#34d399' }} />
              <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Activo</span>
            </div>
          )}
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'Fixtures ✓', color: '#34d399' },
            { label: 'Horarios (delay)', color: '#fbbf24' },
            { label: 'Resultados (delay)', color: '#fbbf24' },
            { label: '10 llamadas/min', color: '#38bdf8' },
            { label: 'Gratis €0/mes', color: '#c084fc' },
          ].map(({ label, color }) => (
            <span key={label} className="text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase"
              style={{ color, background: `${color}12`, border: `1px solid ${color}28` }}>
              {label}
            </span>
          ))}
        </div>

        {configured && maskedKey && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-4"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <span className="text-[10px] text-emerald-400/60 font-mono">{maskedKey}</span>
            <motion.button onClick={deleteKey} disabled={saving}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiTrash2 size={10} /> Eliminar
            </motion.button>
          </div>
        )}

        {/* Input nueva key */}
        <div className="space-y-3">
          <label className="text-[9px] font-black tracking-[0.28em] uppercase" style={{ color: 'rgba(192,132,252,0.60)' }}>
            {configured ? 'Reemplazar API Key' : 'API Key de football-data.org'}
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="Pega tu API key aquí..."
              className="flex-1 px-4 py-2.5 rounded-xl text-[12px] font-mono outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.22)', color: '#e2e8f0', caretColor: '#c084fc' }}
            />
            <motion.button onClick={saveKey} disabled={saving || !apiKey.trim()}
              className="px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase shrink-0"
              style={{ background: apiKey.trim() ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${apiKey.trim() ? 'rgba(192,132,252,0.40)' : 'rgba(255,255,255,0.08)'}`, color: apiKey.trim() ? '#c084fc' : 'rgba(148,163,184,0.30)', transition: 'all 0.2s' }}
              whileHover={apiKey.trim() ? { scale: 1.03 } : {}} whileTap={apiKey.trim() ? { scale: 0.97 } : {}}>
              {saving ? '...' : 'Guardar'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sync card */}
      {configured && (
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: '1px solid rgba(56,189,248,0.18)', backdropFilter: 'blur(20px)' }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.5),transparent)' }} />

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-black text-white tracking-wide">Sincronizar partidos</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
                Importa todos los partidos del Mundial 2026 desde football-data.org
              </p>
            </div>
            <motion.button onClick={sync} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase shrink-0"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8', boxShadow: syncing ? 'none' : '0 0 16px rgba(56,189,248,0.15)' }}
              whileHover={!syncing ? { scale: 1.03, boxShadow: '0 0 24px rgba(56,189,248,0.28)' } : {}}
              whileTap={!syncing ? { scale: 0.97 } : {}}>
              <motion.span animate={syncing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <FiRefreshCw size={13} />
              </motion.span>
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </motion.button>
          </div>

          {syncResult && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-400">{syncResult.created}</p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">Creados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-sky-400">{syncResult.updated}</p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">Actualizados</p>
                </div>
                {syncResult.errors.length > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-amber-400">{syncResult.errors.length}</p>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">Advertencias</p>
                  </div>
                )}
              </div>
              {syncResult.errors.length > 0 && (
                <div className="space-y-1 mt-2">
                  {syncResult.errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-[9px] text-amber-400/60">{e}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Recalcular Standings */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: '1px solid rgba(251,191,36,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.4),transparent)' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Recalcular standings</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Recalcula la tabla de posiciones de todos los grupos desde los resultados reales de los partidos
            </p>
          </div>
          <motion.button onClick={recalculateStandings} disabled={recalculating}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)', color: '#fbbf24' }}>
            <FiRefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Calculando...' : 'Recalcular'}
          </motion.button>
        </div>
      </div>

      {/* Restaurar datos BD */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: '1px solid rgba(52,211,153,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Restaurar datos BD</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Vuelve a insertar los fixtures y standings marcados como <span className="font-black" style={{ color: '#34d399' }}>BD</span> (partidos demo originales)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmRestore ? (
              <motion.div key="confirm-restore" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmRestore(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.6)' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={restoreDemo} disabled={restoring} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#34d399' }}>
                  <FiRefreshCw size={11} /> {restoring ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn-restore" onClick={() => setConfirmRestore(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)', color: '#34d399' }}>
                <FiRefreshCw size={11} /> Restaurar BD
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clean demo fixtures card */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: '1px solid rgba(192,132,252,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(192,132,252,0.4),transparent)' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Limpiar datos demo</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Elimina todos los fixtures marcados como <span className="font-black" style={{ color: '#c084fc' }}>BD</span> (creados manualmente, sin origen API)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmClean ? (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmClean(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.6)' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={cleanDemo} disabled={cleaning} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                  <FiTrash2 size={11} /> {cleaning ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn" onClick={() => setConfirmClean(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.22)', color: '#c084fc' }}>
                <FiTrash2 size={11} /> Limpiar BD
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Limpiar datos API */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.97), rgba(6,18,42,0.95))', border: '1px solid rgba(56,189,248,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent)' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Limpiar datos API</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Elimina todos los fixtures marcados como <span className="font-black" style={{ color: '#38bdf8' }}>API</span> (sincronizados desde el proveedor externo)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmCleanApi ? (
              <motion.div key="confirm-api" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmCleanApi(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.6)' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={cleanApi} disabled={cleaningApi} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                  <FiTrash2 size={11} /> {cleaningApi ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn-api" onClick={() => setConfirmCleanApi(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.22)', color: '#38bdf8' }}>
                <FiTrash2 size={11} /> Limpiar API
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] font-bold text-emerald-400 text-center">{message}</motion.p>
      )}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] font-bold text-red-400 text-center">{error}</motion.p>
      )}
    </div>
  );
}

function ScheduleTab({ tournamentId, token }: { tournamentId: number; token: string }) {
  const [teams,    setTeams]    = useState<TeamItem[]>([]);
  const [stages,   setStages]   = useState<StageItem[]>([]);
  const [groups,   setGroups]   = useState<GroupItem[]>([]);
  const [fixtures, setFixtures] = useState<FixtureAdmin[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState<'ALL'|'SCHEDULED'|'LIVE'|'FINISHED'>('ALL');

  /* create */
  const [cHome, setCHome] = useState(''); const [cAway, setCAway] = useState('');
  const [cKick, setCKick] = useState(''); const [cStage, setCStage] = useState('');
  const [cGroup, setCGroup] = useState('');
  const [creating, setCreating] = useState(false);
  const [cError, setCError] = useState(''); const [cOk, setCOk] = useState(false);

  /* edit */
  const [editId, setEditId] = useState<number|null>(null);
  const [eHome, setEHome] = useState(''); const [eAway, setEAway] = useState('');
  const [eKick, setEKick] = useState(''); const [eStage, setEStage] = useState('');
  const [eGroup, setEGroup] = useState('');
  const [saving, setSaving] = useState(false);
  const [eError, setEError] = useState(''); const [eOk, setEOk] = useState<number|null>(null);

  /* delete */
  const [deletingId, setDeletingId] = useState<number|null>(null);
  const [confirmId,  setConfirmId]  = useState<number|null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [tr, sr, gr, fr] = await Promise.all([
        fetch('/api/v1/public/teams').then(r => r.json()),
        fetch(`/api/v1/public/tournaments/${tournamentId}/stages`).then(r => r.json()),
        fetch(`/api/v1/public/tournaments/${tournamentId}/groups`).then(r => r.json()),
        fetch(`/api/v1/public/tournaments/${tournamentId}/fixtures`).then(r => r.json()),
      ]);
      setTeams((tr?.data ?? []).map((t: any) => ({ id: t.id, name: t.name, shortName: t.shortName, flagUrl: t.flagUrl })));
      setStages((sr?.data ?? []).map((s: any) => ({ id: s.id, code: s.code, name: s.name, sortOrder: s.sortOrder })));
      setGroups((gr?.data ?? []).map((g: any) => ({ id: g.id, code: g.code, name: g.name })));
      const list: FixtureAdmin[] = (fr?.data ?? []).map((f: any) => ({
        id: f.id, name: f.name, status: f.status,
        homeTeam: { id: f.homeTeam?.id, name: f.homeTeam?.name, shortName: f.homeTeam?.shortName, flagUrl: f.homeTeam?.flagUrl },
        awayTeam: { id: f.awayTeam?.id, name: f.awayTeam?.name, shortName: f.awayTeam?.shortName, flagUrl: f.awayTeam?.flagUrl },
        homeScore: f.homeScore ?? null, awayScore: f.awayScore ?? null,
        kickoffAt: f.kickoffAt, stageName: f.stageName, groupCode: f.groupCode,
        externalProviderId: f.externalProviderId ?? null,
      }));
      list.sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
      setFixtures(list);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [tournamentId]);

  const cHomeTeam = teams.find(t => t.id === Number(cHome));
  const cAwayTeam = teams.find(t => t.id === Number(cAway));

  const handleCreate = async () => {
    if (!cHome || !cAway || !cKick || !cStage) { setCError('Completa equipo local, visitante, etapa y fecha/hora'); return; }
    if (cHome === cAway) { setCError('Los equipos no pueden ser iguales'); return; }
    setCreating(true); setCError('');
    try {
      const body: any = { tournamentId, homeTeamId: Number(cHome), awayTeamId: Number(cAway), stageId: Number(cStage), kickoffAt: new Date(cKick).toISOString() };
      if (cGroup) body.groupStageId = Number(cGroup);
      const res = await fetch('/api/v1/public/tournaments/fixtures', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); setCError(err?.message || 'Error al crear'); return; }
      setCOk(true); setCHome(''); setCAway(''); setCKick(''); setCStage(''); setCGroup(''); setShowForm(false);
      setTimeout(() => setCOk(false), 3000);
      await load();
    } catch { setCError('Error de conexión'); } finally { setCreating(false); }
  };

  const startEdit = (f: FixtureAdmin) => {
    setEditId(f.id); setConfirmId(null);
    setEHome(f.homeTeam.id ? String(f.homeTeam.id) : '');
    setEAway(f.awayTeam.id ? String(f.awayTeam.id) : '');
    setEKick(f.kickoffAt ? toDatetimeLocal(f.kickoffAt) : '');
    setEStage(String(stages.find(s => s.name === f.stageName)?.id ?? ''));
    setEGroup(String(groups.find(g => g.code === f.groupCode)?.id ?? ''));
    setEError('');
  };

  const handleSaveEdit = async (id: number) => {
    if (!eHome || !eAway || !eKick || !eStage) { setEError('Completa todos los campos requeridos'); return; }
    if (eHome === eAway) { setEError('Los equipos no pueden ser iguales'); return; }
    setSaving(true); setEError('');
    try {
      const body: any = { homeTeamId: Number(eHome), awayTeamId: Number(eAway), stageId: Number(eStage), kickoffAt: new Date(eKick).toISOString() };
      if (eGroup) body.groupStageId = Number(eGroup);
      const res = await fetch(`/api/v1/public/tournaments/fixtures/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); setEError(err?.message || 'Error al guardar'); return; }
      setEOk(id); setEditId(null);
      setTimeout(() => setEOk(null), 3000);
      await load();
    } catch { setEError('Error de conexión'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/public/tournaments/fixtures/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      setFixtures(prev => prev.filter(f => f.id !== id)); setConfirmId(null);
    } finally { setDeletingId(null); }
  };

  const counts = { ALL: fixtures.length, SCHEDULED: fixtures.filter(f => f.status === 'SCHEDULED').length, LIVE: fixtures.filter(f => f.status === 'LIVE').length, FINISHED: fixtures.filter(f => f.status === 'FINISHED').length };
  const filtered = fixtures.filter(f => filter === 'ALL' || f.status === filter);
  const FILTERS = [
    { key: 'ALL' as const, label: 'TODOS', n: counts.ALL },
    { key: 'SCHEDULED' as const, label: 'PRÓXIMOS', n: counts.SCHEDULED },
    { key: 'LIVE' as const, label: 'EN VIVO', n: counts.LIVE },
    { key: 'FINISHED' as const, label: 'FINALIZADOS', n: counts.FINISHED },
  ];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.14em]" style={{ color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>GESTIÓN DE PARTIDOS</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.4)' }}>{fixtures.length} partidos · Solo se eliminan los programados</p>
        </div>
        <motion.button onClick={() => { setShowForm(v => !v); setCError(''); }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
          style={{ background: showForm ? 'rgba(255,255,255,0.06)' : 'linear-gradient(90deg,#06b6d4,#10b981)', border: showForm ? '1px solid rgba(255,255,255,0.1)' : 'none', color: showForm ? 'rgba(148,163,184,0.7)' : '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', boxShadow: showForm ? 'none' : '0 4px 18px rgba(6,182,212,0.3)' }}>
          {showForm ? <IconX /> : <IconPlus />}{showForm ? 'CANCELAR' : 'AGREGAR PARTIDO'}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
            <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg,rgba(9,20,38,0.96),rgba(14,30,56,0.92))', border: '1px solid rgba(34,211,238,0.25)', boxShadow: '0 8px 28px rgba(2,6,23,0.5)' }}>
              <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg,transparent,#22d3ee,transparent)' }} />
              <div className="p-5">
                <p className="text-[10px] font-black tracking-[0.2em] mb-4" style={{ color: '#22d3ee', fontFamily: 'var(--font-display)' }}>NUEVO PARTIDO</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'EQUIPO LOCAL', val: cHome, set: setCHome },
                    { label: 'EQUIPO VISITANTE', val: cAway, set: setCAway },
                  ].map(({ label, val, set }, i) => {
                    const preview = teams.find(t => t.id === Number(val));
                    return (
                      <div key={i}>
                        <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</p>
                        <div className="flex items-center gap-2">
                          <FlagBig url={preview?.flagUrl} name={preview?.name ?? ''} />
                          <div className="flex-1 relative">
                            <select value={val} onChange={e => set(e.target.value)} style={SCHED_SELECT}>
                              <option value="">Seleccionar...</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div>
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>ETAPA</p>
                    <div className="relative"><select value={cStage} onChange={e => setCStage(e.target.value)} style={SCHED_SELECT}><option value="">Seleccionar etapa...</option>{stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>GRUPO <span style={{ opacity: 0.4 }}>(opcional)</span></p>
                    <div className="relative"><select value={cGroup} onChange={e => setCGroup(e.target.value)} style={SCHED_SELECT}><option value="">Sin grupo</option>{groups.map(g => <option key={g.id} value={g.id}>Grupo {g.code}</option>)}</select><span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span></div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>FECHA Y HORA (hora local)</p>
                    <input type="datetime-local" value={cKick} onChange={e => setCKick(e.target.value)} style={{ ...SCHED_SELECT, colorScheme: 'dark' }} />
                  </div>
                </div>
                <AnimatePresence>
                  {cHomeTeam && cAwayTeam && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl mb-3"
                      style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FlagBig url={cHomeTeam.flagUrl} name={cHomeTeam.name} />
                        <span className="font-black text-sm truncate" style={{ color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>{cHomeTeam.shortName || cHomeTeam.name}</span>
                      </div>
                      <span className="font-black text-sm shrink-0" style={{ color: 'rgba(148,163,184,0.3)', fontFamily: 'var(--font-display)' }}>VS</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-sm truncate" style={{ color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>{cAwayTeam.shortName || cAwayTeam.name}</span>
                        <FlagBig url={cAwayTeam.flagUrl} name={cAwayTeam.name} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {cError && <p className="text-xs text-center mb-3" style={{ color: '#f87171' }}>{cError}</p>}
                <motion.button onClick={handleCreate} disabled={creating} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg,#06b6d4,#0ea5e9,#10b981)', boxShadow: '0 4px 18px rgba(6,182,212,0.3)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                  <IconPlus />{creating ? 'CREANDO…' : 'CREAR PARTIDO'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create success */}
      <AnimatePresence>
        {cOk && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
            <IconCheck /> Partido creado correctamente
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-xl" style={{ background: 'rgba(9,18,36,0.92)', border: '1px solid rgba(34,211,238,0.12)' }}>
        {FILTERS.map(f => (
          <motion.button key={f.key} onClick={() => setFilter(f.key)} whileTap={{ scale: 0.96 }}
            className="relative py-2.5 rounded-lg text-[8px] font-black flex flex-col items-center gap-0.5"
            style={{ color: filter === f.key ? '#fff' : 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-display)' }}>
            {filter === f.key && (
              <motion.span layoutId="sched-filter" className="absolute inset-0 rounded-lg"
                style={{ background: 'linear-gradient(90deg,#06b6d4,#0ea5e9,#10b981)', boxShadow: '0 2px 12px rgba(6,182,212,0.25)' }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
            )}
            <span className="relative z-10 text-sm font-black leading-none" style={{ fontFamily: 'var(--font-display)' }}>{f.n}</span>
            <span className="relative z-10 tracking-widest text-[7px]">{f.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-cyan-400/15 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-4xl opacity-20 mb-3">📅</p>
          <p className="text-xs tracking-widest" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-display)' }}>NO HAY PARTIDOS EN ESTA CATEGORÍA</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((f, idx) => {
              const cfg = STATUS_CFG_SCHED[f.status] ?? STATUS_CFG_SCHED.POSTPONED;
              const isEditing = editId === f.id;
              const canDelete = f.status === 'SCHEDULED';
              const isEditOk  = eOk === f.id;
              const eHomeTeam = teams.find(t => t.id === Number(eHome));
              const eAwayTeam = teams.find(t => t.id === Number(eAway));

              return (
                <motion.div key={f.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 280, damping: 26 }}
                  className={`relative rounded-2xl overflow-hidden ${isEditing ? 'md:col-span-2' : ''}`}
                  style={{ background: isEditOk ? 'linear-gradient(145deg,rgba(6,40,30,0.96),rgba(9,50,38,0.92))' : cfg.cardBg, border: `1px solid ${isEditOk ? 'rgba(52,211,153,0.4)' : cfg.cardBorder}`, boxShadow: '0 8px 24px rgba(2,6,23,0.45)' }}>

                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,transparent,${cfg.line},transparent)` }} />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <StatusPill status={f.status} />
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(148,163,184,0.4)' }}>
                        {new Date(f.kickoffAt).toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                        <span className="font-black text-sm text-right truncate leading-none" style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
                          {f.homeTeam.shortName || f.homeTeam.name}
                        </span>
                        <FlagBig url={f.homeTeam.flagUrl} name={f.homeTeam.name} />
                      </div>
                      <div className="shrink-0 flex items-center justify-center px-3 py-2 rounded-xl"
                        style={{ background: f.status === 'FINISHED' ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${f.status === 'FINISHED' ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.08)'}`, minWidth: 70 }}>
                        {f.status === 'FINISHED' && f.homeScore !== null
                          ? <span className="font-black text-lg tracking-wider" style={{ color: '#22d3ee', fontFamily: 'var(--font-display)' }}>{f.homeScore}<span style={{ color: 'rgba(148,163,184,0.3)', margin: '0 3px' }}>-</span>{f.awayScore}</span>
                          : f.status === 'LIVE'
                          ? <span className="font-black text-xs" style={{ color: '#f87171', fontFamily: 'var(--font-display)' }}>LIVE</span>
                          : <span className="font-black text-xs" style={{ color: 'rgba(148,163,184,0.28)', fontFamily: 'var(--font-display)' }}>VS</span>
                        }
                      </div>
                      <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                        <FlagBig url={f.awayTeam.flagUrl} name={f.awayTeam.name} />
                        <span className="font-black text-sm truncate leading-none" style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
                          {f.awayTeam.shortName || f.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    {!isEditing && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Source badge */}
                          {f.externalProviderId != null ? (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest"
                              style={{ background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}>
                              API
                            </span>
                          ) : (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest"
                              style={{ background: 'rgba(192,132,252,0.10)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc' }}>
                              BD
                            </span>
                          )}
                          {f.stageName && <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.45)' }}>{f.stageName}</span>}
                          {f.groupCode && <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.45)' }}>Grupo {f.groupCode}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <motion.button onClick={() => startEdit(f)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)', color: '#22d3ee', fontFamily: 'var(--font-display)' }}>
                            <IconEdit /> EDITAR
                          </motion.button>
                          {canDelete && (
                            confirmId === f.id ? (
                              <div className="flex gap-1">
                                <motion.button onClick={() => setConfirmId(null)} whileTap={{ scale: 0.95 }}
                                  className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.6)' }}>
                                  <IconX />
                                </motion.button>
                                <motion.button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-50"
                                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'var(--font-display)' }}>
                                  {deletingId === f.id ? <span className="w-3 h-3 rounded-full border border-t-red-400 border-red-400/20 animate-spin" /> : <><IconCheck /> ¿ELIMINAR?</>}
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button onClick={() => setConfirmId(f.id)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
                                <IconTrash />
                              </motion.button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {isEditOk && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mt-2"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                        <IconCheck /> Actualizado correctamente
                      </motion.div>
                    )}
                  </div>

                  {/* Edit inline form */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                        <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                          <p className="text-[9px] font-black tracking-[0.2em] mb-3 pt-3" style={{ color: '#22d3ee', fontFamily: 'var(--font-display)' }}>EDITAR PARTIDO #{f.id}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {[
                              { label: 'EQUIPO LOCAL', val: eHome, set: setEHome, preview: eHomeTeam },
                              { label: 'EQUIPO VISITANTE', val: eAway, set: setEAway, preview: eAwayTeam },
                            ].map(({ label, val, set, preview }, i) => (
                              <div key={i}>
                                <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>{label}</p>
                                <div className="flex items-center gap-2">
                                  <FlagBig url={preview?.flagUrl} name={preview?.name ?? ''} />
                                  <div className="flex-1 relative">
                                    <select value={val} onChange={e => set(e.target.value)} style={SCHED_SELECT}>
                                      <option value="">Seleccionar...</option>
                                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div>
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>ETAPA</p>
                              <div className="relative"><select value={eStage} onChange={e => setEStage(e.target.value)} style={SCHED_SELECT}><option value="">Seleccionar...</option>{stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span></div>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>GRUPO <span style={{ opacity: 0.4 }}>(opcional)</span></p>
                              <div className="relative"><select value={eGroup} onChange={e => setEGroup(e.target.value)} style={SCHED_SELECT}><option value="">Sin grupo</option>{groups.map(g => <option key={g.id} value={g.id}>Grupo {g.code}</option>)}</select><span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>▾</span></div>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>FECHA Y HORA</p>
                              <input type="datetime-local" value={eKick} onChange={e => setEKick(e.target.value)} style={{ ...SCHED_SELECT, colorScheme: 'dark' }} />
                            </div>
                          </div>
                          {eError && <p className="text-xs text-center mb-3" style={{ color: '#f87171' }}>{eError}</p>}
                          <div className="flex gap-2">
                            <motion.button onClick={() => { setEditId(null); setEError(''); }} whileTap={{ scale: 0.97 }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(148,163,184,0.7)' }}>
                              <IconX /> Cancelar
                            </motion.button>
                            <motion.button onClick={() => handleSaveEdit(f.id)} disabled={saving} whileTap={{ scale: 0.97 }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50"
                              style={{ background: 'linear-gradient(90deg,#10b981,#06b6d4)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                              <IconCheck />{saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [fixtures,    setFixtures]    = useState<FixtureAdmin[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [homeScore,   setHomeScore]   = useState('');
  const [awayScore,   setAwayScore]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [successId,   setSuccessId]   = useState<number | null>(null);
  const [error,       setError]       = useState('');
  const [extendId,    setExtendId]    = useState<number | null>(null);
  const [extraMins,   setExtraMins]   = useState<number | null>(null);
  const [extending,   setExtending]   = useState(false);
  const [activeTab, setActiveTab] = useState<'resultados' | 'analytics' | 'horario' | 'config'>('resultados');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SCHEDULED' | 'FINISHED'>('SCHEDULED');
  const [tournamentId, setTournamentId] = useState<number | null>(null);

  const isAdmin = user?.email === 'admin@example.com';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) router.replace('/');
  }, [authLoading, isAuthenticated, isAdmin]);

  useEffect(() => { if (isAdmin) loadFixtures(); }, [isAdmin]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const tournament = await getCurrentTournament();
      if (!tournament?.id) return;
      setTournamentId(tournament.id);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/public/tournaments/${tournament.id}/fixtures`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const list: FixtureAdmin[] = (data?.data ?? []).map((f: any) => ({
        id: f.id, name: f.name, status: f.status, homeTeam: f.homeTeam, awayTeam: f.awayTeam,
        homeScore: f.homeScore ?? null, awayScore: f.awayScore ?? null, kickoffAt: f.kickoffAt,
      }));
      list.sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
      setFixtures(list);
    } catch { setError('Error cargando partidos'); }
    finally { setLoading(false); }
  };

  const startEdit = (f: FixtureAdmin) => { setEditingId(f.id); setHomeScore(f.homeScore !== null ? String(f.homeScore) : ''); setAwayScore(f.awayScore !== null ? String(f.awayScore) : ''); setError(''); };
  const cancelEdit = () => { setEditingId(null); setHomeScore(''); setAwayScore(''); setError(''); };

  const confirmExtend = async () => {
    if (!extendId || !extraMins) return;
    setExtending(true);
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/v1/public/tournaments/fixtures/${extendId}/extend`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ extraMinutes: extraMins }),
      });
      setExtendId(null); setExtraMins(null);
      await loadFixtures();
    } catch { } finally { setExtending(false); }
  };

  const saveResult = async (fixtureId: number) => {
    if (homeScore === '' || awayScore === '') { setError('Ingresa ambos marcadores'); return; }
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/public/tournaments/fixtures/${fixtureId}/result`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ homeScore: parseInt(homeScore), awayScore: parseInt(awayScore) }),
      });
      if (!res.ok) { const err = await res.json(); setError(err?.message || 'Error al guardar resultado'); return; }
      setSuccessId(fixtureId); setEditingId(null);
      setTimeout(() => setSuccessId(null), 3000);
      await loadFixtures();
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  const filtered = fixtures.filter(f => filterStatus === 'ALL' ? true : f.status === filterStatus);
  const pendingCount = fixtures.filter(f => f.status === 'SCHEDULED').length;
  const finishedCount = fixtures.filter(f => f.status === 'FINISHED').length;

  if (authLoading) return null;
  if (!isAuthenticated || !isAdmin) return null;

  const MAIN_TABS = [
    { key: 'resultados' as const, icon: <FiTarget size={13} />,    label: 'Resultados', accent: '#22d3ee', glow: 'rgba(34,211,238,0.45)' },
    { key: 'horario'    as const, icon: <FiCalendar size={13} />,  label: 'Horario',    accent: '#38bdf8', glow: 'rgba(56,189,248,0.45)' },
    { key: 'analytics'  as const, icon: <FiBarChart2 size={13} />, label: 'Analytics',  accent: '#34d399', glow: 'rgba(52,211,153,0.45)' },
    { key: 'config'     as const, icon: <FiSettings size={13} />,  label: 'Config',     accent: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  ];
  const FILTER_TABS = [
    { key: 'SCHEDULED' as const, label: 'Pendientes',  count: pendingCount,  dot: '#fbbf24' },
    { key: 'FINISHED'  as const, label: 'Finalizados', count: finishedCount, dot: '#34d399' },
    { key: 'ALL'       as const, label: 'Todos',       count: fixtures.length, dot: '#94a3b8' },
  ];

  return (
    <div className="w-full min-h-screen relative">
      {/* Fondo oscuro completo del admin */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 0%, rgba(6,30,60,0.55) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(4,46,46,0.4) 0%, transparent 50%), linear-gradient(180deg, rgba(6,18,38,0.7) 0%, rgba(4,14,30,0.65) 100%)',
      }} />

      {/* Partículas decorativas */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="fixed rounded-full pointer-events-none" style={{ zIndex: 0,
          width: [120,80,160,100,140,90][i], height: [120,80,160,100,140,90][i],
          left: ['8%','72%','45%','15%','85%','55%'][i], top: ['15%','8%','60%','80%','40%','25%'][i],
          background: ['rgba(6,182,212,0.04)','rgba(16,185,129,0.03)','rgba(56,189,248,0.04)','rgba(251,191,36,0.03)','rgba(6,182,212,0.03)','rgba(16,185,129,0.04)'][i],
          filter: 'blur(40px)',
        }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: [8,11,9,7,10,8][i], repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }} />
      ))}

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header admin con logo */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(3,6,20,0.98) 0%, rgba(8,4,28,0.96) 50%, rgba(4,8,24,0.95) 100%)', borderBottom: '1px solid rgba(192,132,252,0.18)' }}>
          {/* Ambient glow layers */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,132,252,0.10) 0%, transparent 65%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(192,132,252,0.04) 50%, transparent 90%)' }} />
          {/* Animated bottom border glow */}
          <motion.div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.7), rgba(34,211,238,0.5), rgba(192,132,252,0.7), transparent)' }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Animated top corner orbs */}
          <motion.div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 65%)', filter: 'blur(32px)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 65%)', filter: 'blur(28px)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />

          <div className="relative px-4 py-5 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="flex items-center justify-center mb-3">
              <motion.div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest"
                style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.30)', color: '#c084fc', fontFamily: 'var(--font-display)' }}
                animate={{ boxShadow: ['0 0 8px rgba(192,132,252,0.10)', '0 0 22px rgba(192,132,252,0.30)', '0 0 8px rgba(192,132,252,0.10)'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                <IconShield /> ACCESO ADMIN
              </motion.div>
            </div>

            {/* Logo centrado */}
            <div className="inline-flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="relative shrink-0">
                  <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: 'rgba(192,132,252,0.45)', filter: 'blur(14px)' }}
                    animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }} />
                  <motion.div
                    animate={{ filter: ['drop-shadow(0 0 8px rgba(192,132,252,0.6))', 'drop-shadow(0 0 20px rgba(192,132,252,0.9)) drop-shadow(0 0 40px rgba(34,211,238,0.4))', 'drop-shadow(0 0 8px rgba(192,132,252,0.6))'] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={52} height={52} className="relative z-10 w-12 h-12 object-contain" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ filter: ['drop-shadow(0 0 6px rgba(192,132,252,0.4))', 'drop-shadow(0 0 18px rgba(192,132,252,0.75)) drop-shadow(0 0 36px rgba(34,211,238,0.30))', 'drop-shadow(0 0 6px rgba(192,132,252,0.4))'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={160} height={40} className="h-9 w-auto object-contain" style={{ mixBlendMode: 'screen' }} />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h1 className="text-center font-black text-xl leading-none mb-1"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.10em', background: 'linear-gradient(135deg, #c084fc, #e2e8f0, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                animate={{ textShadow: ['0 0 0px transparent', '0 0 0px transparent'] }}>
                PANEL DE CONTROL
              </motion.h1>
              <p className="text-center text-[10px] tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.45)', letterSpacing: '0.20em' }}>
                Mundial 2026 · Gestión de resultados
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 max-w-5xl mx-auto pb-32">

          {/* ── Tabs principales ── */}
          <div className="flex gap-2 mb-5 p-2 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(4,10,26,0.85) 0%, rgba(6,16,38,0.80) 100%)',
              border: '1px solid rgba(34,211,238,0.14)',
              boxShadow: '0 8px 32px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}>
            {MAIN_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative flex-1 py-3 px-3 rounded-xl font-black text-[12px] flex items-center justify-center gap-2.5 overflow-hidden"
                  style={{
                    color: isActive ? '#fff' : `${tab.accent}99`,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.07em',
                    background: isActive
                      ? `linear-gradient(135deg, ${tab.accent}28, ${tab.accent}12)`
                      : `linear-gradient(135deg, ${tab.accent}0a, transparent)`,
                    border: `1px solid ${isActive ? tab.accent + '55' : tab.accent + '20'}`,
                    boxShadow: isActive ? `0 0 20px ${tab.glow}, inset 0 1px 0 ${tab.accent}20` : 'none',
                    transition: 'all 0.25s ease',
                  }}>
                  {/* Active animated background sweep */}
                  {isActive && (
                    <motion.span layoutId="admin-main-tab" className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 30% 50%, ${tab.accent}18 0%, transparent 70%)` }}
                      transition={{ type: 'spring', stiffness: 340, damping: 30 }} />
                  )}
                  {/* Active top neon line */}
                  {isActive && (
                    <motion.span className="absolute inset-x-4 top-0 h-px rounded-full pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, ${tab.accent}, transparent)` }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                  )}
                  {/* Icon box */}
                  <motion.span
                    className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${tab.accent}20, ${tab.accent}0c)`,
                      border: `1px solid ${tab.accent}${isActive ? '55' : '30'}`,
                      color: tab.accent,
                      boxShadow: isActive ? `0 0 10px ${tab.glow}` : 'none',
                      transition: 'all 0.25s ease',
                    }}
                    animate={isActive ? { boxShadow: [`0 0 6px ${tab.glow}`, `0 0 16px ${tab.glow}`, `0 0 6px ${tab.glow}`] } : {}}
                    transition={{ duration: 2.2, repeat: Infinity }}>
                    {tab.icon}
                  </motion.span>
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* ── Config ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'config' && (
              <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <ConfigTab />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Analytics ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <AnalyticsTab />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Horario ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'horario' && tournamentId && (
              <motion.div key="horario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <ScheduleTab tournamentId={tournamentId} token={localStorage.getItem('authToken') ?? ''} />
              </motion.div>
            )}
            {activeTab === 'horario' && !tournamentId && (
              <motion.div key="horario-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-cyan-400/15 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Resultados ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'resultados' && (
              <motion.div key="resultados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                {/* Filtros con contadores */}
                <div className="flex gap-1.5 mb-5 p-1.5 rounded-2xl"
                  style={{ background: 'rgba(9,18,36,0.92)', border: '1px solid rgba(34,211,238,0.15)', boxShadow: '0 6px 18px rgba(2,6,23,0.45)', inset: '0 1px 0 rgba(255,255,255,0.04)' }}>
                  {FILTER_TABS.map(f => (
                    <motion.button key={f.key} onClick={() => setFilterStatus(f.key)} whileTap={{ scale: 0.97 }}
                      className="relative flex-1 py-2 px-1 rounded-xl text-[11px] font-black transition-colors flex flex-col items-center gap-0.5"
                      style={{ color: filterStatus === f.key ? '#fff' : 'rgba(148,163,184,0.5)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                      {filterStatus === f.key && (
                        <motion.span layoutId="admin-filter-pill" className="absolute inset-0 rounded-xl"
                          style={{ background: 'linear-gradient(90deg, #06b6d4, #0ea5e9, #10b981)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)' }}
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }} />
                      )}
                      <span className="relative z-10 flex flex-col items-center gap-0.5">
                        <span className="text-base font-black" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>{f.count}</span>
                        <span className="text-[9px] tracking-widest">{f.label.toUpperCase()}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Lista partidos */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-t-cyan-400 border-cyan-400/15 animate-spin" />
                    <p className="text-xs tracking-widest" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-display)' }}>CARGANDO PARTIDOS</p>
                  </div>
                ) : (
                  <>
                  <AnimatePresence>
                    {extendId && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                        onClick={() => { setExtendId(null); setExtraMins(null); }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                          className="relative rounded-2xl p-6 w-full max-w-sm"
                          style={{ background: 'linear-gradient(145deg, rgba(4,12,28,0.99), rgba(6,18,42,0.97))', border: '1px solid rgba(251,191,36,0.25)' }}
                          onClick={e => e.stopPropagation()}>
                          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                            style={{ background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)' }} />
                          <p className="text-base font-black text-white mb-1">⏱ Extender partido</p>
                          <p className="text-[11px] mb-5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            {fixtures.find(f => f.id === extendId)?.name}
                          </p>
                          <p className="text-[10px] font-black mb-3 tracking-widest" style={{ color: 'rgba(251,191,36,0.6)' }}>MINUTOS ADICIONALES</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {[15, 30, 45].map(m => (
                              <motion.button key={m} onClick={() => setExtraMins(m)} whileTap={{ scale: 0.95 }}
                                className="py-3 rounded-xl text-sm font-black"
                                style={{
                                  background: extraMins === m ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${extraMins === m ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                  color: extraMins === m ? '#fbbf24' : 'rgba(148,163,184,0.6)',
                                }}>
                                +{m} min
                              </motion.button>
                            ))}
                          </div>
                          <div className="mb-5">
                            <p className="text-[10px] font-black mb-2 tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>PERSONALIZADO</p>
                            <input type="number" min="1" max="120"
                              value={extraMins && ![15,30,45].includes(extraMins) ? extraMins : ''}
                              onChange={e => setExtraMins(parseInt(e.target.value) || null)}
                              placeholder="Ej: 20"
                              className="w-full text-center text-2xl font-black py-2.5 rounded-xl outline-none"
                              style={{ background: 'rgba(251,191,36,0.06)', border: '1.5px solid rgba(251,191,36,0.2)', color: '#fbbf24' }} />
                          </div>
                          <div className="flex gap-2">
                            <motion.button onClick={() => { setExtendId(null); setExtraMins(null); }} whileTap={{ scale: 0.97 }}
                              className="flex-1 py-2.5 rounded-xl text-sm font-black"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.6)' }}>
                              Cancelar
                            </motion.button>
                            <motion.button onClick={confirmExtend} disabled={!extraMins || extending} whileTap={{ scale: 0.97 }}
                              className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
                              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}>
                              {extending ? 'Aplicando...' : `Aplicar +${extraMins ?? 0} min`}
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {filtered.map((fixture, idx) => (
                        <div key={fixture.id} className={editingId === fixture.id ? 'md:col-span-2' : ''}>
                        <FixtureCard fixture={fixture} idx={idx}
                          isSuccess={successId === fixture.id} isEditing={editingId === fixture.id}
                          homeScore={homeScore} awayScore={awayScore} saving={saving}
                          error={editingId === fixture.id ? error : ''}
                          onEdit={() => startEdit(fixture)} onCancel={cancelEdit}
                          onSave={() => saveResult(fixture.id)}
                          onExtend={() => { setExtendId(fixture.id); setExtraMins(null); }}
                          onHomeChange={setHomeScore} onAwayChange={setAwayScore} />
                        </div>
                      ))}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 space-y-3">
                        <p className="text-5xl opacity-20">
                          {filterStatus === 'SCHEDULED' ? '⏳' : filterStatus === 'FINISHED' ? '✅' : '📋'}
                        </p>
                        <p className="text-xs tracking-widest" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-display)' }}>
                          NO HAY PARTIDOS {filterStatus === 'SCHEDULED' ? 'PENDIENTES' : filterStatus === 'FINISHED' ? 'FINALIZADOS' : ''}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
