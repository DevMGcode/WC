import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/locales';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale ?? 'es';
  const canonical = `${APP_URL}/${locale}/premium`;
  return {
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}/premium`])),
    },
  };
}

export default function PremiumLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
