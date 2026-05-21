'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="es">
      <body style={{ margin: 0, background: '#06110A', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>
            Algo salió mal
          </h1>
          <p style={{ color: 'rgba(184,196,188,0.7)', fontSize: 14, margin: '0 0 24px' }}>
            El error ha sido registrado. Intenta de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #1B5E20, #388E3C)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '10px 24px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
