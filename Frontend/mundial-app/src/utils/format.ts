/**
 * Utilidades de formateo de fechas centralizadas.
 * Todas las funciones aceptan Date | string | number.
 * Locale por defecto: 'es-ES'.
 */

const LOCALE = 'es-ES';

/** "18:00" */
export const fmtTime = (d: Date | string | number): string =>
  new Date(d).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });

/** "lun. 15 jun." */
export const fmtDay = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });

/** "lun. 15 jun. · 18:00" */
export const fmtDate = (d: Date | string | number): string => {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    dt.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
  );
};

/** "lunes, 15 de junio" — cabecera de grupo en fixtures */
export const fmtDayLong = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

/** "15 jun." — fecha corta sin día de la semana */
export const fmtShortDate = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' });

/** "lunes, 15 de junio" para el encabezado de hoy (igual que fmtDayLong, alias semántico) */
export const fmtTodayHeader = (d: Date | string | number = new Date()): string =>
  new Date(d).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

/** "junio de 2026" — para perfil u otros contextos */
export const fmtMonthYear = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });

/** "lun. 15 jun. 2026 · 18:00" — fecha completa con año */
export const fmtFullDateTime = (d: Date | string | number): string =>
  new Date(d).toLocaleDateString(LOCALE, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
