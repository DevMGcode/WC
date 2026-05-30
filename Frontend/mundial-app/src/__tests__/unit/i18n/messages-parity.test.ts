/**
 * Tests de paridad i18n entre los 7 idiomas soportados.
 *
 * Garantiza que TODOS los JSON de mensajes tienen la misma estructura:
 *   - mismas keys en cada nivel del árbol
 *   - ningún idioma se queda atrás cuando se agrega un mensaje nuevo
 *
 * Esto evita el bug típico "se ve la key cruda en alemán porque
 * olvidaron traducirla". El test catalá el set completo y compara.
 */
import esMessages from '@/i18n/messages/es.json';
import enMessages from '@/i18n/messages/en.json';
import deMessages from '@/i18n/messages/de.json';
import frMessages from '@/i18n/messages/fr.json';
import ptMessages from '@/i18n/messages/pt.json';
import ruMessages from '@/i18n/messages/ru.json';
import arMessages from '@/i18n/messages/ar.json';

/** Devuelve todas las keys de un objeto anidado en dot-notation: "auth.login.title". */
function flattenKeys(obj: any, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [];
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

const ALL_LOCALES = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
  fr: frMessages,
  pt: ptMessages,
  ru: ruMessages,
  ar: arMessages
};

describe('i18n — paridad de mensajes entre los 7 idiomas', () => {
  const esKeys = flattenKeys(esMessages);

  it('español tiene un número razonable de keys (>100, sanity check)', () => {
    expect(esKeys.length).toBeGreaterThan(100);
  });

  Object.entries(ALL_LOCALES).forEach(([locale, messages]) => {
    if (locale === 'es') return; // ES es el baseline.

    it(`"${locale}" tiene las mismas keys que español (baseline)`, () => {
      const localeKeys = flattenKeys(messages);
      const missing = esKeys.filter(k => !localeKeys.includes(k));
      const extra = localeKeys.filter(k => !esKeys.includes(k));

      // Asserts separados para que el output del test diga claramente cuáles faltan.
      expect({ locale, missing }).toEqual({ locale, missing: [] });
      expect({ locale, extra }).toEqual({ locale, extra: [] });
    });
  });

  it('Fix C: todos los locales tienen las nuevas keys auth.hero.*', () => {
    const REQUIRED_HERO_KEYS = [
      'auth.hero.mundial',
      'auth.hero.tagline',
      'auth.hero.countdownLabel',
      'auth.hero.days',
      'auth.hero.hours',
      'auth.hero.minutes',
      'auth.hero.seconds',
      'auth.hero.predictionsMade',
      'auth.hero.chipPredictions',
      'auth.hero.chipPrivateLeagues',
      'auth.hero.chipStatistics',
      'auth.hero.chipWorldCup'
    ];

    Object.entries(ALL_LOCALES).forEach(([locale, messages]) => {
      const keys = flattenKeys(messages);
      REQUIRED_HERO_KEYS.forEach(k => {
        expect({ locale, key: k, present: keys.includes(k) })
          .toEqual({ locale, key: k, present: true });
      });
    });
  });

  it('Fix E: todos los locales tienen fixtures.hostCountries', () => {
    Object.entries(ALL_LOCALES).forEach(([locale, messages]) => {
      const keys = flattenKeys(messages);
      expect({ locale, hasHostCountries: keys.includes('fixtures.hostCountries') })
        .toEqual({ locale, hasHostCountries: true });
    });
  });

  it('Fix F: predictions.predictionsRegistered usa formato ICU con {count, plural}', () => {
    Object.entries(ALL_LOCALES).forEach(([locale, messages]: [string, any]) => {
      const value = messages.predictions?.predictionsRegistered;
      expect({ locale, hasICUPlural: typeof value === 'string' && value.includes('{count, plural') })
        .toEqual({ locale, hasICUPlural: true });
    });
  });
});
