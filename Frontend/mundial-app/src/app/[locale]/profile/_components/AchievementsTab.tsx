'use client';

/**
 * Tab "Logros" del perfil.
 *
 * Muestra la racha de aciertos del usuario y el catálogo de insignias
 * (desbloqueadas y bloqueadas con barra de progreso). Todo viene del backend
 * GET /api/v1/achievements/{torneo}, que lo calcula del scoring existente.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward, FiZap, FiTarget, FiCrosshair, FiEye, FiStar,
  FiCheckSquare, FiDollarSign, FiCheck, FiLock,
} from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { SectionLabel } from './ui';
import { achievementsService, type AchievementSummary, type Achievement } from '@/services/achievements';

interface AchievementsTabProps {
  tournamentId: number;
  userId: number | null;
  t: (key: string) => string;
}

/** Mapeo del nombre de icono que manda el backend → icono react-icons/fi. */
const ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  target:    FiTarget,
  crosshair: FiCrosshair,
  eye:       FiEye,
  flame:     FiZap,
  trophy:    FiAward,
  crown:     FiStar,
  coins:     FiDollarSign,
  checkbox:  FiCheckSquare,
};

export default function AchievementsTab({ tournamentId, userId, t }: AchievementsTabProps) {
  const [data, setData]       = useState<AchievementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    setLoading(true);
    achievementsService.get(tournamentId, userId)
      .then(res => { if (alive) { setData(res); setError(null); } })
      .catch(() => { if (alive) setError(t('achievements.error')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tournamentId, userId, t]);

  if (loading) {
    return (
      <motion.div key="ach-loading" className="flex items-center justify-center py-20"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: alpha(hex.gold.base, 0.2), borderTopColor: hex.gold.base }}
          animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div key="ach-error" className="py-16 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm" style={{ color: hex.text.secondary }}>{error || t('achievements.empty')}</p>
      </motion.div>
    );
  }

  const unlocked = data.achievements.filter(a => a.unlocked);
  const locked   = data.achievements.filter(a => !a.unlocked);
  const ordered  = [...unlocked, ...locked];

  return (
    <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }} className="flex flex-col gap-5">

      {/* ── Racha (hero dorado) ── */}
      <div className="flex items-center gap-3.5 rounded-2xl p-4"
        style={{ background: alpha(hex.gold.base, 0.08), border: `1px solid ${alpha(hex.gold.base, 0.25)}` }}>
        <div className="w-13 h-13 rounded-full flex items-center justify-center shrink-0"
          style={{ width: 52, height: 52, background: alpha(hex.gold.base, 0.14), border: `1px solid ${alpha(hex.gold.base, 0.35)}` }}>
          <FiZap size={26} style={{ color: hex.gold.bright }} />
        </div>
        <div className="flex-1">
          <p className="text-[11px] tracking-wide" style={{ color: hex.text.muted }}>{t('achievements.currentStreak')}</p>
          <p className="text-xl font-black" style={{ color: hex.gold.bright }}>
            {data.currentStreak} {data.currentStreak === 1 ? t('achievements.hit') : t('achievements.hits')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] tracking-wide" style={{ color: hex.text.muted }}>{t('achievements.bestStreak')}</p>
          <p className="text-lg font-black" style={{ color: hex.text.primary }}>{data.bestStreak}</p>
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: t('achievements.exact'),  value: data.exactScores },
          { label: t('achievements.points'), value: data.totalPoints },
          { label: t('achievements.unlocked'), value: `${data.unlockedCount} / ${data.totalCount}` },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-3 text-center"
            style={{ background: hex.bg.elevated, border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
            <p className="text-[10px] tracking-wide mb-1" style={{ color: hex.text.muted }}>{m.label}</p>
            <p className="text-xl font-black" style={{ color: hex.text.primary }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Cuadrícula de insignias ── */}
      <div>
        <SectionLabel>{t('achievements.title')}</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
          {ordered.map(a => <Badge key={a.code} a={a} />)}
        </div>
      </div>
    </motion.div>
  );
}

/** Una insignia: desbloqueada (verde + check) o bloqueada (gris + progreso). */
function Badge({ a }: { a: Achievement }) {
  const Icon = ICONS[a.icon] ?? FiAward;
  const pct = a.target > 0 ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0;

  return (
    <div className="rounded-xl p-3.5 flex gap-3 items-start"
      style={{
        background: a.unlocked ? alpha(hex.green.bright, 0.07) : hex.bg.elevated,
        border: `1px solid ${a.unlocked ? alpha(hex.green.bright, 0.30) : alpha(hex.neutral.white, 0.06)}`,
        opacity: a.unlocked ? 1 : 0.88,
      }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: a.unlocked ? alpha(hex.green.bright, 0.14) : alpha(hex.neutral.white, 0.04),
          border: `1px solid ${a.unlocked ? alpha(hex.green.bright, 0.30) : alpha(hex.neutral.white, 0.07)}`,
        }}>
        <Icon size={18} style={{ color: a.unlocked ? hex.green.bright : hex.text.muted }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold truncate" style={{ color: hex.text.primary }}>{a.name}</p>
          {a.unlocked
            ? <FiCheck size={14} style={{ color: hex.green.bright, flexShrink: 0 }} />
            : <FiLock size={11} style={{ color: hex.text.muted, flexShrink: 0 }} />}
        </div>
        <p className="text-[11px] mb-1.5" style={{ color: hex.text.secondary }}>{a.description}</p>

        {!a.unlocked && (
          <>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: alpha(hex.neutral.white, 0.06) }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: hex.gold.base }} />
            </div>
            <p className="text-[10px] mt-1" style={{ color: hex.text.muted }}>{a.current} / {a.target}</p>
          </>
        )}
      </div>
    </div>
  );
}
