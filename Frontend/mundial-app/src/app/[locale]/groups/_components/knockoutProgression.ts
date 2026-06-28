import type { Match, Team } from './types';

/**
 * PROGRESIÓN DEL CUADRO ELIMINATORIO (Mundial 2026)
 * ─────────────────────────────────────────────────
 * La FIFA define el cuadro con fórmulas fijas: cada casilla de la ronda
 * siguiente es "Ganador del Partido N" (W N). Acá replicamos ese sistema:
 *   - Conocemos los 16 cruces de Dieciseisavos (P73–P88).
 *   - Tomamos el RESULTADO de cada partido desde la API y calculamos el ganador.
 *   - Sustituimos ese ganador en la casilla que le corresponde (P89… en cascada).
 * Mientras un partido no esté jugado, la casilla muestra el placeholder
 * "Ganador {N}" (equivalente al "W{N}" de la FIFA).
 *
 * Esto NO depende de que la API publique Octavos/Cuartos/etc.: el cálculo de
 * quién avanza lo hacemos nosotros con el mapa de progresión. Si la API más
 * adelante publica esas rondas con resultados, se usan para seguir la cascada.
 */

/** Dieciseisavos (P73–P88): pares por fifaCode/shortName (orden indistinto). */
const R32_CODES: Record<number, [string, string]> = {
  73: ['RSA', 'CAN'],
  74: ['GER', 'PAR'],
  75: ['NED', 'MAR'],
  76: ['BRA', 'JPN'],
  77: ['FRA', 'SWE'],
  78: ['CIV', 'NOR'],
  79: ['MEX', 'ECU'],
  80: ['ENG', 'CGO'],
  81: ['USA', 'BIH'],
  82: ['BEL', 'SEN'],
  83: ['POR', 'CRO'],
  84: ['ESP', 'AUT'],
  85: ['SUI', 'ALG'],
  86: ['ARG', 'CPV'],
  87: ['COL', 'GHA'],
  88: ['AUS', 'EGY'],
};

/** Octavos→Final (P89–P104): cada partido lo alimentan los ganadores de otros dos. */
const FEEDS: Record<number, { home: number; away: number }> = {
  89: { home: 74, away: 77 },
  90: { home: 73, away: 75 },
  91: { home: 76, away: 78 },
  92: { home: 79, away: 80 },
  93: { home: 83, away: 84 },
  94: { home: 81, away: 82 },
  95: { home: 86, away: 88 },
  96: { home: 85, away: 87 },
  97: { home: 89, away: 90 },
  98: { home: 93, away: 94 },
  99: { home: 91, away: 92 },
  100: { home: 95, away: 96 },
  101: { home: 97, away: 98 },
  102: { home: 99, away: 100 },
  104: { home: 101, away: 102 },
};

/**
 * Posición en el array del bracket → número de partido FIFA.
 * El orden respeta el cableado del cuadro (BracketChampions): oct[0],oct[1]→cua[0];
 * oct[2],oct[3]→cua[1] (izq); oct[4],oct[5]→cua[2]; oct[6],oct[7]→cua[3] (der).
 */
const OCTAVOS_POS = [89, 90, 93, 94, 91, 92, 95, 96];
const CUARTOS_POS = [97, 98, 99, 100];
const SEMIS_POS   = [101, 102];
const FINAL_POS   = [104];

/**
 * Cronograma oficial FIFA de Octavos→Final + 3er puesto, como INSTANTE REAL en
 * UTC (convertido desde la hora local de cada sede). La app lo muestra en la TZ
 * del torneo (Bogotá), igual que los Dieciseisavos que vienen de la API.
 */
const SCHEDULE: Record<number, string> = {
  89: '2026-07-04T21:00:00Z',
  90: '2026-07-04T17:00:00Z',
  91: '2026-07-05T20:00:00Z',
  92: '2026-07-06T00:00:00Z',
  93: '2026-07-06T19:00:00Z',
  94: '2026-07-07T00:00:00Z',
  95: '2026-07-07T16:00:00Z',
  96: '2026-07-07T20:00:00Z',
  97: '2026-07-09T20:00:00Z',
  98: '2026-07-10T19:00:00Z',
  99: '2026-07-11T21:00:00Z',
  100: '2026-07-12T01:00:00Z',
  101: '2026-07-14T19:00:00Z',
  102: '2026-07-15T19:00:00Z',
  103: '2026-07-18T21:00:00Z',
  104: '2026-07-19T19:00:00Z',
};

const ROUND_OF = (num: number): 'octavos' | 'cuartos' | 'semifinales' | 'final' =>
  num <= 96 ? 'octavos' : num <= 100 ? 'cuartos' : num <= 102 ? 'semifinales' : 'final';

