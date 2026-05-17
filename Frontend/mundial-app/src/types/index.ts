// Alineado con tabla app_user de PostgreSQL
export interface User {
  id: string;
  email: string;
  displayName: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: Date;
  updatedAt?: Date;
}

// Alineado con tabla tournament
export interface Tournament {
  id: number;
  code: string;
  name: string;
  seasonYear: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

// Alineado con tabla team
export interface Team {
  id: number;
  name: string;
  shortName?: string;
  fifaCode?: string;
  flagUrl?: string;
  groupId?: number;
}

// Alineado con tabla fixture
export interface Fixture {
  id: number;
  tournamentId: number;
  stageId?: number;
  groupStageId?: number;
  homeTeamId: number;
  awayTeamId: number;
  kickoffAt: Date;
  status: 'SCHEDULED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'LIVE';
  homeScore?: number;
  awayScore?: number;
  createdAt: Date;
  providerUpdatedAt?: Date;
}

// Response con relaciones expandidas
export interface FixtureDetail extends Fixture {
  homeTeam: Team;
  awayTeam: Team;
  tournamentName?: string;
  stageName?: string;
  groupCode?: string;
  hostCity?: string;
  hostCountry?: string;
  stadiumName?: string;
  events?: FixtureEvent[];
  standing?: Standing;
  scorers?: MatchEventScorer[];
}

// Alineado con tabla fixture_result
export interface FixtureResult {
  id: number;
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  statusResult: string;
  resultedAt: Date;
}

// Eventos del partido
export interface FixtureEvent {
  id: number;
  fixtureId: number;
  type: 'GOAL' | 'CARD' | 'SUBSTITUTION' | 'INJURY' | 'VAR' | 'OTHER';
  minute: number;
  teamId: number;
  playerId?: string;
  playerName?: string;
  description: string;
  createdAt: Date;
}

// Goleador — alineado con MatchEventResponse del backend
export interface MatchEventScorer {
  id: number;
  fixtureId: number;
  playerName: string;
  teamId: number | null;
  teamName: string | null;
  teamFifaCode: string | null;
  minute: number | null;
  eventType: string;
  source: 'MANUAL' | 'API';
  verified: boolean;
  apiPlayerName: string | null;
  mismatch: boolean;
}

// Grupos de fases
export interface GroupStage {
  id: number;
  tournamentId: number;
  stageId: number;
  name: string;
  teams: Team[];
  standings: Standing[];
}

// Tabla de posiciones - alineada con standings
export interface Standing {
  id: number;
  groupId: number;
  teamId: number;
  team?: Team;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
  goalDifference: number;
}

// Alineado con tabla user_prediction
export interface Prediction {
  id: string;
  userId: string;
  fixtureId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedWinner?: 'HOME' | 'AWAY' | 'DRAW';
  submittedAt: Date;
  lockedAt?: Date;
}

// Alineado con tabla prediction_score_ledger
export interface PredictionScore {
  id: string;
  predictionId: string;
  userId: string;
  fixtureId: number;
  tournamentId: number;
  pointsAwarded: number;
  ruleCode: 'EXACT_SCORE' | 'WINNER_ONLY' | 'BONUS' | 'PARTIAL';
  scoredAt: Date;
}

// Alineado con tabla user_tournament_score
export interface UserTournamentScore {
  userId: string;
  tournamentId: number;
  totalPoints: number;
  exactScores: number;
  winnerHits: number;
  bonusPoints: number;
  matchesScored: number;
  rankPosition?: number;
  lastScoredAt: Date;
}

// Ligas privadas - alineado con tabla private_league
export interface PrivateLeague {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  tournamentId: number;
  description?: string;
  isPublic: boolean;
  memberCount: number;
  maxMembers?: number;
  createdAt: Date;
}

// Miembros de liga privada
export interface PrivateLeagueMember {
  id: string;
  leagueId: string;
  userId: string;
  user?: User;
  joinedAt: Date;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// Score en liga privada - alineado con tabla private_league_score
export interface PrivateLeagueScore {
  id: string;
  leagueId: string;
  userId: string;
  userScore: UserTournamentScore;
  rankPosition: number;
  updatedAt: Date;
}

// Auth responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// API Response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
}

// Paginación
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
