'use client';

/**
 * Wrapper que protege una sección/feature exclusiva del plan Premium.
 *
 * Si el usuario es Premium → renderiza `children` normalmente.
 * Si es Free → muestra un paywall con CTA al checkout.
 *
 * Uso:
 *   <PremiumGate feature="ranking global">
 *     <RankingGlobalView />
 *   </PremiumGate>
 */

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiLock, FiZap, FiPlay } from 'react-icons/fi';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';
import { usePremium } from '@/hooks/usePremium';
import PremiumVideoModal from './PremiumVideoModal';

interface PremiumGateProps {
  /** Contenido protegido — solo se muestra a usuarios Premium */
  children: ReactNode;
  /** Nombre de la feature (ej. "ranking global", "head-to-head") — se muestra en el paywall */
  feature: string;
  /** Mensaje personalizado opcional sobre el feature */
  description?: string;
  /** Si true, no muestra el paywall mientras carga la sesión (evita flash) */
  hideWhileLoading?: boolean;
}

export function PremiumGate({
  children,
  feature,
  description,
  hideWhileLoading = true,
}: PremiumGateProps) {
  const { isPremium, isLoading, isAuthenticated } = usePremium();
  const locale = useLocale();
  const [videoOpen, setVideoOpen] = useState(false);

  // Mientras carga, evitamos flash de paywall
  if (isLoading && hideWhileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          className="w-8 h-8 rounded-full border-2"
          style={{
            borderColor: alpha(hex.gold.base, 0.2),
            borderTopColor: hex.gold.base,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Premium → contenido real
  if (isPremium) {
    return <>{children}</>;
  }

  // Free → paywall
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl p-8 text-center"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.92)} 0%, ${alpha(hex.bg.elevated, 0.96)} 100%)`,
        border: `1px solid ${alpha(hex.gold.base, 0.28)}`,
        backdropFilter: 'blur(28px)',
        boxShadow: `0 14px 44px ${alpha(hex.neutral.black, 0.55)}, 0 0 0 1px ${alpha(hex.gold.base, 0.08)}`,
      }}
    >
      {/* Línea superior dorada */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.55)}, transparent)`,
        }}
      />

      {/* Icono central */}
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.20)}, ${alpha(hex.gold.base, 0.05)})`,
          border: `1px solid ${alpha(hex.gold.base, 0.35)}`,
        }}
      >
        <FiLock size={26} style={{ color: hex.gold.base }} />
      </div>

      <p
        className="text-[11px] font-black tracking-[0.22em] uppercase mb-2"
        style={{ color: alpha(hex.gold.base, 0.85) }}
      >
        Solo para Premium
      </p>

      <h2 className="text-xl font-black text-white mb-2">
        Desbloquea {feature}
      </h2>

      <p
        className="text-sm leading-relaxed mb-6 max-w-md mx-auto"
        style={{ color: hex.text.secondary }}
      >
        {description ??
          `Esta funcionalidad es exclusiva del Pase Mundial 2026. Hazte Premium para acceder a ${feature} y mucho más.`}
      </p>

      {/* Trigger del video comercial — abre el modal, no es intrusivo (lo pulsa el usuario) */}
      <button
        onClick={() => setVideoOpen(true)}
        className="mb-5 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-bold tracking-wide transition-all active:scale-[0.98] hover:bg-white/5"
        style={{
          color: hex.gold.base,
          border: `1px solid ${alpha(hex.gold.base, 0.45)}`,
          background: alpha(hex.gold.base, 0.06),
        }}
      >
        <FiPlay size={15} style={{ fill: hex.gold.base }} />
        Mira en 30 seg lo que te llevas
      </button>

      {!isAuthenticated ? (
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-black tracking-wide transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
            color: hex.neutral.black,
            boxShadow: `0 12px 32px ${alpha(hex.gold.base, 0.35)}`,
          }}
        >
          Inicia sesión
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${locale}/premium`}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-black tracking-wide transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
              color: hex.neutral.black,
              boxShadow: `0 12px 32px ${alpha(hex.gold.base, 0.35)}`,
            }}
          >
            <FiZap size={16} />
            Ver Pase Mundial
          </Link>
          <Link
            href={`/${locale}/checkout`}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold tracking-wide transition-all hover:bg-white/5"
            style={{
              color: hex.text.secondary,
              border: `1px solid ${alpha(hex.neutral.white, 0.10)}`,
            }}
          >
            Comprar ahora — $20.000 COP
          </Link>
        </div>
      )}
    </motion.div>

    <PremiumVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} locale={locale} />
    </>
  );
}
