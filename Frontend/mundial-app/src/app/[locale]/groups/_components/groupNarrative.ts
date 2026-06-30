/**
 * Generador de texto editorial por grupo (7 idiomas).
 *
 * Construye una descripción en prosa a partir de los datos REALES de la tabla
 * de posiciones: líder, equipos en zona de clasificación, eliminados, racha y
 * diferencia de goles. Sirve a dos propósitos:
 *   1. UX → contexto legible que acompaña a la tabla.
 *   2. SEO / AdSense → contenido textual original e indexable.
 *
 * Los nombres de equipo (x.team.name) y el nombre del grupo (group.name) ya
 * llegan localizados; aquí se traduce la plantilla de la frase.
 */
import type { Group, Standing } from './types';

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

const CONJ: Record<Lang, string> = { es: 'y', en: 'and', fr: 'et', pt: 'e', de: 'und', ru: 'и', ar: 'و' };

// [singular, plural] por idioma para victorias / empates / derrotas / jornadas.
const WORDS: Record<Lang, { win: [string, string]; draw: [string, string]; loss: [string, string]; matchday: [string, string] }> = {
  es: { win: ['victoria', 'victorias'], draw: ['empate', 'empates'], loss: ['derrota', 'derrotas'], matchday: ['jornada', 'jornadas'] },
  en: { win: ['win', 'wins'], draw: ['draw', 'draws'], loss: ['loss', 'losses'], matchday: ['matchday', 'matchdays'] },
  fr: { win: ['victoire', 'victoires'], draw: ['nul', 'nuls'], loss: ['défaite', 'défaites'], matchday: ['journée', 'journées'] },
  pt: { win: ['vitória', 'vitórias'], draw: ['empate', 'empates'], loss: ['derrota', 'derrotas'], matchday: ['rodada', 'rodadas'] },
  de: { win: ['Sieg', 'Siege'], draw: ['Unentschieden', 'Unentschieden'], loss: ['Niederlage', 'Niederlagen'], matchday: ['Spieltag', 'Spieltagen'] },
  ru: { win: ['победа', 'победы'], draw: ['ничья', 'ничьи'], loss: ['поражение', 'поражения'], matchday: ['тур', 'тура'] },
  ar: { win: ['فوز', 'انتصارات'], draw: ['تعادل', 'تعادلات'], loss: ['خسارة', 'خسائر'], matchday: ['جولة', 'جولات'] },
};

