/**
 * Generador de texto editorial por grupo (es / en).
 *
 * Construye una descripción en prosa a partir de los datos REALES de la tabla
 * de posiciones: líder, equipos en zona de clasificación, eliminados, racha y
 * diferencia de goles. Sirve a dos propósitos:
 *   1. UX → contexto legible que acompaña a la tabla.
 *   2. SEO / AdSense → contenido textual original e indexable (no solo datos
 *      crudos en una tabla), que es lo que Google valora para aprobar el sitio.
 *
 * Se renderiza desde un Client Component, pero Next lo incluye en el HTML del
 * SSR inicial, así que el crawler lo ve.
 */
import type { Group, Standing } from './types';

const isEn = (locale: string) => locale.toLowerCase().startsWith('en');

/** Une una lista con comas y la conjunción final correcta ("a, b y c"). */
function joinNames(names: string[], locale: string): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  const conj = isEn(locale) ? 'and' : 'y';
  return `${names.slice(0, -1).join(', ')} ${conj} ${names[names.length - 1]}`;
}

/** "3 victorias y 1 empate" / "3 wins and 1 draw". */
function recordPhrase(s: Standing, locale: string): string {
  const en = isEn(locale);
  const parts: string[] = [];
  if (s.won)   parts.push(`${s.won} ${en ? (s.won === 1 ? 'win' : 'wins') : (s.won === 1 ? 'victoria' : 'victorias')}`);
  if (s.drawn) parts.push(`${s.drawn} ${en ? (s.drawn === 1 ? 'draw' : 'draws') : (s.drawn === 1 ? 'empate' : 'empates')}`);
  if (s.lost)  parts.push(`${s.lost} ${en ? (s.lost === 1 ? 'loss' : 'losses') : (s.lost === 1 ? 'derrota' : 'derrotas')}`);
  return joinNames(parts, locale);
}

/**
 * Devuelve la descripción del grupo según su estado:
 *  - sin empezar (0 partidos)  → presentación de los equipos
 *  - en curso                  → líder, escolta y quiénes pelean
 *  - finalizado (round-robin)  → clasificados y eliminados
 */
export function buildGroupNarrative(group: Group, locale: string): string {
  const en = isEn(locale);
  const s = [...group.standings].sort((a, b) => a.position - b.position);
  if (s.length === 0) return '';

  const name = group.name; // ya viene localizado: "Grupo A" / "Group A"
  const names = s.map(x => x.team.name);
  const leader = s[0];
  const second = s[1];

  const teamsCount = s.length;
  const roundRobinGames = teamsCount - 1;
  const maxPlayed = Math.max(...s.map(x => x.played));
  const notStarted = maxPlayed === 0;
  const allPlayed = roundRobinGames > 0 && s.every(x => x.played >= roundRobinGames);

  // ── Sin empezar ──────────────────────────────────────────────
  if (notStarted) {
    return en
      ? `${name} of the 2026 World Cup features ${joinNames(names, locale)}. They face each other in a round-robin format, and the top two of the group secure their place in the knockout round.`
      : `El ${name} del Mundial 2026 está integrado por ${joinNames(names, locale)}. Se enfrentan todos contra todos y los dos primeros del grupo aseguran su clasificación a la fase eliminatoria.`;
  }

  const rec = recordPhrase(leader, locale);
  const recPart = rec ? (en ? ` (${rec})` : ` (${rec})`) : '';
  const gd = leader.goalDiff > 0 ? `+${leader.goalDiff}` : `${leader.goalDiff}`;

  // ── Finalizado ───────────────────────────────────────────────
  if (allPlayed) {
    const qualified = joinNames([leader.team.name, second.team.name], locale);
    const eliminated = joinNames(s.slice(2).map(x => x.team.name), locale);
    return en
      ? `${leader.team.name} finished top of ${name} with ${leader.points} points${recPart} and a ${gd} goal difference. ${qualified} qualified for the knockout stage, while ${eliminated} were eliminated.`
      : `${leader.team.name} terminó líder del ${name} con ${leader.points} puntos${recPart} y una diferencia de gol de ${gd}. ${qualified} clasificaron a la fase eliminatoria, mientras que ${eliminated} quedaron eliminados.`;
  }

  // ── En curso ─────────────────────────────────────────────────
  const jornada = maxPlayed;
  const chasers = s.slice(2);
  const chasersPhrase = chasers.length
    ? (en
        ? ` ${joinNames(chasers.map(x => `${x.team.name} (${x.points} pts)`), locale)} ${chasers.length === 1 ? 'is' : 'are'} still fighting to advance.`
        : ` ${joinNames(chasers.map(x => `${x.team.name} (${x.points} pts)`), locale)} ${chasers.length === 1 ? 'todavía pelea' : 'todavía pelean'} por avanzar.`)
    : '';
  const secondPart = second
    ? (en ? `, followed by ${second.team.name} with ${second.points}` : `, seguido de ${second.team.name} con ${second.points}`)
    : '';

  return en
    ? `After ${jornada} matchday${jornada === 1 ? '' : 's'}, ${leader.team.name} leads ${name} with ${leader.points} points${recPart}${secondPart}. If the standings hold, both would reach the next round.${chasersPhrase}`
    : `Tras ${jornada} jornada${jornada === 1 ? '' : 's'}, ${leader.team.name} lidera el ${name} con ${leader.points} puntos${recPart}${secondPart}. Si se mantienen las posiciones, ambos avanzarían a la siguiente ronda.${chasersPhrase}`;
}

/** Texto introductorio editorial de la fase de grupos (es / en). */
export function groupsIntroText(locale: string): string {
  return isEn(locale)
    ? 'The group stage of the 2026 World Cup splits the national teams into groups of four that play each other in a round-robin. The top two of each group advance to the knockout round. Below you will find the up-to-date standings of every group — matches played, won, drawn and lost, goal difference and points — along with an analysis of where each team stands.'
    : 'La fase de grupos del Mundial 2026 reparte a las selecciones en grupos de cuatro equipos que juegan todos contra todos. Los dos primeros de cada grupo avanzan a la fase eliminatoria. A continuación encontrás las posiciones actualizadas de cada grupo —partidos jugados, ganados, empatados y perdidos, diferencia de goles y puntos— junto a un análisis de la situación de cada selección.';
}
