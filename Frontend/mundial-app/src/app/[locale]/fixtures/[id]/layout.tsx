import { cache } from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getFixtureById } from '@/services/publicTournament';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

// cache() deduplicates: both generateMetadata and the layout fn share one API call per request
const fetchFixture = cache((id: number) => getFixtureById(id).catch(() => null));

type Props = { params: { id: string; locale: string }; children: ReactNode };

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string };
}): Promise<Metadata> {
  const fixtureId = parseInt(params.id, 10);
  if (isNaN(fixtureId)) return { title: 'Partido | Orionix Gol' };

  const fixture = await fetchFixture(fixtureId);
  if (!fixture) return { title: 'Partido | Orionix Gol' };

  const homeName = fixture.homeTeam?.name ?? 'Local';
  const awayName = fixture.awayTeam?.name ?? 'Visitante';
  const homeCode = fixture.homeTeam?.fifaCode ?? fixture.homeTeam?.shortName ?? homeName;
  const awayCode = fixture.awayTeam?.fifaCode ?? fixture.awayTeam?.shortName ?? awayName;

  let title: string;
  let description: string;

  if (fixture.status === 'LIVE') {
    const hs = fixture.homeScore ?? 0;
    const as_ = fixture.awayScore ?? 0;
    title = `🔴 ${homeCode} ${hs}-${as_} ${awayCode} EN VIVO | Mundial 2026`;
    description = `Sigue ${homeName} vs ${awayName} en tiempo real. Marcador actual ${hs}-${as_}. Goleadores, estadísticas y predicciones en Orionix Gol.`;
  } else if (fixture.status === 'FINISHED') {
    const hs = fixture.homeScore ?? 0;
    const as_ = fixture.awayScore ?? 0;
    const scorerList = fixture.scorers?.slice(0, 4).map((s) => s.playerName).join(', ');
    title = `${homeName} ${hs}-${as_} ${awayName} | Resultado Final | Mundial 2026`;
    description = `Resultado final: ${homeName} ${hs} - ${as_} ${awayName}. Mundial de Fútbol 2026.${scorerList ? ` Goleadores: ${scorerList}.` : ''} Predicciones y estadísticas en Orionix Gol.`;
  } else {
    title = `${homeName} vs ${awayName} | Pronóstico | Mundial 2026`;
    description = `Predice ${homeName} vs ${awayName} del Mundial 2026. Compite con tus amigos en ligas privadas y sigue el partido en vivo en Orionix Gol.`;
  }

  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/fixtures/${fixtureId}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${APP_URL}/${l}/fixtures/${fixtureId}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Orionix Gol',
      images: [{ url: '/og', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function FixtureDetailLayout({ params, children }: Props) {
  const fixtureId = parseInt(params.id, 10);
  const locale = params.locale ?? 'es';

  // Same deduplicated fetch — no extra API call
  const fixture = isNaN(fixtureId) ? null : await fetchFixture(fixtureId);

  let jsonLd: Record<string, unknown> | null = null;

  if (fixture) {
    const homeName = fixture.homeTeam?.name ?? 'Local';
    const awayName = fixture.awayTeam?.name ?? 'Visitante';
    const canonical = `${APP_URL}/${locale}/fixtures/${fixtureId}`;

    const eventStatus =
      fixture.status === 'CANCELLED' || fixture.status === 'POSTPONED'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled';

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${homeName} vs ${awayName} — FIFA World Cup 2026`,
      description: `Partido de la Copa Mundial FIFA 2026. ${homeName} vs ${awayName}.`,
      url: canonical,
      startDate: fixture.kickoffAt
        ? new Date(fixture.kickoffAt).toISOString()
        : undefined,
      eventStatus,
      organizer: {
        '@type': 'Organization',
        name: 'FIFA',
        url: 'https://www.fifa.com',
      },
      ...(fixture.stadiumName
        ? {
            location: {
              '@type': 'Place',
              name: fixture.stadiumName,
              ...(fixture.hostCity || fixture.hostCountry
                ? {
                    address: {
                      '@type': 'PostalAddress',
                      ...(fixture.hostCity ? { addressLocality: fixture.hostCity } : {}),
                      ...(fixture.hostCountry ? { addressCountry: fixture.hostCountry } : {}),
                    },
                  }
                : {}),
            },
          }
        : {}),
      homeTeam: {
        '@type': 'SportsTeam',
        name: homeName,
        sport: 'Soccer',
      },
      awayTeam: {
        '@type': 'SportsTeam',
        name: awayName,
        sport: 'Soccer',
      },
      // Scores — non-standard but recognized by Google for rich snippets
      ...(fixture.status === 'FINISHED' || fixture.status === 'LIVE'
        ? {
            homeTeamScore: {
              '@type': 'QuantitativeValue',
              value: fixture.homeScore ?? 0,
            },
            awayTeamScore: {
              '@type': 'QuantitativeValue',
              value: fixture.awayScore ?? 0,
            },
          }
        : {}),
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
