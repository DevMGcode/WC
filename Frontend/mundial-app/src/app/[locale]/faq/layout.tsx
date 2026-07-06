import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

const TITLES: Record<string, { title: string; description: string }> = {
  es: { title: 'Cómo funciona Orionix Gol — Porras del Mundial 2026', description: 'Cómo funcionan las porras del Mundial 2026, cómo se calculan los puntos, qué incluye el plan gratuito y el Premium, qué pasa con los penales y más.' },
  en: { title: 'How Orionix Gol works — World Cup 2026 predictions', description: 'How 2026 World Cup predictions work, how points are calculated, what the free plan and Premium include, how penalties are scored and more.' },
  fr: { title: 'Comment fonctionne Orionix Gol — Pronostics 2026', description: 'Comment fonctionnent les pronostics de la Coupe du Monde 2026, le calcul des points, ce que comprennent le plan gratuit et le Premium, les tirs au but et plus.' },
  de: { title: 'So funktioniert Orionix Gol — WM-2026-Tipps', description: 'Wie die WM-2026-Tipps funktionieren, wie Punkte berechnet werden, was Gratis-Plan und Premium enthalten, wie Elfmeterschießen gewertet wird und mehr.' },
  pt: { title: 'Como funciona o Orionix Gol — Palpites 2026', description: 'Como funcionam os palpites da Copa do Mundo 2026, como os pontos são calculados, o que incluem o plano grátis e o Premium, como contam os pênaltis e mais.' },
  ru: { title: 'Как работает Orionix Gol — прогнозы ЧМ 2026', description: 'Как работают прогнозы на ЧМ 2026, как считаются очки, что входит в бесплатный план и Premium, как учитываются пенальти и другое.' },
  ar: { title: 'كيف يعمل Orionix Gol — توقعات 2026', description: 'كيف تعمل توقعات كأس العالم 2026، وكيف تُحتسب النقاط، وماذا تشمل الخطة المجانية وPremium، وكيف تُحتسب ركلات الترجيح والمزيد.' },
};

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const meta = TITLES[locale] ?? TITLES.es;
  const canonical = `${APP_URL}/${locale}/faq`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/faq`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
    },
  };
}

export default function FaqLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
