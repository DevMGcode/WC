/**
 * Hooks de datos del torneo con TanStack Query.
 *
 * Beneficios vs useEffect+fetch manual:
 *  - Caché automático: navegar a Fixtures 10 veces → 1 solo fetch real
 *  - staleTime 30s: datos se consideran frescos, no re-fetch en cada render
 *  - gcTime 5min: datos permanecen en memoria al navegar entre páginas
 *  - refetchOnWindowFocus: false → no re-fetch al cambiar de pestaña
 *  - Loading/error states incluidos sin useState adicional
 *  - initialData: datos del servidor (RSC) hidratados directamente → 0 loading
 */

import { useQuery } from '@tanstack/react-query';
import {
  getCurrentTournament,
  getAllFixtures,
  getTournamentFixtures,
  getTournamentGroups,
  getTeams,
  getLiveFixtures,
  getFixtureById,
  getUserPredictions,
  getUserScore,
  getScoreHistory,
} from '@/services/publicTournament';
import { scoringService, leagueService } from '@/services/predictions';
import type { FixtureDetail, Tournament } from '@/types';
import {
  STALE,
  LIVE_REFETCH_INTERVAL_MS,
  RANKING_PAGE,
} from '@/constants/tournament';

const fetchJson = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).then(d => d?.data ?? null);

