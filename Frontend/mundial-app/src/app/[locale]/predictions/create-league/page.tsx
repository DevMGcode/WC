'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentTournament } from '@/services/publicTournament';
import {
  FiShield, FiArrowLeft, FiAlertCircle, FiCopy,
  FiCheck, FiUsers, FiArrowRight, FiPlus,
} from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { usePremium } from '@/hooks/usePremium';
import { PremiumGate } from '@/components/premium/PremiumGate';

/* ── Shared input style helper ── */
const inputStyle: React.CSSProperties = {
  background: alpha(hex.neutral.white, 0.03),
  border: '1px solid rgba(34,211,238,0.18)',
  color: '#e2f8ff',
  outline: 'none',
};

/**
 * Página /predictions/create-league
 * Gate Premium: crear ligas es exclusivo Premium. Free ve paywall.
 *
 * El wrapper externo es liviano (solo decide qué renderizar).
 * El componente interno CreateLeagueForm solo se monta para Premium —
 * esto evita inconsistencias de hooks entre renders.
 */
export default function CreateLeaguePage() {
  const { isPremium, isLoading: premiumLoading } = usePremium();

  if (premiumLoading) {
    return (
      <div className="w-full relative min-h-screen">
        <div className="relative z-10">
          <Header title="Orionix Gol" subtitle="Crear liga privada" centered />
        </div>
        <div className="flex items-center justify-center py-24">
          <motion.div
            className="w-10 h-10 rounded-full border-2"
            style={{
              borderColor: alphaOf('green', 0.20),
              borderTopColor: hex.green.bright,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="w-full relative min-h-screen">
        <div className="relative z-10">
          <Header title="Orionix Gol" subtitle="Crear liga privada" centered />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 pb-32">
          <PremiumGate
            feature="crear ligas privadas"
            description="Crea ligas privadas ilimitadas con tus amigos y compite por el mejor pronosticador del Mundial. Esta funcionalidad es exclusiva del Pase Mundial 2026."
          >
            <div />
          </PremiumGate>
        </div>
      </div>
    );
  }

  return <CreateLeagueForm />;
}

/**
 * Componente real con el formulario de creación.
 * Solo se monta cuando el usuario es Premium — así sus hooks no se mezclan
 * con la lógica del gate.
 */
function CreateLeagueForm() {
  const router = useRouter();
  const t      = useTranslations();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [tournamentId, setTournamentId] = useState<number>(0);
  const [createdLeague, setCreatedLeague] = useState<{ id: string; name: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', maxMembers: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    getCurrentTournament().then(t => { if (t?.id) setTournamentId(t.id); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'maxMembers' ? (value === '' ? '' : parseInt(value, 10)) : value }));
  };

  const handleCopyCode = () => {
    if (!createdLeague) return;
    navigator.clipboard.writeText(createdLeague.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!user?.id)     { setError(t('league.mustLoginCreate')); setLoading(false); return; }
    if (!tournamentId) { setError('No se pudo obtener el torneo activo. Intenta de nuevo.'); setLoading(false); return; }
    try {
      const newLeague = await leagueService.createLeague({ userId: Number(user.id), ...formData, tournamentId });
      await queryClient.invalidateQueries({ queryKey: ['leagues', 'user', Number(user.id)] });
      setCreatedLeague({ id: String((newLeague as any).id), name: (newLeague as any).name, code: (newLeague as any).code });
    } catch (err: any) {
      setError(err.message || 'Error al crear la liga');
    } finally { setLoading(false); }
  };

  const focusProps = (field: string) => ({
    onFocus: (e: React.FocusEvent<any>) => {
      setFocusedField(field);
      e.target.style.border = '1px solid rgba(34,211,238,0.50)';
      e.target.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.08)';
    },
    onBlur: (e: React.FocusEvent<any>) => {
      setFocusedField(null);
      e.target.style.border = '1px solid rgba(34,211,238,0.18)';
      e.target.style.boxShadow = 'none';
    },
  });

  /* ══ SUCCESS SCREEN ══ */
  if (createdLeague) {
    return (
      <div className="w-full relative min-h-screen"
        style={{ background: 'radial-gradient(ellipse at 22% 35%, #060f1e 0%, #030a14 48%, #010508 100%)' }}>

        <motion.div className="fixed rounded-full pointer-events-none"
          style={{ width: 500, height: 500, top: -100, left: -100,
            background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 12, repeat: Infinity }} />

        <div className="relative" style={{ zIndex: 10 }}>
          <Header title={t('league.createTitle')} subtitle={t('league.createSubtitle')} centered />
        </div>

        <div className="relative z-10 px-4 py-6 max-w-lg mx-auto w-full pb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Main success card */}
            <div className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,18,10,0.97))',
                border: '1px solid rgba(52,211,153,0.20)',
                boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: 'linear-gradient(90deg, #22d3ee, #34d399, #22d3ee)', borderRadius: '12px 12px 0 0' }} />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)', filter: 'blur(28px)' }} />

              <div className="relative p-6">
                {/* Trophy + name */}
                <div className="text-center mb-6">
                  <motion.div
                    className="text-5xl mb-3 inline-block"
                    animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >🎉</motion.div>
                  <h2 className="text-xl font-black text-white">{createdLeague.name}</h2>
                  <p className="text-xs text-orionix-text-muted mt-1">Tu liga fue creada exitosamente</p>
                </div>

                {/* Code display */}
                <div className="mb-5">
                  <p className="text-[9px] font-black tracking-[0.28em] uppercase text-center mb-3"
                    style={{ color: 'rgba(251,191,36,0.60)' }}>
                    {t('league.inviteCode')}
                  </p>
                  <motion.button
                    onClick={handleCopyCode}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="relative w-full overflow-hidden rounded-xl flex items-center justify-between gap-3 px-4 py-4"
                    style={{
                      background: copied ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.07)',
                      border: `1px solid ${copied ? 'rgba(52,211,153,0.30)' : 'rgba(251,191,36,0.25)'}`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${copied ? 'rgba(52,211,153,0.60)' : 'rgba(251,191,36,0.60)'}, transparent)` }} />
                    <p className="text-2xl font-black font-mono tracking-[0.12em] min-w-0 flex-1"
                      style={{ color: copied ? '#34d399' : '#fbbf24', textShadow: `0 0 20px ${copied ? 'rgba(52,211,153,0.65)' : 'rgba(251,191,36,0.65)'}` }}>
                      {createdLeague.code}
                    </p>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0"
                      style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.10)' }}>
                      {copied
                        ? <FiCheck size={14} style={{ color: '#34d399' }} />
                        : <FiCopy size={14} style={{ color: '#fbbf24' }} />}
                      <span className="text-[9px] font-black"
                        style={{ color: copied ? '#34d399' : '#fbbf24' }}>
                        {copied ? 'Copiado' : 'Copiar'}
                      </span>
                    </div>
                  </motion.button>
                </div>

                {/* Instructions */}
                <div className="rounded-xl p-4 mb-5"
                  style={{ background: alphaOf('green', 0.04), border: `1px solid ${alphaOf('green', 0.10)}` }}>
                  <div className="absolute inset-x-0 top-0 h-px" />
                  <p className="text-[9px] font-black tracking-[0.25em] uppercase text-green-400/50 mb-3">{t('league.howToInvite')}</p>
                  {[
                    t('league.inviteStep1', { code: createdLeague.code }),
                    t('league.inviteStep2'),
                    t('league.inviteStep3'),
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                      <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black mt-0.5"
                        style={{ background: 'rgba(34,211,238,0.10)', border: '1px solid rgba(34,211,238,0.20)', color: '#22d3ee' }}>
                        {i + 1}
                      </span>
                      <p className="text-xs text-orionix-text-muted leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => router.push('/predictions')}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-secondary flex items-center justify-center gap-2"
                    style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
                  >
                    <FiArrowLeft size={13} /> {t('league.goToPredictions')}
                  </motion.button>
                  <motion.button
                    onClick={() => router.push(`/predictions/leagues/${createdLeague.id}`)}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(52,211,153,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 6px 24px rgba(52,211,153,0.28)' }}
                  >
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                    <span className="relative flex items-center gap-2">{t('league.viewMyLeague')} <FiArrowRight size={13} /></span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ══ FORM SCREEN ══ */
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
          background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('league.createLeague')} subtitle={t('league.pageStartCompetition')} centered />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-lg mx-auto w-full pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main form card */}
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
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'rgba(34,211,238,0.35)', filter: 'blur(12px)', opacity: 0.25, transform: 'scale(1.15)' }} />
                  <motion.div
                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(34,211,238,0.10), rgba(1,4,14,0.85))',
                      border: '1px solid rgba(34,211,238,0.22)',
                    }}
                    animate={{ boxShadow: ['0 0 10px rgba(34,211,238,0.10)', '0 0 24px rgba(34,211,238,0.28)', '0 0 10px rgba(34,211,238,0.10)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.08) 0%, transparent 65%)' }} />
                    <div className="absolute inset-x-0 top-0 h-px rounded-2xl pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.55), transparent)' }} />
                    <FiShield size={22} style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.7))' }} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: '1px solid rgba(34,211,238,0.28)' }}
                    animate={{ opacity: [0, 0.8, 0], scale: [1, 1.45, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-[0.28em] uppercase text-green-400/50 mb-0.5">{t('league.pageStartCompetition')}</p>
                  <h2 className="text-base font-black text-white leading-none">{t('league.createLeague')}</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* League name */}
                <div>
                  <label className="block text-[9px] font-black tracking-[0.28em] uppercase mb-2"
                    style={{ color: focusedField === 'name' ? '#22d3ee' : 'rgba(100,116,139,0.80)' }}>
                    {t('league.leagueName')}
                  </label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder={t('league.leagueNamePlaceholder')} required maxLength={50}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={inputStyle}
                    {...focusProps('name')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-black tracking-[0.28em] uppercase mb-2"
                    style={{ color: focusedField === 'description' ? '#22d3ee' : 'rgba(100,116,139,0.80)' }}>
                    {t('league.leagueDescription')} <span className="normal-case font-normal text-orionix-text-muted">{t('league.optional')}</span>
                  </label>
                  <textarea
                    name="description" value={formData.description} onChange={handleChange}
                    placeholder={t('league.leagueDescriptionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all"
                    style={{ ...inputStyle, lineHeight: 1.6 }}
                    {...focusProps('description')}
                  />
                </div>

                {/* Max members */}
                <div>
                  <label className="block text-[9px] font-black tracking-[0.28em] uppercase mb-2"
                    style={{ color: focusedField === 'maxMembers' ? '#22d3ee' : 'rgba(100,116,139,0.80)' }}>
                    <span className="inline-flex items-center gap-1">
                      <FiUsers size={9} /> {t('league.maxMembers')}
                    </span>
                  </label>
                  <input
                    type="number" name="maxMembers" value={formData.maxMembers} onChange={handleChange}
                    min="2" max="100"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={inputStyle}
                    {...focusProps('maxMembers')}
                  />
                  <p className="text-[9px] text-orionix-text-muted mt-1.5 ml-1">{t('league.maxMembersHint')}</p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-300 font-medium"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                      <FiAlertCircle size={13} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button" onClick={() => router.back()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-secondary flex items-center justify-center gap-2"
                    style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
                  >
                    <FiArrowLeft size={13} /> {t('league.cancel')}
                  </motion.button>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(0,210,185,0.40)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`, boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                  >
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                    <span className="relative flex items-center gap-2">
                      {loading
                        ? <><motion.span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /> {t('league.joining')}</>
                        : <><FiPlus size={13} /> {t('league.createLeague')}</>}
                    </span>
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
