import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, { title: string; description: string }> = {
  es: { title: 'Goleadores del Mundial 2026 — Tabla de artilleros', description: 'Ranking de goleadores y asistencias del Mundial de Fútbol 2026, actualizado durante el torneo.' },
  en: { title: '2026 World Cup Top Scorers — Goals & Assists', description: 'Top scorers and assists ranking of the 2026 FIFA World Cup, updated throughout the tournament.' },
  fr: { title: 'Meilleurs buteurs — Coupe du Monde 2026', description: 'Classement des buteurs et passeurs de la Coupe du Monde 2026, mis à jour pendant le tournoi.' },
  de: { title: 'WM 2026 Torschützenliste — Tore & Vorlagen', description: 'Torschützen- und Vorlagen-Ranking der WM 2026, aktualisiert während des Turniers.' },
  pt: { title: 'Artilheiros da Copa do Mundo 2026', description: 'Ranking de artilheiros e assistências da Copa do Mundo 2026, atualizado durante o torneio.' },
  ru: { title: 'Бомбардиры ЧМ 2026 — голы и передачи', description: 'Рейтинг бомбардиров и ассистентов Чемпионата мира 2026, обновляется во время турнира.' },
  ar: { title: 'هدافو كأس العالم 2026 — الأهداف والتمريرات', description: 'ترتيب هدافي وصانعي أهداف كأس العالم 2026، يُحدَّث خلال البطولة.' },
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const meta = TITLES[locale] ?? TITLES.es;
  const canonical = `${APP_URL}/${locale}/scorers`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/scorers`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
    },
  };
}

export default function ScorersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
