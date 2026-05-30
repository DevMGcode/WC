/**
 * GlitchTip — Error tracking client-side (browser).
 *
 * GlitchTip es un proyecto open-source (MIT) compatible con el protocolo de
 * Sentry, por lo que reutilizamos el SDK `@sentry/nextjs` como transporte.
 * Los eventos se envían al DSN de GlitchTip, no a Sentry.
 *
 * Funciones soportadas:
 *   ✓ Captura de errores y excepciones
 *   ✓ Breadcrumbs (eventos previos al error)
 *   ✓ Performance/tracing básico
 *   ✗ Session replay (exclusivo de Sentry)
 */
import * as GlitchTip from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_GLITCHTIP_DSN;

if (dsn) {
  GlitchTip.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
