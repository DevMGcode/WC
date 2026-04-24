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
  homeTeamId?: number;
  awayTeamId?: number;
  kickoffAt?: string | Date;
  createdAt?: string | Date;
  providerUpdatedAt?: string | Date;
  status?: Fixture['status'] | string;
  homeScore?: number;
  awayScore?: number;
  homeTeam?: RawTeam;
  awayTeam?: RawTeam;
  events?: FixtureDetail['events'];
  standing?: FixtureDetail['standing'];
  stadiumName?: string;
  attendance?: number;
  matchDay?: string;
};

function normalizeTeam(team?: RawTeam, fallbackId = 0, fallbackName = 'Equipo', fallbackShortName = 'EQ'): Team {
  return {
    id: team?.id ?? fallbackId,
    name: team?.name ?? fallbackName,
    shortName: team?.shortName ?? team?.fifaCode ?? fallbackShortName,
    fifaCode: team?.fifaCode,
    flagUrl: team?.flagUrl,
  };
}

function normalizeStatus(status?: string): Fixture['status'] {
  const normalizedStatus = (status || 'SCHEDULED').toUpperCase();

  if (normalizedStatus === 'LIVE') return 'LIVE';
  if (normalizedStatus === 'FINISHED') return 'FINISHED';
  if (normalizedStatus === 'POSTPONED') return 'POSTPONED';
  if (normalizedStatus === 'CANCELLED') return 'CANCELLED' as Fixture['status'];

  return 'SCHEDULED';
}

function toDate(value?: string | Date): Date {
  if (!value) {
    return new Date();
  }

  return value instanceof Date ? value : new Date(value);
}

function normalizeFixture(raw: RawFixture, fallbackIndex = 0): FixtureDetail {
  const fixtureId = raw.id ?? fallbackIndex + 1;
  const homeTeam = normalizeTeam(
    raw.homeTeam,
    raw.homeTeamId ?? fixtureId * 2 - 1,
    raw.homeTeam?.name ?? 'Local',
    raw.homeTeam?.shortName ?? 'LOC'
  );
  const awayTeam = normalizeTeam(
    raw.awayTeam,
    raw.awayTeamId ?? fixtureId * 2,
    raw.awayTeam?.name ?? 'Visitante',
    raw.awayTeam?.shortName ?? 'VIS'
  );

  return {
    id: fixtureId,
    tournamentId: raw.tournamentId ?? 1,
    stageId: raw.stageId,
    groupStageId: raw.groupStageId,
    homeTeamId: raw.homeTeamId ?? homeTeam.id,
    awayTeamId: raw.awayTeamId ?? awayTeam.id,
    kickoffAt: toDate(raw.kickoffAt),
    status: normalizeStatus(raw.status),
    homeScore: raw.homeScore,
    awayScore: raw.awayScore,
    createdAt: toDate(raw.createdAt),
    providerUpdatedAt: raw.providerUpdatedAt ? toDate(raw.providerUpdatedAt) : undefined,
    homeTeam,
    awayTeam,
    events: raw.events,
    standing: raw.standing,
  };
}

export async function getCurrentTournament(): Promise<Tournament | null> {
  try {
    const tournaments = await request<Tournament[] | { data?: Tournament[] }>('/tournaments');
    const list = Array.isArray(tournaments) ? tournaments : tournaments?.data ?? [];
    return list[0] ?? null;
  } catch {
    return null;
  }
}

export async function getLiveFixtures(): Promise<FixtureDetail[]> {
  try {
    const response = await request<RawFixture[] | { data?: RawFixture[] }>('/tournaments/fixtures/live');
    const list = Array.isArray(response) ? response : response?.data ?? [];
    return list.map((fixture, index) => normalizeFixture(fixture, index));
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