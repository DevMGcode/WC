import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, { title: string; description: string }> = {
  es: { title: 'Grupos y Eliminatorias — Mundial 2026', description: 'Tablas de posiciones de todos los grupos y el cuadro de eliminatorias del Mundial de Fútbol 2026. Clasificados, resultados y análisis de cada grupo.' },
  en: { title: 'Groups & Knockout Bracket — 2026 World Cup', description: 'Standings for every group and the knockout bracket of the 2026 FIFA World Cup. Qualified teams, results and group-by-group analysis.' },
  fr: { title: 'Groupes et Tableau final — Coupe du Monde 2026', description: 'Classements de tous les groupes et tableau à élimination directe de la Coupe du Monde 2026. Qualifiés, résultats et analyse de chaque groupe.' },
  de: { title: 'Gruppen & K.-o.-Runde — WM 2026', description: 'Tabellen aller Gruppen und der K.-o.-Baum der WM 2026. Qualifizierte Teams, Ergebnisse und Gruppenanalyse.' },
  pt: { title: 'Grupos e Mata-mata — Copa do Mundo 2026', description: 'Classificação de todos os grupos e a chave do mata-mata da Copa do Mundo 2026. Classificados, resultados e análise de cada grupo.' },
  ru: { title: 'Группы и плей-офф — ЧМ 2026', description: 'Таблицы всех групп и сетка плей-офф Чемпионата мира 2026. Вышедшие команды, результаты и анализ каждой группы.' },
  ar: { title: 'المجموعات والأدوار الإقصائية — كأس العالم 2026', description: 'ترتيب جميع المجموعات ومخطط الأدوار الإقصائية لكأس العالم 2026. المتأهلون والنتائج وتحليل كل مجموعة.' },
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const meta = TITLES[locale] ?? TITLES.es;
  const canonical = `${APP_URL}/${locale}/groups`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/groups`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
    },
  };
}

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
