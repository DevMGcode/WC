import { apiClient } from './api';
import {
  Prediction,
  PredictionScore,
  UserTournamentScore,
  PrivateLeague,
  PrivateLeagueMember,
  PrivateLeagueScore,
  UserStats,
  PaginatedResponse,
} from '@/types';

export const predictionService = {
  async createPrediction(data: {
    fixtureId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }): Promise<Prediction> {
    return apiClient.post<Prediction>('/predictions', data);
  },

  async updatePrediction(
    predictionId: string,
    data: {
      predictedHomeScore: number;
      predictedAwayScore: number;
    }
  ): Promise<Prediction> {
    return apiClient.put<Prediction>(`/predictions/${predictionId}`, data);
  },

  async getPrediction(predictionId: string): Promise<Prediction> {
    return apiClient.get<Prediction>(`/predictions/${predictionId}`);
  },

  async getUserPredictions(tournamentId: number): Promise<Prediction[]> {
    return apiClient.get<Prediction[]>('/predictions', { tournamentId });
  },

  async getUserPredictionForFixture(fixtureId: number): Promise<Prediction | null> {
    try {
      return await apiClient.get<Prediction>(`/predictions/fixture/${fixtureId}`);
    } catch (error) {
      return null;
    }
  },

  async deletePrediction(predictionId: string): Promise<void> {
    return apiClient.delete(`/predictions/${predictionId}`);
  },
};

export const scoringService = {
  async getUserScore(tournamentId: number): Promise<UserTournamentScore> {
    return apiClient.get<UserTournamentScore>(`/scores/user/${tournamentId}`);
  },

  async getUserScoreHistory(tournamentId: number): Promise<PredictionScore[]> {
    return apiClient.get<PredictionScore[]>(`/scores/history/${tournamentId}`);
  },

  async getGlobalRanking(
    tournamentId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<UserTournamentScore>> {
    return apiClient.get<PaginatedResponse<UserTournamentScore>>(
      `/rankings/global/${tournamentId}`,
      params
    );
  },

  async getUserRankPosition(tournamentId: number): Promise<{ rank: number; totalUsers: number }> {
    return apiClient.get<{ rank: number; totalUsers: number }>(
      `/rankings/user/${tournamentId}/position`
    );
  },
};

export const leagueService = {
  async createLeague(data: {
    name: string;
    tournamentId: number;
    description?: string;
    maxMembers?: number;
  }): Promise<PrivateLeague> {
    return apiClient.post<PrivateLeague>('/leagues', data);
  },

  async getLeague(leagueId: string): Promise<PrivateLeague> {
    return apiClient.get<PrivateLeague>(`/leagues/${leagueId}`);
  },

  async getUserLeagues(): Promise<PrivateLeague[]> {
    return apiClient.get<PrivateLeague[]>('/leagues/user');
  },

  async getLeagueMembers(leagueId: string): Promise<PrivateLeagueMember[]> {
    return apiClient.get<PrivateLeagueMember[]>(`/leagues/${leagueId}/members`);
  },

  async joinLeague(leagueCode: string): Promise<PrivateLeagueMember> {
    return apiClient.post<PrivateLeagueMember>('/leagues/join', { leagueCode });
  },

  async leaveLeague(leagueId: string): Promise<void> {
    return apiClient.post(`/leagues/${leagueId}/leave`, {});
  },

  async getLeagueRanking(leagueId: string): Promise<PrivateLeagueScore[]> {
    return apiClient.get<PrivateLeagueScore[]>(`/leagues/${leagueId}/ranking`);
  },

  async updateLeague(
    leagueId: string,
    data: { name?: string; description?: string }
  ): Promise<PrivateLeague> {
    return apiClient.put<PrivateLeague>(`/leagues/${leagueId}`, data);
  },

  async deleteLeague(leagueId: string): Promise<void> {
    return apiClient.delete(`/leagues/${leagueId}`);
  },
};

export const userStatsService = {
  async getUserStats(): Promise<UserStats> {
    return apiClient.get<UserStats>('/users/stats');
  },

  async getUserStatsByTournament(tournamentId: number): Promise<UserStats> {
    return apiClient.get<UserStats>(`/users/stats/${tournamentId}`);
  },
};

export default {
  predictionService,
  scoringService,
  leagueService,
  userStatsService,
};
