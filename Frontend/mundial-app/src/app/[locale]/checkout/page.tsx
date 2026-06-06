'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect }                  from 'react';
import { useTranslations }            from 'next-intl';
import { motion }                     from 'framer-motion';
import { Header }                     from '@/components/Navigation';
import { useAuth }                    from '@/contexts/AuthContext';
import { AvailabilityGuard }          from '@/components/payments/AvailabilityGuard';
import { PaymentErrorBoundary }       from '@/components/payments/PaymentErrorBoundary';
import { hex }                        from '@/lib/design/tokens';
import { alpha, alphaOf }             from '@/lib/design/effects';
import type { ProductDetails }        from '@/lib/payments/types';

// Valores por defecto del Pase Mundial 2026 (un solo plan, pago único)
const MUNDIAL_PASS: ProductDetails = {
  id:             'mundial-pass-2026',
  name:           'Pase Mundial 2026',
  description:    'Acceso premium hasta el 19 de julio de 2026',
  quantity:       1,
  unitPrice:      9.99,
  fiatCurrency:   'USD',
  cryptoCurrency: 'USDT',
  type:           'PHYSICAL', // declarado como físico para evitar restricciones de tiendas
};

export default function CheckoutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router                             = useSearchParams();
  const nav                                = useRouter();
  const t                                  = useTranslations();

  // Redirigir si no hay sesión (el middleware lo hace también, pero esto cubre el hydration)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav.push('/login?callbackUrl=/checkout');
    }
  }, [loading, isAuthenticated, nav]);

  // Leer cantidad personalizada desde searchParams si existe
  const customAmount = parseFloat(router.get('amount') ?? '');
  const amount       = Number.isFinite(customAmount) && customAmount > 0
    ? customAmount
    : MUNDIAL_PASS.unitPrice;

  const productDetails: ProductDetails = { ...MUNDIAL_PASS, unitPrice: amount };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: alphaOf('green', 0.20), borderTopColor: hex.green.bright }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="w-full relative min-h-screen">
      {/* Ambient orbs — mismo estilo que el resto de la app */}
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 500, height: 500, top: -140, left: -80,
          background: `radial-gradient(circle, ${alphaOf('green', 0.05)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 400, height: 400, bottom: -60, right: -60,
          background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.05)} 0%, transparent 65%)`,
          filter: 'blur(60px)', zIndex: 0,
        }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, delay: 4 }}
      />

      <div className="relative z-10">
        <Header title="Orionix Gol" subtitle="Pase Mundial 2026" centered />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1 h-7 rounded-full"
              style={{
                background: `linear-gradient(180deg, ${hex.gold.base}, ${hex.gold.muted})`,
                boxShadow:  `0 0 10px ${alpha(hex.gold.base, 0.50)}`,
              }}
            />
            <h1 className="text-xl font-black text-white tracking-wide">Finalizar compra</h1>
          </div>
          <p className="text-[13px] ml-4" style={{ color: hex.text.secondary }}>
            Hola, <strong style={{ color: hex.text.primary }}>{user?.displayName ?? user?.email}</strong> — elige cómo quieres pagar.
          </p>
        </motion.div>

        {/* Pasarelas de pago con Error Boundary */}
        <PaymentErrorBoundary>
          <AvailabilityGuard productDetails={productDetails} amount={amount} />
        </PaymentErrorBoundary>
      </div>
    </div>
  );
}
