/**
 * Narrativa editorial de goleadores / asistentes (es / en).
 *
 * Arma un párrafo en prosa desde los datos REALES del ranking (líder, equipo,
 * goles/asistencias, total). Mismo objetivo que el de grupos: contenido textual
 * original e indexable para SEO/AdSense, generado 100% de los datos y que se
 * actualiza solo cuando cambia la tabla.
 */
type ScorerLite = { playerName: string; teamName: string; goals: number; assists: number };

const isEn = (l: string) => l.toLowerCase().startsWith('en');

function joinNames(items: string[], locale: string): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const conj = isEn(locale) ? 'and' : 'y';
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`;
}

export function buildScorersNarrative(players: ScorerLite[], stat: 'goals' | 'assists', locale: string): string {
  const en = isEn(locale);
  const val = (p: ScorerLite) => (stat === 'goals' ? p.goals : p.assists) ?? 0;
  const list = players.filter(p => val(p) > 0);
  if (list.length === 0) return '';

  const leader = list[0];
  const lv = val(leader);
  const noun = stat === 'goals'
    ? (en ? (lv === 1 ? 'goal' : 'goals') : (lv === 1 ? 'gol' : 'goles'))
    : (en ? (lv === 1 ? 'assist' : 'assists') : (lv === 1 ? 'asistencia' : 'asistencias'));

  const others = list.slice(1, 3).map(p => `${p.playerName} (${p.teamName}, ${val(p)})`);
  const othersPhrase = others.length
    ? (en ? ` They are followed by ${joinNames(others, locale)}.` : ` Le siguen ${joinNames(others, locale)}.`)
    : '';

  const total = list.reduce((s, p) => s + val(p), 0);
  const count = list.length;

  if (stat === 'goals') {
    return en
      ? `${leader.playerName} (${leader.teamName}) tops the 2026 World Cup scoring charts with ${lv} ${noun}.${othersPhrase} The top ${count} scorers have netted ${total} goals so far in the tournament.`
      : `${leader.playerName} (${leader.teamName}) encabeza la tabla de goleadores del Mundial 2026 con ${lv} ${noun}.${othersPhrase} Entre los ${count} máximos artilleros suman ${total} goles en lo que va del torneo.`;
  }
  return en
    ? `${leader.playerName} (${leader.teamName}) leads the assist chart of the 2026 World Cup with ${lv} ${noun}.${othersPhrase} A total of ${count} players have provided assists.`
    : `${leader.playerName} (${leader.teamName}) lidera la tabla de asistencias del Mundial 2026 con ${lv} ${noun}.${othersPhrase} En total, ${count} jugadores registran asistencias.`;
}
