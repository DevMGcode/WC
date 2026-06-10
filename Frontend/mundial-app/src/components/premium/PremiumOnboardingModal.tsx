'use client';

/**
 * Modal de bienvenida para usuarios Free.
 *
 * Reglas:
 * - Solo se muestra a usuarios autenticados que NO son Premium.
 * - Aparece UNA SOLA VEZ por sesión del navegador. Se persiste en
 *   sessionStorage, así que al hacer logout/login vuelve a aparecer
 *   (una nueva sesión = nueva oportunidad de conversión).
 * - Se cierra con la X. Mientras la sesión esté abierta no vuelve a
 *   mostrarse (NO es agresivo tipo plantilla del partido).
 *
 * El botón inline "Pásate a Premium" del dashboard sigue existiendo
 * para quien cerró el modal y luego quiere volver a verlo.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiX, FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';

const SESSION_KEY = 'orionix.premiumModalShown';

interface Props {
  /** Si false, el modal no se renderiza (ej. usuario es Premium o no autenticado). */
  enabled: boolean;
  /** Locale activo para enrutar correctamente al checkout. */
  locale: string;
}

export default function PremiumOnboardingModal({ enabled, locale }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Decisión de abrir: una sola vez por sesión, solo para Free autenticado.
  useEffect(() => {
    if (!enabled) return;
    try {
      const shown = sessionStorage.getItem(SESSION_KEY);
      if (shown !== '1') {
        // Pequeño delay para no interrumpir la animación de entrada del dashboard.
        const timer = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // sessionStorage puede no estar disponible (modo incógnito muy restringido) — fallamos silenciosamente.
    }
  }, [enabled]);

  // Bloqueo de scroll + Escape para cerrar.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    setOpen(false);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
  }

  function goPremium() {
    handleClose();
    router.push(`/${locale}/premium`);
  }

  if (!mounted || !enabled) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: alpha(hex.neutral.black, 0.78), backdropFilter: 'blur(8px)' }} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden relative"
              style={{
                background: `linear-gradient(180deg, ${alpha(hex.bg.primary, 0.97)}, ${alpha(hex.neutral.black, 0.99)})`,
                border: `1px solid ${alphaOf('gold', 0.32)}`,
                boxShadow: `0 30px 90px ${alpha(hex.neutral.black, 0.75)}, 0 0 80px ${alphaOf('gold', 0.18)}`,
              }}>
              {/* Brillo decorativo superior */}
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}, transparent)` }} />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${alphaOf('gold', 0.20)} 0%, transparent 70%)` }} />

              {/* Close */}
              <button onClick={handleClose}
                className="absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center z-10"
                style={{ background: alpha(hex.bg.primary, 0.6), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}
                title="Cerrar">
                <FiX size={18} style={{ color: alpha(hex.text.muted, 0.85) }} />
              </button>

              <div className="relative px-6 pt-8 pb-6 text-center">
                {/* Ícono central animado */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
                  className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                    boxShadow: `0 10px 28px ${alphaOf('gold', 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.35)}`,
                  }}>
                  <FiZap size={28} style={{ color: hex.neutral.black, fill: hex.neutral.black }} />
                </motion.div>

                {/* Título */}
                <h2 className="text-xl sm:text-2xl font-black mb-1"
                  style={{ color: hex.gold.base }}>
                  ¡Vive el Mundial al máximo!
                </h2>
                <p className="text-[12px] tracking-[0.22em] uppercase font-black mb-4"
                  style={{ color: alpha(hex.gold.base, 0.65) }}>
                  Pase Mundial 2026
                </p>
                <p className="text-[13px] leading-relaxed mb-5"
                  style={{ color: alpha(hex.text.muted, 0.85) }}>
                  Predice los 80 partidos, crea ligas ilimitadas y disfruta sin anuncios hasta el final del torneo.
                </p>

                {/* Beneficios */}
                <ul className="text-left space-y-2 mb-6 mx-auto" style={{ maxWidth: 280 }}>
                  {[
                    'Predicciones de todos los partidos',
                    'Crear ligas privadas ilimitadas',
                    'Top 50 goleadores + filtros',
                    'Insignia PRO en el ranking',
                    'Sin anuncios',
                  ].map((b, i) => (
                    <motion.li key={b}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className="flex items-center gap-2.5 text-[12px]"
                      style={{ color: hex.text.primary }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: alphaOf('gold', 0.15), border: borders.brand('gold', 0.35) }}>
                        <FiCheck size={11} style={{ color: hex.gold.base }} />
                      </span>
                      <span>{b}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTAs */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goPremium}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black tracking-wider uppercase text-[12px]"
                    style={{
                      background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                      color: hex.neutral.black,
                      boxShadow: `0 6px 22px ${alphaOf('gold', 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.35)}`,
                    }}>
                    <FiZap size={14} style={{ fill: hex.neutral.black }} />
                    Pasarme a Premium
                    <FiArrowRight size={14} />
                  </motion.button>

                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-[11px] tracking-wider uppercase font-bold"
                    style={{ color: alpha(hex.text.muted, 0.55) }}>
                    Quizás más tarde
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
