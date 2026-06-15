/**
 * Utilidades de formateo de fechas centralizadas.
 *
 * Todas las funciones aceptan Date | string | number y un `locale` opcional.
 * Si no se pasa `locale`, se intenta leer del atributo `lang` del <html> en
 * cliente (lo setea next-intl según la ruta). En SSR o si no hay <html>, cae a
 * 'es-ES'. Esto permite que las fechas reflejen el idioma activo automáticamente
 * sin que cada componente tenga que pasar el locale explícitamente.
 */

const DEFAULT_LOCALE = 'es-ES';

// TZ fija del torneo para evitar mismatches SSR/cliente (Bug hydration).
// Usamos CDMX porque es la sede del partido inaugural (MEX vs RSA, 11-jun-2026)
// y coincide con lo que muestran FIFA, Google y la TV mexicana. El usuario en
// Bogotá, BA, Madrid, etc. verá la hora local de la sede del partido — patrón
// estándar en apps deportivas (ESPN, FotMob).
const TOURNAMENT_TZ = 'America/Mexico_City';

/** Detecta el locale activo desde <html lang="…"> en cliente; SSR → 'es-ES'. */
function activeLocale(override?: string): string {
  if (override) return override;
  if (typeof document !== 'undefined') {
    const lang = document.documentElement?.lang;
    if (lang) return lang;
  }
  return DEFAULT_LOCALE;
}

/** "18:00" */
export const fmtTime = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleTimeString(activeLocale(locale), { hour: '2-digit', minute: '2-digit', timeZone: TOURNAMENT_TZ });

/** "lun. 15 jun." */
export const fmtDay = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), { weekday: 'short', day: 'numeric', month: 'short', timeZone: TOURNAMENT_TZ });

/** "lun. 15 jun. · 18:00" */
export const fmtDate = (d: Date | string | number, locale?: string): string => {
  const dt = new Date(d);
  const l  = activeLocale(locale);
  return (
    dt.toLocaleDateString(l, { weekday: 'short', day: 'numeric', month: 'short', timeZone: TOURNAMENT_TZ }) +
    ' · ' +
    dt.toLocaleTimeString(l, { hour: '2-digit', minute: '2-digit', timeZone: TOURNAMENT_TZ })
  );
};

/** "lunes, 15 de junio" — cabecera de grupo en fixtures */
export const fmtDayLong = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', timeZone: TOURNAMENT_TZ });

/**
 * Clave de día "YYYY-MM-DD" en la TZ del torneo (CDMX), para AGRUPAR partidos
 * por día de forma consistente con lo que muestran fmtDay/fmtDayLong.
 *
 * Importante: NO usar d.toISOString().slice(0,10) para agrupar — eso da la
 * fecha en UTC, que para partidos cerca de medianoche cae en un día distinto
 * al que se muestra (el del torneo), mezclando partidos bajo encabezados de
 * otro día. 'en-CA' produce el formato ISO "YYYY-MM-DD" y ordena bien.
 */
export const dayKey = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString('en-CA', { timeZone: TOURNAMENT_TZ });

/** "15 jun." — fecha corta sin día de la semana */
export const fmtShortDate = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), { day: '2-digit', month: 'short', timeZone: TOURNAMENT_TZ });

/** "lunes, 15 de junio" para el encabezado de hoy (igual que fmtDayLong, alias semántico) */
export const fmtTodayHeader = (d: Date | string | number = new Date(), locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', timeZone: TOURNAMENT_TZ });

/** "junio de 2026" — para perfil u otros contextos */
export const fmtMonthYear = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), { month: 'long', year: 'numeric', timeZone: TOURNAMENT_TZ });

/** "lun. 15 jun. 2026 · 18:00" — fecha completa con año */
export const fmtFullDateTime = (d: Date | string | number, locale?: string): string =>
  new Date(d).toLocaleDateString(activeLocale(locale), {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TOURNAMENT_TZ,
  });
