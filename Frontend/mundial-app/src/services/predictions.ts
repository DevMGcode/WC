import { apiClient } from './api';
import {
  Prediction,
  PredictionScore,
  UserTournamentScore,
  PrivateLeague,
  PrivateLeagueMember,
  PrivateLeagueScore,
  PaginatedResponse,
} from '@/types';

export const predictionService = {
  async createPrediction(data: {
    userId: number;
    fixtureId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }): Promise<Prediction> {
    return apiClient.post<Prediction>('/v1/public/predictions', data);
  },

  async updatePrediction(
    predictionId: string | number,
    data: {
      predictedHomeScore: number;
      predictedAwayScore: number;
    }
  ): Promise<Prediction> {
    return apiClient.put<Prediction>(`/v1/public/predictions/${predictionId}`, data);
  },

  async getPrediction(predictionId: string | number): Promise<Prediction> {
    return apiClient.get<Prediction>(`/v1/public/predictions/${predictionId}`);
  },

  async getUserPredictions(userId: number): Promise<Prediction[]> {
    return apiClient.get<Prediction[]>(`/v1/public/predictions/user/${userId}`);
  },

  async getUserPredictionForFixture(fixtureId: number): Promise<Prediction | null> {
    try {
      return await apiClient.get<Prediction>(`/v1/public/predictions/fixture/${fixtureId}`);
    } catch {
      return null;
    }
  },

  async deletePrediction(predictionId: string | number): Promise<void> {
    return apiClient.delete(`/v1/public/predictions/${predictionId}`);
  },
};

export const scoringService = {
  async getUserScore(tournamentId: number): Promise<UserTournamentScore> {
    return apiClient.get<UserTournamentScore>(`/v1/public/scores/user/${tournamentId}`);
  },

  async getUserScoreHistory(tournamentId: number): Promise<PredictionScore[]> {
    return apiClient.get<PredictionScore[]>(`/v1/public/scores/history/${tournamentId}`);
  },

  async getGlobalRanking(
    tournamentId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<UserTournamentScore>> {
    return apiClient.get<PaginatedResponse<UserTournamentScore>>(
      `/v1/public/rankings/global/${tournamentId}`,
      params
    );
  },

  async getUserRankPosition(tournamentId: number): Promise<{ rank: number; totalUsers: number }> {
    return apiClient.get<{ rank: number; totalUsers: number }>(
      `/v1/public/rankings/user/${tournamentId}/position`
    );
  },
};

export const leagueService = {
  async createLeague(data: {
    userId: number;
    name: string;
    tournamentId: number;
    description?: string;
    maxMembers?: number;
  }): Promise<PrivateLeague> {
    return apiClient.post<PrivateLeague>('/v1/public/leagues', data);
  },

  async getLeague(leagueId: string): Promise<PrivateLeague> {
    return apiClient.get<PrivateLeague>(`/v1/public/leagues/${leagueId}`);
  },

  async getUserLeagues(userId: number): Promise<PrivateLeague[]> {
    return apiClient.get<PrivateLeague[]>(`/v1/public/leagues/user/${userId}`);
  },

  async getLeagueMembers(leagueId: string): Promise<PrivateLeagueMember[]> {
    return apiClient.get<PrivateLeagueMember[]>(`/v1/public/leagues/${leagueId}/members`);
  },

  async joinLeague(data: { userId: number; leagueCode: string }): Promise<PrivateLeagueMember> {
    return apiClient.post<PrivateLeagueMember>('/v1/public/leagues/join', data);
  },

  async leaveLeague(leagueId: string, userId: number): Promise<void> {
    return apiClient.post(`/v1/public/leagues/${leagueId}/leave`, { userId });
  },

  async transferOwnership(
    leagueId: string,
    currentOwnerUserId: number,
    newOwnerUserId: number
  ): Promise<PrivateLeague> {
    return apiClient.post<PrivateLeague>(`/v1/public/leagues/${leagueId}/transfer-ownership`, {
      currentOwnerUserId,
      newOwnerUserId,
    });
  },

  async getLeagueRanking(leagueId: string): Promise<PrivateLeagueScore[]> {
    return apiClient.get<PrivateLeagueScore[]>(`/v1/public/leagues/${leagueId}/ranking`);
  },

  async updateLeague(
    leagueId: string,
    data: { name?: string; description?: string }
  ): Promise<PrivateLeague> {
    return apiClient.put<PrivateLeague>(`/v1/public/leagues/${leagueId}`, data);
  },

  async deleteLeague(leagueId: string, ownerUserId: number): Promise<void> {
    return apiClient.delete(`/v1/public/leagues/${leagueId}`, { ownerUserId });
  },
};

export default {
  predictionService,
  scoringService,
  leagueService,
};
