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
import { apiFetch } from '@/lib/apiFetch';
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
      const res  = await apiFetch(`/api/v1/public/tournaments/${tournament.id}/fixtures`);
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
      await apiFetch(`/api/v1/public/tournaments/fixtures/${extendId}/extend`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      const res = await apiFetch(`/api/v1/public/tournaments/fixtures/${fixtureId}/result`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
        {/* Admin header — compact strip */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(4,8,5,0.99) 0%, rgba(5,10,6,0.97) 100%)', borderBottom: borders.brand('danger', 0.18) }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 45% 120% at 0% 50%, rgba(211,47,47,0.09) 0%, transparent 65%)' }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, rgba(211,47,47,0.65), ${alphaOf('green', 0.38)}, rgba(211,47,47,0.65), transparent)` }}
            animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

          <div className="relative px-4 py-3.5 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              {/* Left: logo + title */}
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  animate={{ filter: ['drop-shadow(0 0 5px rgba(211,47,47,0.45))', 'drop-shadow(0 0 14px rgba(211,47,47,0.80))', 'drop-shadow(0 0 5px rgba(211,47,47,0.45))'] }}
                  transition={{ duration: 2.6, repeat: Infinity }}>
                  <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={34} height={34} className="w-8 h-8 object-contain shrink-0" />
                </motion.div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-sm font-black leading-none"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: hex.text.primary }}>
                      PANEL DE CONTROL
                    </h1>
                    <motion.div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest shrink-0"
                      style={{ background: alphaOf('danger', 0.12), border: borders.brand('danger', 0.28), color: hex.status.danger, fontFamily: 'var(--font-display)' }}
                      animate={{ boxShadow: ['0 0 4px rgba(211,47,47,0.08)', '0 0 14px rgba(211,47,47,0.28)', '0 0 4px rgba(211,47,47,0.08)'] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      <IconShield /> ADMIN
                    </motion.div>
                  </div>
                  <p className="text-[9px] tracking-widest mt-0.5" style={{ color: 'rgba(211,47,47,0.40)', letterSpacing: '0.18em' }}>
                    MUNDIAL 2026 · GESTIÓN DE RESULTADOS
                  </p>
                </div>
              </div>

              {/* Right: quick stats */}
              {!loading && fixtures.length > 0 && (
                <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                  style={{ border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, background: alpha(hex.bg.primary, 0.7) }}>
                  {[
                    { val: pendingCount,    label: 'PEND',  color: hex.gold.base },
                    { val: finishedCount,   label: 'FIN',   color: hex.green.hover },
                    { val: fixtures.length, label: 'TOTAL', color: hex.text.secondary },
                  ].map((s, i) => (
                    <React.Fragment key={s.label}>
                      {i > 0 && <div className="w-px self-stretch" style={{ background: alpha(hex.neutral.white, 0.08) }} />}
                      <div className="flex flex-col items-center px-3 py-2">
                        <span className="text-sm font-black leading-none" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</span>
                        <span className="text-[8px] tracking-widest mt-0.5" style={{ color: alpha(hex.text.secondary, 0.38) }}>{s.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 max-w-5xl mx-auto pb-32">

          {/* Main tabs */}
          <div className="flex gap-2 mb-5 p-2 rounded-2xl overflow-x-auto"
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
                  className="relative flex-shrink-0 sm:flex-1 py-3 px-3 rounded-xl font-black text-[12px] flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap"
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
                <div className="flex gap-2 mb-5">
                  {FILTER_TABS.map(f => {
                    const isActive = filterStatus === f.key;
                    return (
                      <motion.button key={f.key} onClick={() => setFilterStatus(f.key)}
                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                        className="relative flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 overflow-hidden"
                        style={{
                          background: isActive
                            ? `linear-gradient(145deg, ${alpha(f.dot, 0.18)}, ${alpha(f.dot, 0.08)})`
                            : alpha(hex.bg.primary, 0.80),
                          border: `1px solid ${isActive ? alpha(f.dot, 0.45) : alpha(hex.neutral.white, 0.08)}`,
                          boxShadow: isActive ? `0 4px 20px ${alpha(f.dot, 0.20)}, inset 0 1px 0 ${alpha(f.dot, 0.15)}` : '0 2px 8px rgba(2,6,23,0.35)',
                          transition: 'all 0.22s ease',
                        }}>
                        {isActive && (
                          <motion.span className="absolute inset-x-3 top-0 h-px rounded-full"
                            style={{ background: `linear-gradient(90deg, transparent, ${f.dot}, transparent)` }}
                            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} />
                        )}
                        <span className="text-xl font-black leading-none relative z-10"
                          style={{ color: isActive ? f.dot : alpha(hex.text.secondary, 0.5), fontFamily: 'var(--font-display)' }}>
                          {f.count}
                        </span>
                        <span className="text-[9px] font-black tracking-widest relative z-10"
                          style={{ color: isActive ? alpha(hex.neutral.white, 0.75) : alpha(hex.text.secondary, 0.35), letterSpacing: '0.14em' }}>
                          {f.label.toUpperCase()}
                        </span>
                      </motion.button>
                    );
                  })}
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
