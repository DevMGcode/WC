/**
 * Resumen textual automático de un partido (es / en).
 *
 * Arma una frase/párrafo desde los datos REALES del fixture: equipos, marcador,
 * estadio, ciudad y goleadores con su minuto. Cubre los 3 estados:
 *   - SCHEDULED → previa
 *   - LIVE      → marcador en curso + goles hasta el momento
 *   - FINISHED  → resultado + goleadores
 *
 * Contenido textual original e indexable (SEO/AdSense) generado 100% de los datos.
 */
type SummaryScorer = {
  playerName: string;
  teamId: number | null;
  minute: number | null;
  extraMinute?: number | null;
};

type SummaryFixture = {
  status: string;
  homeTeam?: { id: number; name: string };
  awayTeam?: { id: number; name: string };
  homeScore?: number | null;
  awayScore?: number | null;
  stadiumName?: string;
  hostCity?: string;
  scorers?: SummaryScorer[];
};

const isEn = (l: string) => l.toLowerCase().startsWith('en');

function joinNames(items: string[], locale: string): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const conj = isEn(locale) ? 'and' : 'y';
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`;
}

function venuePhrase(f: SummaryFixture, locale: string): string {
  const en = isEn(locale);
  if (f.stadiumName) {
    const city = f.hostCity ? (en ? ` in ${f.hostCity}` : ` de ${f.hostCity}`) : '';
    return en ? ` at ${f.stadiumName}${city}` : ` en el ${f.stadiumName}${city}`;
  }
  if (f.hostCity) return en ? ` in ${f.hostCity}` : ` en ${f.hostCity}`;
  return '';
}

export function buildMatchSummary(f: SummaryFixture, locale: string): string {
  const en = isEn(locale);
  const home = f.homeTeam?.name;
  const away = f.awayTeam?.name;
  if (!home || !away) return '';

  const hs = f.homeScore ?? 0;
  const as = f.awayScore ?? 0;
  const vp = venuePhrase(f, locale);

  // ── Previa (sin marcador) ──
  if (f.status === 'SCHEDULED' || f.status === 'POSTPONED' || f.status === 'CANCELLED') {
    return en
      ? `${home} will face ${away}${vp} in the 2026 World Cup.`
      : `${home} se enfrentará a ${away}${vp} por el Mundial 2026.`;
  }

  // ── Cláusula de resultado ──
  let result: string;
  if (hs === as) {
    result = hs === 0
      ? (en ? `${home} and ${away} drew 0-0` : `${home} y ${away} empataron sin goles`)
      : (en ? `${home} drew ${hs}-${as} with ${away}` : `${home} empató ${hs}-${as} con ${away}`);
  } else if (hs > as) {
    result = en ? `${home} beat ${away} ${hs}-${as}` : `${home} venció ${hs}-${as} a ${away}`;
  } else {
    result = en ? `${away} beat ${home} ${as}-${hs}` : `${away} venció ${as}-${hs} a ${home}`;
  }

  // ── Goles ──
  const fmtMin = (s: SummaryScorer) =>
    s.minute != null ? ` (${s.minute}${s.extraMinute ? `+${s.extraMinute}` : ''}')` : '';
  const scorers = (f.scorers ?? []).filter(s => s.playerName);
  const homeGoals = scorers.filter(s => s.teamId === f.homeTeam?.id).map(s => `${s.playerName}${fmtMin(s)}`);
  const awayGoals = scorers.filter(s => s.teamId === f.awayTeam?.id).map(s => `${s.playerName}${fmtMin(s)}`);
  let goals = '';
  if (homeGoals.length || awayGoals.length) {
    const parts: string[] = [];
    if (homeGoals.length) parts.push(`${joinNames(homeGoals, locale)} ${en ? 'for' : 'por'} ${home}`);
    if (awayGoals.length) parts.push(`${joinNames(awayGoals, locale)} ${en ? 'for' : 'por'} ${away}`);
    goals = en ? ` Goals: ${parts.join('; ')}.` : ` Goles: ${parts.join('; ')}.`;
  }

  // ── En vivo ──
  if (f.status === 'LIVE') {
    const base = en
      ? `${home} and ${away} are playing their 2026 World Cup match${vp}; the score is ${hs}-${as}.`
      : `${home} y ${away} disputan su partido del Mundial 2026${vp}; el marcador va ${hs}-${as}.`;
    return `${base}${goals}`;
  }

  // ── Finalizado ──
  return en
    ? `${result}${vp} in the 2026 World Cup.${goals}`
    : `${result}${vp} por el Mundial 2026.${goals}`;
}
