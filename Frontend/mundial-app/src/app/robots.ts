import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Rutas privadas (protegidas además por el login del middleware).
        // NOTA: login/register/reset-password NO se bloquean aquí a propósito: llevan
        // meta robots "noindex", y para que Google lo lea debe poder rastrearlas. Si se
        // bloquearan en robots, nunca leería el noindex y quedarían como "Duplicada".
        disallow: [
          '/api/',
          '/*/admin',
          '/*/profile',
          '/*/checkout',
          '/*/onboarding',
          '/*/predictions',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
