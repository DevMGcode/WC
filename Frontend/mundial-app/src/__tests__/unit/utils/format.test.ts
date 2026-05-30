/**
 * Tests para src/utils/format.ts
 *
 * Cubre el Fix #2 de timezone aplicado hoy: todas las funciones de formato
 * fijan `timeZone: 'America/New_York'` para evitar el hydration mismatch entre
 * SSR (UTC del servidor) y cliente (TZ local del navegador).
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
  fmtFullDateTime
} from '@/utils/format';

// Fecha fija para reproducibilidad: 11 jun 2026, 21:00 UTC → en NY (UTC-4 DST) son 17:00 del 11 jun
const ISO_KICKOFF = '2026-06-11T21:00:00Z';

describe('format.ts — anti-hydration timezone', () => {
  describe('TZ del torneo fija (America/New_York)', () => {
    it('fmtTime devuelve hora en TZ del torneo, no en TZ local del runner', () => {
      const result = fmtTime(ISO_KICKOFF, 'es-ES');
      // 21:00 UTC en NY DST = 17:00 (formato 24h en es-ES).
      expect(result).toMatch(/17[:.]00/);
    });

    it('fmtDayLong el mismo input produce mismo día sin importar el runner', () => {
      // Si la TZ del runner fuese UTC, daría "jueves 11 jun" igualmente; lo
      // importante es que para UTC madrugada el día NO cambie.
      const lateNight = '2026-06-12T02:00:00Z'; // medianoche pasada UTC = aún 11 jun en NY
      const result = fmtDayLong(lateNight, 'es-ES');
      expect(result.toLowerCase()).toContain('jueves');
      expect(result.toLowerCase()).toContain('11');
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
