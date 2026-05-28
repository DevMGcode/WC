'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiCalendar, FiBarChart2, FiSettings } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentTournament } from '@/services/publicTournament';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { IconShield, IconCheck, IconX, IconEdit } from './_components/AdminIcons';
import FixtureCard from './_components/FixtureCard';
import AnalyticsTab from './_components/AnalyticsTab';
import ConfigTab from './_components/ConfigTab';
import ScheduleTab from './_components/ScheduleTab';
import type { FixtureAdmin } from './_components/types';

const MAIN_TABS = [
  { key: 'resultados' as const, icon: <FiTarget size={13} />,    label: 'Resultados', accent: hex.green.bright,    glow: alphaOf('green', 0.45) },
  { key: 'horario'    as const, icon: <FiCalendar size={13} />,  label: 'Horario',    accent: hex.green.soft,     glow: alpha(hex.green.soft, 0.45) },
  { key: 'analytics'  as const, icon: <FiBarChart2 size={13} />, label: 'Analytics',  accent: hex.green.hover,    glow: alpha(hex.green.hover, 0.45) },
  { key: 'config'     as const, icon: <FiSettings size={13} />,  label: 'Config',     accent: hex.status.danger,  glow: alphaOf('danger', 0.45) },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [fixtures,     setFixtures]     = useState<FixtureAdmin[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [homeScore,    setHomeScore]    = useState('');
  const [awayScore,    setAwayScore]    = useState('');
  const [saving,       setSaving]       = useState(false);
  const [successId,    setSuccessId]    = useState<number | null>(null);
  const [error,        setError]        = useState('');
  const [extendId,     setExtendId]     = useState<number | null>(null);
  const [extraMins,    setExtraMins]    = useState<number | null>(null);
  const [extending,    setExtending]    = useState(false);
  const [activeTab,    setActiveTab]    = useState<'resultados'|'analytics'|'horario'|'config'>('resultados');
  const [filterStatus, setFilterStatus] = useState<'ALL'|'SCHEDULED'|'FINISHED'>('SCHEDULED');
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
      const res  = await fetch(`/api/v1/public/tournaments/${tournament.id}/fixtures`, { headers: { Authorization: `Bearer ${token}` } });
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

  const startEdit = (f: FixtureAdmin) => {
    setEditingId(f.id);
    setHomeScore(f.homeScore !== null ? String(f.homeScore) : '');
    setAwayScore(f.awayScore !== null ? String(f.awayScore) : '');
    setError('');
  };
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

  const filtered      = fixtures.filter(f => filterStatus === 'ALL' ? true : f.status === filterStatus);
  const pendingCount  = fixtures.filter(f => f.status === 'SCHEDULED').length;
  const finishedCount = fixtures.filter(f => f.status === 'FINISHED').length;

  if (authLoading || !isAuthenticated || !isAdmin) return null;

  const FILTER_TABS = [
    { key: 'SCHEDULED' as const, label: 'Pendientes',  count: pendingCount,      dot: hex.gold.base },
    { key: 'FINISHED'  as const, label: 'Finalizados', count: finishedCount,     dot: hex.green.hover },
    { key: 'ALL'       as const, label: 'Todos',       count: fixtures.length,   dot: hex.text.secondary },
  ];

  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        background: `radial-gradient(ellipse at 20% 0%, ${alpha(hex.bg.primary, 0.55)} 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(4,40,10,0.4) 0%, transparent 50%), linear-gradient(180deg, ${alpha(hex.bg.primary, 0.70)} 0%, rgba(4,11,7,0.65) 100%)`,
      }} />
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="fixed rounded-full pointer-events-none" style={{ zIndex: 0,
          width: [120,80,160,100,140,90][i], height: [120,80,160,100,140,90][i],
          left: ['8%','72%','45%','15%','85%','55%'][i], top: ['15%','8%','60%','80%','40%','25%'][i],
          background: [alpha(hex.green.base,0.04),'rgba(16,185,129,0.03)',alpha(hex.green.soft,0.04),alpha(hex.gold.base,0.03),alpha(hex.green.base,0.03),'rgba(16,185,129,0.04)'][i],
          filter: 'blur(40px)',
        }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: [8,11,9,7,10,8][i], repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }} />
      ))}

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Admin header */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(4,8,5,0.98) 0%, rgba(6,12,7,0.96) 50%, rgba(5,10,6,0.95) 100%)', borderBottom: borders.brand('danger', 0.18) }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(211,47,47,0.10) 0%, transparent 65%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(211,47,47,0.04) 50%, transparent 90%)' }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, rgba(211,47,47,0.7), ${alphaOf('green', 0.5)}, rgba(211,47,47,0.7), transparent)` }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(211,47,47,0.12) 0%, transparent 65%)', filter: 'blur(32px)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />
          <motion.div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${alphaOf('green', 0.10)} 0%, transparent 65%)`, filter: 'blur(28px)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity, delay: 1.5 }} />

          <div className="relative px-4 py-5 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <motion.div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest"
                style={{ background: alphaOf('danger', 0.12), border: borders.brand('danger', 0.30), color: hex.status.danger, fontFamily: 'var(--font-display)' }}
                animate={{ boxShadow: ['0 0 8px rgba(211,47,47,0.10)', '0 0 22px rgba(211,47,47,0.30)', '0 0 8px rgba(211,47,47,0.10)'] }}
                transition={{ duration: 2.4, repeat: Infinity }}>
                <IconShield /> ACCESO ADMIN
              </motion.div>
            </div>
            <div className="inline-flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="relative shrink-0">
                  <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: alphaOf('danger', 0.45), filter: 'blur(14px)' }}
                    animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                  <motion.div
                    animate={{ filter: ['drop-shadow(0 0 8px rgba(211,47,47,0.6))', `drop-shadow(0 0 20px rgba(211,47,47,0.9)) drop-shadow(0 0 40px ${alphaOf('green', 0.4)})`, 'drop-shadow(0 0 8px rgba(211,47,47,0.6))'] }}
                    transition={{ duration: 2.8, repeat: Infinity }}>
                    <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={52} height={52} className="relative z-10 w-12 h-12 object-contain" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ filter: ['drop-shadow(0 0 6px rgba(211,47,47,0.4))', `drop-shadow(0 0 18px rgba(211,47,47,0.75)) drop-shadow(0 0 36px ${alphaOf('green', 0.30)})`, 'drop-shadow(0 0 6px rgba(211,47,47,0.4))'] }}
                  transition={{ duration: 2.8, repeat: Infinity }}>
                  <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={160} height={40} className="h-9 w-auto object-contain" style={{ mixBlendMode: 'screen' }} />
                </motion.div>
              </div>
              <motion.h1 className="text-center font-black text-xl leading-none mb-1"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.10em', background: 'linear-gradient(135deg, #D32F2F, #e2e8f0, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PANEL DE CONTROL
              </motion.h1>
              <p className="text-center text-[10px] tracking-widest uppercase" style={{ color: alphaOf('danger', 0.45), letterSpacing: '0.20em' }}>
                Mundial 2026 · Gestión de resultados
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 max-w-5xl mx-auto pb-32">

          {/* Main tabs */}
          <div className="flex gap-2 mb-5 p-2 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${alpha(hex.bg.primary, 0.85)} 0%, ${alpha(hex.bg.secondary, 0.80)} 100%)`,
              border: `1px solid ${alphaOf('green', 0.14)}`,
              boxShadow: `0 8px 32px rgba(2,6,23,0.6), inset 0 1px 0 ${alpha(hex.neutral.white, 0.06)}`,
              backdropFilter: 'blur(20px)',
            }}>
            {MAIN_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.96 }}
                  className="relative flex-1 py-3 px-3 rounded-xl font-black text-[12px] flex items-center justify-center gap-2.5 overflow-hidden"
                  style={{
                    color: isActive ? hex.neutral.white : `${tab.accent}99`,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.07em',
                    background: isActive ? `linear-gradient(135deg, ${tab.accent}28, ${tab.accent}12)` : `linear-gradient(135deg, ${tab.accent}0a, transparent)`,
                    border: `1px solid ${isActive ? tab.accent + '55' : tab.accent + '20'}`,
                    boxShadow: isActive ? `0 0 20px ${tab.glow}, inset 0 1px 0 ${tab.accent}20` : 'none',
                    transition: 'all 0.25s ease',
                  }}>
                  {isActive && (
                    <motion.span layoutId="admin-main-tab" className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 30% 50%, ${tab.accent}18 0%, transparent 70%)` }}
                      transition={{ type: 'spring', stiffness: 340, damping: 30 }} />
                  )}
                  {isActive && (
                    <motion.span className="absolute inset-x-4 top-0 h-px rounded-full pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, ${tab.accent}, transparent)` }}
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                  )}
                  <motion.span className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
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

          {/* Tab panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'config' && (
              <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <ConfigTab />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <AnalyticsTab />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'horario' && tournamentId && (
              <motion.div key="horario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <ScheduleTab tournamentId={tournamentId} token={localStorage.getItem('authToken') ?? ''} />
              </motion.div>
            )}
            {activeTab === 'horario' && !tournamentId && (
              <motion.div key="horario-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-t-green-400 border-green-400/15 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'resultados' && (
              <motion.div key="resultados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                {/* Filter tabs */}
                <div className="flex gap-1.5 mb-5 p-1.5 rounded-2xl"
                  style={{ background: alpha(hex.bg.primary, 0.92), border: borders.brand('green', 0.15), boxShadow: '0 6px 18px rgba(2,6,23,0.45)' }}>
                  {FILTER_TABS.map(f => (
                    <motion.button key={f.key} onClick={() => setFilterStatus(f.key)} whileTap={{ scale: 0.97 }}
                      className="relative flex-1 py-2 px-1 rounded-xl text-[11px] font-black flex flex-col items-center gap-0.5"
                      style={{ color: filterStatus === f.key ? hex.neutral.white : alpha(hex.text.secondary, 0.5), fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                      {filterStatus === f.key && (
                        <motion.span layoutId="admin-filter-pill" className="absolute inset-0 rounded-xl"
                          style={{ background: `linear-gradient(90deg, ${hex.green.base}, ${hex.green.bright}, #10b981)`, boxShadow: `0 4px 14px ${alpha(hex.green.base, 0.3)}` }}
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }} />
                      )}
                      <span className="relative z-10 flex flex-col items-center gap-0.5">
                        <span className="text-base font-black" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>{f.count}</span>
                        <span className="text-[9px] tracking-widest">{f.label.toUpperCase()}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Fixture list */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-t-green-400 border-green-400/15 animate-spin" />
                    <p className="text-xs tracking-widest" style={{ color: alpha(hex.text.secondary, 0.4), fontFamily: 'var(--font-display)' }}>CARGANDO PARTIDOS</p>
                  </div>
                ) : (
                  <>
                    {/* Extend modal */}
                    <AnimatePresence>
                      {extendId && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4"
                          style={{ background: alpha(hex.neutral.black, 0.75), backdropFilter: 'blur(6px)' }}
                          onClick={() => { setExtendId(null); setExtraMins(null); }}>
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative rounded-2xl p-6 w-full max-w-sm"
                            style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.99)}, ${alpha(hex.bg.secondary, 0.97)})`, border: `1px solid ${alpha(hex.gold.base, 0.25)}` }}
                            onClick={e => e.stopPropagation()}>
                            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                              style={{ background: gradients.divider('gold', 0.5) }} />
                            <p className="text-base font-black text-white mb-1">⏱ Extender partido</p>
                            <p className="text-[11px] mb-5" style={{ color: alpha(hex.text.secondary, 0.5) }}>
                              {fixtures.find(f => f.id === extendId)?.name}
                            </p>
                            <p className="text-[10px] font-black mb-3 tracking-widest" style={{ color: alphaOf('gold', 0.6) }}>MINUTOS ADICIONALES</p>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {[15, 30, 45].map(m => (
                                <motion.button key={m} onClick={() => setExtraMins(m)} whileTap={{ scale: 0.95 }}
                                  className="py-3 rounded-xl text-sm font-black"
                                  style={{
                                    background: extraMins === m ? alphaOf('gold', 0.2) : alpha(hex.neutral.white, 0.04),
                                    border: `1px solid ${extraMins === m ? alpha(hex.gold.base, 0.5) : alpha(hex.neutral.white, 0.08)}`,
                                    color: extraMins === m ? hex.gold.base : alpha(hex.text.secondary, 0.6),
                                  }}>
                                  +{m} min
                                </motion.button>
                              ))}
                            </div>
                            <div className="mb-5">
                              <p className="text-[10px] font-black mb-2 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.4) }}>PERSONALIZADO</p>
                              <input type="number" min="1" max="120"
                                value={extraMins && ![15,30,45].includes(extraMins) ? extraMins : ''}
                                onChange={e => setExtraMins(parseInt(e.target.value) || null)}
                                placeholder="Ej: 20"
                                className="w-full text-center text-2xl font-black py-2.5 rounded-xl outline-none"
                                style={{ background: alphaOf('gold', 0.06), border: `1.5px solid ${alphaOf('gold', 0.2)}`, color: hex.gold.base }} />
                            </div>
                            <div className="flex gap-2">
                              <motion.button onClick={() => { setExtendId(null); setExtraMins(null); }} whileTap={{ scale: 0.97 }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-black"
                                style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, color: alpha(hex.text.secondary, 0.6) }}>
                                Cancelar
                              </motion.button>
                              <motion.button onClick={confirmExtend} disabled={!extraMins || extending} whileTap={{ scale: 0.97 }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
                                style={{ background: alphaOf('gold', 0.15), border: `1px solid ${alpha(hex.gold.base, 0.35)}`, color: hex.gold.base }}>
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
                            <FixtureCard
                              fixture={fixture} idx={idx}
                              isSuccess={successId === fixture.id} isEditing={editingId === fixture.id}
                              homeScore={homeScore} awayScore={awayScore}
                              saving={saving} error={editingId === fixture.id ? error : ''}
                              onEdit={() => startEdit(fixture)} onCancel={cancelEdit}
                              onSave={() => saveResult(fixture.id)}
                              onExtend={() => { setExtendId(fixture.id); setExtraMins(null); }}
                              onHomeChange={setHomeScore} onAwayChange={setAwayScore} />
                          </div>
                        ))}
                      </AnimatePresence>

                      {filtered.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-3">
                          <p className="text-5xl opacity-20">
                            {filterStatus === 'SCHEDULED' ? '⏰' : filterStatus === 'FINISHED' ? '✅' : '📋'}
                          </p>
                          <p className="text-xs tracking-widest" style={{ color: alpha(hex.text.secondary, 0.4), fontFamily: 'var(--font-display)' }}>
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
