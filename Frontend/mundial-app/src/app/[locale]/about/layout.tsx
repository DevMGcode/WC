import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, string> = {
  es: 'Acerca de — Orionix Gol',
  en: 'About — Orionix Gol',
  fr: 'À propos — Orionix Gol',
  de: 'Über uns — Orionix Gol',
  pt: 'Sobre — Orionix Gol',
  ru: 'О нас — Orionix Gol',
  ar: 'معلومات عنا — Orionix Gol',
};

const DESCRIPTIONS: Record<string, string> = {
  es: 'Conocé Orionix Gol: la plataforma independiente para seguir el Mundial 2026 en vivo — calendario, grupos, goleadores, fase eliminatoria y porras.',
  en: 'Discover Orionix Gol: the independent platform to follow the 2026 World Cup live — schedule, groups, top scorers, knockout stage and predictions.',
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/about`;
  return {
    title: TITLES[locale] ?? TITLES.es,
    description: DESCRIPTIONS[locale] ?? DESCRIPTIONS.es,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/about`])),
    },
  };
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
