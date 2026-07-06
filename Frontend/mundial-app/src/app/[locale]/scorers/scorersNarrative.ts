/**
 * Narrativa editorial de goleadores / asistentes (7 idiomas).
 *
 * Arma un párrafo en prosa desde los datos REALES del ranking (líder, equipo,
 * goles/asistencias, total). Mismo objetivo que el de grupos: contenido textual
 * original e indexable para SEO/AdSense, generado 100% de los datos y que se
 * actualiza solo cuando cambia la tabla.
 *
 * Maneja el empate en la cima (varios jugadores con el mismo máximo) con una
 * frase de "comparten el liderato" en vez de nombrar a uno solo.
 */
type ScorerLite = { playerName: string; teamName: string; goals: number; assists: number };

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

const CONJ: Record<Lang, string> = { es: 'y', en: 'and', fr: 'et', pt: 'e', de: 'und', ru: 'и', ar: 'و' };

function joinNames(items: string[], lang: Lang): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} ${CONJ[lang]} ${items[items.length - 1]}`;
}

// [singular, plural] de "gol" / "asistencia" por idioma.
const GOAL_WORD: Record<Lang, [string, string]> = {
  es: ['gol', 'goles'], en: ['goal', 'goals'], fr: ['but', 'buts'], pt: ['gol', 'gols'],
  de: ['Tor', 'Tore'], ru: ['гол', 'гола(ов)'], ar: ['هدف', 'أهداف'],
};
const ASSIST_WORD: Record<Lang, [string, string]> = {
  es: ['asistencia', 'asistencias'], en: ['assist', 'assists'], fr: ['passe décisive', 'passes décisives'],
  pt: ['assistência', 'assistências'], de: ['Vorlage', 'Vorlagen'], ru: ['передача', 'передач(и)'], ar: ['تمريرة حاسمة', 'تمريرات حاسمة'],
};

export function buildScorersNarrative(players: ScorerLite[], stat: 'goals' | 'assists', locale: string): string {
  const lang = pickLang(locale);
  const val = (p: ScorerLite) => (stat === 'goals' ? p.goals : p.assists) ?? 0;
  const list = players.filter(p => val(p) > 0);
  if (list.length === 0) return '';

  const lv = val(list[0]);
  const coLeaders = list.filter(p => val(p) === lv);
  const isTie = coLeaders.length > 1;
  const words = stat === 'goals' ? GOAL_WORD[lang] : ASSIST_WORD[lang];
  const noun = lv === 1 ? words[0] : words[1];

  const fmt = (p: ScorerLite) => `${p.playerName} (${p.teamName})`;
  const leaderPhrase = isTie ? joinNames(coLeaders.map(fmt), lang) : fmt(list[0]);

  // ── Frase del líder (o colíderes) ──
  const lead: Record<Lang, string> = stat === 'goals'
    ? {
        es: isTie
          ? `${leaderPhrase} comparten el liderato de la tabla de goleadores del Mundial 2026 con ${lv} ${noun} cada uno.`
          : `${leaderPhrase} encabeza la tabla de goleadores del Mundial 2026 con ${lv} ${noun}.`,
        en: isTie
          ? `${leaderPhrase} share the top of the 2026 World Cup scoring charts with ${lv} ${noun} each.`
          : `${leaderPhrase} tops the 2026 World Cup scoring charts with ${lv} ${noun}.`,
        fr: isTie
          ? `${leaderPhrase} se partagent la tête du classement des buteurs de la Coupe du Monde 2026 avec ${lv} ${noun} chacun.`
          : `${leaderPhrase} est en tête du classement des buteurs de la Coupe du Monde 2026 avec ${lv} ${noun}.`,
        pt: isTie
          ? `${leaderPhrase} dividem a liderança da artilharia da Copa do Mundo 2026 com ${lv} ${noun} cada.`
          : `${leaderPhrase} lidera a artilharia da Copa do Mundo 2026 com ${lv} ${noun}.`,
        de: isTie
          ? `${leaderPhrase} führen die Torschützenliste der WM 2026 gemeinsam mit je ${lv} ${noun} an.`
          : `${leaderPhrase} führt die Torschützenliste der WM 2026 mit ${lv} ${noun} an.`,
        ru: isTie
          ? `${leaderPhrase} делят первое место в списке бомбардиров ЧМ 2026 — по ${lv} ${noun}.`
          : `${leaderPhrase} возглавляет список бомбардиров ЧМ 2026 с ${lv} ${noun}.`,
        ar: isTie
          ? `يتقاسم ${leaderPhrase} صدارة هدافي كأس العالم 2026 برصيد ${lv} ${noun} لكل منهما.`
          : `يتصدّر ${leaderPhrase} ترتيب هدافي كأس العالم 2026 برصيد ${lv} ${noun}.`,
      }
    : {
        es: isTie
          ? `${leaderPhrase} comparten el liderato de asistencias del Mundial 2026 con ${lv} ${noun} cada uno.`
          : `${leaderPhrase} lidera la tabla de asistencias del Mundial 2026 con ${lv} ${noun}.`,
        en: isTie
          ? `${leaderPhrase} share the lead of the 2026 World Cup assist chart with ${lv} ${noun} each.`
          : `${leaderPhrase} leads the assist chart of the 2026 World Cup with ${lv} ${noun}.`,
        fr: isTie
          ? `${leaderPhrase} se partagent la tête du classement des passeurs de la Coupe du Monde 2026 avec ${lv} ${noun} chacun.`
          : `${leaderPhrase} mène le classement des passeurs de la Coupe du Monde 2026 avec ${lv} ${noun}.`,
        pt: isTie
          ? `${leaderPhrase} dividem a liderança de assistências da Copa do Mundo 2026 com ${lv} ${noun} cada.`
          : `${leaderPhrase} lidera a tabela de assistências da Copa do Mundo 2026 com ${lv} ${noun}.`,
        de: isTie
          ? `${leaderPhrase} führen die Vorlagenliste der WM 2026 gemeinsam mit je ${lv} ${noun} an.`
          : `${leaderPhrase} führt die Vorlagenliste der WM 2026 mit ${lv} ${noun} an.`,
        ru: isTie
          ? `${leaderPhrase} делят первое место по передачам на ЧМ 2026 — по ${lv} ${noun}.`
          : `${leaderPhrase} лидирует по передачам на ЧМ 2026 с ${lv} ${noun}.`,
        ar: isTie
          ? `يتقاسم ${leaderPhrase} صدارة صانعي الأهداف في كأس العالم 2026 برصيد ${lv} ${noun} لكل منهما.`
          : `يتصدّر ${leaderPhrase} قائمة صانعي الأهداف في كأس العالم 2026 برصيد ${lv} ${noun}.`,
      };

  // ── Perseguidores (los 2 siguientes tras el/los líderes) ──
  const chasers = list.filter(p => val(p) < lv).slice(0, 2).map(p => `${p.playerName} (${p.teamName}, ${val(p)})`);
  const followPhrase: Record<Lang, string> = {
    es: chasers.length ? ` Le${isTie ? 's' : ''} siguen ${joinNames(chasers, lang)}.` : '',
    en: chasers.length ? ` They are followed by ${joinNames(chasers, lang)}.` : '',
    fr: chasers.length ? ` Suivent ${joinNames(chasers, lang)}.` : '',
    pt: chasers.length ? ` Em seguida vêm ${joinNames(chasers, lang)}.` : '',
    de: chasers.length ? ` Dahinter folgen ${joinNames(chasers, lang)}.` : '',
    ru: chasers.length ? ` Далее идут ${joinNames(chasers, lang)}.` : '',
    ar: chasers.length ? ` يليه ${joinNames(chasers, lang)}.` : '',
  };

  // ── Cierre con el total ──
  const total = list.reduce((s, p) => s + val(p), 0);
  const count = list.length;
  const closing: Record<Lang, string> = stat === 'goals'
    ? {
        es: ` Entre los ${count} máximos artilleros suman ${total} goles en lo que va del torneo.`,
        en: ` The top ${count} scorers have netted ${total} goals so far in the tournament.`,
        fr: ` Les ${count} meilleurs buteurs totalisent ${total} buts depuis le début du tournoi.`,
        pt: ` Os ${count} maiores artilheiros somam ${total} gols até aqui no torneio.`,
        de: ` Die ${count} besten Torschützen kommen bisher zusammen auf ${total} Tore.`,
        ru: ` На счету ${count} лучших бомбардиров уже ${total} голов на турнире.`,
        ar: ` سجّل أفضل ${count} هدافين ${total} هدفاً حتى الآن في البطولة.`,
      }
    : {
        es: ` En total, ${count} jugadores registran asistencias.`,
        en: ` A total of ${count} players have provided assists.`,
        fr: ` Au total, ${count} joueurs ont délivré des passes décisives.`,
        pt: ` No total, ${count} jogadores registram assistências.`,
        de: ` Insgesamt haben ${count} Spieler Vorlagen beigesteuert.`,
        ru: ` Всего передачи записали на свой счёт ${count} игроков.`,
        ar: ` في المجموع، سجّل ${count} لاعباً تمريرات حاسمة.`,
      };

  return `${lead[lang]}${followPhrase[lang]}${closing[lang]}`;
}
