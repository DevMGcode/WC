/**
 * Localización de nombres de equipos provenientes de API-Football.
 *
 * Estrategia: API-Football devuelve los nombres en inglés. Mantenemos esos
 * nombres como fuente canónica en la BD y traducimos en el frontend usando
 * `Intl.DisplayNames` (nativo del navegador), que soporta los 7 idiomas
 * configurados (es, en, pt, fr, de, ar, ru) sin mantener tablas manuales.
 *
 * Para los pocos casos en los que el nombre de API-Football no coincide con
 * un código ISO 3166 estándar (Türkiye, Cabo Verde, Curazao, etc.) usamos un
 * mapeo manual de respaldo.
 */

/** Inglés (API-Football) → ISO 3166-1 alpha-2 */
const ENGLISH_TO_ISO2: Record<string, string> = {
  // CONMEBOL
  Argentina: 'AR',
  Brazil: 'BR',
  Colombia: 'CO',
  Uruguay: 'UY',
  Paraguay: 'PY',
  Ecuador: 'EC',

  // CONCACAF
  Mexico: 'MX',
  USA: 'US',
  Canada: 'CA',
  Panama: 'PA',
  Haiti: 'HT',
  Curaçao: 'CW',

  // UEFA
  Spain: 'ES',
  France: 'FR',
  England: 'GB-ENG',
  Germany: 'DE',
  Portugal: 'PT',
  Belgium: 'BE',
  Netherlands: 'NL',
  Italy: 'IT',
  Croatia: 'HR',
  Switzerland: 'CH',
  Sweden: 'SE',
  Norway: 'NO',
  Scotland: 'GB-SCT',
  Austria: 'AT',
  'Czech Republic': 'CZ',
  'Bosnia & Herzegovina': 'BA',
  Türkiye: 'TR',

  // AFC
  Japan: 'JP',
  'South Korea': 'KR',
  Australia: 'AU',
  Iran: 'IR',
  'Saudi Arabia': 'SA',
  Qatar: 'QA',
  Iraq: 'IQ',
  Uzbekistan: 'UZ',
  Jordan: 'JO',

  // CAF
  Senegal: 'SN',
  Morocco: 'MA',
  Tunisia: 'TN',
  Egypt: 'EG',
  Algeria: 'DZ',
  Ghana: 'GH',
  'Ivory Coast': 'CI',
  'Congo DR': 'CD',
  'South Africa': 'ZA',
  'Cape Verde Islands': 'CV',

  // OFC
  'New Zealand': 'NZ',
};

/**
 * Overrides manuales para casos donde `Intl.DisplayNames` no devuelve un
 * nombre amigable o el ISO 3166 no aplica directamente (selecciones
 * sub-nacionales como Inglaterra/Escocia, o nombres comerciales como Türkiye).
 */
const MANUAL_OVERRIDES: Record<string, Record<string, string>> = {
  es: {
    England: 'Inglaterra',
    Scotland: 'Escocia',
    'Cape Verde Islands': 'Cabo Verde',
    Türkiye: 'Turquía',
    Curaçao: 'Curazao',
    'Congo DR': 'RD del Congo',
    'Ivory Coast': 'Costa de Marfil',
    'Saudi Arabia': 'Arabia Saudita',
  },
  en: {
    Türkiye: 'Türkiye',
    'Congo DR': 'DR Congo',
    'Cape Verde Islands': 'Cape Verde',
  },
  pt: {
    England: 'Inglaterra',
    Scotland: 'Escócia',
    'Cape Verde Islands': 'Cabo Verde',
    Türkiye: 'Turquia',
    Curaçao: 'Curaçao',
    'Congo DR': 'RD do Congo',
  },
  fr: {
    England: 'Angleterre',
    Scotland: 'Écosse',
    'Cape Verde Islands': 'Cap-Vert',
    Türkiye: 'Turquie',
    Curaçao: 'Curaçao',
    'Congo DR': 'RD du Congo',
  },
  de: {
    England: 'England',
    Scotland: 'Schottland',
    'Cape Verde Islands': 'Kap Verde',
    Türkiye: 'Türkei',
    Curaçao: 'Curaçao',
    'Congo DR': 'DR Kongo',
  },
  ar: {
    England: 'إنجلترا',
    Scotland: 'اسكتلندا',
    'Cape Verde Islands': 'الرأس الأخضر',
    Türkiye: 'تركيا',
    Curaçao: 'كوراساو',
    'Congo DR': 'جمهورية الكونغو الديمقراطية',
  },
  ru: {
    England: 'Англия',
    Scotland: 'Шотландия',
    'Cape Verde Islands': 'Кабо-Верде',
    Türkiye: 'Турция',
    Curaçao: 'Кюрасао',
    'Congo DR': 'ДР Конго',
  },
};

const SUPPORTED_LOCALES = new Set(['es', 'en', 'pt', 'fr', 'de', 'ar', 'ru']);

/**
 * Devuelve el nombre del equipo en el idioma indicado. Si no hay traducción
 * disponible, devuelve el nombre original (inglés de API-Football).
 */
export function localizeTeamName(name: string | undefined | null, locale: string = 'es'): string {
  if (!name) return '';
  const lang = SUPPORTED_LOCALES.has(locale) ? locale : 'es';

  const override = MANUAL_OVERRIDES[lang]?.[name];
  if (override) return override;

  const iso2 = ENGLISH_TO_ISO2[name];
  if (!iso2) return name;

  try {
    const display = new Intl.DisplayNames([lang], { type: 'region' }).of(iso2);
    return display ?? name;
  } catch {
    return name;
  }
}

/**
 * Atajo retrocompatible. Equivalente a `localizeTeamName(name, 'es')`.
 * Se mantiene para que servicios que aún no propagan `locale` no rompan.
 */
export function toSpanish(name: string | undefined | null): string {
  return localizeTeamName(name, 'es');
}
