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
import { localizeTeamName } from '@/lib/i18n/teamNames';

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

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

const CONJ: Record<Lang, string> = { es: 'y', en: 'and', fr: 'et', pt: 'e', de: 'und', ru: 'и', ar: 'و' };
const GOALS_LABEL: Record<Lang, string> = { es: ' Goles: ', en: ' Goals: ', fr: ' Buts : ', pt: ' Gols: ', de: ' Tore: ', ru: ' Голы: ', ar: ' الأهداف: ' };
const FOR_WORD: Record<Lang, string> = { es: 'por', en: 'for', fr: 'pour', pt: 'por', de: 'für', ru: 'за', ar: 'لـ' };

function joinNames(items: string[], lang: Lang): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} ${CONJ[lang]} ${items[items.length - 1]}`;
}

function venuePhrase(f: SummaryFixture, lang: Lang): string {
  const s = f.stadiumName;
  const c = f.hostCity;
  if (s) {
    switch (lang) {
      case 'en': return ` at ${s}${c ? ` in ${c}` : ''}`;
      case 'fr': return ` au ${s}${c ? ` à ${c}` : ''}`;
      case 'pt': return ` no ${s}${c ? ` em ${c}` : ''}`;
      case 'de': return ` im ${s}${c ? ` in ${c}` : ''}`;
      case 'ru': return ` на стадионе ${s}${c ? ` в ${c}` : ''}`;
      case 'ar': return ` في ${s}${c ? ` في ${c}` : ''}`;
      default:   return ` en el ${s}${c ? ` de ${c}` : ''}`;
    }
  }
  if (c) {
    switch (lang) {
      case 'en': return ` in ${c}`;
      case 'fr': return ` à ${c}`;
      case 'pt': return ` em ${c}`;
      case 'de': return ` in ${c}`;
      case 'ru': return ` в ${c}`;
      case 'ar': return ` في ${c}`;
      default:   return ` en ${c}`;
    }
  }
  return '';
}

export function buildMatchSummary(f: SummaryFixture, locale: string): string {
  const lang = pickLang(locale);
  const home = localizeTeamName(f.homeTeam?.name, locale);
  const away = localizeTeamName(f.awayTeam?.name, locale);
  if (!home || !away) return '';

  const hs = f.homeScore ?? 0;
  const as = f.awayScore ?? 0;
  const vp = venuePhrase(f, lang);

  // ── Previa (sin marcador) ──
  if (f.status === 'SCHEDULED' || f.status === 'POSTPONED' || f.status === 'CANCELLED') {
    const preview: Record<Lang, string> = {
      es: `${home} se enfrentará a ${away}${vp} por el Mundial 2026.`,
      en: `${home} will face ${away}${vp} in the 2026 World Cup.`,
      fr: `${home} affrontera ${away}${vp} lors de la Coupe du Monde 2026.`,
      pt: `${home} enfrentará ${away}${vp} pela Copa do Mundo 2026.`,
      de: `${home} trifft auf ${away}${vp} bei der WM 2026.`,
      ru: `${home} сыграет против ${away}${vp} на Чемпионате мира 2026.`,
      ar: `سيواجه ${home} ${away}${vp} في كأس العالم 2026.`,
    };
    return preview[lang];
  }

  // ── Cláusula de resultado ──
  let result: string;
  if (hs === as && hs === 0) {
    result = ({
      es: `${home} y ${away} empataron sin goles`,
      en: `${home} and ${away} drew 0-0`,
      fr: `${home} et ${away} ont fait match nul 0-0`,
      pt: `${home} e ${away} empataram sem gols`,
      de: `${home} und ${away} trennten sich 0:0`,
      ru: `${home} и ${away} сыграли вничью 0:0`,
      ar: `تعادل ${home} و${away} 0-0`,
    } as Record<Lang, string>)[lang];
  } else if (hs === as) {
    result = ({
      es: `${home} empató ${hs}-${as} con ${away}`,
      en: `${home} drew ${hs}-${as} with ${away}`,
      fr: `${home} a fait match nul ${hs}-${as} contre ${away}`,
      pt: `${home} empatou ${hs}-${as} com ${away}`,
      de: `${home} spielte ${hs}:${as} unentschieden gegen ${away}`,
      ru: `${home} сыграл вничью ${hs}:${as} с ${away}`,
      ar: `تعادل ${home} ${hs}-${as} مع ${away}`,
    } as Record<Lang, string>)[lang];
  } else if (hs > as) {
    result = ({
      es: `${home} venció ${hs}-${as} a ${away}`,
      en: `${home} beat ${away} ${hs}-${as}`,
      fr: `${home} a battu ${away} ${hs}-${as}`,
      pt: `${home} venceu ${away} por ${hs}-${as}`,
      de: `${home} besiegte ${away} mit ${hs}:${as}`,
      ru: `${home} обыграл ${away} со счётом ${hs}:${as}`,
      ar: `فاز ${home} على ${away} ${hs}-${as}`,
    } as Record<Lang, string>)[lang];
  } else {
    result = ({
      es: `${away} venció ${as}-${hs} a ${home}`,
      en: `${away} beat ${home} ${as}-${hs}`,
      fr: `${away} a battu ${home} ${as}-${hs}`,
      pt: `${away} venceu ${home} por ${as}-${hs}`,
      de: `${away} besiegte ${home} mit ${as}:${hs}`,
      ru: `${away} обыграл ${home} со счётом ${as}:${hs}`,
      ar: `فاز ${away} على ${home} ${as}-${hs}`,
    } as Record<Lang, string>)[lang];
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
    if (homeGoals.length) parts.push(`${joinNames(homeGoals, lang)} ${FOR_WORD[lang]} ${home}`);
    if (awayGoals.length) parts.push(`${joinNames(awayGoals, lang)} ${FOR_WORD[lang]} ${away}`);
    goals = `${GOALS_LABEL[lang]}${parts.join('; ')}.`;
  }

  // ── En vivo ──
  if (f.status === 'LIVE') {
    const live: Record<Lang, string> = {
      es: `${home} y ${away} disputan su partido del Mundial 2026${vp}; el marcador va ${hs}-${as}.`,
      en: `${home} and ${away} are playing their 2026 World Cup match${vp}; the score is ${hs}-${as}.`,
      fr: `${home} et ${away} disputent leur match de la Coupe du Monde 2026${vp} ; le score est de ${hs}-${as}.`,
      pt: `${home} e ${away} disputam seu jogo da Copa do Mundo 2026${vp}; o placar está ${hs}-${as}.`,
      de: `${home} und ${away} bestreiten ihr WM-2026-Spiel${vp}; der Spielstand ist ${hs}:${as}.`,
      ru: `${home} и ${away} играют свой матч Чемпионата мира 2026${vp}; счёт ${hs}:${as}.`,
      ar: `يلعب ${home} و${away} مباراتهما في كأس العالم 2026${vp}؛ النتيجة ${hs}-${as}.`,
    };
    return `${live[lang]}${goals}`;
  }

  // ── Finalizado ──
  const finished: Record<Lang, string> = {
    es: `${result}${vp} por el Mundial 2026.${goals}`,
    en: `${result}${vp} in the 2026 World Cup.${goals}`,
    fr: `${result}${vp} lors de la Coupe du Monde 2026.${goals}`,
    pt: `${result}${vp} pela Copa do Mundo 2026.${goals}`,
    de: `${result}${vp} bei der WM 2026.${goals}`,
    ru: `${result}${vp} на Чемпионате мира 2026.${goals}`,
    ar: `${result}${vp} في كأس العالم 2026.${goals}`,
  };
  return finished[lang];
}
