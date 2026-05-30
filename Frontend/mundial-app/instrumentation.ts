/**
 * Next.js instrumentation hook — registra el cliente GlitchTip según el runtime.
 * GlitchTip es open-source y compatible con el protocolo Sentry, por eso el
 * SDK que transporta los eventos es `@sentry/nextjs` (apunta al DSN de GlitchTip).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./glitchtip.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./glitchtip.edge.config');
  }
}
