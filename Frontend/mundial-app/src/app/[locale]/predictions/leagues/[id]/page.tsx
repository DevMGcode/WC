'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiShield, FiUsers, FiCopy, FiCheck, FiArrowLeft,
  FiLogOut, FiTrash2, FiRepeat, FiAlertCircle,
} from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { PremiumBadge } from '@/components/premium/PremiumBadge';

/* ── GlowBar ── */
const GlowBar = ({ value, max = 100, color, height = 4 }: {
  value: number; max?: number; color: string; height?: number;
}) => {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, background: alpha(hex.neutral.white, 0.05) }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}80` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#fbbf24', '#94a3b8', '#f97316'];
const ROW_FALLBACK_COLOR = alpha(hex.neutral.white, 0.20);

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t      = useTranslations();
  const leagueId = params.id as string;
  const { user } = useAuth();
  const userId = Number(user?.id ?? 0);

  const [league, setLeague]                   = useState<any>(null);
  const [members, setMembers]                 = useState<any[]>([]);
  const [ranking, setRanking]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [actionError, setActionError]         = useState('');
  const [actionLoading, setActionLoading]     = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');
  const [codeCopied, setCodeCopied]           = useState(false);

  const handleCopyCode = () => {
    if (!league?.code) return;
    navigator.clipboard.writeText(league.code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  useEffect(() => { loadLeagueData(); }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      const leagueData  = await leagueService.getLeague(leagueId);
      setLeague(leagueData);
      const membersData = await leagueService.getLeagueMembers(leagueId);
      setMembers(membersData);
      const rankingData = await leagueService.getLeagueRanking(leagueId);
      setRanking(rankingData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLeaveLeague = async () => {
    setActionError('');
    if (league?.ownerId === userId) {
      setActionError('No puedes salir siendo propietario. Transfiere o elimina la liga primero.');
      return;
    }
    if (!confirm(t('league.confirmLeave'))) return;
    try {
      setActionLoading(true);
      await leagueService.leaveLeague(leagueId, userId);
      router.push('/predictions');
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'No se pudo salir de la liga.');
    } finally { setActionLoading(false); }
  };

  const handleTransferOwnership = async () => {
    setActionError('');
    if (!selectedNewOwnerId) { setActionError('Selecciona un miembro.'); return; }
    try {
      setActionLoading(true);
      await leagueService.transferOwnership(leagueId, userId, Number(selectedNewOwnerId));
      await loadLeagueData();
      setSelectedNewOwnerId('');
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'No se pudo transferir.');
    } finally { setActionLoading(false); }
  };

  const handleDeleteLeague = async () => {
    setActionError('');
    if (!confirm(t('league.confirmDelete'))) return;
    try {
      setActionLoading(true);
      await leagueService.deleteLeague(leagueId, userId);
      router.push('/predictions');
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'No se pudo eliminar.');
    } finally { setActionLoading(false); }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 42%, ${hex.bg.primary} 100%)` }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-12 h-12 rounded-full border-2 border-green-500/20 border-t-green-500"
            animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-[10px] text-green-500/60 tracking-[0.3em] uppercase font-bold">{t('league.loading')}</p>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 42%, ${hex.bg.primary} 100%)` }}>
        <div className="text-center">
          <p className="text-orionix-text-secondary mb-4">Liga no encontrada</p>
          <button onClick={() => router.back()}
            className="px-5 py-2 rounded-xl text-sm font-bold text-green-300 border border-green-500/30">
            ← {t('league.back')}
          </button>
        </div>
      </div>
    );
  }

  const myScore           = ranking.find((r: any) => r.userId === userId);
  const isOwner           = Number(league?.ownerId) === userId;
  const transferableMembers = members.filter((m: any) => Number(m.userId) !== userId);
  const maxPts            = ranking.length > 0 ? Math.max(...ranking.map((r: any) => r.totalPoints), 1) : 1;

  const statChips = [
    { label: t('league.maxMembersStat'), value: league.maxMembers,                              color: '#22d3ee' },
    { label: t('league.yourPoints'),     value: myScore?.totalPoints ?? 0,                      color: '#34d399' },
    { label: t('league.yourPosition'),   value: myScore?.rankPosition ? `#${myScore.rankPosition}` : '#—', color: '#fbbf24' },
  ];

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
          background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={league.name} subtitle={t('league.detailTitle')} centered />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-3xl mx-auto w-full pb-32">

        {/* ── HEADER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-4"
          style={{
            background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
            border: '1px solid rgba(34,211,238,0.14)',
            boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.65), transparent)' }} />
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 65%)', filter: 'blur(22px)' }} />

          <div className="relative p-5">
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,211,238,0.10)', border: '1px solid rgba(34,211,238,0.20)' }}>
                  <FiShield size={18} style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.7))' }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-none">{league.name}</h2>
                  {league.description && <p className="text-[11px] text-orionix-text-muted mt-0.5">{league.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ border: '1px solid rgba(34,211,238,0.22)', background: 'rgba(34,211,238,0.07)' }}>
                <FiUsers size={10} style={{ color: '#22d3ee' }} />
                <span className="text-[9px] font-black text-green-300 tracking-widest">{ranking.length} miembros</span>
              </div>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {statChips.map(({ label, value, color }) => (
                <div key={label} className="relative overflow-hidden rounded-xl p-3 text-center"
                  style={{ background: alpha(hex.bg.primary, 0.80), border: `1px solid ${color}22` }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
                  <p className="text-xl font-black" style={{ color, textShadow: `0 0 14px ${color}80` }}>{value}</p>
                  <p className="text-[9px] font-bold mt-0.5 tracking-wide" style={{ color: `${color}70` }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Code copy button */}
            <motion.button
              onClick={handleCopyCode}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="relative w-full overflow-hidden rounded-xl p-3 flex items-center justify-between"
              style={{
                background: codeCopied ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.06)',
                border: `1px solid ${codeCopied ? 'rgba(52,211,153,0.28)' : 'rgba(251,191,36,0.22)'}`,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${codeCopied ? 'rgba(52,211,153,0.60)' : 'rgba(251,191,36,0.60)'}, transparent)` }} />
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-left"
                  style={{ color: codeCopied ? 'rgba(52,211,153,0.60)' : 'rgba(251,191,36,0.60)' }}>
                  {t('league.leagueCodeLabel')}
                </p>
                <p className="text-sm font-mono font-black mt-0.5"
                  style={{ color: codeCopied ? '#34d399' : '#fbbf24', letterSpacing: '0.2em' }}>
                  {league.code}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: codeCopied ? 'rgba(52,211,153,0.10)' : 'rgba(251,191,36,0.10)' }}>
                {codeCopied
                  ? <FiCheck size={13} style={{ color: '#34d399' }} />
                  : <FiCopy size={13} style={{ color: '#fbbf24' }} />}
                <span className="text-[9px] font-black"
                  style={{ color: codeCopied ? '#34d399' : '#fbbf24' }}>
                  {codeCopied ? '✓' : t('league.copy')}
                </span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ── RANKING ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl mb-4"
          style={{
            background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
            border: '1px solid rgba(251,191,36,0.12)',
            boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.55), transparent)' }} />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 65%)', filter: 'blur(22px)' }} />

          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[3px] h-5 rounded-full"
                style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }} />
              <span className="text-[10px] font-black text-orionix-text-secondary tracking-[0.24em] uppercase">{t('league.rankingTitle')}</span>
              <span className="text-lg ml-1">🏆</span>
            </div>

            {ranking.length === 0 ? (
              <p className="text-orionix-text-muted text-sm text-center py-6">{t('league.noMembers')}</p>
            ) : (
              <div className="space-y-1.5">
                {/* Header row */}
                <div className="grid grid-cols-[32px_1fr_56px_64px_52px] gap-2 px-3 pb-1">
                  <span className="text-[8px] font-black text-orionix-text-muted uppercase tracking-widest">{t('league.position')}</span>
                  <span className="text-[8px] font-black text-orionix-text-muted uppercase tracking-widest">{t('league.player')}</span>
                  <span className="text-[8px] font-black text-orionix-text-muted uppercase tracking-widest text-center">{t('league.exactScores')}</span>
                  <span className="text-[8px] font-black text-orionix-text-muted uppercase tracking-widest text-center">{t('league.winners')}</span>
                  <span className="text-[8px] font-black text-orionix-text-muted uppercase tracking-widest text-right">{t('league.points')}</span>
                </div>

                {ranking.map((player: any, idx: number) => {
                  const isMe     = player.userId === userId;
                  const rowColor = isMe ? '#22d3ee' : (MEDAL_COLORS[idx] ?? ROW_FALLBACK_COLOR);
                  return (
                    <motion.div
                      key={player.userId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + idx * 0.05 }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: isMe ? 'rgba(34,211,238,0.06)' : (idx < 3 ? 'rgba(251,191,36,0.03)' : alpha(hex.neutral.white, 0.02)),
                        border: isMe ? '1px solid rgba(34,211,238,0.20)' : `1px solid ${alpha(hex.neutral.white, 0.04)}`,
                      }}
                    >
                      {isMe && <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.45), transparent)' }} />}
                      <div className="grid grid-cols-[32px_1fr_56px_64px_52px] gap-2 items-center px-3 pt-3 pb-2">
                        <span className="text-lg text-center leading-none">
                          {idx < 3
                            ? MEDALS[idx]
                            : <span className="text-orionix-text-muted text-xs font-bold">{idx + 1}</span>}
                        </span>
                        <span className={`text-xs font-bold truncate flex items-center gap-1.5 ${isMe ? 'text-green-300' : 'text-orionix-text-secondary'}`}>
                          {isMe && <span className="text-green-500 mr-0.5">›</span>}
                          <span className="truncate">{player.fullName || player.username}</span>
                          <PremiumBadge isPremium={player.isPremium} />
                          {isMe && <span className="text-orionix-text-muted">{t('league.you')}</span>}
                        </span>
                        <span className="text-xs font-black tabular-nums text-center text-orionix-text-secondary">{player.exactScores}</span>
                        <span className="text-xs font-black tabular-nums text-center text-orionix-text-secondary">{player.winnerHits}</span>
                        <span className="text-xs font-black tabular-nums text-right"
                          style={{ color: rowColor, textShadow: `0 0 8px ${rowColor}60` }}>
                          {player.totalPoints}
                        </span>
                      </div>
                      <div className="px-3 pb-2">
                        <GlowBar value={player.totalPoints} max={maxPts} color={rowColor} height={2} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── MANAGEMENT (owner only) ── */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(20,4,4,0.97))',
              border: '1px solid rgba(239,68,68,0.14)',
              boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.45), transparent)' }} />

            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #ef4444, #b91c1c)' }} />
                <span className="text-[10px] font-black text-orionix-text-secondary tracking-[0.24em] uppercase">{t('league.ownership')}</span>
              </div>

              {transferableMembers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-orionix-text-muted">Transfiere la propiedad si quieres salir de la liga.</p>
                  <select
                    value={selectedNewOwnerId}
                    onChange={e => setSelectedNewOwnerId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-orionix-text-secondary font-medium"
                    style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.10)}`, outline: 'none' }}
                  >
                    <option value="" style={{ background: hex.bg.primary }}>Selecciona nuevo propietario…</option>
                    {transferableMembers.map((m: any) => (
                      <option key={m.userId} value={m.userId} style={{ background: hex.bg.primary }}>
                        {m.fullName || m.username}
                      </option>
                    ))}
                  </select>
                  <motion.button
                    onClick={handleTransferOwnership}
                    disabled={actionLoading || !selectedNewOwnerId}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`, boxShadow: `0 4px 20px ${alphaOf('green', 0.25)}` }}
                  >
                    <FiRepeat size={14} />
                    {actionLoading ? 'Transfiriendo…' : 'Transferir Propiedad'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-orionix-text-muted">{t('league.onlyMember')}</p>
                  <motion.button
                    onClick={handleDeleteLeague}
                    disabled={actionLoading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #991b1b, #dc2626)', boxShadow: '0 4px 20px rgba(220,38,38,0.25)' }}
                  >
                    <FiTrash2 size={14} />
                    {actionLoading ? '…' : t('league.deleteLeague')}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-300 font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
            >
              <FiAlertCircle size={13} /> {actionError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-secondary flex items-center justify-center gap-2"
            style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
          >
            <FiArrowLeft size={14} /> {t('league.back')}
          </motion.button>
          <motion.button
            onClick={handleLeaveLeague}
            disabled={isOwner || actionLoading}
            whileHover={!isOwner ? { scale: 1.02 } : {}}
            whileTap={!isOwner ? { scale: 0.97 } : {}}
            className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
            style={{
              background: isOwner ? alpha(hex.neutral.white, 0.03) : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))',
              border: isOwner ? `1px solid ${alpha(hex.neutral.white, 0.06)}` : '1px solid rgba(239,68,68,0.28)',
              color: isOwner ? 'rgba(100,116,139,0.50)' : '#f87171',
              opacity: isOwner ? 0.55 : 1,
            }}
          >
            <FiLogOut size={14} />
            {isOwner ? t('league.isOwner') : actionLoading ? '…' : t('league.leaveLeague')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
