import { Fixture, FixtureDetail, Team, Tournament } from '@/types';
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
  hostCity?: string;
  hostCountry?: string;
  stadiumName?: string;
  homeTeam?: RawTeam | string;
  awayTeam?: RawTeam | string;
  events?: FixtureDetail['events'];
  standing?: FixtureDetail['standing'];
};

function normalizeTeam(
  team?: RawTeam,
  fallbackId = 0,
  fallbackName = 'Equipo',
  fallbackShortName = 'EQ'
): Team {
  return {
    id: team?.id ?? fallbackId,
    name: team?.name ?? fallbackName,
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

function normalizeFixture(raw: RawFixture, fallbackIndex = 0): FixtureDetail {
  const fixtureId = raw.id ?? fallbackIndex + 1;
  const homeTeamInput = typeof raw.homeTeam === 'string' ? { name: raw.homeTeam } : raw.homeTeam;
  const awayTeamInput = typeof raw.awayTeam === 'string' ? { name: raw.awayTeam } : raw.awayTeam;
  const homeTeam = normalizeTeam(
    homeTeamInput,
    raw.homeTeamId ?? fixtureId * 2 - 1,
    homeTeamInput?.name ?? 'Local',
    homeTeamInput?.shortName ?? 'LOC'
  );
  const awayTeam = normalizeTeam(
    awayTeamInput,
    raw.awayTeamId ?? fixtureId * 2,
    awayTeamInput?.name ?? 'Visitante',
    awayTeamInput?.shortName ?? 'VIS'
  );

  return {
    id: fixtureId,
    tournamentId: raw.tournamentId ?? 1,
    tournamentName: raw.tournamentName,
    stageId: raw.stageId,
    stageName: raw.stageName,
    groupStageId: raw.groupStageId,
    groupCode: raw.groupCode ?? undefined,
    homeTeamId: raw.homeTeamId ?? homeTeam.id,
    awayTeamId: raw.awayTeamId ?? awayTeam.id,
    kickoffAt: toDate(raw.kickoffAt),
    status: normalizeStatus(raw.status),
    homeScore: raw.homeScore ?? undefined,
    awayScore: raw.awayScore ?? undefined,
    createdAt: toDate(raw.createdAt),
    providerUpdatedAt: raw.providerUpdatedAt ? toDate(raw.providerUpdatedAt) : undefined,
    homeTeam,
    awayTeam,
    hostCity: raw.hostCity,
    hostCountry: raw.hostCountry,
    stadiumName: raw.stadiumName,
    events: raw.events,
    standing: raw.standing,
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
    return list.map((fixture: RawFixture, index: number) => normalizeFixture(fixture, index));
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
    return list.map((fixture: RawFixture, index: number) => normalizeFixture(fixture, index));
  } catch {
    return [];
  }
}

export async function getFixtureById(fixtureId: number): Promise<FixtureDetail | null> {
  try {
    const response = await request<RawFixture>(`/tournaments/fixtures/${fixtureId}`);
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

    const fixtures = await getTournamentFixtures(tournament.id);
    if (!status || status === 'ALL') return fixtures;
    return fixtures.filter((f) => f.status === status);
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
    const response = await request<any[]>(`/predictions/user/${userId}`);
    return Array.isArray(response) ? response : (response as any)?.data ?? [];
  } catch {
    return [];
  }
}
