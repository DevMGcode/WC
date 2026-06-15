/**
 * Tests para src/utils/format.ts
 *
 * Cubre el fix de timezone: todas las funciones de formato fijan
 * `timeZone: 'America/Mexico_City'` (CDMX, sede del partido inaugural) para
 * evitar el hydration mismatch entre SSR (UTC del servidor) y cliente (TZ
 * local del navegador), y para que la fecha mostrada sea la de la sede.
 *
 * También valida i18n: ES vs EN producen labels traducidos por el browser.
 */
import {
  fmtTime,
  fmtDay,
  fmtDate,
  fmtDayLong,
  fmtShortDate,
  fmtTodayHeader,
  fmtMonthYear,
  fmtFullDateTime,
  dayKey
} from '@/utils/format';

// Fecha fija para reproducibilidad: 11 jun 2026, 21:00 UTC → en CDMX (UTC-6) son 15:00 del 11 jun
const ISO_KICKOFF = '2026-06-11T21:00:00Z';

describe('format.ts — anti-hydration timezone', () => {
  describe('TZ del torneo fija (America/Mexico_City)', () => {
    it('fmtTime devuelve hora en TZ del torneo, no en TZ local del runner', () => {
      const result = fmtTime(ISO_KICKOFF, 'es-ES');
      // 21:00 UTC en CDMX (UTC-6) = 15:00 (formato 24h en es-ES).
      expect(result).toMatch(/15[:.]00/);
    });

    it('fmtDayLong el mismo input produce mismo día sin importar el runner', () => {
      // 02:00 UTC del 12 jun = 20:00 del 11 jun en CDMX → debe seguir siendo 11 jun.
      const lateNight = '2026-06-12T02:00:00Z';
      const result = fmtDayLong(lateNight, 'es-ES');
      expect(result.toLowerCase()).toContain('jueves');
      expect(result.toLowerCase()).toContain('11');
    });
  });

  describe('dayKey — agrupación por día en TZ del torneo (CDMX)', () => {
    it('un partido de madrugada UTC se agrupa en el día del torneo, no en UTC', () => {
      // 01:00 UTC del 16 jun = 19:00 del 15 jun en CDMX → debe agruparse en el 15.
      expect(dayKey('2026-06-16T01:00:00Z')).toBe('2026-06-15');
    });

    it('un partido de mediodía cae en su propio día', () => {
      // 18:00 UTC del 16 jun = 12:00 del 16 jun en CDMX → día 16.
      expect(dayKey('2026-06-16T18:00:00Z')).toBe('2026-06-16');
    });

    it('dos partidos que se MUESTRAN el mismo día comparten la misma clave', () => {
      // Ambos caen el 15 jun en CDMX aunque uno sea 16 jun en UTC.
      const a = dayKey('2026-06-16T01:00:00Z'); // 19:00 del 15 CDMX
      const b = dayKey('2026-06-15T23:00:00Z'); // 17:00 del 15 CDMX
      expect(a).toBe(b);
      expect(a).toBe('2026-06-15');
    });

    it('la clave es consistente con el día que muestra fmtDay', () => {
      // El bug original: la clave (UTC) y la etiqueta (CDMX) no coincidían.
      const iso = '2026-06-16T03:00:00Z'; // 21:00 del 15 en CDMX
      expect(dayKey(iso)).toBe('2026-06-15');
      expect(fmtDay(iso, 'es-ES').toLowerCase()).toContain('15');
    });
  });

  describe('Localización ES vs EN', () => {
    it('fmtDayLong en español incluye día de semana y mes en español', () => {
      const result = fmtDayLong(ISO_KICKOFF, 'es-ES');
      expect(result.toLowerCase()).toMatch(/jueves|junio/);
    });

    it('fmtDayLong en inglés incluye día y mes en inglés', () => {
      const result = fmtDayLong(ISO_KICKOFF, 'en-US');
      expect(result.toLowerCase()).toMatch(/thursday|june/);
    });

    it('fmtMonthYear ES devuelve "junio de 2026"', () => {
      const result = fmtMonthYear(ISO_KICKOFF, 'es-ES');
      expect(result.toLowerCase()).toContain('junio');
      expect(result).toContain('2026');
    });

    it('fmtMonthYear EN devuelve "June 2026"', () => {
      const result = fmtMonthYear(ISO_KICKOFF, 'en-US');
      expect(result).toContain('June');
      expect(result).toContain('2026');
    });
  });

  describe('Inputs admitidos: Date | string | number', () => {
    it('acepta string ISO', () => {
      expect(() => fmtShortDate(ISO_KICKOFF, 'es-ES')).not.toThrow();
    });

    it('acepta Date', () => {
      expect(() => fmtShortDate(new Date(ISO_KICKOFF), 'es-ES')).not.toThrow();
    });

    it('acepta number (epoch ms)', () => {
      expect(() => fmtShortDate(new Date(ISO_KICKOFF).getTime(), 'es-ES')).not.toThrow();
    });
  });

  describe('fmtFullDateTime incluye año y hora', () => {
    it('incluye 2026 y hora en formato 24h', () => {
      const result = fmtFullDateTime(ISO_KICKOFF, 'es-ES');
      expect(result).toContain('2026');
      expect(result).toMatch(/\d{2}[:.]\d{2}/);
    });
  });

  describe('fmtTodayHeader con default = hoy', () => {
    it('sin argumentos devuelve un string con día semana, día, mes', () => {
      const result = fmtTodayHeader(undefined, 'es-ES');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });
  });

  describe('Determinismo de SSR vs cliente (el bug fixed)', () => {
    it('fmtDayLong devuelve el mismo string en llamadas sucesivas', () => {
      const r1 = fmtDayLong(ISO_KICKOFF, 'es-ES');
      const r2 = fmtDayLong(ISO_KICKOFF, 'es-ES');
      expect(r1).toBe(r2);
    });

    it('fmtTime devuelve la misma hora en llamadas sucesivas', () => {
      const r1 = fmtTime(ISO_KICKOFF, 'es-ES');
      const r2 = fmtTime(ISO_KICKOFF, 'es-ES');
      expect(r1).toBe(r2);
    });
  });
});
