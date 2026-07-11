import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // La API pública de solo lectura DEBE estar permitida: las páginas (fichas,
        // goleadores, home) cargan sus datos desde /api/v1/public/* en el cliente, y
        // Googlebot respeta robots.txt también para esas peticiones al RENDERIZAR.
        // Con /api/ bloqueado entero, el renderizado de Google no podía traer los
        // datos, la ficha mostraba "Partido no encontrado" y Google la clasificaba
        // como Soft 404 pese a que el HTML inicial tenía contenido.
        // La regla más específica (Allow más largo) gana sobre Disallow: /api/.
        allow: ['/', '/api/v1/public/'],
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
