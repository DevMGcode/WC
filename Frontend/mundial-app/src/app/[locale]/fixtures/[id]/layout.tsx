import { cache } from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getFixtureById } from '@/services/publicTournament';
import { localizeTeamName } from '@/lib/i18n/teamNames';
import { buildMatchSummary } from './_components/matchSummary';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

// cache() deduplicates: both generateMetadata and the layout fn share one API call per request
const fetchFixture = cache((id: number) => getFixtureById(id).catch(() => null));

type Props = { params: { id: string; locale: string }; children: ReactNode };

// ── Plantilla del meta del partido, localizada a los 7 idiomas ──────────────
type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
const pickLang = (locale: string): Lang => {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
};
const WC:      Record<Lang, string> = { es: 'Mundial 2026', en: 'World Cup 2026', fr: 'Coupe du Monde 2026', pt: 'Copa do Mundo 2026', de: 'WM 2026', ru: 'ЧМ 2026', ar: 'كأس العالم 2026' };
const LIVE_W:  Record<Lang, string> = { es: 'EN VIVO', en: 'LIVE', fr: 'EN DIRECT', pt: 'AO VIVO', de: 'LIVE', ru: 'В ПРЯМОМ ЭФИРЕ', ar: 'مباشر' };
const RESULT_W:Record<Lang, string> = { es: 'Resultado Final', en: 'Final Result', fr: 'Résultat final', pt: 'Resultado Final', de: 'Endergebnis', ru: 'Итоговый результат', ar: 'النتيجة النهائية' };
const PRED_W:  Record<Lang, string> = { es: 'Pronóstico', en: 'Prediction', fr: 'Pronostic', pt: 'Palpite', de: 'Tipp', ru: 'Прогноз', ar: 'توقّع' };
const GOALS_W: Record<Lang, string> = { es: 'Goleadores', en: 'Scorers', fr: 'Buteurs', pt: 'Artilheiros', de: 'Torschützen', ru: 'Голы', ar: 'الهدافون' };

type MetaCtx = { homeName: string; awayName: string; homeCode: string; awayCode: string; hs: number; as_: number; scorerList?: string; status?: string };

