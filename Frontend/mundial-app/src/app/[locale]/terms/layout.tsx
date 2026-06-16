import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, string> = {
  es: 'Términos y Condiciones — Orionix Gol',
  en: 'Terms and Conditions — Orionix Gol',
  fr: "Conditions d'utilisation — Orionix Gol",
  de: 'Nutzungsbedingungen — Orionix Gol',
  pt: 'Termos e Condições — Orionix Gol',
  ru: 'Условия использования — Orionix Gol',
  ar: 'الشروط والأحكام — Orionix Gol',
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/terms`;
  return {
    title: TITLES[locale] ?? TITLES.es,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/terms`])),
    },
  };
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
