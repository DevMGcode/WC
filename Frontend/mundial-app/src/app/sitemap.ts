import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/locales';
import { getAllFixtures } from '@/services/publicTournament';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

// Regenera el sitemap cada hora para reflejar partidos que pasan a LIVE o FINISHED
export const revalidate = 3600;

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

// Páginas públicas estáticas
const staticRoutes = [
  '',
  '/fixtures',
  '/groups',
  '/scorers',
  '/premium',
  '/privacy',
  '/terms',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Páginas estáticas × idiomas ─────────────────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${APP_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (
        route === '' || route === '/fixtures' ? 'daily' : 'weekly'
      ) as ChangeFreq,
      priority: route === '' ? 1.0 : route === '/fixtures' || route === '/groups' ? 0.8 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${APP_URL}/${l}${route}`])
        ),
      },
    }))
  );

  // ── Páginas dinámicas: cada partido × cada idioma ────────────────────────────
  // Una página indexada por partido es oro puro para búsquedas del tipo
  // "Argentina Brasil Mundial 2026", "Alemania goles hoy", etc.
  let fixtureEntries: MetadataRoute.Sitemap = [];
  try {
    const fixtures = await getAllFixtures();
    fixtureEntries = fixtures.flatMap((fixture) =>
      locales.map((locale) => ({
        url: `${APP_URL}/${locale}/fixtures/${fixture.id}`,
        lastModified: fixture.providerUpdatedAt ?? fixture.kickoffAt ?? new Date(),
        changeFrequency: (
          fixture.status === 'LIVE'      ? 'always' :
          fixture.status === 'SCHEDULED' ? 'daily'  : 'weekly'
        ) as ChangeFreq,
        // Los partidos en vivo tienen máxima prioridad para el crawler
        priority: fixture.status === 'LIVE' ? 0.95 : 0.75,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${APP_URL}/${l}/fixtures/${fixture.id}`])
          ),
        },
      }))
    );
  } catch {
    // Si la API falla, el sitemap sigue funcionando con solo las páginas estáticas
  }

  return [...staticEntries, ...fixtureEntries];
}
