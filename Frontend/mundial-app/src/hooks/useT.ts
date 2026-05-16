'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { locales, defaultLocale, type Locale } from '@/i18n/locales';

import es from '@/i18n/messages/es.json';
import en from '@/i18n/messages/en.json';
import fr from '@/i18n/messages/fr.json';
import de from '@/i18n/messages/de.json';
import pt from '@/i18n/messages/pt.json';
import ru from '@/i18n/messages/ru.json';
import ar from '@/i18n/messages/ar.json';

const messages: Record<Locale, Record<string, unknown>> = { es, en, fr, de, pt, ru, ar };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

export function useT() {
  const pathname = usePathname();

  const locale = useMemo((): Locale => {
    const segment = pathname?.split('/')[1] ?? '';
    return locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;
  }, [pathname]);

  const t = useMemo(
    () => (key: string) => getNestedValue(messages[locale] as Record<string, unknown>, key),
    [locale]
  );

  return { t, locale };
}