/** Une una lista con comas y la conjunción final correcta ("a, b y c"). */
function joinNames(names: string[], lang: Lang): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} ${CONJ[lang]} ${names[names.length - 1]}`;
}

/** "3 victorias y 1 empate" en el idioma dado. */
function recordPhrase(s: Standing, lang: Lang): string {
  const w = WORDS[lang];
  const parts: string[] = [];
  if (s.won)   parts.push(`${s.won} ${s.won === 1 ? w.win[0] : w.win[1]}`);
  if (s.drawn) parts.push(`${s.drawn} ${s.drawn === 1 ? w.draw[0] : w.draw[1]}`);
  if (s.lost)  parts.push(`${s.lost} ${s.lost === 1 ? w.loss[0] : w.loss[1]}`);
  return joinNames(parts, lang);
}

/**
 * Devuelve la descripción del grupo según su estado:
 *  - sin empezar (0 partidos)  → presentación de los equipos
 *  - en curso                  → líder, escolta y quiénes pelean
 *  - finalizado (round-robin)  → clasificados y eliminados
 */
export function buildGroupNarrative(group: Group, locale: string): string {
  const lang = pickLang(locale);
  const s = [...group.standings].sort((a, b) => a.position - b.position);
  if (s.length === 0) return '';

  const name = group.name; // ya viene localizado: "Grupo A" / "Group A" / "Groupe A"
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
    const list = joinNames(names, lang);
    const tpl: Record<Lang, string> = {
      es: `El ${name} del Mundial 2026 está integrado por ${list}. Se enfrentan todos contra todos y los dos primeros del grupo aseguran su clasificación a la fase eliminatoria.`,
      en: `${name} of the 2026 World Cup features ${list}. They face each other in a round-robin format, and the top two of the group secure their place in the knockout round.`,
      fr: `Le ${name} de la Coupe du Monde 2026 est composé de ${list}. Les équipes s'affrontent toutes entre elles et les deux premières du groupe se qualifient pour la phase à élimination directe.`,
      pt: `O ${name} da Copa do Mundo 2026 é composto por ${list}. As equipes se enfrentam em pontos corridos e as duas primeiras do grupo garantem a classificação para a fase eliminatória.`,
      de: `${name} der WM 2026 besteht aus ${list}. Die Teams spielen jeder gegen jeden, und die besten zwei der Gruppe ziehen in die K.-o.-Runde ein.`,
      ru: `${name} Чемпионата мира 2026 состоит из ${list}. Команды играют каждая с каждой, и две лучшие команды группы выходят в плей-офф.`,
      ar: `تتكوّن ${name} في كأس العالم 2026 من ${list}. تلعب الفرق بنظام الدوري، ويتأهل أول فريقين من المجموعة إلى الدور الإقصائي.`,
    };
    return tpl[lang];
  }

  const rec = recordPhrase(leader, lang);
  const recPart = rec ? ` (${rec})` : '';
  const gd = leader.goalDiff > 0 ? `+${leader.goalDiff}` : `${leader.goalDiff}`;

  // ── Finalizado ───────────────────────────────────────────────
  if (allPlayed) {
    const qualified = joinNames([leader.team.name, second.team.name], lang);
    const eliminated = joinNames(s.slice(2).map(x => x.team.name), lang);
    const tpl: Record<Lang, string> = {
      es: `${leader.team.name} terminó líder del ${name} con ${leader.points} puntos${recPart} y una diferencia de gol de ${gd}. ${qualified} clasificaron a la fase eliminatoria, mientras que ${eliminated} quedaron eliminados.`,
      en: `${leader.team.name} finished top of ${name} with ${leader.points} points${recPart} and a ${gd} goal difference. ${qualified} qualified for the knockout stage, while ${eliminated} were eliminated.`,
      fr: `${leader.team.name} a terminé en tête du ${name} avec ${leader.points} points${recPart} et une différence de buts de ${gd}. ${qualified} se sont qualifiés pour la phase à élimination directe, tandis que ${eliminated} ont été éliminés.`,
      pt: `${leader.team.name} terminou na liderança do ${name} com ${leader.points} pontos${recPart} e um saldo de gols de ${gd}. ${qualified} se classificaram para a fase eliminatória, enquanto ${eliminated} foram eliminados.`,
      de: `${leader.team.name} beendete ${name} als Erster mit ${leader.points} Punkten${recPart} und einer Tordifferenz von ${gd}. ${qualified} qualifizierten sich für die K.-o.-Runde, während ${eliminated} ausschieden.`,
      ru: `${leader.team.name} занял первое место в ${name} с ${leader.points} очками${recPart} и разницей мячей ${gd}. ${qualified} вышли в плей-офф, а ${eliminated} выбыли.`,
      ar: `أنهى ${leader.team.name} ${name} في الصدارة برصيد ${leader.points} نقطة${recPart} وبفارق أهداف ${gd}. تأهل ${qualified} إلى الدور الإقصائي، بينما خرج ${eliminated}.`,
    };
    return tpl[lang];
  }

  // ── En curso ─────────────────────────────────────────────────
  const md = maxPlayed;
  const mdWord = md === 1 ? WORDS[lang].matchday[0] : WORDS[lang].matchday[1];
  const chasers = s.slice(2);
  const chaserList = joinNames(chasers.map(x => `${x.team.name} (${x.points} pts)`), lang);
  const manyChasers = chasers.length !== 1;

  const secondPart: Record<Lang, string> = {
    es: second ? `, seguido de ${second.team.name} con ${second.points}` : '',
    en: second ? `, followed by ${second.team.name} with ${second.points}` : '',
    fr: second ? `, suivi de ${second.team.name} avec ${second.points}` : '',
    pt: second ? `, seguido por ${second.team.name} com ${second.points}` : '',
    de: second ? `, gefolgt von ${second.team.name} mit ${second.points}` : '',
    ru: second ? `, за ним ${second.team.name} с ${second.points}` : '',
    ar: second ? `، يليه ${second.team.name} بـ ${second.points}` : '',
  };

  const chasersPhrase: Record<Lang, string> = {
    es: chasers.length ? ` ${chaserList} ${manyChasers ? 'todavía pelean' : 'todavía pelea'} por avanzar.` : '',
    en: chasers.length ? ` ${chaserList} ${manyChasers ? 'are' : 'is'} still fighting to advance.` : '',
    fr: chasers.length ? ` ${chaserList} ${manyChasers ? 'luttent encore' : 'lutte encore'} pour se qualifier.` : '',
    pt: chasers.length ? ` ${chaserList} ${manyChasers ? 'ainda lutam' : 'ainda luta'} para avançar.` : '',
    de: chasers.length ? ` ${chaserList} ${manyChasers ? 'kämpfen' : 'kämpft'} noch um den Aufstieg.` : '',
    ru: chasers.length ? ` ${chaserList} ещё ${manyChasers ? 'борются' : 'борется'} за выход.` : '',
    ar: chasers.length ? ` لا يزال ${chaserList} ${manyChasers ? 'يتنافسون' : 'يتنافس'} على التأهل.` : '',
  };

  const tpl: Record<Lang, string> = {
    es: `Tras ${md} ${mdWord}, ${leader.team.name} lidera el ${name} con ${leader.points} puntos${recPart}${secondPart.es}. Si se mantienen las posiciones, ambos avanzarían a la siguiente ronda.${chasersPhrase.es}`,
    en: `After ${md} ${mdWord}, ${leader.team.name} leads ${name} with ${leader.points} points${recPart}${secondPart.en}. If the standings hold, both would reach the next round.${chasersPhrase.en}`,
    fr: `Après ${md} ${mdWord}, ${leader.team.name} est en tête du ${name} avec ${leader.points} points${recPart}${secondPart.fr}. Si le classement se maintient, les deux atteindraient le tour suivant.${chasersPhrase.fr}`,
    pt: `Após ${md} ${mdWord}, ${leader.team.name} lidera o ${name} com ${leader.points} pontos${recPart}${secondPart.pt}. Se as posições se mantiverem, ambos avançariam à próxima fase.${chasersPhrase.pt}`,
    de: `Nach ${md} ${mdWord} führt ${leader.team.name} ${name} mit ${leader.points} Punkten${recPart}${secondPart.de} an. Wenn es so bleibt, würden beide die nächste Runde erreichen.${chasersPhrase.de}`,
    ru: `После ${md} ${mdWord} ${leader.team.name} возглавляет ${name} с ${leader.points} очками${recPart}${secondPart.ru}. Если положение сохранится, оба выйдут в следующий раунд.${chasersPhrase.ru}`,
    ar: `بعد ${md} ${mdWord}، يتصدّر ${leader.team.name} ${name} برصيد ${leader.points} نقطة${recPart}${secondPart.ar}. وإذا بقيت النتائج كما هي، سيتأهل كلاهما إلى الدور التالي.${chasersPhrase.ar}`,
  };
  return tpl[lang];
}

