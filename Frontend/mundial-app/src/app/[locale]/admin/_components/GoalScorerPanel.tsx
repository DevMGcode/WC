'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { apiFetch } from '@/lib/apiFetch';

interface GoalScorerPanelProps {
  fixtureId: number;
  homeTeam: { id?: number; name: string; shortName?: string };
  awayTeam: { id?: number; name: string; shortName?: string };
}

export default function GoalScorerPanel({ fixtureId, homeTeam, awayTeam }: GoalScorerPanelProps) {
  const [scorers,    setScorers]    = useState<any[]>([]);
  const [showForm,   setShowForm]   = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [teamId,     setTeamId]     = useState<string>('');
  const [minute,     setMinute]     = useState('');
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);

  const token = () => localStorage.getItem('authToken') ?? '';

  const loadScorers = async () => {
    try {
      const res  = await apiFetch(`/api/v1/public/fixtures/${fixtureId}/events`);
      const data = await res.json();
      setScorers(data?.data ?? []);
    } catch { /* no-op */ }
  };

  useEffect(() => { loadScorers(); }, [fixtureId]);

  const addScorer = async () => {
    if (!playerName.trim()) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v1/public/admin/fixtures/${fixtureId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          teamId:     teamId ? Number(teamId) : null,
          minute:     minute ? parseInt(minute) : null,
          eventType:  'GOAL',
        }),
      });
      setPlayerName(''); setTeamId(''); setMinute(''); setShowForm(false);
      await loadScorers();
    } finally { setSaving(false); }
  };

  const deleteScorer = async (eventId: number) => {
    setDeleting(eventId);
    try {
      await apiFetch(`/api/v1/public/admin/fixtures/events/${eventId}`, {
        method: 'DELETE',
      });
      await loadScorers();
    } finally { setDeleting(null); }
  };

  return (
    <div className="mt-3 pt-3" style={{ borderTop: borders.brand('gold', 0.12) }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black tracking-widest uppercase text-orionix-gold">⚽ Goleadores</span>
          {scorers.length > 0 && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: alphaOf('gold', 0.10), color: hex.gold.base, border: borders.brand('gold', 0.20) }}>
              {scorers.length}
            </span>
          )}
        </div>
        <motion.button
          onClick={() => setShowForm(f => !f)}
          whileTap={{ scale: 0.95 }}
          className="text-[9px] font-black px-2 py-1 rounded-lg"
          style={{
            background: showForm ? alphaOf('danger', 0.08) : alphaOf('gold', 0.08),
            border: `1px solid ${showForm ? 'rgba(239,68,68,0.28)' : alpha(hex.gold.base, 0.25)}`,
            color: showForm ? hex.status.danger : hex.gold.base,
          }}>
          {showForm ? '✕ Cancelar' : '+ Añadir gol'}
        </motion.button>
      </div>

      {/* Scorer list */}
      {scorers.length > 0 ? (
        <div className="space-y-1.5 mb-2">
          {scorers.map((s: any) => (
            <div key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{ background: alphaOf('gold', 0.04), border: `1px solid ${alpha(hex.gold.base, 0.10)}` }}>
              <span className="text-sm shrink-0">⚽</span>
              <span className="flex-1 text-xs font-bold text-orionix-text-secondary truncate">
                {s.playerName}{s.minute ? ` · ${s.minute}'` : ''}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {s.teamFifaCode && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                    style={{ background: alpha(hex.neutral.white, 0.05), color: alpha(hex.text.secondary, 0.7) }}>
                    {s.teamFifaCode}
                  </span>
                )}
                {s.source === 'API' && <span className="text-[8px] text-green-500/60 font-bold">API</span>}
                {s.mismatch   && <span className="text-[8px] text-amber-400/70 font-bold">⚠ corregido</span>}
                {s.verified   && s.source !== 'API' && <span className="text-[8px] text-emerald-500/60">✓</span>}
                <motion.button
                  onClick={() => deleteScorer(s.id)}
                  disabled={deleting === s.id}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="text-red-500/40 hover:text-red-400 transition-colors disabled:opacity-40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-[10px] text-orionix-text-muted mb-2 text-center">
            Sin goleadores aún · pulsa &quot;+ Añadir gol&quot;
          </p>
        )
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl p-3 space-y-2.5 mt-1"
              style={{ background: alphaOf('gold', 0.04), border: borders.brand('gold', 0.20) }}>
              <input
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScorer()}
                placeholder="Nombre del jugador que anotó..."
                className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: hex.text.primary, caretColor: hex.gold.base }}
                autoFocus
              />
              <div className="flex gap-2">
                <select value={teamId} onChange={e => setTeamId(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: alpha(hex.bg.primary, 0.95), border: `1px solid ${alpha(hex.neutral.white, 0.10)}`, color: hex.text.primary, appearance: 'none' }}>
                  <option value="">¿Qué equipo anotó?</option>
                  {homeTeam.id && <option value={homeTeam.id}>{homeTeam.shortName || homeTeam.name} (local)</option>}
                  {awayTeam.id && <option value={awayTeam.id}>{awayTeam.shortName || awayTeam.name} (visita)</option>}
                </select>
                <input value={minute} onChange={e => setMinute(e.target.value)}
                  placeholder="Min" type="number" min="1" max="120"
                  className="w-16 px-2 py-1.5 rounded-lg text-xs text-center outline-none"
                  style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: hex.text.primary }} />
              </div>
              <motion.button
                onClick={addScorer}
                disabled={saving || !playerName.trim()}
                whileHover={!saving && playerName.trim() ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-lg text-xs font-black disabled:opacity-40"
                style={{ background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.18)}, ${alpha(hex.gold.base, 0.12)})`, border: borders.brand('gold', 0.40), color: hex.gold.base }}>
                {saving ? 'Guardando...' : '⚽ Guardar goleador'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
