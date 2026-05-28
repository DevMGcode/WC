'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { StatusPill, FlagBig, toDatetimeLocal, SCHED_SELECT, STATUS_CFG_SCHED } from './AdminShared';
import { IconPlus, IconX, IconCheck, IconEdit, IconTrash } from './AdminIcons';
import type { FixtureAdmin, TeamItem, StageItem, GroupItem } from './types';

interface ScheduleTabProps { tournamentId: number; token: string; }

export default function ScheduleTab({ tournamentId, token }: ScheduleTabProps) {
  const [teams,    setTeams]    = useState<TeamItem[]>([]);
  const [stages,   setStages]   = useState<StageItem[]>([]);
  const [groups,   setGroups]   = useState<GroupItem[]>([]);
  const [fixtures, setFixtures] = useState<FixtureAdmin[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState<'ALL'|'SCHEDULED'|'LIVE'|'FINISHED'>('ALL');

  /* create */
  const [cHome,  setCHome]  = useState(''); const [cAway,  setCAway]  = useState('');
  const [cKick,  setCKick]  = useState(''); const [cStage, setCStage] = useState('');
  const [cGroup, setCGroup] = useState('');
  const [creating, setCreating] = useState(false);
  const [cError, setCError]    = useState(''); const [cOk, setCOk] = useState(false);

  /* edit */
  const [editId, setEditId] = useState<number|null>(null);
  const [eHome,  setEHome]  = useState(''); const [eAway,  setEAway]  = useState('');
  const [eKick,  setEKick]  = useState(''); const [eStage, setEStage] = useState('');
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
      const res = await fetch('/api/v1/public/tournaments/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
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
      const res = await fetch(`/api/v1/public/tournaments/fixtures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
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

  const counts = {
    ALL: fixtures.length,
    SCHEDULED: fixtures.filter(f => f.status === 'SCHEDULED').length,
    LIVE: fixtures.filter(f => f.status === 'LIVE').length,
    FINISHED: fixtures.filter(f => f.status === 'FINISHED').length,
  };
  const filtered = fixtures.filter(f => filter === 'ALL' || f.status === filter);
  const FILTERS = [
    { key: 'ALL'       as const, label: 'TODOS',      n: counts.ALL       },
    { key: 'SCHEDULED' as const, label: 'PRÓXIMOS',   n: counts.SCHEDULED },
    { key: 'LIVE'      as const, label: 'EN VIVO',    n: counts.LIVE      },
    { key: 'FINISHED'  as const, label: 'FINALIZADOS', n: counts.FINISHED },
  ];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.14em]" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)' }}>GESTIÓN DE PARTIDOS</p>
          <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.4) }}>{fixtures.length} partidos · Solo se eliminan los programados</p>
        </div>
        <motion.button onClick={() => { setShowForm(v => !v); setCError(''); }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
          style={{
            background: showForm ? alpha(hex.neutral.white, 0.06) : `linear-gradient(90deg,${hex.green.base},#10b981)`,
            border: showForm ? `1px solid ${alpha(hex.neutral.white, 0.1)}` : 'none',
            color: showForm ? alpha(hex.text.secondary, 0.7) : hex.neutral.white,
            fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
            boxShadow: showForm ? 'none' : `0 4px 18px ${alpha(hex.green.base, 0.3)}`,
          }}>
          {showForm ? <IconX /> : <IconPlus />}{showForm ? 'CANCELAR' : 'AGREGAR PARTIDO'}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.96)}, ${alpha(hex.bg.secondary, 0.92)})`, border: borders.brand('green', 0.25), boxShadow: '0 8px 28px rgba(2,6,23,0.5)' }}>
              <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg,transparent,${hex.green.bright},transparent)` }} />
              <div className="p-5">
                <p className="text-[10px] font-black tracking-[0.2em] mb-4" style={{ color: hex.green.bright, fontFamily: 'var(--font-display)' }}>NUEVO PARTIDO</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'EQUIPO LOCAL',     val: cHome,  set: setCHome  },
                    { label: 'EQUIPO VISITANTE', val: cAway,  set: setCAway  },
                  ].map(({ label, val, set }, i) => {
                    const preview = teams.find(t => t.id === Number(val));
                    return (
                      <div key={i}>
                        <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.6) }}>{label}</p>
                        <div className="flex items-center gap-2">
                          <FlagBig url={preview?.flagUrl} name={preview?.name ?? ''} />
                          <div className="flex-1 relative">
                            <select value={val} onChange={e => set(e.target.value)} style={SCHED_SELECT}>
                              <option value="">Seleccionar...</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div>
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.6) }}>ETAPA</p>
                    <div className="relative">
                      <select value={cStage} onChange={e => setCStage(e.target.value)} style={SCHED_SELECT}>
                        <option value="">Seleccionar etapa...</option>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.6) }}>GRUPO <span style={{ opacity: 0.4 }}>(opcional)</span></p>
                    <div className="relative">
                      <select value={cGroup} onChange={e => setCGroup(e.target.value)} style={SCHED_SELECT}>
                        <option value="">Sin grupo</option>
                        {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.code}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.6) }}>FECHA Y HORA (hora local)</p>
                    <input type="datetime-local" value={cKick} onChange={e => setCKick(e.target.value)} style={{ ...SCHED_SELECT, colorScheme: 'dark' }} />
                  </div>
                </div>
                <AnimatePresence>
                  {cHomeTeam && cAwayTeam && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl mb-3"
                      style={{ background: alphaOf('green', 0.05), border: borders.brand('green', 0.12) }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FlagBig url={cHomeTeam.flagUrl} name={cHomeTeam.name} />
                        <span className="font-black text-sm truncate" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)' }}>{cHomeTeam.shortName || cHomeTeam.name}</span>
                      </div>
                      <span className="font-black text-sm shrink-0" style={{ color: alpha(hex.text.secondary, 0.3), fontFamily: 'var(--font-display)' }}>VS</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-sm truncate" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)' }}>{cAwayTeam.shortName || cAwayTeam.name}</span>
                        <FlagBig url={cAwayTeam.flagUrl} name={cAwayTeam.name} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {cError && <p className="text-xs text-center mb-3" style={{ color: hex.status.danger }}>{cError}</p>}
                <motion.button onClick={handleCreate} disabled={creating} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(90deg,${hex.green.base},${hex.green.bright},#10b981)`, boxShadow: `0 4px 18px ${alpha(hex.green.base, 0.3)}`, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
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
            style={{ background: alpha(hex.green.hover, 0.1), border: `1px solid ${alpha(hex.green.hover, 0.25)}`, color: hex.green.hover }}>
            <IconCheck /> Partido creado correctamente
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-xl" style={{ background: alpha(hex.bg.primary, 0.92), border: borders.brand('green', 0.12) }}>
        {FILTERS.map(f => (
          <motion.button key={f.key} onClick={() => setFilter(f.key)} whileTap={{ scale: 0.96 }}
            className="relative py-2.5 rounded-lg text-[8px] font-black flex flex-col items-center gap-0.5"
            style={{ color: filter === f.key ? hex.neutral.white : alpha(hex.text.secondary, 0.4), fontFamily: 'var(--font-display)' }}>
            {filter === f.key && (
              <motion.span layoutId="sched-filter" className="absolute inset-0 rounded-lg"
                style={{ background: `linear-gradient(90deg,${hex.green.base},${hex.green.bright},#10b981)`, boxShadow: `0 2px 12px ${alpha(hex.green.base, 0.25)}` }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
            )}
            <span className="relative z-10 text-sm font-black leading-none" style={{ fontFamily: 'var(--font-display)' }}>{f.n}</span>
            <span className="relative z-10 tracking-widest text-[7px]">{f.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-t-green-400 border-green-400/15 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-4xl opacity-20 mb-3">📅</p>
          <p className="text-xs tracking-widest" style={{ color: alpha(hex.text.secondary, 0.4), fontFamily: 'var(--font-display)' }}>NO HAY PARTIDOS EN ESTA CATEGORÍA</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((f, idx) => {
              const cfg       = STATUS_CFG_SCHED[f.status] ?? STATUS_CFG_SCHED.POSTPONED;
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
                  style={{ background: isEditOk ? `linear-gradient(145deg,${alpha(hex.bg.elevated, 0.96)},rgba(9,50,38,0.92))` : cfg.cardBg, border: `1px solid ${isEditOk ? alpha(hex.green.hover, 0.4) : cfg.cardBorder}`, boxShadow: '0 8px 24px rgba(2,6,23,0.45)' }}>

                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,transparent,${cfg.line},transparent)` }} />

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <StatusPill status={f.status} />
                      <span className="text-[10px] font-mono" style={{ color: alpha(hex.text.secondary, 0.4) }}>
                        {new Date(f.kickoffAt).toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Teams row */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                        <span className="font-black text-sm text-right truncate leading-none" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)' }}>
                          {f.homeTeam.shortName || f.homeTeam.name}
                        </span>
                        <FlagBig url={f.homeTeam.flagUrl} name={f.homeTeam.name} />
                      </div>
                      <div className="shrink-0 flex items-center justify-center px-3 py-2 rounded-xl"
                        style={{ background: f.status === 'FINISHED' ? alphaOf('green', 0.08) : alpha(hex.neutral.white, 0.04), border: `1.5px solid ${f.status === 'FINISHED' ? alphaOf('green', 0.3) : alpha(hex.neutral.white, 0.08)}`, minWidth: 70 }}>
                        {f.status === 'FINISHED' && f.homeScore !== null
                          ? <span className="font-black text-lg tracking-wider" style={{ color: hex.green.bright, fontFamily: 'var(--font-display)' }}>{f.homeScore}<span style={{ color: alpha(hex.text.secondary, 0.3), margin: '0 3px' }}>-</span>{f.awayScore}</span>
                          : f.status === 'LIVE'
                          ? <span className="font-black text-xs" style={{ color: hex.status.danger, fontFamily: 'var(--font-display)' }}>LIVE</span>
                          : <span className="font-black text-xs" style={{ color: alpha(hex.text.secondary, 0.28), fontFamily: 'var(--font-display)' }}>VS</span>
                        }
                      </div>
                      <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                        <FlagBig url={f.awayTeam.flagUrl} name={f.awayTeam.name} />
                        <span className="font-black text-sm truncate leading-none" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)' }}>
                          {f.awayTeam.shortName || f.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Footer with edit/delete */}
                    {!isEditing && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {f.externalProviderId != null ? (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest"
                              style={{ background: alpha(hex.green.soft, 0.10), border: `1px solid ${alpha(hex.green.soft, 0.25)}`, color: hex.green.soft }}>API</span>
                          ) : (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest"
                              style={{ background: alphaOf('danger', 0.10), border: borders.brand('danger', 0.25), color: hex.status.danger }}>BD</span>
                          )}
                          {f.stageName && <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, color: alpha(hex.text.secondary, 0.45) }}>{f.stageName}</span>}
                          {f.groupCode && <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, color: alpha(hex.text.secondary, 0.45) }}>Grupo {f.groupCode}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <motion.button onClick={() => startEdit(f)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                            style={{ background: alphaOf('green', 0.08), border: borders.brand('green', 0.18), color: hex.green.bright, fontFamily: 'var(--font-display)' }}>
                            <IconEdit /> EDITAR
                          </motion.button>
                          {canDelete && (
                            confirmId === f.id ? (
                              <div className="flex gap-1">
                                <motion.button onClick={() => setConfirmId(null)} whileTap={{ scale: 0.95 }}
                                  className="p-1.5 rounded-lg" style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, color: alpha(hex.text.secondary, 0.6) }}>
                                  <IconX />
                                </motion.button>
                                <motion.button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-50"
                                  style={{ background: alphaOf('danger', 0.15), border: borders.brand('danger', 0.3), color: hex.status.danger, fontFamily: 'var(--font-display)' }}>
                                  {deletingId === f.id ? <span className="w-3 h-3 rounded-full border border-t-red-400 border-red-400/20 animate-spin" /> : <><IconCheck /> ¿ELIMINAR?</>}
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button onClick={() => setConfirmId(f.id)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                className="p-1.5 rounded-lg" style={{ background: alphaOf('danger', 0.08), border: '1px solid rgba(239,68,68,0.18)', color: hex.status.danger }}>
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
                        style={{ background: alpha(hex.green.hover, 0.1), border: `1px solid ${alpha(hex.green.hover, 0.25)}`, color: hex.green.hover }}>
                        <IconCheck /> Actualizado correctamente
                      </motion.div>
                    )}
                  </div>

                  {/* Inline edit form */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                        <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                          <p className="text-[9px] font-black tracking-[0.2em] mb-3 pt-3" style={{ color: hex.green.bright, fontFamily: 'var(--font-display)' }}>EDITAR PARTIDO #{f.id}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {[
                              { label: 'EQUIPO LOCAL',     val: eHome, set: setEHome, preview: eHomeTeam },
                              { label: 'EQUIPO VISITANTE', val: eAway, set: setEAway, preview: eAwayTeam },
                            ].map(({ label, val, set, preview }, i) => (
                              <div key={i}>
                                <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.5) }}>{label}</p>
                                <div className="flex items-center gap-2">
                                  <FlagBig url={preview?.flagUrl} name={preview?.name ?? ''} />
                                  <div className="flex-1 relative">
                                    <select value={val} onChange={e => set(e.target.value)} style={SCHED_SELECT}>
                                      <option value="">Seleccionar...</option>
                                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div>
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.5) }}>ETAPA</p>
                              <div className="relative">
                                <select value={eStage} onChange={e => setEStage(e.target.value)} style={SCHED_SELECT}>
                                  <option value="">Seleccionar...</option>
                                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.5) }}>GRUPO <span style={{ opacity: 0.4 }}>(opcional)</span></p>
                              <div className="relative">
                                <select value={eGroup} onChange={e => setEGroup(e.target.value)} style={SCHED_SELECT}>
                                  <option value="">Sin grupo</option>
                                  {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.code}</option>)}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: alpha(hex.text.secondary, 0.4) }}>▾</span>
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-[9px] font-bold mb-1 tracking-widest" style={{ color: alpha(hex.text.secondary, 0.5) }}>FECHA Y HORA</p>
                              <input type="datetime-local" value={eKick} onChange={e => setEKick(e.target.value)} style={{ ...SCHED_SELECT, colorScheme: 'dark' }} />
                            </div>
                          </div>
                          {eError && <p className="text-xs text-center mb-3" style={{ color: hex.status.danger }}>{eError}</p>}
                          <div className="flex gap-2">
                            <motion.button onClick={() => { setEditId(null); setEError(''); }} whileTap={{ scale: 0.97 }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                              style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.09)}`, color: alpha(hex.text.secondary, 0.7) }}>
                              <IconX /> Cancelar
                            </motion.button>
                            <motion.button onClick={() => handleSaveEdit(f.id)} disabled={saving} whileTap={{ scale: 0.97 }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50"
                              style={{ background: `linear-gradient(90deg,#10b981,${hex.green.base})`, boxShadow: '0 4px 14px rgba(16,185,129,0.3)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
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
