export type Team = { id: number; name: string; shortName: string; flagUrl: string };
export type Standing = {
  position: number;
  team: Team;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
};
export type Group = { id: number; name: string; standings: Standing[] };
export type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  winner?: Team | null;
  isPlayed?: boolean;
};
export type BracketData = {
  octavos: Match[];
  cuartos: Match[];
  semifinales: Match[];
  final: Match[];
};
export type KnockoutRound = 'octavos' | 'cuartos' | 'semifinales' | 'final';
