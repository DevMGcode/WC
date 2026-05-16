export const locales = ['es', 'en', 'fr', 'de', 'pt', 'ru', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeConfig: Record<Locale, {label: string; dir: 'ltr' | 'rtl'}> = {
  es: {label: 'Español', dir: 'ltr'},
  en: {label: 'English', dir: 'ltr'},
  fr: {label: 'Français', dir: 'ltr'},
  de: {label: 'Deutsch', dir: 'ltr'},
  pt: {label: 'Português', dir: 'ltr'},
  ru: {label: 'Русский', dir: 'ltr'},
  ar: {label: 'العربية', dir: 'rtl'},
};

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