/** fifaCode estable del equipo (cae a shortName, que en estos datos coincide). */
const codeOf = (t?: Team | null): string =>
  String((t as { fifaCode?: string })?.fifaCode || t?.shortName || '').toUpperCase();

/** Equipo-placeholder "Gan. {N}" (el "W{N}" de la FIFA). */
const placeholder = (num: number): Team => ({
  id: -num,
  name: `Gan. ${num}`,
  shortName: `Gan. ${num}`,
  flagUrl: '',
});

/** Equipo-placeholder "Perdedor {N}" (para el partido por el 3er puesto). */
const loserPlaceholder = (num: number): Team => ({
  id: -(900 + num),
  name: `Perdedor ${num}`,
  shortName: `Perdedor ${num}`,
  flagUrl: '',
});

const sameMatch = (m: Match, a: string, b: string): boolean => {
  const x = codeOf(m.homeTeam), y = codeOf(m.awayTeam);
  return (x === a && y === b) || (x === b && y === a);
};

/**
 * Construye Octavos→Final autocompletados a partir de los Dieciseisavos reales
 * (con resultados de la API) y, si existieran, de las rondas superiores ya
 * publicadas por la API (para seguir la cascada con resultados reales).
 */
export function computeKnockout(rounds: {
  dieciseisavos: Match[];
  octavos: Match[];
  cuartos: Match[];
  semifinales: Match[];
  final: Match[];
}): { octavos: Match[]; cuartos: Match[]; semifinales: Match[]; final: Match[]; tercerPuesto: Match } {
  // R32 reales mapeados a su número de partido por el par de equipos.
  const r32ByNum = new Map<number, Match>();
  for (const fx of rounds.dieciseisavos) {
    const a = codeOf(fx.homeTeam), b = codeOf(fx.awayTeam);
    for (const [numStr, [ca, cb]] of Object.entries(R32_CODES)) {
      if ((a === ca && b === cb) || (a === cb && b === ca)) {
        r32ByNum.set(Number(numStr), fx);
        break;
      }
    }
  }

  const apiByRound: Record<'octavos' | 'cuartos' | 'semifinales' | 'final', Match[]> = {
    octavos: rounds.octavos,
    cuartos: rounds.cuartos,
    semifinales: rounds.semifinales,
    final: rounds.final,
  };

  const cache = new Map<number, Match | null>();

  // Partido real que ocupa la casilla N (si existe en la API), o null.
  const resolve = (num: number): Match | null => {
    if (cache.has(num)) return cache.get(num)!;
    cache.set(num, null); // evita recursión infinita (los feeds siempre son menores)
    let result: Match | null = null;

    if (num <= 88) {
      result = r32ByNum.get(num) ?? null;
    } else {
      const feed = FEEDS[num];
      const home = winnerTeam(feed.home);
      const away = winnerTeam(feed.away);
      // Solo se puede emparejar un fixture real de la API si ya conocemos ambos
      // equipos esperados (ganadores resueltos de la ronda previa).
      if (home && away) {
        const a = codeOf(home), b = codeOf(away);
        result = apiByRound[ROUND_OF(num)].find((m) => sameMatch(m, a, b)) ?? null;
      }
    }

    cache.set(num, result);
    return result;
  };

  const winnerTeam = (num: number): Team | null => {
    const m = resolve(num);
    return m && m.isPlayed && m.winner ? m.winner : null;
  };

  // Perdedor de un partido jugado (el equipo que no es el ganador).
  const loserTeam = (num: number): Team | null => {
    const m = resolve(num);
    if (!m || !m.isPlayed || !m.winner) return null;
    return codeOf(m.winner) === codeOf(m.homeTeam) ? m.awayTeam : m.homeTeam;
  };

  const buildMatch = (num: number): Match => {
    const real = resolve(num);
    if (real) return { ...real, kickoff: real.kickoff ?? SCHEDULE[num] };
    const feed = FEEDS[num];
    return {
      id: -num,
      homeTeam: winnerTeam(feed.home) ?? placeholder(feed.home),
      awayTeam: winnerTeam(feed.away) ?? placeholder(feed.away),
      isPlayed: false,
      winner: null,
      kickoff: SCHEDULE[num],
    };
  };

  // Partido por el 3er puesto (P103): Perdedor 101 vs Perdedor 102.
  const tercerPuesto: Match = {
    id: -103,
    homeTeam: loserTeam(101) ?? loserPlaceholder(101),
    awayTeam: loserTeam(102) ?? loserPlaceholder(102),
    isPlayed: false,
    winner: null,
    kickoff: SCHEDULE[103],
  };

  return {
    octavos:     OCTAVOS_POS.map(buildMatch),
    cuartos:     CUARTOS_POS.map(buildMatch),
    semifinales: SEMIS_POS.map(buildMatch),
    final:       FINAL_POS.map(buildMatch),
    tercerPuesto,
  };
}
