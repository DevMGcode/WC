import { Fixture, FixtureDetail, MatchEventScorer, Team, Tournament } from '@/types';
import { request } from './publicApi';

type RawTeam = Partial<Team> & {
  id?: number;
  name?: string;
  shortName?: string;
  fifaCode?: string;
  flagUrl?: string;
};

type RawFixture = Partial<FixtureDetail> & {
  id?: number;
  tournamentId?: number;
  tournamentName?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  kickoffAt?: string | Date;
  createdAt?: string | Date;
  providerUpdatedAt?: string | Date;
  status?: Fixture['status'] | string;
  stageName?: string;
  groupCode?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
  extraMinutes?: number | null;
  elapsedMinutes?: number | null;
  hostCity?: string;
  hostCountry?: string;
  stadiumName?: string;
  homeTeam?: RawTeam | string;
  awayTeam?: RawTeam | string;
  events?: FixtureDetail['events'];
  standing?: FixtureDetail['standing'];
  scorers?: MatchEventScorer[];
};

function normalizeTeam(
  team?: RawTeam,
  fallbackId = 0,
  fallbackName = 'Equipo',
  fallbackShortName = 'EQ'
): Team {
  // Devolvemos el nombre tal como llega (inglés de API-Football). La
  // traducción se aplica en los componentes que renderean el nombre, donde
  // sí tenemos acceso al `locale` activo vía `useLocale()`.
  const rawName = team?.name ?? fallbackName;
  return {
    id: team?.id ?? fallbackId,
    name: rawName,
    shortName: team?.shortName ?? team?.fifaCode ?? fallbackShortName,
    fifaCode: team?.fifaCode,
    flagUrl: team?.flagUrl,
  };
}

function normalizeStatus(status?: string): Fixture['status'] {
  const s = (status || 'SCHEDULED').toUpperCase();
  if (s === 'LIVE') return 'LIVE';
  if (s === 'FINISHED') return 'FINISHED';
  if (s === 'POSTPONED') return 'POSTPONED';
  if (s === 'CANCELLED') return 'CANCELLED' as Fixture['status'];
  return 'SCHEDULED';
}

function toDate(value?: string | Date): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function normalizeFixture(raw: RawFixture, fallbackIndex = 0, fallbackTournamentId?: number): FixtureDetail {
  const fixtureId = raw.id ?? fallbackIndex + 1;
  const homeTeamInput = typeof raw.homeTeam === 'string' ? { name: raw.homeTeam } : raw.homeTeam;
  const awayTeamInput = typeof raw.awayTeam === 'string' ? { name: raw.awayTeam } : raw.awayTeam;
  const homeTeam = normalizeTeam(
    homeTeamInput,
    raw.homeTeamId ?? fixtureId * 2 - 1,
    homeTeamInput?.name ?? 'Local',
    ('shortName' in (homeTeamInput ?? {}) ? (homeTeamInput as any).shortName : undefined) ?? 'LOC'
  );
  const awayTeam = normalizeTeam(
    awayTeamInput,
    raw.awayTeamId ?? fixtureId * 2,
    awayTeamInput?.name ?? 'Visitante',
    ('shortName' in (awayTeamInput ?? {}) ? (awayTeamInput as any).shortName : undefined) ?? 'VIS'
  );

  return {
    id: fixtureId,
    tournamentId: raw.tournamentId ?? fallbackTournamentId ?? 0,
    tournamentName: raw.tournamentName,
    stageId: raw.stageId,
    stageName: raw.stageName,
    groupStageId: raw.groupStageId,
    groupCode: raw.groupCode ?? undefined,
    homeTeamId: raw.homeTeamId ?? homeTeam.id,
    awayTeamId: raw.awayTeamId ?? awayTeam.id,
    kickoffAt: toDate(raw.kickoffAt),
    predictionLockedAt: raw.predictionLockedAt ? toDate(raw.predictionLockedAt) : undefined,
    status: normalizeStatus(raw.status),
    homeScore: raw.homeScore ?? undefined,
    awayScore: raw.awayScore ?? undefined,
    homePenalty: raw.homePenalty ?? null,
    awayPenalty: raw.awayPenalty ?? null,
    extraMinutes: raw.extraMinutes ?? undefined,
    elapsedMinutes: raw.elapsedMinutes ?? undefined,
    createdAt: toDate(raw.createdAt),
    providerUpdatedAt: raw.providerUpdatedAt ? toDate(raw.providerUpdatedAt) : undefined,
    homeTeam,
    awayTeam,
    hostCity: raw.hostCity,
    hostCountry: raw.hostCountry,
    stadiumName: raw.stadiumName,
    events: raw.events,
    standing: raw.standing,
    scorers: raw.scorers ?? [],
  };
}

// ── Tournament ──────────────────────────────────────────────────────────────

