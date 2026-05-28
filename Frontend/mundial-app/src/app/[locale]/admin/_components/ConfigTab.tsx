'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiWifi, FiTrash2 } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients, surfaces } from '@/lib/design/effects';
import type { ApiFootballStatus, SyncResult } from './types';

export default function ConfigTab() {
  const [status,          setStatus]          = useState<ApiFootballStatus | null>(null);
  const [statusLoading,   setStatusLoading]   = useState(true);
  const [statusError,     setStatusError]     = useState('');
  const [syncingTeams,    setSyncingTeams]    = useState(false);
  const [syncingFixtures, setSyncingFixtures] = useState(false);
  const [syncingLive,     setSyncingLive]     = useState(false);
  const [teamResult,      setTeamResult]      = useState<SyncResult | null>(null);
  const [fixtureResult,   setFixtureResult]   = useState<SyncResult | null>(null);
  const [liveResult,      setLiveResult]      = useState<SyncResult | null>(null);
  const [cleaning,        setCleaning]        = useState(false);
  const [confirmClean,    setConfirmClean]    = useState(false);
  const [cleaningApi,     setCleaningApi]     = useState(false);
  const [confirmCleanApi, setConfirmCleanApi] = useState(false);
  const [restoring,       setRestoring]       = useState(false);
  const [confirmRestore,  setConfirmRestore]  = useState(false);
  const [recalculating,   setRecalculating]   = useState(false);
  const [message,         setMessage]         = useState('');
  const [error,           setError]           = useState('');

  const token      = () => localStorage.getItem('authToken') ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    setStatusLoading(true); setStatusError('');
    try {
      const res  = await fetch('/api/v1/admin/apifootball/status', { headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setStatusError('No se pudo conectar con API Football'); return; }
      const s = data?.data ?? null;
      setStatus(s ? { account: s.account ?? null, subscription: s.subscription ?? null, requests: s.requests ?? null } : null);
    } catch { setStatusError('Error de conexión con API Football'); }
    finally { setStatusLoading(false); }
  };

  const syncTeams = async () => {
    setSyncingTeams(true); setTeamResult(null); setError(''); setMessage('');
    try {
      const res  = await fetch('/api/v1/admin/apifootball/sync/teams', { method: 'POST', headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || 'Error al sincronizar equipos'); return; }
      setTeamResult(data?.data ?? { created: 0, updated: 0, errors: [] });
    } catch { setError('Error de conexión'); }
    finally { setSyncingTeams(false); }
  };

  const syncFixtures = async () => {
    setSyncingFixtures(true); setFixtureResult(null); setError(''); setMessage('');
    try {
      const res  = await fetch('/api/v1/admin/apifootball/sync/fixtures', { method: 'POST', headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || 'Error al sincronizar partidos'); return; }
      setFixtureResult(data?.data ?? { created: 0, updated: 0, errors: [] });
    } catch { setError('Error de conexión'); }
    finally { setSyncingFixtures(false); }
  };

  const syncAll = async () => {
    setError(''); setMessage('');
    await syncTeams();
    await syncFixtures();
    setMessage('Sincronización completa: equipos y partidos actualizados');
  };

  const syncLive = async () => {
    setSyncingLive(true); setLiveResult(null); setError(''); setMessage('');
    try {
      const res  = await fetch('/api/v1/admin/apifootball/sync/fixtures/live', { method: 'POST', headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || 'Error al sincronizar partidos en vivo'); return; }
      setLiveResult(data?.data ?? { created: 0, updated: 0, errors: [] });
      setMessage('Partidos en vivo sincronizados correctamente');
    } catch { setError('Error de conexión'); }
    finally { setSyncingLive(false); }
  };

  const isSyncing = syncingTeams || syncingFixtures;

  const cleanDemo = async () => {
    setCleaning(true); setError(''); setMessage(''); setConfirmClean(false);
    try {
      const res  = await fetch('/api/v1/public/admin/config/demo-fixtures', { method: 'DELETE', headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setError('Error al limpiar'); return; }
      const d = data?.data ?? {};
      setMessage(`Eliminados: ${d.fixturesDeleted ?? 0} partidos demo de la BD`);
    } catch { setError('Error de conexión'); }
    finally { setCleaning(false); }
  };

  const recalculateStandings = async () => {
    setRecalculating(true); setError(''); setMessage('');
    try {
      const res = await fetch('/api/v1/public/admin/config/recalculate-standings', { method: 'POST', headers: authHeader() });
      if (!res.ok) { setError('Error al recalcular standings'); return; }
      setMessage('Standings recalculados correctamente desde los resultados de los partidos');
    } catch { setError('Error de conexión'); }
    finally { setRecalculating(false); }
  };

  const restoreDemo = async () => {
    setRestoring(true); setError(''); setMessage(''); setConfirmRestore(false);
    try {
      const res = await fetch('/api/v1/public/admin/config/restore-demo', { method: 'POST', headers: authHeader() });
      if (!res.ok) { setError('Error al restaurar datos demo'); return; }
      setMessage('Datos demo restaurados correctamente');
    } catch { setError('Error de conexión'); }
    finally { setRestoring(false); }
  };

  const cleanApi = async () => {
    setCleaningApi(true); setError(''); setMessage(''); setConfirmCleanApi(false);
    try {
      const res  = await fetch('/api/v1/public/admin/config/api-fixtures', { method: 'DELETE', headers: authHeader() });
      const data = await res.json();
      if (!res.ok) { setError('Error al limpiar datos API'); return; }
      const d = data?.data ?? {};
      setMessage(`Eliminados: ${d.fixturesDeleted ?? 0} partidos sincronizados desde la API`);
    } catch { setError('Error de conexión'); }
    finally { setCleaningApi(false); }
  };

  const isActive = status?.subscription?.active === true;
  const planName = status?.subscription?.plan ?? '—';
  const planEnd  = status?.subscription?.end  ?? '—';
  const reqCur   = status?.requests?.current  ?? 0;
  const reqLim   = status?.requests?.limit_day ?? 0;
  const reqPct   = reqLim > 0 ? Math.min(100, Math.round((reqCur / reqLim) * 100)) : 0;
  const reqColor = reqPct > 85 ? hex.status.danger : reqPct > 60 ? hex.gold.base : hex.green.hover;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* API Football status */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{ background: surfaces.card(), border: `1px solid ${isActive ? alpha(hex.green.hover, 0.25) : alpha(hex.status.danger, 0.20)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: isActive ? `linear-gradient(90deg,transparent,${alpha(hex.green.hover, 0.6)},transparent)` : `linear-gradient(90deg,transparent,${alpha(hex.status.danger, 0.5)},transparent)` }} />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: isActive ? alpha(hex.green.hover, 0.12) : alpha(hex.status.danger, 0.10), border: `1px solid ${isActive ? alpha(hex.green.hover, 0.30) : alpha(hex.status.danger, 0.25)}` }}>
            <FiWifi size={18} style={{ color: isActive ? hex.green.hover : hex.status.danger }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white tracking-wide">API Football</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusLoading ? (
                <span className="text-[10px] tracking-widest" style={{ color: alpha(hex.text.secondary, 0.4) }}>Verificando...</span>
              ) : statusError ? (
                <span className="text-[10px] font-bold tracking-widest" style={{ color: hex.status.danger }}>{statusError}</span>
              ) : (
                <>
                  <motion.div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: isActive ? hex.green.hover : hex.status.danger }}
                    animate={isActive ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity }} />
                  <span className="text-[10px] font-bold tracking-widest uppercase truncate"
                    style={{ color: isActive ? hex.green.hover : alpha(hex.text.secondary, 0.5) }}>
                    {isActive ? `Conectado · Plan ${planName}` : 'Sin conexión'}
                  </span>
                </>
              )}
            </div>
          </div>
          <motion.button onClick={loadStatus} disabled={statusLoading}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="p-2 rounded-lg shrink-0"
            style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, color: alpha(hex.text.secondary, 0.5) }}>
            <motion.span animate={statusLoading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <FiRefreshCw size={12} />
            </motion.span>
          </motion.button>
        </div>

        {!statusLoading && !statusError && status && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: alpha(hex.text.secondary, 0.45) }}>Plan</p>
                <p className="text-sm font-black text-white">{planName}</p>
                <p className="text-[9px] mt-0.5 font-mono" style={{ color: alpha(hex.text.secondary, 0.40) }}>Vence: {planEnd}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: alpha(hex.text.secondary, 0.45) }}>Cuenta</p>
                <p className="text-sm font-black text-white truncate">{status.account?.firstname ?? '—'}</p>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: alpha(hex.text.secondary, 0.40) }}>{status.account?.email ?? '—'}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <p className="text-[9px] font-black tracking-[0.22em] uppercase" style={{ color: alpha(hex.text.secondary, 0.45) }}>Requests hoy</p>
                <p className="text-[10px] font-black font-mono" style={{ color: reqColor }}>{reqCur.toLocaleString()} / {reqLim.toLocaleString()}</p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: alpha(hex.neutral.white, 0.06) }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${reqPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: `linear-gradient(90deg, ${reqColor}, ${alpha(reqColor, 0.7)})` }} />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Fixtures en vivo',  color: hex.green.hover },
            { label: 'Resultados real',   color: hex.green.hover },
            { label: 'Equipos + escudos', color: hex.green.soft  },
            { label: '150K req/día',      color: hex.gold.base   },
            { label: 'Vence ago 2026',    color: hex.gold.base   },
          ].map(({ label, color }) => (
            <span key={label} className="text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase"
              style={{ color, background: `${color}12`, border: `1px solid ${color}28` }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Sync from API Football */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: surfaces.card(), border: `1px solid ${alpha(hex.green.hover, 0.18)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${alpha(hex.green.hover, 0.5)},transparent)` }} />
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Sincronizar desde API Football</p>
            <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Importa equipos y todos los partidos del Mundial 2026 con resultados en vivo
            </p>
          </div>
          <motion.button onClick={syncAll} disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase shrink-0"
            style={{ background: alpha(hex.green.hover, 0.12), border: `1px solid ${alpha(hex.green.hover, 0.35)}`, color: hex.green.hover, boxShadow: isSyncing ? 'none' : `0 0 16px ${alpha(hex.green.hover, 0.15)}` }}
            whileHover={!isSyncing ? { scale: 1.03, boxShadow: `0 0 24px ${alpha(hex.green.hover, 0.28)}` } : {}}
            whileTap={!isSyncing ? { scale: 0.97 } : {}}>
            <motion.span animate={isSyncing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <FiRefreshCw size={13} />
            </motion.span>
            {syncingTeams ? 'Sync equipos...' : syncingFixtures ? 'Sync partidos...' : 'Sincronizar todo'}
          </motion.button>
        </div>

        {isSyncing && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3"
            style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${syncingTeams ? 'animate-pulse' : ''}`}
              style={{ background: syncingTeams ? hex.green.soft : (teamResult ? hex.green.hover : alpha(hex.neutral.white, 0.2)) }} />
            <span className="text-[10px]" style={{ color: syncingTeams ? hex.green.soft : alpha(hex.text.secondary, 0.5) }}>
              {syncingTeams ? 'Paso 1/2 — Sincronizando equipos…' : 'Paso 1/2 — Equipos ✓'}
            </span>
          </div>
        )}
        {syncingFixtures && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3"
            style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: hex.green.hover }} />
            <span className="text-[10px]" style={{ color: hex.green.hover }}>Paso 2/2 — Sincronizando partidos…</span>
          </div>
        )}

        {(teamResult || fixtureResult) && !isSyncing && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 space-y-2"
            style={{ background: alpha(hex.green.hover, 0.06), border: `1px solid ${alpha(hex.green.hover, 0.18)}` }}>
            {teamResult && (
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: alpha(hex.green.soft, 0.7) }}>Equipos</span>
                <span className="text-[10px] font-black text-green-500">+{teamResult.created} nuevos</span>
                <span className="text-[10px] font-black text-green-400">{teamResult.updated} actualizados</span>
              </div>
            )}
            {fixtureResult && (
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: alpha(hex.green.hover, 0.7) }}>Partidos</span>
                <span className="text-[10px] font-black text-green-500">+{fixtureResult.created} nuevos</span>
                <span className="text-[10px] font-black text-green-400">{fixtureResult.updated} actualizados</span>
                {fixtureResult.errors.length > 0 && <span className="text-[10px] font-black text-amber-400">{fixtureResult.errors.length} avisos</span>}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Sync live fixtures */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: surfaces.card(), border: `1px solid ${alpha(hex.status.danger, 0.20)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${alpha(hex.status.danger, 0.5)},transparent)` }} />
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-black text-white tracking-wide">Sincronizar partidos en vivo</p>
              <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: alpha(hex.status.danger, 0.12), border: `1px solid ${alpha(hex.status.danger, 0.30)}`, color: hex.status.danger }}>
                <motion.span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                LIVE
              </span>
            </div>
            <p className="text-[10px]" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Actualiza resultados y marcadores de los partidos actualmente en juego
            </p>
          </div>
          <motion.button onClick={syncLive} disabled={syncingLive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase shrink-0"
            style={{ background: alpha(hex.status.danger, 0.10), border: `1px solid ${alpha(hex.status.danger, 0.35)}`, color: hex.status.danger, boxShadow: syncingLive ? 'none' : `0 0 16px ${alpha(hex.status.danger, 0.12)}` }}
            whileHover={!syncingLive ? { scale: 1.03, boxShadow: `0 0 24px ${alpha(hex.status.danger, 0.25)}` } : {}}
            whileTap={!syncingLive ? { scale: 0.97 } : {}}>
            <motion.span animate={syncingLive ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <FiRefreshCw size={13} />
            </motion.span>
            {syncingLive ? 'Sincronizando...' : 'Sync Live'}
          </motion.button>
        </div>

        {liveResult && !syncingLive && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3"
            style={{ background: alpha(hex.status.danger, 0.06), border: `1px solid ${alpha(hex.status.danger, 0.18)}` }}>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: alpha(hex.status.danger, 0.7) }}>En vivo</span>
              <span className="text-[10px] font-black text-green-500">+{liveResult.created} nuevos</span>
              <span className="text-[10px] font-black text-green-400">{liveResult.updated} actualizados</span>
              {liveResult.errors.length > 0 && <span className="text-[10px] font-black text-amber-400">{liveResult.errors.length} avisos</span>}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recalculate standings */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: surfaces.card(), border: `1px solid ${alpha(hex.gold.base, 0.15)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${alpha(hex.gold.base, 0.4)},transparent)` }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Recalcular standings</p>
            <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Recalcula la tabla de posiciones de todos los grupos desde los resultados reales
            </p>
          </div>
          <motion.button onClick={recalculateStandings} disabled={recalculating}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
            style={{ background: alphaOf('gold', 0.08), border: borders.brand('gold', 0.22), color: hex.gold.base }}>
            <FiRefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Calculando...' : 'Recalcular'}
          </motion.button>
        </div>
      </div>

      {/* Restore demo data */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: surfaces.card(), border: `1px solid ${alpha(hex.green.hover, 0.15)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${alpha(hex.green.hover, 0.4)},transparent)` }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Restaurar datos BD</p>
            <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Vuelve a insertar los fixtures y standings marcados como <span className="font-black text-orionix-green-hover">BD</span> (partidos demo originales)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmRestore ? (
              <motion.div key="confirm-restore" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmRestore(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: alpha(hex.text.secondary, 0.6) }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={restoreDemo} disabled={restoring} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alpha(hex.green.hover, 0.15), border: `1px solid ${alpha(hex.green.hover, 0.35)}`, color: hex.green.hover }}>
                  <FiRefreshCw size={11} /> {restoring ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn-restore" onClick={() => setConfirmRestore(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: alpha(hex.green.hover, 0.08), border: `1px solid ${alpha(hex.green.hover, 0.22)}`, color: hex.green.hover }}>
                <FiRefreshCw size={11} /> Restaurar BD
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clean demo data */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: surfaces.card(), border: borders.brand('danger', 0.15), backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: gradients.divider('danger', 0.4) }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Limpiar datos demo</p>
            <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Elimina todos los fixtures marcados como <span className="font-black" style={{ color: hex.status.danger }}>BD</span> (creados manualmente, sin origen API)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmClean ? (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmClean(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: alpha(hex.text.secondary, 0.6) }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={cleanDemo} disabled={cleaning} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alphaOf('danger', 0.15), border: borders.brand('danger', 0.35), color: hex.status.danger }}>
                  <FiTrash2 size={11} /> {cleaning ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn-clean" onClick={() => setConfirmClean(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: alphaOf('danger', 0.08), border: borders.brand('danger', 0.22), color: hex.status.danger }}>
                <FiTrash2 size={11} /> Limpiar BD
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clean API data */}
      <div className="relative p-4 rounded-2xl overflow-hidden"
        style={{ background: surfaces.card(), border: `1px solid ${alpha(hex.green.soft, 0.15)}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: gradients.divider('success', 0.4) }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white tracking-wide">Limpiar datos API</p>
            <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.45) }}>
              Elimina todos los fixtures marcados como <span className="font-black text-orionix-green-muted">API</span> (sincronizados desde el proveedor externo)
            </p>
          </div>
          <AnimatePresence mode="wait">
            {confirmCleanApi ? (
              <motion.div key="confirm-api" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 shrink-0">
                <motion.button onClick={() => setConfirmCleanApi(false)} whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: alpha(hex.text.secondary, 0.6) }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={cleanApi} disabled={cleaningApi} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black"
                  style={{ background: alphaOf('danger', 0.15), border: borders.brand('danger', 0.35), color: hex.status.danger }}>
                  <FiTrash2 size={11} /> {cleaningApi ? '...' : 'Confirmar'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="btn-api" onClick={() => setConfirmCleanApi(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black shrink-0"
                style={{ background: alpha(hex.green.soft, 0.08), border: `1px solid ${alpha(hex.green.soft, 0.22)}`, color: hex.green.soft }}>
                <FiTrash2 size={11} /> Limpiar API
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      {message && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-green-500 text-center">{message}</motion.p>}
      {error   && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-red-400 text-center">{error}</motion.p>}
    </div>
  );
}
