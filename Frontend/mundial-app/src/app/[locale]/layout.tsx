import type { Metadata } from 'next';
import { locales } from '@/i18n/locales';
import LocaleClientLayout from './LocaleClientLayout';

type Locale = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'ru' | 'ar';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orionixgol.azurewebsites.net';

const META: Record<Locale, { title: string; description: string }> = {
  es: {
    title: 'Orionix Gol — Mundial 2026',
    description: 'Predice los resultados del Mundial de Fútbol 2026, compite en ligas privadas y sigue el ranking en tiempo real.',
  },
  en: {
    title: 'Orionix Gol — World Cup 2026',
    description: 'Predict the 2026 FIFA World Cup results, compete in private leagues and follow the ranking in real time.',
  },
  fr: {
    title: 'Orionix Gol — Coupe du Monde 2026',
    description: 'Prédisez les résultats de la Coupe du Monde 2026, concourez dans des ligues privées et suivez le classement en temps réel.',
  },
  de: {
    title: 'Orionix Gol — WM 2026',
    description: 'Sagen Sie die WM 2026 Ergebnisse voraus, treten Sie in privaten Ligen an und verfolgen Sie die Rangliste in Echtzeit.',
  },
  pt: {
    title: 'Orionix Gol — Copa do Mundo 2026',
    description: 'Preveja os resultados da Copa do Mundo 2026, compita em ligas privadas e acompanhe o ranking em tempo real.',
  },
  ru: {
    title: 'Orionix Gol — ЧМ 2026',
    description: 'Предсказывайте результаты ЧМ 2026, соревнуйтесь в частных лигах и следите за рейтингом в реальном времени.',
  },
  ar: {
    title: 'Orionix Gol — كأس العالم 2026',
    description: 'توقع نتائج كأس العالم 2026، تنافس في دوريات خاصة وتابع الترتيب في الوقت الفعلي.',
  },
};

export function generateMetadata(
  { params }: { params: { locale: string } }
): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'es') as Locale;
  const meta = META[locale];
  const ogUrl = `${APP_URL}/og?locale=${locale}`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [ogUrl],
    },
  };
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <LocaleClientLayout>{children}</LocaleClientLayout>;
}
