'use client';

/**
 * Modal de video comercial para usuarios Free.
 *
 * Componente controlado (open / onClose) y reutilizable: lo puede abrir
 * cualquier punto de la app (paywall PremiumGate, onboarding, teaser, …).
 *
 * Diseño no-invasivo:
 * - El <video> SOLO se monta cuando open === true, así que el archivo
 *   (~2,4 MB) no se descarga hasta que el usuario decide verlo.
 * - Autoplay SILENCIADO (única forma que los navegadores permiten autoplay)
 *   + botón para activar el sonido si le interesa.
 * - Se cierra con X, Escape o clic en el backdrop.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiX, FiZap, FiVolume2, FiVolumeX, FiArrowRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

const VIDEO_SRC = '/Propa/video.mp4';

interface Props {
  /** Controla la visibilidad del modal. */
  open: boolean;
  /** Callback para cerrar (lo gestiona el componente padre). */
  onClose: () => void;
  /** Locale activo para enrutar el CTA de compra. */
  locale: string;
  /** Destino del CTA de compra. Por defecto, el checkout. */
  ctaHref?: string;
}

export default function PremiumVideoModal({ open, onClose, locale, ctaHref }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => setMounted(true), []);

  // Bloqueo de scroll + Escape mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Cada vez que se abre, arranca silenciado de nuevo.
  useEffect(() => {
    if (open) setMuted(true);
  }, [open]);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) v.play().catch(() => {});
  }

  function goBuy() {
    onClose();
    router.push(ctaHref ?? `/${locale}/checkout`);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: alpha(hex.neutral.black, 0.80), backdropFilter: 'blur(8px)' }} />

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
              {/* Brillo dorado superior */}
              <div className="absolute inset-x-0 top-0 h-px z-20"
                style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}, transparent)` }} />

              {/* Cerrar */}
              <button onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center z-20"
                style={{ background: alpha(hex.neutral.black, 0.55), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}
                title="Cerrar">
                <FiX size={18} style={{ color: alpha(hex.text.muted, 0.85) }} />
              </button>

              {/* Video — solo se descarga al abrir el modal */}
              <div className="relative" style={{ background: hex.neutral.black }}>
                <video
                  ref={videoRef}
                  src={VIDEO_SRC}
                  className="block w-full h-auto"
                  style={{ maxHeight: '64vh' }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                />
                {/* Botón de sonido */}
                <button onClick={toggleSound}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide z-10"
                  style={{
                    background: alpha(hex.neutral.black, 0.6),
                    border: `1px solid ${alpha(hex.neutral.white, 0.12)}`,
                    color: hex.text.primary,
                  }}>
                  {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
                  {muted ? 'Activar sonido' : 'Silenciar'}
                </button>
              </div>

              {/* CTA de compra */}
              <div className="px-5 pt-4 pb-5 text-center">
                <p className="text-[12px] tracking-[0.22em] uppercase font-black mb-3"
                  style={{ color: alpha(hex.gold.base, 0.7) }}>
                  Pase Mundial 2026
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goBuy}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black tracking-wider uppercase text-[12px]"
                  style={{
                    background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                    color: hex.neutral.black,
                    boxShadow: `0 6px 22px ${alphaOf('gold', 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.35)}`,
                  }}>
                  <FiZap size={14} style={{ fill: hex.neutral.black }} />
                  Comprar ahora — $20.000 COP
                  <FiArrowRight size={14} />
                </motion.button>
                <button onClick={onClose}
                  className="w-full mt-2 py-2 text-[11px] tracking-wider uppercase font-bold"
                  style={{ color: alpha(hex.text.muted, 0.55) }}>
                  Quizás más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