/** Texto introductorio editorial de la fase de grupos (7 idiomas). */
export function groupsIntroText(locale: string): string {
  const intro: Record<Lang, string> = {
    es: 'La fase de grupos del Mundial 2026 reparte a las selecciones en grupos de cuatro equipos que juegan todos contra todos. Los dos primeros de cada grupo avanzan a la fase eliminatoria. A continuación encontrás las posiciones actualizadas de cada grupo —partidos jugados, ganados, empatados y perdidos, diferencia de goles y puntos— junto a un análisis de la situación de cada selección.',
    en: 'The group stage of the 2026 World Cup splits the national teams into groups of four that play each other in a round-robin. The top two of each group advance to the knockout round. Below you will find the up-to-date standings of every group — matches played, won, drawn and lost, goal difference and points — along with an analysis of where each team stands.',
    fr: 'La phase de groupes de la Coupe du Monde 2026 répartit les sélections en groupes de quatre équipes qui s\'affrontent toutes entre elles. Les deux premières de chaque groupe accèdent à la phase à élimination directe. Vous trouverez ci-dessous le classement actualisé de chaque groupe — matchs joués, gagnés, nuls et perdus, différence de buts et points — ainsi qu\'une analyse de la situation de chaque sélection.',
    pt: 'A fase de grupos da Copa do Mundo 2026 divide as seleções em grupos de quatro equipes que jogam em pontos corridos. As duas primeiras de cada grupo avançam à fase eliminatória. A seguir você encontra a classificação atualizada de cada grupo — jogos disputados, ganhos, empatados e perdidos, saldo de gols e pontos — junto a uma análise da situação de cada seleção.',
    de: 'Die Gruppenphase der WM 2026 teilt die Nationalmannschaften in Vierergruppen ein, die jeder gegen jeden spielen. Die besten zwei jeder Gruppe ziehen in die K.-o.-Runde ein. Nachfolgend findest du die aktuelle Tabelle jeder Gruppe — gespielte, gewonnene, unentschiedene und verlorene Spiele, Tordifferenz und Punkte — sowie eine Analyse der Lage jeder Mannschaft.',
    ru: 'Групповой этап Чемпионата мира 2026 распределяет сборные по группам из четырёх команд, которые играют каждая с каждой. Две лучшие команды каждой группы выходят в плей-офф. Ниже представлена актуальная таблица каждой группы — сыгранные, выигранные, ничейные и проигранные матчи, разница мячей и очки — вместе с анализом положения каждой сборной.',
    ar: 'يوزّع دور المجموعات في كأس العالم 2026 المنتخبات على مجموعات من أربعة فرق تلعب بنظام الدوري. يتأهل أول فريقين من كل مجموعة إلى الدور الإقصائي. في ما يلي ترتيب محدّث لكل مجموعة — المباريات المُلعَبة والمكسوبة والمتعادلة والمخسورة، وفارق الأهداف والنقاط — إلى جانب تحليل لوضع كل منتخب.',
  };
  return intro[pickLang(locale)];
}
