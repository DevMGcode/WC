/**
 * Constantes globales del torneo y configuración de caché.
 *
 * Centraliza todos los "magic values" que antes estaban dispersos
 * en home/page.tsx, login/page.tsx, fixtures/page.tsx, hooks, etc.
 *
 * USO:
 *   import { WORLD_CUP_START, MATCH_DURATION_MS, STALE } from '@/constants/tournament';
 */

// ─── Torneo ─────────────────────────────────────────────────────────────────

/** Código oficial del torneo en el backend */
export const TOURNAMENT_CODE = 'WC2026';

/** Fecha y hora de inicio del Mundial 2026 (UTC-6, Ciudad de México) */
export const WORLD_CUP_START = new Date('2026-06-11T00:00:00');

/** Duración estimada de un partido completo (incluyendo tiempo extra) */
export const MATCH_DURATION_MS = 120 * 60 * 1000; // 2 horas en ms

// ─── Tiempo en milisegundos ─────────────────────────────────────────────────
// Usados para el countdown y cálculos de tiempo

export const MS = {
  second:  1_000,
  minute:  60_000,
  hour:    3_600_000,
  day:     86_400_000,
} as const;

// ─── Caché TanStack Query (staleTime en ms) ──────────────────────────────────
// Cuánto tiempo se considera "fresco" un dato antes de re-fetchear.
// Valores más altos = menos requests, datos potencialmente más viejos.

export const STALE = {
  /** Fixtures en vivo — se vencen rápido para mostrar datos actualizados */
  live:       15_000,         // 15 segundos

  /** Scores, predicciones — datos que cambian con cierta frecuencia */
  scores:     30_000,         // 30 segundos

  /** Ranking global — actualización moderada */
  ranking:    60_000,         // 1 minuto

  /** Torneo y grupos — cambian poco durante la jornada */
  tournament: 10 * 60_000,    // 10 minutos

  /** Ligas privadas */
  leagues:    2 * 60_000,     // 2 minutos

  /** Equipos — casi nunca cambian durante el torneo */
  teams:      30 * 60_000,    // 30 minutos

  /** Goleadores/asistencias — cambian solo cuando hay partidos */
  scorers:    5 * 60_000,     // 5 minutos
} as const;

/** Tiempo que los datos permanecen en memoria al navegar entre páginas */
export const GC_TIME_MS = 5 * 60_000; // 5 minutos

/** Intervalo de auto-refetch para fixtures en vivo */
export const LIVE_REFETCH_INTERVAL_MS = 30_000; // 30 segundos

// ─── Paginación ──────────────────────────────────────────────────────────────

export const RANKING_PAGE = {
  /** Tamaño del ranking en el home (widget pequeño) */
  home:        5,
  /** Tamaño del ranking en la página de predicciones (tabla completa) */
  predictions: 10,
} as const;
