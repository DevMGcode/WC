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
  /** Marcador de la tanda de penales (solo si el partido se definió así). */
  homePenalty?: number | null;
  awayPenalty?: number | null;
  winner?: Team | null;
  isPlayed?: boolean;
  /** Instante de inicio (ISO/UTC). Se muestra en la TZ del torneo. */
  kickoff?: string | Date;
};
export type BracketData = {
  dieciseisavos: Match[];
  octavos: Match[];
  cuartos: Match[];
  semifinales: Match[];
  final: Match[];
  /** Partido por el 3er puesto (P103). Opcional: solo lo usa el bracket desktop. */
  tercerPuesto?: Match;
};
export type KnockoutRound = 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinales' | 'final';
/** Pestañas del cuadro en móvil: incluye el 3er puesto (un solo partido). */
export type BracketTab = KnockoutRound | 'tercerPuesto';
