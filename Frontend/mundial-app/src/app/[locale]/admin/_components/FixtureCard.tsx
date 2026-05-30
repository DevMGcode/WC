'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { IconCheck, IconX, IconEdit } from './AdminIcons';
import GoalScorerPanel from './GoalScorerPanel';
import type { FixtureAdmin } from './types';

interface FixtureCardProps {
  fixture: FixtureAdmin; idx: number;
  isSuccess: boolean; isEditing: boolean;
  homeScore: string; awayScore: string;
  saving: boolean; error: string;
  onEdit: () => void; onCancel: () => void; onSave: () => void;
  onHomeChange: (v: string) => void; onAwayChange: (v: string) => void;
  onExtend: () => void;
}

export default function FixtureCard({
  fixture, idx,
  isSuccess, isEditing,
  homeScore, awayScore,
  saving, error,
  onEdit, onCancel, onSave,
  onHomeChange, onAwayChange,
  onExtend,
}: FixtureCardProps) {
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
          ? `linear-gradient(145deg, ${alpha(hex.bg.elevated, 0.95)}, rgba(9,50,38,0.9))`
          : isFinished
          ? `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.95)}, ${alpha(hex.bg.secondary, 0.90)})`
          : 'linear-gradient(145deg, rgba(20,14,6,0.95), rgba(28,18,6,0.9))',
        border: `1px solid ${isSuccess ? alpha(hex.green.hover, 0.5) : isFinished ? alpha(hex.green.soft, 0.18) : alpha(hex.gold.base, 0.3)}`,
        boxShadow: isSuccess
          ? `0 0 28px ${alpha(hex.green.hover, 0.15)}, 0 8px 24px rgba(2,6,23,0.5)`
          : isPending
          ? `0 0 28px ${alpha(hex.gold.base, 0.08)}, 0 8px 24px rgba(2,6,23,0.5)`
          : '0 8px 24px rgba(2,6,23,0.45)',
      }}>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{
        background: isSuccess
          ? `linear-gradient(90deg, transparent, ${hex.green.hover}, transparent)`
          : isFinished
          ? `linear-gradient(90deg, transparent, ${hex.green.soft}, transparent)`
          : `linear-gradient(90deg, transparent, ${hex.gold.base}, transparent)`,
      }} />

      {/* Hover glow for pending */}
      {isPending && !isEditing && (
        <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 0%, ${alpha(hex.gold.base, 0.05)} 0%, transparent 70%)` }} />
      )}

      <div className="relative p-4">
        {/* Row: ID + group + status */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0"
              style={{ color: alpha(hex.text.secondary, 0.45), background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
              #{fixture.id}
            </span>
            {(fixture.groupCode || fixture.stageName) && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest truncate"
                style={{ color: alpha(hex.text.secondary, 0.45), background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
                {fixture.groupCode ? `GRUPO ${fixture.groupCode}` : fixture.stageName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{
              color: isSuccess ? hex.green.hover : isFinished ? hex.green.soft : hex.gold.base,
              background: isSuccess ? alpha(hex.green.hover, 0.10) : isFinished ? alpha(hex.green.soft, 0.10) : alphaOf('gold', 0.10),
              border: `1px solid ${isSuccess ? alpha(hex.green.hover, 0.25) : isFinished ? alpha(hex.green.soft, 0.20) : alpha(hex.gold.base, 0.25)}`,
            }}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-400' : isFinished ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
            {isSuccess ? 'Guardado' : isFinished ? 'Finalizado' : 'Pendiente'}
          </div>
        </div>

        {/* Scoreboard with flags */}
        <div className="flex items-center gap-3 mb-1">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-end gap-1.5 min-w-0">
            {fixture.homeTeam.flagUrl ? (
              <img src={fixture.homeTeam.flagUrl} alt={fixture.homeTeam.name}
                className="w-10 h-7 rounded-md object-cover ml-auto"
                style={{ border: `1px solid ${alpha(hex.neutral.white, 0.14)}`, boxShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-10 h-7 rounded-md ml-auto flex items-center justify-center text-sm"
                style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>🏳</div>
            )}
            <p className="font-black text-right leading-tight truncate w-full"
              style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontSize: '0.88rem' }}>
              {fixture.homeTeam.shortName || fixture.homeTeam.name}
            </p>
          </div>

          {/* Score / VS */}
          <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl"
            style={{
              background: isFinished && !isEditing ? alphaOf('green', 0.08) : alpha(hex.neutral.white, 0.04),
              border: `1.5px solid ${isFinished && !isEditing ? alphaOf('green', 0.28) : alpha(hex.neutral.white, 0.08)}`,
              minWidth: 86,
              padding: '10px 14px',
              boxShadow: isFinished && !isEditing ? `0 0 20px ${alphaOf('green', 0.13)}` : 'none',
            }}>
            {isFinished && fixture.homeScore !== null && !isEditing ? (
              <span className="font-black leading-none"
                style={{ color: hex.green.bright, fontFamily: 'var(--font-display)', fontSize: '1.65rem', letterSpacing: '0.08em' }}>
                {fixture.homeScore}
                <span style={{ color: alpha(hex.text.secondary, 0.28), margin: '0 5px', fontSize: '1.2rem' }}>–</span>
                {fixture.awayScore}
              </span>
            ) : (
              <span className="text-base font-black" style={{ color: alpha(hex.text.secondary, 0.28), fontFamily: 'var(--font-display)' }}>VS</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
            {fixture.awayTeam.flagUrl ? (
              <img src={fixture.awayTeam.flagUrl} alt={fixture.awayTeam.name}
                className="w-10 h-7 rounded-md object-cover"
                style={{ border: `1px solid ${alpha(hex.neutral.white, 0.14)}`, boxShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-10 h-7 rounded-md flex items-center justify-center text-sm"
                style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>🏳</div>
            )}
            <p className="font-black leading-tight truncate w-full"
              style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontSize: '0.88rem' }}>
              {fixture.awayTeam.shortName || fixture.awayTeam.name}
            </p>
          </div>
        </div>

        {/* Kickoff date */}
        <p className="text-center text-[10px] mb-4 mt-1" style={{ color: alpha(hex.text.secondary, 0.35) }}>
          {new Date(fixture.kickoffAt).toLocaleDateString('es', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>

        {/* Success banner */}
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 text-xs font-bold"
            style={{ background: alpha(hex.green.hover, 0.12), border: `1px solid ${alpha(hex.green.hover, 0.25)}`, color: hex.green.hover }}>
            <IconCheck /> Resultado guardado · ranking actualizado
          </motion.div>
        )}

        {/* Edit form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-4 mt-1" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <p className="text-[10px] font-black text-center mb-4 tracking-[0.15em]"
                  style={{ color: alpha(hex.text.secondary, 0.6), fontFamily: 'var(--font-display)' }}>
                  MARCADOR FINAL
                </p>
                <div className="flex items-center gap-3 mb-4">
                  {[
                    { label: fixture.homeTeam.name, value: homeScore, onChange: onHomeChange },
                    { label: fixture.awayTeam.name, value: awayScore, onChange: onAwayChange },
                  ].map((team, i) => (
                    <React.Fragment key={i}>
                      {i === 1 && <span className="text-2xl font-black shrink-0" style={{ color: alpha(hex.text.secondary, 0.3), marginTop: 24 }}>–</span>}
                      <div className="flex-1">
                        <p className="text-[10px] text-center truncate mb-1.5" style={{ color: alpha(hex.text.secondary, 0.5) }}>{team.label}</p>
                        <input type="number" min="0" max="20" value={team.value} onChange={e => team.onChange(e.target.value)}
                          className="w-full text-center text-4xl font-black py-3 rounded-xl outline-none transition-all focus:scale-105"
                          style={{ background: alphaOf('green', 0.06), border: `1.5px solid ${alphaOf('green', 0.3)}`, color: hex.green.bright, fontFamily: 'var(--font-display)', boxShadow: `0 0 20px ${alphaOf('green', 0.1)}` }}
                          placeholder="0" />
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs font-medium text-center mb-3" style={{ color: hex.status.danger }}>
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-2">
                  <motion.button onClick={onCancel} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(hex.neutral.white, 0.1)}`, color: alpha(hex.text.secondary, 0.7) }}>
                    <IconX /> Cancelar
                  </motion.button>
                  <motion.button onClick={onSave} disabled={saving} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(90deg, #10b981, ${hex.green.base})`, boxShadow: '0 4px 18px rgba(16,185,129,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                    <IconCheck /> {saving ? 'GUARDANDO…' : 'CONFIRMAR'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons — always side by side */}
        {!isEditing && (
          <div className="flex gap-2">
            <motion.button onClick={onEdit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all"
              style={{
                background: isFinished
                  ? alpha(hex.neutral.white, 0.05)
                  : `linear-gradient(90deg, ${alphaOf('green', 0.13)}, rgba(16,185,129,0.10))`,
                border: `1px solid ${isFinished ? alpha(hex.neutral.white, 0.09) : alphaOf('green', 0.30)}`,
                color: isFinished ? alpha(hex.text.secondary, 0.65) : hex.green.bright,
                fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
                boxShadow: isFinished ? 'none' : `0 0 14px ${alphaOf('green', 0.08)}`,
              }}>
              <IconEdit />
              {isFinished ? 'EDITAR' : 'RESULTADO'}
            </motion.button>
            {(isLive || isFinished) && (
              <motion.button onClick={onExtend} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black"
                style={{ background: alphaOf('gold', 0.08), border: `1px solid ${alpha(hex.gold.base, 0.26)}`, color: hex.gold.base }}>
                ⏱ EXTENDER
              </motion.button>
            )}
          </div>
        )}

        {/* Scorers panel — finished only */}
        {isFinished && (
          <GoalScorerPanel fixtureId={fixture.id} homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />
        )}
      </div>
    </motion.div>
  );
}