// ─── Query Keys ────────────────────────────────────────────────────────────
// Claves únicas para el caché. Cambiando el key se invalida el caché.
export const QUERY_KEYS = {
  tournament:       ['tournament']                      as const,
  fixtures:         (status?: string) => ['fixtures', status ?? 'all'] as const,
  fixturesLive:     ['fixtures', 'live']                as const,
  fixtureById:      (id: number) => ['fixture', id]     as const,
  tournamentFixtures: (tid: number) => ['tournament', tid, 'fixtures'] as const,
  groups:           (tid: number) => ['tournament', tid, 'groups']    as const,
  teams:            ['teams']                           as const,
  topScorers:       ['stats', 'topscorers']             as const,
  topAssists:       ['stats', 'topassists']             as const,
  userPredictions:  (userId: number) => ['predictions', 'user', userId] as const,
  userScore:        (userId: number, tid: number) => ['scores', 'user', userId, tid] as const,
  scoreHistory:     (userId: number, tid: number) => ['scores', 'history', userId, tid] as const,
  globalRanking:    (tid: number, pageSize: number) => ['ranking', 'global', tid, pageSize] as const,
  userLeagues:      (userId: number) => ['leagues', 'user', userId, 'withRankings'] as const,
} as const;

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Torneo actual — se cachea 10 minutos (no cambia durante una sesión) */
export function useCurrentTournament(initialData?: Tournament | null) {
  return useQuery({
    queryKey: QUERY_KEYS.tournament,
    queryFn:  getCurrentTournament,
    staleTime: STALE.tournament,
    ...(initialData != null ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

/** Todos los fixtures, opcionalmente filtrados por status.
 *  Acepta `initialData` del RSC para hidratación sin spinner.
 *  Acepta `refetchInterval` para polling en vivo (p.ej. LIVE_REFETCH_INTERVAL_MS). */
export function useAllFixtures(status?: string, initialData?: FixtureDetail[], refetchInterval?: number | false) {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures(status),
    queryFn:  () => getAllFixtures(status),
    ...(refetchInterval !== undefined ? { refetchInterval } : {}),
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

/** Fixtures en vivo — staleTime corto para datos frescos */
export function useLiveFixtures() {
  return useQuery({
    queryKey: QUERY_KEYS.fixturesLive,
    queryFn:  getLiveFixtures,
    staleTime:       STALE.live,
    refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  });
}

/** Goleadores del torneo — endpoint público, cachea 5 min */
export function useTopScorers() {
  return useQuery({
    queryKey: QUERY_KEYS.topScorers,
    queryFn:  () => fetchJson('/api/v1/public/players/topscorers'),
    staleTime: STALE.scorers,
  });
}

/** Asistencias del torneo — endpoint público, cachea 5 min */
export function useTopAssists() {
  return useQuery({
    queryKey: QUERY_KEYS.topAssists,
    queryFn:  () => fetchJson('/api/v1/public/players/topassists'),
    staleTime: STALE.scorers,
  });
}

/** Fixture específico por ID */
export function useFixtureById(fixtureId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.fixtureById(fixtureId ?? 0),
    queryFn:  () => getFixtureById(fixtureId!),
    enabled:  fixtureId != null,
    staleTime: STALE.scores,
  });
}

/** Fixtures de un torneo específico.
 *  Acepta `initialData` del RSC para hidratación sin spinner. */
export function useTournamentFixtures(tournamentId: number | null, initialData?: FixtureDetail[]) {
  return useQuery({
    queryKey: QUERY_KEYS.tournamentFixtures(tournamentId ?? 0),
    queryFn:  () => getTournamentFixtures(tournamentId!),
    enabled:  tournamentId != null,
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

/** Grupos de un torneo.
 *  Acepta `initialData` del RSC para hidratación sin spinner. */
export function useTournamentGroups(tournamentId: number | null, initialData?: any[]) {
  return useQuery({
    queryKey: QUERY_KEYS.groups(tournamentId ?? 0),
    queryFn:  () => getTournamentGroups(tournamentId!),
    enabled:  tournamentId != null,
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

/** Todos los equipos */
export function useTeams() {
  return useQuery({
    queryKey: QUERY_KEYS.teams,
    queryFn:  getTeams,
    staleTime: STALE.teams,
  });
}

/** Predicciones de un usuario */
export function useUserPredictions(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userPredictions(userId ?? 0),
    queryFn:  () => getUserPredictions(userId!),
    enabled:  userId != null,
  });
}

/** Puntaje del usuario en el torneo (endpoint público con userId como query param) */
export function useUserScore(userId: number | null, tournamentId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userScore(userId ?? 0, tournamentId ?? 0),
    queryFn:  () => getUserScore(userId!, tournamentId!),
    enabled:  userId != null && tournamentId != null,
    staleTime: STALE.scores,
  });
}

/** Historial de puntajes por predicción */
export function useScoreHistory(userId: number | null, tournamentId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.scoreHistory(userId ?? 0, tournamentId ?? 0),
    queryFn:  () => getScoreHistory(userId!, tournamentId!),
    enabled:  userId != null && tournamentId != null,
    staleTime: STALE.scores,
  });
}

/** Ranking global del torneo */
export function useGlobalRanking(tournamentId: number | null, pageSize = RANKING_PAGE.home) {
  return useQuery({
    queryKey: QUERY_KEYS.globalRanking(tournamentId ?? 0, pageSize),
    queryFn:  async () => {
      const response = await scoringService.getGlobalRanking(tournamentId!, { page: 0, pageSize });
      return (response as any)?.data ?? [];
    },
    enabled:  tournamentId != null,
    staleTime: STALE.ranking,
  });
}

/** Ligas del usuario con ranking de cada liga (resuelve N+1 en el cliente) */
export function useUserLeaguesWithRankings(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userLeagues(userId ?? 0),
    queryFn:  async () => {
      if (!userId) return [];
      const leagues = await leagueService.getUserLeagues(userId);
      const leaguesWithRanking = await Promise.all(
        leagues.map(async (league: any) => {
          try {
            const ranking = await leagueService.getLeagueRanking(league.id);
            const myLeagueScore = (ranking as any[]).find((r: any) => Number(r.userId) === userId);
            const leader = (ranking as any[])[0];
            return {
              id: league.id, name: league.name, code: league.code,
              memberCount: league.memberCount, maxMembers: league.maxMembers,
              myRank: myLeagueScore?.rankPosition || 0,
              myPoints: myLeagueScore?.userScore?.totalPoints || 0,
              leader: {
                name: leader?.userId || 'N/A',
                points: leader?.userScore?.totalPoints || 0,
              },
            };
          } catch { return null; }
        })
      );
      return leaguesWithRanking.filter(Boolean);
    },
    enabled:  userId != null,
    staleTime: STALE.leagues,
  });
}
