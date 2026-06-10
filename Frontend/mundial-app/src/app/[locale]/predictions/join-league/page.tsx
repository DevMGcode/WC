'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiLink, FiArrowLeft, FiLogIn,
  FiAlertCircle, FiCheckCircle, FiInfo,
} from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

export default function JoinLeaguePage() {
  const router = useRouter();
  const t      = useTranslations();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [leagueCode, setLeagueCode] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!leagueCode.trim()) { setError(t('league.enterValidCode')); setLoading(false); return; }
      if (!user?.id)          { setError(t('league.mustLoginJoin')); setLoading(false); return; }
      await leagueService.joinLeague({ userId: Number(user.id), leagueCode: leagueCode.toUpperCase() });
      await queryClient.invalidateQueries({ queryKey: ['leagues', 'user', Number(user.id)] });
      setSuccess(t('league.joinedSuccessfully'));
      setTimeout(() => router.push('/predictions?tab=ligas'), 1500);
    } catch (err: any) {
      setError(err.message || t('league.enterValidCode'));
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full relative min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 22% 35%, #060f1e 0%, #030a14 48%, #010508 100%)' }}>

      {/* Ambient blobs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, top: -100, left: -100,
          background: 'radial-gradient(circle, rgba(0,210,185,0.07) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 400, height: 400, bottom: -80, right: -80,
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('league.join')} subtitle={t('league.joinPageHint')} centered />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-lg mx-auto w-full pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {/* Main card */}
          <div className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
              border: '1px solid rgba(34,211,238,0.14)',
              boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
            }}>
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.65), transparent)' }} />
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)', filter: 'blur(22px)' }} />

            <div className="relative p-6">
              {/* Icon + description */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'rgba(34,211,238,0.35)', filter: 'blur(16px)', opacity: 0.28, transform: 'scale(1.15)' }} />
                  {/* Icon box */}
                  <motion.div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(34,211,238,0.10), rgba(1,4,14,0.85))',
                      border: '1px solid rgba(34,211,238,0.22)',
                    }}
                    animate={{ boxShadow: [
                      '0 0 12px rgba(34,211,238,0.10)',
                      '0 0 28px rgba(34,211,238,0.30)',
                      '0 0 12px rgba(34,211,238,0.10)',
                    ]}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: `linear-gradient(130deg, ${alpha(hex.neutral.white, 0.08)} 0%, ${alpha(hex.neutral.white, 0.04)} 40%, transparent 65%)` }} />
                    {/* Top line */}
                    <div className="absolute inset-x-0 top-0 h-px rounded-2xl pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.60), transparent)' }} />
                    <FiLink size={28} style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.7))' }} />
                  </motion.div>
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: '1px solid rgba(34,211,238,0.30)' }}
                    animate={{ opacity: [0, 0.9, 0], scale: [1, 1.40, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-orionix-text-muted leading-relaxed">
                  {t('league.joinPageHintSub')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black tracking-[0.28em] uppercase text-orionix-text-muted mb-2">
                    {t('league.leagueCode')}
                  </label>
                  <input
                    type="text"
                    value={leagueCode}
                    onChange={e => setLeagueCode(e.target.value.toUpperCase())}
                    placeholder={t('league.leagueCodePlaceholder')}
                    maxLength={8}
                    className="w-full px-4 py-3.5 text-center text-lg font-mono font-black rounded-xl uppercase transition-all"
                    style={{
                      background: alpha(hex.neutral.white, 0.03),
                      border: '1px solid rgba(34,211,238,0.20)',
                      color: '#22d3ee',
                      letterSpacing: '0.22em',
                      outline: 'none',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(34,211,238,0.50)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.08)'; }}
                    onBlur={e  => { e.target.style.border = '1px solid rgba(34,211,238,0.20)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-300 font-medium"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                      <FiAlertCircle size={13} /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-emerald-300 font-medium"
                      style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)' }}>
                      <FiCheckCircle size={13} /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => router.back()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-secondary flex items-center justify-center gap-2"
                    style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
                  >
                    <FiArrowLeft size={13} /> {t('league.cancel')}
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading || !!success}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`, boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                  >
                    <FiLogIn size={13} />
                    {loading ? t('league.joining') : t('league.join')}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Tip card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(2,8,24,0.95), rgba(4,14,36,0.95))',
              border: '1px solid rgba(251,191,36,0.12)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.40), transparent)' }} />
            <div className="relative flex gap-3 p-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ background: 'rgba(251,191,36,0.30)', filter: 'blur(10px)', opacity: 0.22, transform: 'scale(1.15)' }} />
                <div className="relative w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg, rgba(251,191,36,0.10), rgba(1,4,14,0.85))', border: '1px solid rgba(251,191,36,0.22)' }}>
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: `linear-gradient(130deg, ${alpha(hex.neutral.white, 0.08)} 0%, transparent 65%)` }} />
                  <div className="absolute inset-x-0 top-0 h-px rounded-xl pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.55), transparent)' }} />
                  <FiInfo size={13} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.7))' }} />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-amber-400/60 mb-1">{t('league.joinTipHeader')}</p>
                <p className="text-xs text-orionix-text-muted leading-relaxed">
                  {t('league.joinTipBody')}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
