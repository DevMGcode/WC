import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Rutas accesibles sin sesión (relativas al locale, sin el prefijo /es/ /en/ etc.)
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/reset-password',
  '/terms',
  '/privacy',
];

function isPublicPath(pathname: string): boolean {
  // Quitar el prefijo de locale: /es/login → /login
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
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
