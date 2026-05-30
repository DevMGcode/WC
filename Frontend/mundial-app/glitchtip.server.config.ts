/**
 * GlitchTip — Error tracking server-side (Node runtime).
 * Usa SDK @sentry/nextjs como transporte; envía a tu instancia de GlitchTip.
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
