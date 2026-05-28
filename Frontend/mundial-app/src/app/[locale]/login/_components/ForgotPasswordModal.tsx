'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ show, onClose }: ForgotPasswordModalProps) {
  const [fpEmail,   setFpEmail]   = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError,   setFpError]   = useState('');
  const [fpSuccess, setFpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Ingresa tu correo electrónico.'); return; }
    setFpLoading(true); setFpError('');
    try {
      const res  = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) setFpSuccess(true);
      else setFpError(data.message || 'No se pudo procesar la solicitud.');
    } catch {
      setFpError('Error de conexión. Intenta de nuevo.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleClose = () => {
    if (fpLoading) return;
    onClose();
    setTimeout(() => { setFpEmail(''); setFpError(''); setFpSuccess(false); }, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: alpha(hex.neutral.black, 0.75), backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed z-50 w-full px-4"
            style={{ top: '50%', left: '50%', maxWidth: 420, translateX: '-50%', translateY: '-50%' }}
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <div className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(145deg, ${alpha(hex.accent.navyCard, 0.99)}, ${alpha(hex.accent.navyCardMid, 0.97)})`,
                border: `1px solid ${alphaOf('green', 0.18)}`,
                boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.75)}`,
              }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Recuperar contraseña</h2>
                  <p className="text-xs mt-0.5 text-orionix-text-muted">Te enviamos una contraseña temporal al correo</p>
                </div>
                <button onClick={handleClose} disabled={fpLoading} className="transition-colors text-orionix-text-muted hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success state */}
              {fpSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: alphaOf('green', 0.10), border: `1px solid ${alphaOf('green', 0.30)}`, boxShadow: `0 0 24px ${alphaOf('green', 0.15)}` }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hex.green.bright} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mb-1 text-orionix-green-soft">¡Correo enviado!</p>
                  <p className="text-xs text-orionix-text-muted">Revisa tu bandeja de entrada e inicia sesión con la contraseña temporal.</p>
                  <button onClick={handleClose} className="mt-5 px-6 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.25)}` }}>
                    Entendido
                  </button>
                </motion.div>
              ) : (
                /* Form state */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence>
                    {fpError && (
                      <motion.p key="fpe" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-xs px-3 py-2 rounded-lg"
                        style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.22)}`, color: hex.accent.redSoft }}>
                        {fpError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div>
                    <label htmlFor="fp-email" className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-orionix-text-muted">
                      Correo de tu cuenta
                    </label>
                    <input
                      id="fp-email" type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                      placeholder="tu@email.com" required autoFocus autoComplete="email"
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted outline-none transition-all duration-200"
                      style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}
                      onFocus={e => { e.currentTarget.style.border = `1px solid ${alphaOf('green', 0.40)}`; e.currentTarget.style.background = alphaOf('green', 0.05); }}
                      onBlur={e => { e.currentTarget.style.border = `1px solid ${alpha(hex.neutral.white, 0.10)}`; e.currentTarget.style.background = alpha(hex.neutral.white, 0.04); }}
                    />
                  </div>

                  <button type="submit" disabled={fpLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase overflow-hidden relative"
                    style={{
                      background: fpLoading ? alpha(hex.green.hover, 0.28) : `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`,
                      color: '#fff',
                      cursor: fpLoading ? 'not-allowed' : 'pointer',
                      boxShadow: fpLoading ? 'none' : `0 6px 24px ${alphaOf('green', 0.28)}`,
                    }}>
                    {fpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        Enviar contraseña temporal
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
