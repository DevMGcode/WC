'use client';

import { motion }  from 'framer-motion';
import { hex }     from '@/lib/design/tokens';
import { alpha }   from '@/lib/design/effects';
import type { AvailabilityResponse } from '@/lib/payments/types';

interface UnavailableNoticeProps {
  reason?:  AvailabilityResponse['reason'];
  message:  string;
}

const REASON_CFG: Record<
  NonNullable<AvailabilityResponse['reason']>,
  { icon: string; title: string; suggestion: string }
> = {
  REGION_RESTRICTED:   { icon: '🌍', title: 'No disponible en tu región',             suggestion: 'Puedes usar otros métodos de pago disponibles en tu país.' },
  PRODUCT_TYPE_BLOCKED:{ icon: '📦', title: 'Método no disponible para este producto', suggestion: 'Este tipo de producto requiere un método de pago diferente.' },
  STORE_POLICY:        { icon: '📱', title: 'Restricción de la tienda de aplicaciones', suggestion: 'Accede desde nuestro sitio web para usar esta pasarela.' },
  MAINTENANCE:         { icon: '🔧', title: 'Servicio en mantenimiento',               suggestion: 'Estamos trabajando para restablecerlo. Intenta en unos minutos.' },
  KYC_REQUIRED:        { icon: '🪪', title: 'Verificación de identidad requerida',     suggestion: 'Completa tu verificación para habilitar este método de pago.' },
};

const DEFAULT_CFG = {
  icon: '⚠️', title: 'Método de pago no disponible',
  suggestion: 'Por favor, selecciona otro método o contacta soporte.',
};

export function UnavailableNotice({ reason, message }: UnavailableNoticeProps) {
  const cfg = reason ? REASON_CFG[reason] : DEFAULT_CFG;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 text-center"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 100%)`,
        border: `1px solid ${hex.gold.base}30`,
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${hex.gold.base}55, transparent)` }} />
      <p className="text-4xl mb-3">{cfg.icon}</p>
      <p className="text-sm font-black text-white mb-1">{cfg.title}</p>
      <p className="text-[12px] mb-1" style={{ color: hex.text.secondary }}>{message}</p>
      <p className="text-[11px] mb-4" style={{ color: hex.text.muted }}>{cfg.suggestion}</p>
      <a
        href="/checkout/payment-methods"
        className="inline-block px-5 py-2.5 rounded-xl text-sm font-black tracking-wide"
        style={{
          background: `linear-gradient(135deg, ${alpha(hex.gold.base, 0.18)}, ${alpha(hex.bg.elevated, 0.90)})`,
          border: `1px solid ${alpha(hex.gold.base, 0.32)}`,
          color: hex.gold.bright,
        }}
      >
        Ver otros métodos de pago
      </a>
    </motion.div>
  );
}
