import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Rutas PÚBLICAS (accesibles sin sesión), relativas al locale (sin el prefijo
 * /es/ /en/ etc.). El contenido del torneo es público para humanos Y buscadores
 * por igual: así Google indexa páginas reales (no el login) y NO hay cloaking
 * (mostrar al bot algo distinto que al usuario, que penaliza Google).
 *
 * El login solo se exige para lo personal/acciones: porras y ligas
 * (/predictions), perfil, checkout, onboarding y admin.
 */
const PUBLIC_PATHS = [
  // Contenido del torneo (SEO)
  '/fixtures',   // calendario + detalle de cada partido (/fixtures/[id])
  '/groups',     // grupos, tablas y cuadro eliminatorio
  '/scorers',    // goleadores
  '/premium',    // landing de venta del Pase Mundial
  // Institucionales / legales
  '/about',
  '/terms',
  '/privacy',
  // Autenticación
  '/login',
  '/register',
  '/reset-password',
];

function isPublicPath(pathname: string): boolean {
  // Quita el prefijo de idioma: "/es/fixtures/1" → "/fixtures/1"; "/es" → "/".
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  if (withoutLocale === '/') return true; // inicio (landing) es público
  return PUBLIC_PATHS.some(p => withoutLocale === p || withoutLocale.startsWith(p + '/'));
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isPublicPath(pathname)) {
    const hasSession = req.cookies.has('auth_session');
    if (!hasSession) {
      const locale = pathname.match(/^\/([a-z]{2})(\/|$)/)?.[1] ?? 'es';
      const loginUrl = new URL(`/${locale}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|api|og|.*\\..*).*)'],
};
