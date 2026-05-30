/**
 * GlitchTip — hook de transición de rutas (Turbopack).
 * La inicialización completa está en glitchtip.client.config.ts.
 * El SDK `@sentry/nextjs` es solo el transporte: los eventos van a tu GlitchTip.
 */
import * as GlitchTip from '@sentry/nextjs';

export const onRouterTransitionStart = GlitchTip.captureRouterTransitionStart;
