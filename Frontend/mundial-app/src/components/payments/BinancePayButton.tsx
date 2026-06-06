'use client';

import { useState }             from 'react';
import { motion }               from 'framer-motion';
import { FiArrowRight, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { hex }                  from '@/lib/design/tokens';
import { alpha }                from '@/lib/design/effects';
import { authService }          from '@/services/auth';
import { openBinancePayDeeplink } from '@/lib/payments/utils';
import type { ProductDetails, BinancePayOrderPayload, BinancePayOrderResponse, PaymentStatus } from '@/lib/payments/types';

interface BinancePayButtonProps {
  productDetails: ProductDetails;
  amount:         number;
  disabled?:      boolean;
}

// Binance Pay: el usuario paga con cripto que ya posee en su cuenta Binance.
// Flujo: botón → backend crea orden → redirect deeplink (app nativa) o checkoutUrl (web).
export function BinancePayButton({ productDetails, amount, disabled = false }: BinancePayButtonProps) {
  const [status,  setStatus]  = useState<PaymentStatus>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const handlePay = async () => {
    setStatus('loading');
    setErrMsg('');

    try {
      const token = authService.getToken();
      if (!token) throw new Error('Sesión no encontrada. Por favor, inicia sesión de nuevo.');

      const payload: BinancePayOrderPayload = { amount, productDetails };

      const res = await fetch('/api/v1/payments/binance-pay/order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error al crear la orden (${res.status}).`);
      }

      const { checkoutUrl, deeplink }: BinancePayOrderResponse = await res.json();

      setStatus('processing');

      if (deeplink) {
        await openBinancePayDeeplink(deeplink, checkoutUrl);
      } else {
        window.location.href = checkoutUrl;
      }
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Error inesperado al iniciar el pago.');
      setStatus('error');
    }
  };

  const isDisabled = disabled || status === 'loading' || status === 'processing';

  const label =
    status === 'loading'    ? 'Creando orden...' :
    status === 'processing' ? 'Redirigiendo a Binance...' :
    'Pagar con Binance Pay';

  const GOLD = hex.gold.base;

  return (
    <div className="space-y-3">
      {status === 'error' && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl p-3.5"
          style={{
            background: `${hex.status.danger}12`,
            border:     `1px solid ${hex.status.danger}30`,
          }}
        >
          <FiAlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: hex.status.danger }} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold" style={{ color: hex.status.danger }}>{errMsg}</p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="shrink-0"
            style={{ color: hex.text.muted }}
          >
            <FiRefreshCw size={12} />
          </button>
        </motion.div>
      )}

      <motion.button
        onClick={handlePay}
        disabled={isDisabled}
        aria-busy={isDisabled}
        aria-label={label}
        whileHover={!isDisabled ? { scale: 1.02, boxShadow: `0 8px 28px ${alpha(GOLD, 0.30)}` } : {}}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        className="relative w-full flex items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 font-black tracking-wide transition-opacity"
        style={{
          background: isDisabled
            ? alpha(GOLD, 0.12)
            : `linear-gradient(135deg, ${alpha(GOLD, 0.22)} 0%, ${alpha(hex.bg.elevated, 0.90)} 100%)`,
          border:  `1px solid ${alpha(GOLD, isDisabled ? 0.18 : 0.40)}`,
          color:   isDisabled ? alpha(GOLD, 0.45) : GOLD,
          cursor:  isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? 'none' : `0 4px 16px ${alpha(GOLD, 0.12)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.45)}, transparent)` }} />

        {isDisabled ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2"
            style={{ borderColor: alpha(GOLD, 0.30), borderTopColor: GOLD }} />
        ) : (
          <BinanceLogo className="h-5 w-5 shrink-0" />
        )}

        <span className="text-sm">{label}</span>

        {!isDisabled && <FiArrowRight size={14} className="shrink-0 ml-auto" />}
      </motion.button>

      <p className="text-center text-[11px]" style={{ color: hex.text.muted }}>
        Requiere cuenta Binance · Pago en cripto
      </p>
    </div>
  );
}

function BinanceLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.545 2.545L9.818 7.273L12 9.455L14.182 7.273L16.727 9.818L12 14.545L7.273 9.818L9.818 7.273L7.273 4.727L12 0Z" />
      <path d="M4.727 9.818L7.273 7.273L9.818 9.818L7.273 12.364L4.727 9.818Z" />
      <path d="M14.182 9.818L16.727 7.273L19.273 9.818L16.727 12.364L14.182 9.818Z" />
      <path d="M7.273 14.545L9.818 12L12 14.182L14.182 12L16.727 14.545L12 19.273L7.273 14.545Z" />
      <path d="M12 19.273L14.545 21.818L12 24L9.455 21.818L12 19.273Z" />
    </svg>
  );
}
