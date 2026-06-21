'use client';

// Componente principal de pago con Mercado Pago (Checkout Pro).
//
// Flujo:
//   1. Usuario hace click en "Pagar".
//   2. Frontend llama al backend → POST /api/v1/payments/mercadopago/preference.
//   3. Backend crea una Preference en Mercado Pago y devuelve initPoint + sandboxInitPoint.
//   4. Redirigimos al usuario al checkout de Mercado Pago.
//   5. Tras el pago, Mercado Pago redirige a /checkout/result con el estado.
//   6. En paralelo, el webhook del backend activa el Premium del usuario.

import { useState }                from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiShield }  from 'react-icons/fi';
import { hex }                     from '@/lib/design/tokens';
import { alpha }                   from '@/lib/design/effects';
import { authService }             from '@/services/auth';
import type {
  MercadoPagoPreferencePayload,
  MercadoPagoPreferenceResponse,
  ProductDetails,
}                                  from '@/lib/payments/types';

interface MercadoPagoCheckoutProps {
  productDetails: ProductDetails;
  amount:         number;
}

type CheckoutState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'redirecting' }
  | { status: 'error'; message: string };

const MP_BLUE = '#00B1EA';

export function MercadoPagoCheckout({ productDetails, amount }: MercadoPagoCheckoutProps) {
  const [state, setState] = useState<CheckoutState>({ status: 'idle' });

  const handlePay = async () => {
    setState({ status: 'loading' });

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
      }

      const payload: MercadoPagoPreferencePayload = { amount, productDetails };

      const response = await fetch('/api/v1/payments/mercadopago/preference', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? `Error al crear la preferencia (${response.status})`);
      }

      const apiResponse = await response.json();
      const preference: MercadoPagoPreferenceResponse = apiResponse.data ?? apiResponse;

      setState({ status: 'redirecting' });

      // En desarrollo usamos sandboxInitPoint para probar con tarjetas TEST.
      // En producción usamos initPoint que cobra dinero real.
      const isProduction = process.env.NODE_ENV === 'production';
      const redirectUrl = isProduction
        ? preference.initPoint
        : (preference.sandboxInitPoint ?? preference.initPoint);

      window.location.href = redirectUrl;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado al procesar el pago.';
      setState({ status: 'error', message });
    }
  };

  const isLoading      = state.status === 'loading';
  const isRedirecting  = state.status === 'redirecting';
  const isDisabled     = isLoading || isRedirecting;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >
        {/* ── Resumen del pedido ── */}
        <OrderSummary productDetails={productDetails} amount={amount} />

        {/* ── Métodos de pago disponibles ── */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 100%)`,
            border:     `1px solid ${alpha(MP_BLUE, 0.22)}`,
            backdropFilter: 'blur(28px)',
          }}
        >
          <div className="flex items-center gap-2">
            <FiCreditCard size={16} style={{ color: MP_BLUE }} />
            <p className="text-sm font-black text-white">Métodos de pago disponibles</p>
          </div>

          <ul className="grid grid-cols-2 gap-2 text-[12px]" style={{ color: hex.text.secondary }}>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              Nequi
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              PSE
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              Tarjeta crédito/débito
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              Daviplata
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              Efectivo (Efecty, Baloto)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: alpha(MP_BLUE, 0.70) }} />
              Apple Pay · Google Pay
            </li>
          </ul>
        </div>

        {/* ── Estado de error ── */}
        {state.status === 'error' && (
          <div
            role="alert"
            className="rounded-lg p-4 text-sm"
            style={{
              background: alpha('#EF4444', 0.10),
              border:     `1px solid ${alpha('#EF4444', 0.30)}`,
              color:      '#FCA5A5',
            }}
          >
            <strong>Error:</strong> {state.message}
            <button
              onClick={() => setState({ status: 'idle' })}
              className="ml-2 underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Botón de pago ── */}
        <button
          onClick={handlePay}
          disabled={isDisabled}
          aria-busy={isDisabled}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black tracking-wide transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: `linear-gradient(135deg, ${MP_BLUE} 0%, #0099CC 100%)`,
            color:      '#FFFFFF',
            boxShadow:  `0 12px 32px ${alpha(MP_BLUE, 0.35)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.20)}`,
          }}
        >
          {isDisabled ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isLoading ? 'Procesando...' : 'Redirigiendo a Mercado Pago...'}
            </>
          ) : (
            <>
              <FiCreditCard size={18} />
              Pagar con Mercado Pago
            </>
          )}
        </button>

        {/* ── Nota de seguridad ── */}
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{
            background: alpha(hex.bg.soft, 0.60),
            border:     `1px solid ${alpha(hex.neutral.white, 0.06)}`,
          }}
        >
          <FiShield size={13} style={{ color: hex.text.muted }} />
          <p className="text-[11px] leading-relaxed" style={{ color: hex.text.muted }}>
            Pago procesado de forma segura por Mercado Pago. Tu información financiera nunca pasa por nuestros servidores.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── OrderSummary ─────────────────────────────────────────────────────────────

function OrderSummary({ productDetails, amount }: { productDetails: ProductDetails; amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.88)} 0%, ${alpha(hex.bg.elevated, 0.95)} 100%)`,
        border:     `1px solid ${alpha(hex.neutral.white, 0.08)}`,
        backdropFilter: 'blur(24px)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.45)}, transparent)` }}
      />
      <p
        className="text-[11px] font-black tracking-[0.22em] uppercase mb-3"
        style={{ color: hex.text.muted }}
      >
        Resumen del pedido
      </p>
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span style={{ color: hex.text.secondary }}>{productDetails.name}</span>
          <span style={{ color: hex.text.secondary }}>×{productDetails.quantity}</span>
        </div>
        {productDetails.description && (
          <div className="text-[11px]" style={{ color: hex.text.muted }}>
            {productDetails.description}
          </div>
        )}
        <div
          className="flex justify-between pt-2 mt-1 font-black"
          style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}
        >
          <span className="text-white">Total</span>
          <div className="flex flex-col items-end">
            <span style={{ color: hex.gold.base }}>$20.000 COP</span>
            <span className="text-[10px] font-medium mt-0.5" style={{ color: hex.text.muted }}>
              ≈ {amount.toFixed(2)} {productDetails.fiatCurrency}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
