/**
 * Spanish localization of team names that come from API-Football.
 *
 * Why this lives in the frontend and not in the database:
 *   - API-Football is the canonical source of truth for the 48 teams. We mirror
 *     it verbatim in `team.name`, so any sync re-applies cleanly without us
 *     having to maintain translation overrides every time.
 *   - Team-name translation is a presentation concern (i18n), like the rest of
 *     the UI labels. Keeping it co-located with the other locale-dependent
 *     strings makes the responsibility obvious.
 *   - When `/en/...` routes are activated in the future, no DB change is needed
 *     — `localizeTeamName(name, 'en')` simply returns the original.
 *
 * Fallback: if the team isn't in the map, the original name is returned. This
 * keeps the UI functional even if API-Football adds a country we haven't
 * translated yet.
 */

// English (from API-Football) → Spanish (display)
const TEAM_NAMES_ES: Record<string, string> = {
  // CONMEBOL
  Argentina: 'Argentina',
  Brazil: 'Brasil',
  Colombia: 'Colombia',
  Uruguay: 'Uruguay',
  Paraguay: 'Paraguay',
  Ecuador: 'Ecuador',

  // CONCACAF
  Mexico: 'México',
  USA: 'Estados Unidos',
  Canada: 'Canadá',
  Panama: 'Panamá',
  Haiti: 'Haití',
  Curaçao: 'Curazao',

  // UEFA
  Spain: 'España',
  France: 'Francia',
  England: 'Inglaterra',
  Germany: 'Alemania',
  Portugal: 'Portugal',
  Belgium: 'Bélgica',
  Netherlands: 'Países Bajos',
  Italy: 'Italia',
  Croatia: 'Croacia',
  Switzerland: 'Suiza',
  Sweden: 'Suecia',
  Norway: 'Noruega',
  Scotland: 'Escocia',
  Austria: 'Austria',
  'Czech Republic': 'República Checa',
  'Bosnia & Herzegovina': 'Bosnia y Herzegovina',
  Türkiye: 'Turquía',

  // AFC
  Japan: 'Japón',
  'South Korea': 'Corea del Sur',
  Australia: 'Australia',
  Iran: 'Irán',
  'Saudi Arabia': 'Arabia Saudita',
  Qatar: 'Catar',
  Iraq: 'Irak',
  Uzbekistan: 'Uzbekistán',
  Jordan: 'Jordania',

  // CAF
  Senegal: 'Senegal',
  Morocco: 'Marruecos',
  Tunisia: 'Túnez',
  Egypt: 'Egipto',
  Algeria: 'Argelia',
  Ghana: 'Ghana',
  'Ivory Coast': 'Costa de Marfil',
  'Congo DR': 'RD del Congo',
  'South Africa': 'Sudáfrica',
  'Cape Verde Islands': 'Cabo Verde',

  // OFC
  'New Zealand': 'Nueva Zelanda',
};

/**
 * Returns the localized team name for the given locale. Falls back to the
 * original (English) name if no translation is found or if `locale !== 'es'`.
 */
export function localizeTeamName(name: string | undefined | null, locale: string = 'es'): string {
  if (!name) return '';
  if (locale !== 'es') return name;
  return TEAM_NAMES_ES[name] ?? name;
}

/**
 * Convenience for places where we only have a name string and want the Spanish
 * version unconditionally (e.g. inside services that don't know the locale).
 * Same as `localizeTeamName(name, 'es')`.
 */
export function toSpanish(name: string | undefined | null): string {
  return localizeTeamName(name, 'es');
}
