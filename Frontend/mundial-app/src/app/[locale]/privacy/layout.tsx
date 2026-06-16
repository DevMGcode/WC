import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, string> = {
  es: 'Política de Privacidad — Orionix Gol',
  en: 'Privacy Policy — Orionix Gol',
  fr: 'Politique de confidentialité — Orionix Gol',
  de: 'Datenschutzrichtlinie — Orionix Gol',
  pt: 'Política de Privacidade — Orionix Gol',
  ru: 'Политика конфиденциальности — Orionix Gol',
  ar: 'سياسة الخصوصية — Orionix Gol',
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/privacy`;
  return {
    title: TITLES[locale] ?? TITLES.es,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/privacy`])),
    },
  };
}

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
