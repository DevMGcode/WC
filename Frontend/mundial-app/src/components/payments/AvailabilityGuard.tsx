'use client';

import { useEffect, useState } from 'react';
import { motion }              from 'framer-motion';
import { hex }                 from '@/lib/design/tokens';
import { alpha }               from '@/lib/design/effects';
import { authService }         from '@/services/auth';
import { detectDistributionChannel } from '@/lib/payments/utils';
import { PaymentMethodSelector }     from './PaymentMethodSelector';
import { UnavailableNotice }         from './UnavailableNotice';
import type { AvailabilityResponse, ProductDetails } from '@/lib/payments/types';

interface AvailabilityGuardProps {
  productDetails: ProductDetails;
  amount:         number;
}

type GuardState =
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason: AvailabilityResponse['reason']; message: string }
  | { status: 'error' };

// Verifica si las pasarelas de pago están disponibles antes de renderizar el selector.
// Si no hay sesión, muestra error de auth. Si no están disponibles, muestra el aviso.
export function AvailabilityGuard({ productDetails, amount }: AvailabilityGuardProps) {
  const [state, setState] = useState<GuardState>({ status: 'checking' });

  useEffect(() => {
    const check = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setState({
            status:  'unavailable',
            reason:  undefined,
            message: 'Tu sesión no está activa. Por favor, inicia sesión para continuar.',
          });
          return;
        }

        const channel = detectDistributionChannel();

        const res = await fetch(
          `/api/v1/payments/availability?productType=${productDetails.type}`,
          {
            headers: {
              Authorization:             `Bearer ${token}`,
              'X-Distribution-Channel': channel,
            },
          }
        );

        if (!res.ok) { setState({ status: 'error' }); return; }

        const data: AvailabilityResponse = await res.json();

        if (data.available) {
          setState({ status: 'available' });
        } else {
          setState({
            status:  'unavailable',
            reason:  data.reason,
            message: data.message ?? 'Las pasarelas de pago no están disponibles en este momento.',
          });
        }
      } catch {
        setState({ status: 'error' });
      }
    };

    check();
  }, [productDetails.type]);

  if (state.status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: alpha(hex.gold.base, 0.20), borderTopColor: hex.gold.base }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-[12px] font-bold tracking-[0.26em] uppercase" style={{ color: alpha(hex.gold.base, 0.60) }}>
          Verificando disponibilidad...
        </p>
      </div>
    );
  }

  if (state.status === 'unavailable') {
    return <UnavailableNotice reason={state.reason} message={state.message} />;
  }

  if (state.status === 'error') {
    return (
      <UnavailableNotice
        reason="MAINTENANCE"
        message="No pudimos verificar la disponibilidad del método de pago. Por favor, intenta más tarde."
      />
    );
  }

  return <PaymentMethodSelector productDetails={productDetails} amount={amount} />;
}
