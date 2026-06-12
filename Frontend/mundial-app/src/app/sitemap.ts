import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

// Solo páginas públicas (visibles sin iniciar sesión).
// Las rutas con auth (admin, profile, checkout, predictions...) no se indexan.
const publicRoutes = [
  '',
  '/fixtures',
  '/groups',
  '/scorers',
  '/premium',
  '/login',
  '/register',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${APP_URL}/${defaultLocale}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/fixtures' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/fixtures' || route === '/groups' ? 0.8 : 0.5,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${APP_URL}/${locale}${route}`])
      ),
    },
  }));
}