function buildFixtureMeta(lang: Lang, ctx: MetaCtx): { title: string; description: string } {
  const { homeName, awayName, homeCode, awayCode, hs, as_, scorerList, status } = ctx;
  const wc = WC[lang];
  if (status === 'LIVE') {
    const d: Record<Lang, string> = {
      es: `Sigue ${homeName} vs ${awayName} en tiempo real. Marcador actual ${hs}-${as_}. Goleadores, estadísticas y predicciones en Orionix Gol.`,
      en: `Follow ${homeName} vs ${awayName} live. Current score ${hs}-${as_}. Scorers, stats and predictions on Orionix Gol.`,
      fr: `Suivez ${homeName} vs ${awayName} en direct. Score actuel ${hs}-${as_}. Buteurs, statistiques et pronostics sur Orionix Gol.`,
      pt: `Acompanhe ${homeName} vs ${awayName} ao vivo. Placar atual ${hs}-${as_}. Artilheiros, estatísticas e palpites no Orionix Gol.`,
      de: `Verfolge ${homeName} vs ${awayName} live. Aktueller Spielstand ${hs}-${as_}. Torschützen, Statistiken und Tipps auf Orionix Gol.`,
      ru: `Следите за ${homeName} vs ${awayName} в прямом эфире. Текущий счёт ${hs}-${as_}. Бомбардиры, статистика и прогнозы на Orionix Gol.`,
      ar: `تابع ${homeName} ضد ${awayName} مباشرة. النتيجة الحالية ${hs}-${as_}. الهدافون والإحصاءات والتوقعات على Orionix Gol.`,
    };
    return { title: `🔴 ${homeCode} ${hs}-${as_} ${awayCode} ${LIVE_W[lang]} | ${wc}`, description: d[lang] };
  }
  if (status === 'FINISHED') {
    const g = scorerList ? ` ${GOALS_W[lang]}: ${scorerList}.` : '';
    const d: Record<Lang, string> = {
      es: `Resultado final: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Predicciones y estadísticas en Orionix Gol.`,
      en: `Final result: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Predictions and stats on Orionix Gol.`,
      fr: `Résultat final : ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Pronostics et statistiques sur Orionix Gol.`,
      pt: `Resultado final: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Palpites e estatísticas no Orionix Gol.`,
      de: `Endergebnis: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Tipps und Statistiken auf Orionix Gol.`,
      ru: `Итоговый счёт: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} Прогнозы и статистика на Orionix Gol.`,
      ar: `النتيجة النهائية: ${homeName} ${hs} - ${as_} ${awayName}. ${wc}.${g} التوقعات والإحصاءات على Orionix Gol.`,
    };
    return { title: `${homeName} ${hs}-${as_} ${awayName} | ${RESULT_W[lang]} | ${wc}`, description: d[lang] };
  }
  const d: Record<Lang, string> = {
    es: `Predice ${homeName} vs ${awayName} del Mundial 2026. Compite con tus amigos en ligas privadas y sigue el partido en vivo en Orionix Gol.`,
    en: `Predict ${homeName} vs ${awayName} at the 2026 World Cup. Compete with friends in private leagues and follow the match live on Orionix Gol.`,
    fr: `Pronostiquez ${homeName} vs ${awayName} de la Coupe du Monde 2026. Affrontez vos amis dans des ligues privées et suivez le match en direct sur Orionix Gol.`,
    pt: `Faça seu palpite em ${homeName} vs ${awayName} da Copa do Mundo 2026. Compita com amigos em ligas privadas e acompanhe o jogo ao vivo no Orionix Gol.`,
    de: `Tippe ${homeName} vs ${awayName} bei der WM 2026. Tritt in privaten Ligen gegen Freunde an und verfolge das Spiel live auf Orionix Gol.`,
    ru: `Сделай прогноз на ${homeName} vs ${awayName} на ЧМ 2026. Соревнуйся с друзьями в частных лигах и следи за матчем на Orionix Gol.`,
    ar: `توقّع ${homeName} ضد ${awayName} في كأس العالم 2026. نافس أصدقاءك في دوريات خاصة وتابع المباراة مباشرة على Orionix Gol.`,
  };
  return { title: `${homeName} vs ${awayName} | ${PRED_W[lang]} | ${wc}`, description: d[lang] };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string };
}): Promise<Metadata> {
  const fixtureId = parseInt(params.id, 10);
  if (isNaN(fixtureId)) return { title: 'Partido | Orionix Gol' };

  const fixture = await fetchFixture(fixtureId);
  if (!fixture) return { title: 'Partido | Orionix Gol' };

  const locale = params.locale ?? 'es';
  const homeName = localizeTeamName(fixture.homeTeam?.name, locale) || 'Local';
  const awayName = localizeTeamName(fixture.awayTeam?.name, locale) || 'Visitante';
  const homeCode = fixture.homeTeam?.fifaCode ?? fixture.homeTeam?.shortName ?? homeName;
  const awayCode = fixture.awayTeam?.fifaCode ?? fixture.awayTeam?.shortName ?? awayName;

  const hs = fixture.homeScore ?? 0;
  const as_ = fixture.awayScore ?? 0;
  const scorerList = fixture.status === 'FINISHED'
    ? fixture.scorers?.slice(0, 4).map((s) => s.playerName).join(', ')
    : undefined;
  const { title, description } = buildFixtureMeta(pickLang(locale), {
    homeName, awayName, homeCode, awayCode, hs, as_, scorerList, status: fixture.status,
  });

  const canonical = `${APP_URL}/${locale}/fixtures/${fixtureId}`;

  // Imagen OG dinámica: tarjeta del partido (banderas + códigos + marcador/VS).
  // La pinta /og en "modo partido"; así el link compartido muestra una foto real.
  const og = new URL(`${APP_URL}/og`);
  og.searchParams.set('locale', locale);
  og.searchParams.set('home', homeName);
  og.searchParams.set('away', awayName);
  og.searchParams.set('hc', homeCode);
  og.searchParams.set('ac', awayCode);
  if (fixture.homeTeam?.flagUrl) og.searchParams.set('hf', fixture.homeTeam.flagUrl);
  if (fixture.awayTeam?.flagUrl) og.searchParams.set('af', fixture.awayTeam.flagUrl);
  og.searchParams.set('st', fixture.status ?? 'SCHEDULED');
  if (fixture.status === 'LIVE' || fixture.status === 'FINISHED') {
    og.searchParams.set('hs', String(fixture.homeScore ?? 0));
    og.searchParams.set('as', String(fixture.awayScore ?? 0));
  }
  const ogImage = og.toString();

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
    const homeName = localizeTeamName(fixture.homeTeam?.name, locale) || 'Local';
    const awayName = localizeTeamName(fixture.awayTeam?.name, locale) || 'Visitante';
    const canonical = `${APP_URL}/${locale}/fixtures/${fixtureId}`;

    const eventStatus =
      fixture.status === 'CANCELLED' || fixture.status === 'POSTPONED'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled';

    const startDate = fixture.kickoffAt ? new Date(fixture.kickoffAt) : null;
    const endDate   = startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null;

    // OG image URL para el campo image del schema
    const og = new URL(`${APP_URL}/og`);
    og.searchParams.set('locale', locale);
    og.searchParams.set('home', homeName);
    og.searchParams.set('away', awayName);
    if (fixture.homeTeam?.fifaCode) og.searchParams.set('hc', fixture.homeTeam.fifaCode);
    if (fixture.awayTeam?.fifaCode) og.searchParams.set('ac', fixture.awayTeam.fifaCode);
    if (fixture.homeTeam?.flagUrl)  og.searchParams.set('hf', fixture.homeTeam.flagUrl);
    if (fixture.awayTeam?.flagUrl)  og.searchParams.set('af', fixture.awayTeam.flagUrl);
    og.searchParams.set('st', fixture.status ?? 'SCHEDULED');
    if (fixture.status === 'LIVE' || fixture.status === 'FINISHED') {
      og.searchParams.set('hs', String(fixture.homeScore ?? 0));
      og.searchParams.set('as', String(fixture.awayScore ?? 0));
    }

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${homeName} vs ${awayName} — FIFA World Cup 2026`,
      description: `Partido de la Copa Mundial FIFA 2026. ${homeName} vs ${awayName}.`,
      url: canonical,
      startDate: startDate?.toISOString(),
      endDate:   endDate?.toISOString(),
      eventStatus,
      image: og.toString(),
      offers: {
        '@type': 'Offer',
        name: 'Predicción gratuita',
        price: '0',
        priceCurrency: 'COP',
        url: canonical,
        availability: 'https://schema.org/InStock',
        validFrom: startDate?.toISOString(),
      },
      performer: [
        { '@type': 'SportsTeam', name: homeName, sport: 'Soccer' },
        { '@type': 'SportsTeam', name: awayName, sport: 'Soccer' },
      ],
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

  // ── Contenido SSR indexable (evita el "Soft 404" de Google) ────────────────
  // El contenido rico de la ficha (resumen, marcador, pestañas) se renderiza en el
  // CLIENTE con datos de React Query, así que NO llegaba al HTML del servidor: el
  // crawler recibía una página sin prosa real (solo placeholders "No data") y la
  // marcaba como Soft 404 ("página flaca"). Acá, desde los datos que el servidor YA
  // tiene, renderizamos el título del partido y un resumen en prosa (localizado a 7
  // idiomas) para que Google vea contenido sustancial y único apenas abre la página.
  const lang = pickLang(locale);
  let matchHeading = '';
  let previewText = '';
  const factParts: string[] = [];
  if (fixture) {
    const hName = localizeTeamName(fixture.homeTeam?.name, locale) || 'Local';
    const aName = localizeTeamName(fixture.awayTeam?.name, locale) || 'Visitante';
    matchHeading = `${hName} vs ${aName} — ${WC[lang]}`;
    previewText = buildMatchSummary({
      status: fixture.status,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      stadiumName: fixture.stadiumName,
      hostCity: fixture.hostCity,
      scorers: fixture.scorers,
    }, locale);
    if (fixture.kickoffAt) {
      try {
        factParts.push(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(fixture.kickoffAt)));
      } catch { /* fecha inválida → se omite */ }
    }
    if (fixture.stadiumName) factParts.push(`${fixture.stadiumName}${fixture.hostCity ? `, ${fixture.hostCity}` : ''}`);
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
      {matchHeading && (
        <section aria-label={matchHeading}
          style={{ maxWidth: 900, margin: '0 auto', padding: '4px 20px 40px' }}>
          <div style={{ borderRadius: 16, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#eafbea', margin: '0 0 8px', lineHeight: 1.35 }}>{matchHeading}</h1>
            {previewText && (
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(226,241,226,0.72)', margin: 0 }}>{previewText}</p>
            )}
            {factParts.length > 0 && (
              <p style={{ fontSize: 12, color: 'rgba(210,228,210,0.5)', margin: '8px 0 0' }}>{factParts.join(' · ')}</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
