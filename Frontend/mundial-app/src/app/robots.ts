import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Rutas privadas o sin valor para buscadores
        disallow: [
          '/api/',
          '/*/admin',
          '/*/profile',
          '/*/checkout',
          '/*/onboarding',
          '/*/reset-password',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
