/**
 * Tests para src/services/predictions.ts
 *
 * Foco: verificar que TODAS las llamadas usan los paths NUEVOS (sin `/public`)
 * tras el refactor de hoy. Si alguien revierte por accidente el rename, este
 * suite lo atrapa. Cubre predictionService, leagueService y scoringService.
 *
 * Mock: `apiClient` (que internamente usa axios) — interceptamos las funciones
 * para capturar los argumentos sin hacer HTTP real.
 */
import { predictionService, leagueService, scoringService } from '@/services/predictions';
import { apiClient } from '@/services/api';

describe('predictionService — usa paths /v1/predictions (NO /v1/public/predictions)', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'put').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'get').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'delete').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createPrediction usa /v1/predictions', async () => {
    await predictionService.createPrediction({ userId: 1, fixtureId: 10, predictedHomeScore: 2, predictedAwayScore: 1 });
    expect(apiClient.post).toHaveBeenCalledWith('/v1/predictions', expect.objectContaining({ fixtureId: 10 }));
  });

  it('updatePrediction usa /v1/predictions/:id', async () => {
    await predictionService.updatePrediction(99, { predictedHomeScore: 3, predictedAwayScore: 2 });
    expect(apiClient.put).toHaveBeenCalledWith('/v1/predictions/99', { predictedHomeScore: 3, predictedAwayScore: 2 });
  });

  it('getPrediction usa /v1/predictions/:id', async () => {
    await predictionService.getPrediction(123);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/predictions/123');
  });

  it('getUserPredictions usa /v1/predictions/user/:userId', async () => {
    await predictionService.getUserPredictions(2);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/predictions/user/2');
  });

  it('getUserPredictionForFixture devuelve null si el backend tira error (404)', async () => {
    jest.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('404'));
    const result = await predictionService.getUserPredictionForFixture(99);
    expect(result).toBeNull();
  });

  it('deletePrediction usa /v1/predictions/:id', async () => {
    await predictionService.deletePrediction(50);
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/predictions/50');
  });
});

describe('scoringService — paths nuevos sin /public', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getUserScore usa /v1/scores/user/:tournamentId con userId como query', async () => {
    await scoringService.getUserScore(2, 3);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/scores/user/2', { userId: 3 });
  });

  it('getUserScoreHistory usa /v1/scores/history/:tournamentId', async () => {
    await scoringService.getUserScoreHistory(2, 3);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/scores/history/2', { userId: 3 });
  });

  it('getGlobalRanking usa /v1/rankings/global/:tournamentId (público)', async () => {
    await scoringService.getGlobalRanking(2, { page: 0, pageSize: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/v1/rankings/global/2', { page: 0, pageSize: 10 });
  });

  it('getUserRankPosition usa /v1/rankings/user/:tournamentId/position', async () => {
    await scoringService.getUserRankPosition(2, 3);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/rankings/user/2/position', { userId: 3 });
  });
});

describe('leagueService — paths nuevos sin /public', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'put').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'get').mockResolvedValue({} as any);
    jest.spyOn(apiClient, 'delete').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createLeague usa /v1/leagues', async () => {
    await leagueService.createLeague({ userId: 1, name: 'X', tournamentId: 2 });
    expect(apiClient.post).toHaveBeenCalledWith('/v1/leagues', expect.objectContaining({ name: 'X' }));
  });

  it('getLeague usa /v1/leagues/:id', async () => {
    await leagueService.getLeague('7');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/leagues/7');
  });

  it('getUserLeagues usa /v1/leagues/user/:userId', async () => {
    await leagueService.getUserLeagues(26);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/leagues/user/26');
  });

  it('getLeagueMembers usa /v1/leagues/:id/members', async () => {
    await leagueService.getLeagueMembers('7');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/leagues/7/members');
  });

  it('joinLeague usa /v1/leagues/join', async () => {
    await leagueService.joinLeague({ userId: 26, leagueCode: 'ABCD1234' });
    expect(apiClient.post).toHaveBeenCalledWith('/v1/leagues/join', { userId: 26, leagueCode: 'ABCD1234' });
  });

  it('leaveLeague usa /v1/leagues/:id/leave', async () => {
    await leagueService.leaveLeague('7', 26);
    expect(apiClient.post).toHaveBeenCalledWith('/v1/leagues/7/leave', { userId: 26 });
  });

  it('transferOwnership usa /v1/leagues/:id/transfer-ownership', async () => {
    await leagueService.transferOwnership('7', 2, 26);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/v1/leagues/7/transfer-ownership',
      { currentOwnerUserId: 2, newOwnerUserId: 26 }
    );
  });

  it('getLeagueRanking usa /v1/leagues/:id/ranking', async () => {
    await leagueService.getLeagueRanking('7');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/leagues/7/ranking');
  });

  it('updateLeague usa PUT /v1/leagues/:id', async () => {
    await leagueService.updateLeague('7', { name: 'Nuevo nombre' });
    expect(apiClient.put).toHaveBeenCalledWith('/v1/leagues/7', { name: 'Nuevo nombre' });
  });

  it('deleteLeague usa DELETE /v1/leagues/:id con ownerUserId en body', async () => {
    await leagueService.deleteLeague('7', 2);
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/leagues/7', { ownerUserId: 2 });
  });
});

describe('Regresión: NINGÚN service usa /v1/public/{predictions|scores|leagues|rankings}', () => {
  it('los paths privados NUNCA llevan /public/', () => {
    // Lectura del módulo de servicios: si alguien revierte un path por error,
    // este test atrapa la regresión sin necesidad de correr todos los servicios.
    const source = require('fs').readFileSync(
      require('path').resolve(__dirname, '../../../services/predictions.ts'),
      'utf-8'
    );
    expect(source).not.toMatch(/\/v1\/public\/(predictions|scores|leagues|rankings)/);
  });
});
