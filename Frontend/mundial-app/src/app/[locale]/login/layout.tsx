import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, string> = {
  es: 'Iniciar sesión | Orionix Gol',
  en: 'Sign in | Orionix Gol',
  fr: 'Connexion | Orionix Gol',
  de: 'Anmelden | Orionix Gol',
  pt: 'Entrar | Orionix Gol',
  ru: 'Войти | Orionix Gol',
  ar: 'تسجيل الدخول | Orionix Gol',
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/login`;

  return {
    title: TITLES[locale] ?? TITLES.es,
    // Página utilitaria sin valor SEO: fuera del índice. Combinado con quitarla del
    // Disallow de robots.txt, Google puede rastrearla, leer el noindex y descartarla
    // limpiamente (evita el estado "Duplicada: sin versión canónica" en Search Console).
    robots: { index: false, follow: false },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${APP_URL}/${l}/login`])
      ),
    },
  };
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
