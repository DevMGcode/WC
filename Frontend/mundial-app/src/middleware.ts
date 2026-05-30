import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Excluye: archivos estáticos, _next, api, og, favicon, etc.
  matcher: ['/((?!_next|api|og|.*\\..*).*)'],
};
