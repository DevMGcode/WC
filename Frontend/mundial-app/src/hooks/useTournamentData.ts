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

/** Fetch que añade el JWT si el usuario está autenticado (para que el backend conozca el plan). */
const fetchJsonAuth = (url: string) => {
  const headers: HeadersInit = {};
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('authToken');
    if (token) (headers as Record<string,string>).Authorization = `Bearer ${token}`;
  }
  return fetch(url, { headers }).then(r => r.ok ? r.json() : null).then(d => d?.data ?? null);
};

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
  topScorers:       (limit?: number, teamId?: number) => ['stats', 'topscorers', limit ?? 'def', teamId ?? 'all'] as const,
  topAssists:       (limit?: number, teamId?: number) => ['stats', 'topassists', limit ?? 'def', teamId ?? 'all'] as const,
  teamSquad:        (teamId: number) => ['team', teamId, 'squad'] as const,
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
    refetchOnWindowFocus: true,
    ...(refetchInterval !== undefined ? { refetchInterval } : {}),
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

/** Fixtures en vivo — WebSocket actualiza el caché en tiempo real.
 *  60s de polling HTTP como fallback si WebSocket no conecta. */
export function useLiveFixtures() {
  return useQuery({
    queryKey: QUERY_KEYS.fixturesLive,
    queryFn:  getLiveFixtures,
    staleTime:       STALE.live,
    refetchInterval: 60_000,
  });
}

/**
 * Goleadores del torneo. Endpoint soft-auth:
 *   - Anónimo o Free → top 10
 *   - Premium → hasta 50 + filtro opcional por equipo
 * Manda el JWT si el usuario está logueado.
 */
export function useTopScorers(opts?: { limit?: number; teamId?: number }) {
  const qs = new URLSearchParams();
  if (opts?.limit)  qs.set('limit',  String(opts.limit));
  if (opts?.teamId) qs.set('teamId', String(opts.teamId));
  const suffix = qs.toString() ? `?${qs}` : '';
  return useQuery({
    queryKey: QUERY_KEYS.topScorers(opts?.limit, opts?.teamId),
    queryFn:  () => fetchJsonAuth(`/api/v1/public/players/topscorers${suffix}`),
    staleTime: STALE.scorers,
  });
}

/**
 * Plantilla nacional de un equipo. Endpoint soft-auth en backend:
 *   - Free / Anónimo → 11 jugadores
 *   - Premium        → plantilla completa
 *
 * NOTA: API-Football no expone "lista oficial del Mundial" — devuelve la
 * plantilla actual del seleccionado nacional. Se aclara al usuario en el
 * tooltip del modal.
 */
export interface SquadPlayer {
  teamId: number;
  teamName: string;
  playerId: number;
  playerName: string;
  shirtNumber: number | null;
  position: string | null;
  age: number | null;
  photoUrl: string | null;
}
export function useTeamSquad(teamId: number | null, enabled = true) {
  return useQuery<SquadPlayer[] | null>({
    queryKey: teamId ? QUERY_KEYS.teamSquad(teamId) : ['team', 'none', 'squad'],
    queryFn:  () => fetchJsonAuth(`/api/v1/public/teams/${teamId}/squad`),
    staleTime: 1000 * 60 * 30, // 30 min: la plantilla cambia poco día a día
    enabled: enabled && teamId != null,
  });
}

/** Asistencias del torneo — exclusivo Premium. Pasa `enabled: false` para usuarios Free. */
export function useTopAssists(opts?: { limit?: number; teamId?: number; enabled?: boolean }) {
  const qs = new URLSearchParams();
  if (opts?.limit)  qs.set('limit',  String(opts.limit));
  if (opts?.teamId) qs.set('teamId', String(opts.teamId));
  const suffix = qs.toString() ? `?${qs}` : '';
  return useQuery({
    queryKey: QUERY_KEYS.topAssists(opts?.limit, opts?.teamId),
    queryFn:  () => fetchJsonAuth(`/api/v1/public/players/topassists${suffix}`),
    staleTime: STALE.scorers,
    enabled:   opts?.enabled !== false,
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
    refetchOnWindowFocus: true,
    // Refresca el estado de los partidos (LIVE → FINALIZADO, marcadores) sin que el
    // usuario tenga que apretar F5. Solo poll mientras la pestaña está activa
    // (refetchIntervalInBackground es false por defecto).
    refetchInterval: 60_000,
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

/** Ranking global del torneo — exclusivo Premium. Requiere isPremium=true para disparar el fetch. */
export function useGlobalRanking(tournamentId: number | null, pageSize: number = RANKING_PAGE.home, isPremium: boolean = false) {
  return useQuery({
    queryKey: QUERY_KEYS.globalRanking(tournamentId ?? 0, pageSize),
    queryFn:  async () => {
      const response = await scoringService.getGlobalRanking(tournamentId!, { page: 0, pageSize });
      return (response as any)?.data ?? [];
    },
    enabled:  tournamentId != null && isPremium,
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
              myPoints: myLeagueScore?.totalPoints ?? 0,
              leader: {
                name: leader?.fullName || leader?.username || 'N/A',
                points: leader?.totalPoints ?? 0,
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
