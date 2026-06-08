'use client';

/**
 * Página /premium — vitrina del Pase Mundial 2026.
 *
 * Muestra:
 *   - Comparación Free vs Premium en tabla visual
 *   - Precio y beneficios
 *   - CTA al checkout (si está logueado) o al login (si no)
 *   - Mensaje "Ya eres Premium" si ya pagó
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useLocale } from 'next-intl';
import { Header } from '@/components/Navigation';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { usePremium } from '@/hooks/usePremium';

interface FeatureRow {
  feature: string;
  free: boolean | string;
  premium: boolean | string;
  highlight?: boolean;
}

const FEATURES: FeatureRow[] = [
  { feature: 'Ver fixtures, grupos y resultados', free: true, premium: true },
  { feature: 'Top goleadores', free: 'Top 10', premium: 'Top 50 + filtros' },
  { feature: 'Predicciones de partidos', free: '3 partidos de tu equipo favorito', premium: 'Todos los partidos', highlight: true },
  { feature: 'Crear ligas privadas', free: false, premium: 'Ilimitadas', highlight: true },
  { feature: 'Unirse a ligas privadas', free: '1 (invitado por Premium)', premium: 'Ilimitadas' },
  { feature: 'Ranking global del torneo', free: false, premium: true, highlight: true },
  { feature: 'Top asistentes', free: false, premium: true },
  { feature: 'Estadísticas detalladas del partido', free: false, premium: true },
  { feature: 'Stats de jugadores por partido', free: false, premium: true },
  { feature: 'Head-to-head entre equipos', free: false, premium: true },
  { feature: 'Plantilla completa (suplentes + cuerpo)', free: false, premium: true },
  { feature: 'Sin anuncios', free: false, premium: true, highlight: true },
  { feature: 'Insignia "PRO" en rankings', free: false, premium: true },
];

export default function PremiumPage() {
  const { isPremium, isAuthenticated, isLoading } = usePremium();
  const router = useRouter();
  const locale = useLocale();

  const handleCTA = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?callbackUrl=/checkout`);
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="w-full relative min-h-screen">
      {/* Ambient orbs */}
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 500, height: 500, top: -140, left: -80,
          background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.06)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 400, height: 400, bottom: -60, right: -60,
          background: `radial-gradient(circle, ${alphaOf('green', 0.05)} 0%, transparent 65%)`,
          filter: 'blur(60px)', zIndex: 0,
        }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, delay: 4 }}
      />

      <div className="relative z-10">
        <Header title="Orionix Gol" subtitle="Pase Mundial 2026" centered />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.25)}, ${alpha(hex.gold.base, 0.05)})`,
              border: `1px solid ${alpha(hex.gold.base, 0.40)}`,
            }}
          >
            <FiAward size={36} style={{ color: hex.gold.base }} />
          </div>

          <p
            className="text-[11px] font-black tracking-[0.30em] uppercase mb-3"
            style={{ color: alpha(hex.gold.base, 0.85) }}
          >
            Pase Mundial 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Vive el Mundial al máximo
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6"
            style={{ color: hex.text.secondary }}
          >
            Predice todos los partidos, crea ligas con tus amigos, accede a estadísticas
            avanzadas y disfruta sin anuncios hasta el 19 de julio de 2026.
          </p>

          {/* Precio */}
          <div className="inline-flex flex-col items-center gap-1 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black" style={{ color: hex.gold.base }}>
                $36.000
              </span>
              <span className="text-base font-bold" style={{ color: hex.text.secondary }}>
                COP
              </span>
            </div>
            <span className="text-[11px]" style={{ color: hex.text.muted }}>
              ≈ 9.99 USD · pago único · hasta fin del Mundial
            </span>
          </div>

          {/* CTA principal */}
          {isLoading ? null : isPremium ? (
            <div
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-black tracking-wide"
              style={{
                background: alphaOf('green', 0.12),
                border: `1px solid ${alphaOf('green', 0.40)}`,
                color: hex.green.bright,
              }}
            >
              <FiCheck size={18} />
              ¡Ya eres Premium! Disfruta todas las ventajas.
            </div>
          ) : (
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-black tracking-wide transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                color: hex.neutral.black,
                boxShadow: `0 14px 40px ${alpha(hex.gold.base, 0.40)}`,
              }}
            >
              <FiZap size={18} />
              {isAuthenticated ? 'Hacerme Premium ahora' : 'Inicia sesión para comprar'}
            </button>
          )}
        </motion.div>

        {/* ── Tabla comparativa ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl mb-8"
          style={{
            background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.92)} 0%, ${alpha(hex.bg.elevated, 0.96)} 100%)`,
            border: `1px solid ${alpha(hex.neutral.white, 0.08)}`,
            backdropFilter: 'blur(28px)',
            boxShadow: `0 14px 44px ${alpha(hex.neutral.black, 0.55)}`,
          }}
        >
          {/* Header de columnas */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.8fr_1fr_1fr] gap-3 sm:gap-6 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: alpha(hex.neutral.white, 0.08) }}
          >
            <p className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: hex.text.muted }}>
              Funcionalidad
            </p>
            <p className="text-center text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: hex.text.secondary }}>
              Free
            </p>
            <p className="text-center text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: hex.gold.base }}>
              Premium
            </p>
          </div>

          {/* Filas */}
          {FEATURES.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.8fr_1fr_1fr] gap-3 sm:gap-6 px-4 sm:px-6 py-3 items-center"
              style={{
                background: row.highlight
                  ? `linear-gradient(90deg, ${alpha(hex.gold.base, 0.04)}, transparent)`
                  : i % 2 === 0
                    ? alpha(hex.neutral.white, 0.015)
                    : 'transparent',
                borderTop: i === 0 ? 'none' : `1px solid ${alpha(hex.neutral.white, 0.04)}`,
              }}
            >
              <p className="text-[12px] sm:text-[13px]" style={{ color: hex.text.primary }}>
                {row.feature}
              </p>
              <div className="flex justify-center">
                <FeatureCell value={row.free} variant="free" />
              </div>
              <div className="flex justify-center">
                <FeatureCell value={row.premium} variant="premium" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Beneficios destacados ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <BenefitCard
            icon={<FiTrendingUp size={20} />}
            title="Ranking sin límites"
            description="Compite con miles de usuarios en el ranking global del Mundial."
          />
          <BenefitCard
            icon={<FiAward size={20} />}
            title="Ligas con tus amigos"
            description="Crea ligas privadas ilimitadas y compite con tu círculo cercano."
          />
          <BenefitCard
            icon={<FiZap size={20} />}
            title="Sin anuncios"
            description="Experiencia limpia, sin interrupciones, hasta fin del Mundial."
          />
        </motion.div>

        {/* ── CTA inferior repetido ──────────────────────────────────────── */}
        {!isPremium && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-black tracking-wide transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${hex.gold.base} 0%, ${hex.gold.muted} 100%)`,
                color: hex.neutral.black,
                boxShadow: `0 14px 40px ${alpha(hex.gold.base, 0.40)}`,
              }}
            >
              <FiZap size={18} />
              {isAuthenticated ? 'Hacerme Premium — $36.000 COP' : 'Inicia sesión para comprar'}
            </button>
            <p className="mt-3 text-[11px]" style={{ color: hex.text.muted }}>
              Pago seguro procesado por Mercado Pago · Nequi, PSE, Tarjeta, Efectivo
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function FeatureCell({ value, variant }: { value: boolean | string; variant: 'free' | 'premium' }) {
  const color = variant === 'premium' ? hex.gold.base : hex.text.secondary;

  if (value === true) {
    return <FiCheck size={18} style={{ color: variant === 'premium' ? hex.gold.base : hex.green.bright }} />;
  }
  if (value === false) {
    return <FiX size={18} style={{ color: alpha(hex.text.muted, 0.6) }} />;
  }
  return (
    <span className="text-[11px] sm:text-[12px] text-center" style={{ color }}>
      {value}
    </span>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.85)} 0%, ${alpha(hex.bg.elevated, 0.92)} 100%)`,
        border: `1px solid ${alpha(hex.gold.base, 0.15)}`,
        backdropFilter: 'blur(24px)',
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
        style={{
          background: alpha(hex.gold.base, 0.12),
          color: hex.gold.base,
        }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-black text-white mb-1">{title}</h3>
      <p className="text-[12px] leading-relaxed" style={{ color: hex.text.secondary }}>
        {description}
      </p>
    </div>
  );
}
