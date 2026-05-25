import { apiClient } from './api';
import { Tournament, Team, Fixture, FixtureDetail, GroupStage, Standing, PaginatedResponse } from '@/types';

export const tournamentService = {
  async getTournament(tournamentId: number): Promise<Tournament> {
    return apiClient.get<Tournament>(`/tournaments/${tournamentId}`);
  },

  async getCurrentTournament(): Promise<Tournament> {
    return apiClient.get<Tournament>('/tournaments/current');
  },

  async listTournaments(): Promise<Tournament[]> {
    return apiClient.get<Tournament[]>('/tournaments');
  },
};

export const teamService = {
  async getTeam(teamId: number): Promise<Team> {
    return apiClient.get<Team>(`/teams/${teamId}`);
  },

  async listTeams(tournamentId?: number): Promise<Team[]> {
    return apiClient.get<Team[]>('/teams', { tournamentId });
  },

  async searchTeams(query: string): Promise<Team[]> {
    return apiClient.get<Team[]>('/teams/search', { q: query });
  },
};

export const fixtureService = {
  async getFixture(fixtureId: number): Promise<FixtureDetail> {
    return apiClient.get<FixtureDetail>(`/fixtures/${fixtureId}`);
  },

  async listFixtures(params?: {
    tournamentId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Fixture>> {
    return apiClient.get<PaginatedResponse<Fixture>>('/fixtures', params);
  },

  async getUpcomingFixtures(limit?: number): Promise<Fixture[]> {
    return apiClient.get<Fixture[]>('/fixtures/upcoming', { limit });
  },

  async getFinishedFixtures(limit?: number): Promise<Fixture[]> {
    return apiClient.get<Fixture[]>('/fixtures/finished', { limit });
  },

  async getFixturesByTeam(teamId: number, tournamentId?: number): Promise<Fixture[]> {
    return apiClient.get<Fixture[]>(`/fixtures/team/${teamId}`, { tournamentId });
  },
};

export const groupService = {
  async getGroup(groupId: number): Promise<GroupStage> {
    return apiClient.get<GroupStage>(`/groups/${groupId}`);
  },

  async getGroupsByTournament(tournamentId: number): Promise<GroupStage[]> {
    return apiClient.get<GroupStage[]>(`/tournaments/${tournamentId}/groups`);
  },

  async getGroupStandings(groupId: number): Promise<Standing[]> {
    // Endpoint canonico segun documentacion del proyecto
    return apiClient.get<Standing[]>(`/standings/group/${groupId}`);
  },
};

export const standingService = {
  async getStandingByGroup(groupId: number): Promise<Standing[]> {
    return apiClient.get<Standing[]>(`/standings/group/${groupId}`);
  },

  async getStandingByTournament(tournamentId: number): Promise<Standing[]> {
    return apiClient.get<Standing[]>(`/standings/tournament/${tournamentId}`);
  },
};

export default {
  tournamentService,
  teamService,
  fixtureService,
  groupService,
  standingService,
};
