'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { hex } from '@/lib/design/tokens';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: `radial-gradient(ellipse at 25% 60%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 45%, rgba(3,8,6,1) 100%)` }}
    >
      <div className="text-center px-6 py-10">
        <div className="text-5xl mb-4">⚽</div>
        <h2 className="text-white font-black text-xl mb-2">Algo salió mal</h2>
        <p className="text-orionix-text-muted text-sm mb-6">El error ha sido registrado. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})` }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