export async function getCurrentTournament(): Promise<Tournament | null> {
  try {
    const tournaments = await request<Tournament[] | { data?: Tournament[] }>('/tournaments');
    const list = Array.isArray(tournaments) ? tournaments : (tournaments as any)?.data ?? [];
    return (
      list.find((t: Tournament) => t.code === 'WC2026') ||
      list.find((t: Tournament) => t.name?.includes('World Cup')) ||
      list[0] ||
      null
    );
  } catch {
    return null;
  }
}

// ── Teams ───────────────────────────────────────────────────────────────────

export async function getTeams(): Promise<Team[]> {
  try {
    const response = await request<RawTeam[] | { data?: RawTeam[] }>('/teams');
    const list = Array.isArray(response) ? response : (response as any)?.data ?? [];
    return list.map((team: RawTeam, index: number) =>
      normalizeTeam(team, team.id ?? index + 1, team.name ?? `Equipo ${index + 1}`, team.shortName ?? 'EQ')
    );
  } catch {
    return [];
  }
}

// ── Fixtures ────────────────────────────────────────────────────────────────

export async function getTournamentFixtures(tournamentId: number): Promise<FixtureDetail[]> {
  try {
    const response = await request<RawFixture[] | { data?: RawFixture[] }>(
      `/tournaments/${tournamentId}/fixtures`
    );
    const list = Array.isArray(response) ? response : (response as any)?.data ?? [];
    return list.map((fixture: RawFixture, index: number) => normalizeFixture(fixture, index, tournamentId));
  } catch {
    return [];
  }
}

export async function getLiveFixtures(): Promise<FixtureDetail[]> {
  try {
    const response = await request<RawFixture[] | { data?: RawFixture[] }>(
      '/tournaments/fixtures/live'
    );
    const list = Array.isArray(response) ? response : (response as any)?.data ?? [];
    // El API siempre incluye tournamentId en cada fixture; no se necesita fallback hardcodeado
    return list.map((fixture: RawFixture, index: number) => normalizeFixture(fixture, index));
  } catch {
    return [];
  }
}

export async function getFixtureById(fixtureId: number): Promise<FixtureDetail | null> {
  try {
    const response = await request<RawFixture>(`/tournaments/fixtures/${fixtureId}`);
    // tournamentId viene siempre en la respuesta del API; no se necesita fallback hardcodeado
    return normalizeFixture(response, fixtureId - 1);
  } catch {
    return null;
  }
}

/**
 * Obtiene todos los fixtures del torneo activo, con filtro opcional por estado.
 * Primero busca el torneo WC2026 y luego trae sus fixtures.
 */
export async function getAllFixtures(status?: string): Promise<FixtureDetail[]> {
  try {
    const tournament = await getCurrentTournament();
    if (!tournament) return [];

    // Se pasa tournament.id para que normalizeFixture use el ID real de la BD
    const fixtures = await getTournamentFixtures(tournament.id);
    if (!status || status === 'ALL') return fixtures;
    return fixtures.filter((f) => f.status === status);
  } catch {
    return [];
  }
}

// ── Top scorers (para SSR de /scorers) ──────────────────────────────────────
export type PublicScorer = {
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
};

/**
 * Ranking de goleadores del torneo (endpoint público). Lo usa el server
 * component de /scorers para renderizar narrativa y lista indexables en SSR.
 */
export async function getTopScorers(limit = 10): Promise<PublicScorer[]> {
  try {
    const list = await request<PublicScorer[]>('/players/topscorers', { limit });
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// ── Groups ──────────────────────────────────────────────────────────────────

export async function getTournamentGroups(tournamentId: number): Promise<any[]> {
  try {
    const response = await request<any[] | { data?: any[] }>(`/tournaments/${tournamentId}/groups`);
    return Array.isArray(response) ? response : (response as any)?.data ?? [];
  } catch {
    return [];
  }
}

// ── Predictions (public) ────────────────────────────────────────────────────

export async function getUserPredictions(userId: number): Promise<any[]> {
  try {
    const response = await request<any[]>(`/api/v1/predictions/user/${userId}`);
    return Array.isArray(response) ? response : (response as any)?.data ?? [];
  } catch {
    return [];
  }
}

// ── Scores (public) ─────────────────────────────────────────────────────────

export async function getUserScore(userId: number, tournamentId: number): Promise<any> {
  try {
    return await request<any>(`/api/v1/scores/user/${tournamentId}`, { userId });
  } catch {
    return null;
  }
}

export async function getScoreHistory(userId: number, tournamentId: number): Promise<any[]> {
  try {
    const response = await request<any>(`/api/v1/scores/history/${tournamentId}`, { userId });
    return Array.isArray(response) ? response : (response as any)?.data ?? [];
  } catch {
    return [];
  }
}
