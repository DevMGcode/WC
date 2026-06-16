/**
 * Fixtures page — React Server Component (RSC)
 *
 * Ventajas del patrón RSC + Client hybrid:
 *  - El HTML de los fixtures se pre-renderiza en el servidor → 0 spinner inicial
 *  - El cliente recibe `initialData` ya hidratado en TanStack Query
 *  - Si el usuario navega y vuelve, TanStack Query re-valida silenciosamente
 *  - getAllFixtures() usa URL absoluta → funciona tanto en server como client
 */

import type { Metadata } from 'next';
import { getAllFixtures } from '@/services/publicTournament';
import { locales } from '@/i18n/locales';
import FixturesClient from './FixturesClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, { title: string; description: string }> = {
  es: { title: 'Fixture Mundial 2026 — Todos los partidos en vivo', description: 'Calendario completo del Mundial de Fútbol 2026. Partidos en vivo, resultados, goleadores y pronósticos. Sigue cada partido en tiempo real.' },
  en: { title: 'FIFA World Cup 2026 Fixture — All matches live',    description: 'Complete 2026 FIFA World Cup schedule. Live scores, results, scorers and predictions. Follow every match in real time.' },
  fr: { title: 'Calendrier Coupe du Monde 2026 — Tous les matchs', description: 'Calendrier complet de la Coupe du Monde 2026. Scores en direct, résultats et pronostics.' },
  de: { title: 'WM 2026 Spielplan — Alle Spiele live',             description: 'Kompletter Spielplan der WM 2026. Live-Ergebnisse, Torschützen und Tipps.' },
  pt: { title: 'Tabela Copa do Mundo 2026 — Todos os jogos ao vivo', description: 'Calendário completo da Copa do Mundo 2026. Placar ao vivo, resultados e palpites.' },
  ru: { title: 'Расписание ЧМ 2026 — Все матчи в прямом эфире',    description: 'Полное расписание ЧМ 2026. Счёт онлайн, голы и прогнозы.' },
  ar: { title: 'جدول كأس العالم 2026 — جميع المباريات مباشرة',     description: 'الجدول الكامل لكأس العالم 2026. نتائج مباشرة وأهداف وتوقعات.' },
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const meta = TITLES[locale] ?? TITLES.es;
  const canonical = `${APP_URL}/${locale}/fixtures`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/fixtures`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
    },
  };
}

export default async function FixturesPage() {
  const initialFixtures = await getAllFixtures().catch(() => []);
  return <FixturesClient initialFixtures={initialFixtures} />;
}
