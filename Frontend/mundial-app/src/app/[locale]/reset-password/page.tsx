'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

export default function ResetPasswordPage() {
  const t        = useTranslations();
  const router   = useRouter();
  const locale   = useLocale();
  const params   = useSearchParams();
  const token    = params.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) { setError(t('reset.invalidLink')); return; }
    if (password.length < 6) { setError(t('reset.passwordMin')); return; }
    if (password !== confirm) { setError(t('reset.passwordMismatch')); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSuccess(true);
      } else {
        setError(data?.message || t('reset.invalidLink'));
      }
    } catch {
      setError(t('forgot.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.push(`/${locale}/login`);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0a1a10 0%, #060d08 55%, #040a06 100%)' }}>

      <motion.div
        className="relative z-10 w-full"
        style={{ maxWidth: 420 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-2xl p-6 sm:p-8"
          style={{
            background: `linear-gradient(145deg, ${alpha(hex.accent.navyCard, 0.99)}, ${alpha(hex.accent.navyCardMid, 0.97)})`,
            border: `1px solid ${alphaOf('green', 0.18)}`,
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.75)}`,
          }}>

          {success ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: alphaOf('green', 0.10), border: `1px solid ${alphaOf('green', 0.30)}`, boxShadow: `0 0 24px ${alphaOf('green', 0.15)}` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hex.green.bright} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-lg font-bold text-white mb-1">{t('reset.successTitle')}</h1>
              <p className="text-xs text-orionix-text-muted mb-6">{t('reset.successBody')}</p>
              <button onClick={goToLogin} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.25)}` }}>
                {t('reset.goToLogin')}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white">{t('reset.title')}</h1>
                <p className="text-xs mt-1 text-orionix-text-muted">{t('reset.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.22)}`, color: hex.accent.redSoft }}>
                    {error}
                  </p>
                )}

                <div>
                  <label htmlFor="rp-pass" className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-orionix-text-muted">
                    {t('reset.newPassword')}
                  </label>
                  <input
                    id="rp-pass" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoFocus autoComplete="new-password"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted outline-none"
                    style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}
                  />
                </div>

                <div>
                  <label htmlFor="rp-confirm" className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-orionix-text-muted">
                    {t('reset.confirmPassword')}
                  </label>
                  <input
                    id="rp-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••" required autoComplete="new-password"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted outline-none"
                    style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase"
                  style={{
                    background: loading ? alpha(hex.green.hover, 0.28) : `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`,
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : `0 6px 24px ${alphaOf('green', 0.28)}`,
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                      {t('common.sending')}
                    </span>
                  ) : t('reset.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
