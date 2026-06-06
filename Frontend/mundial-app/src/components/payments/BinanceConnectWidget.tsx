'use client';

import { useState, useCallback }  from 'react';
import { useRouter }              from 'next/navigation';
import { useLocale }              from 'next-intl';
import { motion }                 from 'framer-motion';
import { FiCreditCard, FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi';
import { hex }                    from '@/lib/design/tokens';
import { alpha }                  from '@/lib/design/effects';
import { authService }            from '@/services/auth';
import { useBinanceConnectSdk }   from './BinanceConnectSdkLoader';
import type {
  ProductDetails,
  BinanceConnectSessionPayload,
  BinanceConnectSessionResponse,
  BinanceConnectSuccessPayload,
  BinanceConnectFailurePayload,
  BinanceConnectConfig,
  PaymentStatus,
} from '@/lib/payments/types';

interface BinanceConnectWidgetProps {
  productDetails: ProductDetails;
  amount:         number;
  disabled?:      boolean;
}

// Binance Connect: el usuario paga con tarjeta o banco (fiat). El widget
// maneja KYC y conversión a cripto internamente — no requiere cuenta Binance.
export function BinanceConnectWidget({ productDetails, amount, disabled = false }: BinanceConnectWidgetProps) {
  const router              = useRouter();
  const locale              = useLocale();
  const { status: sdkSt }  = useBinanceConnectSdk();

  const [status,  setStatus]  = useState<PaymentStatus>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const handleOpen = useCallback(async () => {
    if (sdkSt !== 'ready') {
      setErrMsg('El módulo de pago no ha terminado de cargar. Intenta de nuevo.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrMsg('');

    try {
      const token = authService.getToken();
      if (!token) throw new Error('Sesión no encontrada. Por favor, inicia sesión de nuevo.');

      const payload: BinanceConnectSessionPayload = {
        amount,
        fiatCurrency:   productDetails.fiatCurrency,
        cryptoCurrency: productDetails.cryptoCurrency,
        productDetails,
      };

      const res = await fetch('/api/v1/payments/binance-connect/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error al crear sesión (${res.status}).`);
      }

      const session: BinanceConnectSessionResponse = await res.json();

      const config: BinanceConnectConfig = {
        merchantCode:   session.merchantCode,
        timestamp:      session.timestamp,
        signature:      session.signature,
        fiatCurrency:   productDetails.fiatCurrency,
        cryptoCurrency: productDetails.cryptoCurrency,
        amount:         amount.toFixed(2),
        returnUrl:      session.returnUrl,
        theme:          'dark',
        locale,
        quoteId:        session.quoteId,

        onSuccess: (result: BinanceConnectSuccessPayload) => {
          setStatus('success');
          router.push(`/checkout/result?orderId=${result.orderId}&gateway=connect&status=success`);
        },

        onFailure: (error: BinanceConnectFailurePayload) => {
          setErrMsg(`El pago no pudo procesarse (${error.errorCode}). Intenta de nuevo o usa Binance Pay.`);
          setStatus('error');
        },

        onCancel: () => setStatus('cancelled'),
      };

      window.BinanceConnect!.init(config);
      window.BinanceConnect!.open();
      setStatus('processing');
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Error inesperado al iniciar el widget.');
      setStatus('error');
    }
  }, [sdkSt, amount, productDetails, locale, router]);

  const isDisabled =
    disabled || sdkSt === 'loading' || sdkSt === 'idle' ||
    status === 'loading' || status === 'processing';

  const label =
    sdkSt === 'loading' || sdkSt === 'idle' ? 'Cargando módulo...' :
    status === 'loading'                      ? 'Iniciando sesión segura...' :
    status === 'processing'                   ? 'Widget abierto...' :
    'Pagar con Binance Connect';

  const BLUE = '#3B82F6';

  return (
    <div className="space-y-3">
      {/* Error */}
      {status === 'error' && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl p-3.5"
          style={{ background: `${hex.status.danger}12`, border: `1px solid ${hex.status.danger}30` }}
        >
          <FiAlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: hex.status.danger }} />
          <p className="flex-1 text-[12px] font-bold" style={{ color: hex.status.danger }}>{errMsg}</p>
          <button onClick={() => setStatus('idle')} style={{ color: hex.text.muted }}>
            <FiRefreshCw size={12} />
          </button>
        </motion.div>
      )}

      {/* Cancelado */}
      {status === 'cancelled' && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-xl p-3.5"
          style={{ background: `${hex.text.muted}10`, border: `1px solid ${hex.text.muted}25` }}
        >
          <FiX size={13} style={{ color: hex.text.muted }} />
          <p className="flex-1 text-[12px]" style={{ color: hex.text.secondary }}>
            Cancelaste el proceso. Puedes intentarlo de nuevo.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="text-[11px] font-bold underline"
            style={{ color: hex.text.muted }}
          >
            Reintentar
          </button>
        </motion.div>
      )}

      <motion.button
        onClick={handleOpen}
        disabled={isDisabled}
        aria-busy={isDisabled}
        aria-label={label}
        whileHover={!isDisabled ? { scale: 1.02, boxShadow: `0 8px 28px ${alpha(BLUE, 0.25)}` } : {}}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        className="relative w-full flex items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 font-black tracking-wide transition-opacity"
        style={{
          background: isDisabled
            ? alpha(BLUE, 0.08)
            : `linear-gradient(135deg, ${alpha(BLUE, 0.20)} 0%, ${alpha(hex.bg.elevated, 0.90)} 100%)`,
          border:  `1px solid ${alpha(BLUE, isDisabled ? 0.14 : 0.36)}`,
          color:   isDisabled ? alpha(BLUE, 0.40) : BLUE,
          cursor:  isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? 'none' : `0 4px 16px ${alpha(BLUE, 0.10)}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alpha(BLUE, 0.40)}, transparent)` }} />

        {isDisabled ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2"
            style={{ borderColor: alpha(BLUE, 0.25), borderTopColor: BLUE }} />
        ) : (
          <FiCreditCard size={18} className="shrink-0" />
        )}

        <span className="text-sm">{label}</span>
      </motion.button>

      <p className="text-center text-[11px]" style={{ color: hex.text.muted }}>
        Sin cuenta Binance · Tarjeta, banco o Apple/Google Pay
      </p>
    </div>
  );
}
