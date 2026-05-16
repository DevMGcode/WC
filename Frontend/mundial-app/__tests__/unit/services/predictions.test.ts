import { predictionService, scoringService, leagueService } from '@/services/predictions';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => {
  const mock = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    setAccessToken: jest.fn(),
    getAccessToken: jest.fn(),
    clearAuth: jest.fn(),
  };
  return { __esModule: true, apiClient: mock, default: mock };
});

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('predictionService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createPrediction', () => {
    it('calls POST /v1/public/predictions with the correct payload', async () => {
      const payload = { userId: 1, fixtureId: 10, predictedHomeScore: 2, predictedAwayScore: 1 };
      const mockPrediction = { id: 'p1', ...payload };
      mockedClient.post.mockResolvedValueOnce(mockPrediction);

      const result = await predictionService.createPrediction(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/v1/public/predictions', payload);
      expect(result).toEqual(mockPrediction);
    });
  });

  describe('updatePrediction', () => {
    it('calls PUT /v1/public/predictions/:id with updated scores', async () => {
      const updated = { id: 'p1', predictedHomeScore: 3, predictedAwayScore: 0 };
      mockedClient.put.mockResolvedValueOnce(updated);

      const result = await predictionService.updatePrediction('p1', {
        predictedHomeScore: 3,
        predictedAwayScore: 0,
      });

      expect(mockedClient.put).toHaveBeenCalledWith('/v1/public/predictions/p1', {
        predictedHomeScore: 3,
        predictedAwayScore: 0,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('getUserPredictions', () => {
    it('calls GET /v1/public/predictions/user/:userId', async () => {
      const predictions = [{ id: 'p1' }, { id: 'p2' }];
      mockedClient.get.mockResolvedValueOnce(predictions);

      const result = await predictionService.getUserPredictions(42);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/predictions/user/42');
      expect(result).toEqual(predictions);
    });
  });

  describe('getUserPredictionForFixture', () => {
    it('calls GET /v1/public/predictions/fixture/:fixtureId and returns the prediction', async () => {
      const prediction = { id: 'p1', fixtureId: 5 };
      mockedClient.get.mockResolvedValueOnce(prediction);

      const result = await predictionService.getUserPredictionForFixture(5);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/predictions/fixture/5');
      expect(result).toEqual(prediction);
    });

    it('returns null when the request fails (no prediction exists)', async () => {
      mockedClient.get.mockRejectedValueOnce(new Error('Not found'));

      const result = await predictionService.getUserPredictionForFixture(99);

      expect(result).toBeNull();
    });
  });

  describe('deletePrediction', () => {
    it('calls DELETE /v1/public/predictions/:id', async () => {
      mockedClient.delete.mockResolvedValueOnce(undefined);

      await predictionService.deletePrediction('p1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/v1/public/predictions/p1');
    });
  });
});

describe('scoringService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getUserScore', () => {
    it('calls GET /v1/public/scores/user/:tournamentId', async () => {
      const score = { totalPoints: 15, exactPredictions: 3 };
      mockedClient.get.mockResolvedValueOnce(score);

      const result = await scoringService.getUserScore(1);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/scores/user/1');
      expect(result).toEqual(score);
    });
  });

  describe('getGlobalRanking', () => {
    it('calls GET /v1/public/rankings/global/:tournamentId with pagination params', async () => {
      const ranking = { data: [], total: 0, page: 1, pageSize: 10 };
      mockedClient.get.mockResolvedValueOnce(ranking);

      await scoringService.getGlobalRanking(1, { page: 1, pageSize: 10 });

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/v1/public/rankings/global/1',
        { page: 1, pageSize: 10 }
      );
    });

    it('calls GET /v1/public/rankings/global/:tournamentId without params when omitted', async () => {
      mockedClient.get.mockResolvedValueOnce({ data: [] });

      await scoringService.getGlobalRanking(2);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/rankings/global/2', undefined);
    });
  });

  describe('getUserRankPosition', () => {
    it('calls GET /v1/public/rankings/user/:tournamentId/position', async () => {
      mockedClient.get.mockResolvedValueOnce({ rank: 5, totalUsers: 200 });

      const result = await scoringService.getUserRankPosition(1);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/rankings/user/1/position');
      expect(result).toEqual({ rank: 5, totalUsers: 200 });
    });
  });
});

describe('leagueService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createLeague', () => {
    it('calls POST /v1/public/leagues with league data', async () => {
      const payload = { userId: 1, name: 'Mi Liga', tournamentId: 1 };
      const league = { id: 'l1', code: 'ABC123', ...payload };
      mockedClient.post.mockResolvedValueOnce(league);

      const result = await leagueService.createLeague(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/v1/public/leagues', payload);
      expect(result).toEqual(league);
    });
  });

  describe('joinLeague', () => {
    it('calls POST /v1/public/leagues/join with userId and leagueCode', async () => {
      const payload = { userId: 1, leagueCode: 'ABC123' };
      mockedClient.post.mockResolvedValueOnce({ id: 'm1' });

      await leagueService.joinLeague(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/v1/public/leagues/join', payload);
    });
  });

  describe('getLeagueRanking', () => {
    it('calls GET /v1/public/leagues/:leagueId/ranking', async () => {
      const scores = [{ userId: 1, points: 30 }];
      mockedClient.get.mockResolvedValueOnce(scores);

      const result = await leagueService.getLeagueRanking('l1');

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/leagues/l1/ranking');
      expect(result).toEqual(scores);
    });
  });

  describe('getUserLeagues', () => {
    it('calls GET /v1/public/leagues/user/:userId', async () => {
      const leagues = [{ id: 'l1' }, { id: 'l2' }];
      mockedClient.get.mockResolvedValueOnce(leagues);

      const result = await leagueService.getUserLeagues(42);

      expect(mockedClient.get).toHaveBeenCalledWith('/v1/public/leagues/user/42');
      expect(result).toEqual(leagues);
    });
  });

  describe('deleteLeague', () => {
    it('calls DELETE /v1/public/leagues/:leagueId with ownerUserId', async () => {
      mockedClient.delete.mockResolvedValueOnce(undefined);

      await leagueService.deleteLeague('l1', 1);

      expect(mockedClient.delete).toHaveBeenCalledWith('/v1/public/leagues/l1', { ownerUserId: 1 });
    });
  });
});
