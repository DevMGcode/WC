import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const SOCIAL_BOTS = [
  'whatsapp', 'telegrambot', 'facebookexternalhit', 'twitterbot',
  'linkedinbot', 'slackbot', 'discordbot', 'googlebot', 'bingbot',
  // Crawlers de Google Ads/AdSense: deben ver el contenido real (no el login)
  // o AdSense reporta "anuncios en pantallas sin contenido del editor".
  'mediapartners-google', 'adsbot-google', 'google-adstxt',
];

function isSocialBot(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent')?.toLowerCase() ?? '';
  return SOCIAL_BOTS.some(bot => ua.includes(bot));
}

// Rutas accesibles sin sesión (relativas al locale, sin el prefijo /es/ /en/ etc.)
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/reset-password',
  '/terms',
  '/privacy',
  '/about',
];

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return PUBLIC_PATHS.some(p => withoutLocale === p || withoutLocale.startsWith(p + '/'));
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isPublicPath(pathname) && !isSocialBot(req)) {
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
