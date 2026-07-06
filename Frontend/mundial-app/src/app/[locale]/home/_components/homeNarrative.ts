/**
 * Narrativa editorial de la página de inicio (7 idiomas).
 *
 * Genera, desde los fixtures REALES del torneo, el contenido indexable de la
 * home: qué es el sitio, estado del torneo (fase y partidos jugados), últimos
 * resultados y próximos partidos con enlace a su ficha. Server-safe (sin hooks):
 * lo consume el server component de la home para renderizarlo en SSR.
 */
import { localizeTeamName } from '@/lib/i18n/teamNames';

type FixtureLite = {
  id: number;
  status: string;
  kickoffAt: Date;
  stageName?: string;
  homeTeam?: { name: string };
  awayTeam?: { name: string };
  homeScore?: number;
  awayScore?: number;
  homePenalty?: number | null;
  awayPenalty?: number | null;
};

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
const pickLang = (locale: string): Lang => {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
};

// El stageName llega de la BD en español; se mapea por patrón al idioma activo.
// `label` = con artículo, para la frase en prosa ("la competencia está en …").
// `short` = versión corta capitalizada, para el chip visual de "Fase actual".
const STAGE_LABEL: { pattern: RegExp; label: Record<Lang, string>; short: Record<Lang, string> }[] = [
  { pattern: /dieciseisavos|round of 32|16avos/i,
    label: { es: 'los dieciseisavos de final', en: 'the round of 32', fr: 'les seizièmes de finale', pt: 'os 16 avos de final', de: 'das Sechzehntelfinale', ru: '1/16 финала', ar: 'دور الـ32' },
    short: { es: 'Dieciseisavos', en: 'Round of 32', fr: 'Seizièmes', pt: '16 avos', de: 'Sechzehntelfinale', ru: '1/16 финала', ar: 'دور الـ32' } },
  { pattern: /octavos|round of 16/i,
    label: { es: 'los octavos de final', en: 'the round of 16', fr: 'les huitièmes de finale', pt: 'as oitavas de final', de: 'das Achtelfinale', ru: '1/8 финала', ar: 'ثمن النهائي' },
    short: { es: 'Octavos de final', en: 'Round of 16', fr: 'Huitièmes', pt: 'Oitavas', de: 'Achtelfinale', ru: '1/8 финала', ar: 'ثمن النهائي' } },
  { pattern: /cuartos|quarter/i,
    label: { es: 'los cuartos de final', en: 'the quarter-finals', fr: 'les quarts de finale', pt: 'as quartas de final', de: 'das Viertelfinale', ru: 'четвертьфиналы', ar: 'ربع النهائي' },
    short: { es: 'Cuartos de final', en: 'Quarter-finals', fr: 'Quarts de finale', pt: 'Quartas', de: 'Viertelfinale', ru: 'Четвертьфиналы', ar: 'ربع النهائي' } },
  { pattern: /semi/i,
    label: { es: 'las semifinales', en: 'the semi-finals', fr: 'les demi-finales', pt: 'as semifinais', de: 'das Halbfinale', ru: 'полуфиналы', ar: 'نصف النهائي' },
    short: { es: 'Semifinales', en: 'Semi-finals', fr: 'Demi-finales', pt: 'Semifinais', de: 'Halbfinale', ru: 'Полуфиналы', ar: 'نصف النهائي' } },
  { pattern: /tercer|third|3er|3rd|play-?off/i,
    label: { es: 'el partido por el tercer puesto', en: 'the third-place play-off', fr: 'le match pour la troisième place', pt: 'a disputa de terceiro lugar', de: 'das Spiel um Platz drei', ru: 'матч за третье место', ar: 'مباراة المركز الثالث' },
    short: { es: 'Tercer puesto', en: 'Third place', fr: '3e place', pt: '3º lugar', de: 'Platz drei', ru: 'Матч за 3-е место', ar: 'المركز الثالث' } },
  { pattern: /final/i,
    label: { es: 'la gran final', en: 'the grand final', fr: 'la grande finale', pt: 'a grande final', de: 'das große Finale', ru: 'большой финал', ar: 'النهائي الكبير' },
    short: { es: 'Gran final', en: 'Grand final', fr: 'Grande finale', pt: 'Grande final', de: 'Großes Finale', ru: 'Финал', ar: 'النهائي' } },
  { pattern: /grupo|group/i,
    label: { es: 'la fase de grupos', en: 'the group stage', fr: 'la phase de groupes', pt: 'a fase de grupos', de: 'die Gruppenphase', ru: 'групповой этап', ar: 'دور المجموعات' },
    short: { es: 'Fase de grupos', en: 'Group stage', fr: 'Phase de groupes', pt: 'Fase de grupos', de: 'Gruppenphase', ru: 'Групповой этап', ar: 'دور المجموعات' } },
];

function stageEntry(stageName: string | undefined) {
  if (!stageName) return null;
  return STAGE_LABEL.find(s => s.pattern.test(stageName)) ?? null;
}

export type HomeEditorial = {
  title: string;
  intro: string;
  state: string;
  host: string;
  played: number;
  total: number;
  phaseShort: string | null;
  playedLabel: string;
  phaseLabel: string;
  latestLabel: string;
  latestResults: { home: string; away: string; score: string }[];
  nextLabel: string;
  nextMatches: { id: number; teams: string; date: string }[];
  ctaLogin: string;
  ctaRegister: string;
  exploreLabel: string;
  links: { href: string; label: string }[];
};

const TITLE: Record<Lang, string> = {
  es: 'Mundial 2026: resultados, calendario, cuadro y porras',
  en: 'World Cup 2026: results, schedule, bracket and predictions',
  fr: 'Coupe du Monde 2026 : résultats, calendrier, tableau et pronostics',
  pt: 'Copa do Mundo 2026: resultados, calendário, chaveamento e palpites',
  de: 'WM 2026: Ergebnisse, Spielplan, Turnierbaum und Tipps',
  ru: 'ЧМ 2026: результаты, календарь, сетка и прогнозы',
  ar: 'كأس العالم 2026: النتائج والجدول والمخطط والتوقعات',
};

const INTRO: Record<Lang, string> = {
  es: 'Orionix Gol te trae la Copa del Mundo 2026 partido a partido: marcadores en vivo, calendario completo, fase de grupos, cuadro de eliminatorias, tabla de goleadores y porras para competir con tus amigos en ligas privadas.',
  en: 'Orionix Gol brings you the 2026 FIFA World Cup match by match: live scores, full schedule, group stage, knockout bracket, top scorers and score predictions to compete with your friends in private leagues.',
  fr: 'Orionix Gol vous fait vivre la Coupe du Monde 2026 match par match : scores en direct, calendrier complet, phase de groupes, tableau final, classement des buteurs et pronostics pour défier vos amis dans des ligues privées.',
  pt: 'O Orionix Gol traz a Copa do Mundo 2026 jogo a jogo: placares ao vivo, calendário completo, fase de grupos, chaveamento do mata-mata, artilharia e palpites para competir com seus amigos em ligas privadas.',
  de: 'Orionix Gol bringt dir die WM 2026 Spiel für Spiel: Live-Ergebnisse, kompletter Spielplan, Gruppenphase, K.-o.-Baum, Torschützenliste und Tipps, um in privaten Ligen gegen Freunde anzutreten.',
  ru: 'Orionix Gol — Чемпионат мира 2026 матч за матчем: счёт в прямом эфире, полный календарь, групповой этап, сетка плей-офф, список бомбардиров и прогнозы, чтобы соревноваться с друзьями в частных лигах.',
  ar: 'يقدّم لك Orionix Gol كأس العالم 2026 مباراة بمباراة: نتائج مباشرة، جدول كامل، دور المجموعات، مخطط الأدوار الإقصائية، ترتيب الهدافين وتوقعات لمنافسة أصدقائك في دوريات خاصة.',
};

const HOST: Record<Lang, string> = {
  es: 'USA · México · Canadá', en: 'USA · Mexico · Canada', fr: 'USA · Mexique · Canada',
  pt: 'EUA · México · Canadá', de: 'USA · Mexiko · Kanada', ru: 'США · Мексика · Канада',
  ar: 'الولايات المتحدة · المكسيك · كندا',
};

const PLAYED_LABEL: Record<Lang, string> = { es: 'Partidos jugados', en: 'Matches played', fr: 'Matchs joués', pt: 'Jogos disputados', de: 'Gespielte Spiele', ru: 'Сыграно матчей', ar: 'المباريات المُقامة' };
const PHASE_LABEL: Record<Lang, string> = { es: 'Fase actual', en: 'Current stage', fr: 'Phase actuelle', pt: 'Fase atual', de: 'Aktuelle Phase', ru: 'Текущая стадия', ar: 'المرحلة الحالية' };
const LATEST_LABEL: Record<Lang, string> = { es: 'Últimos resultados', en: 'Latest results', fr: 'Derniers résultats', pt: 'Últimos resultados', de: 'Letzte Ergebnisse', ru: 'Последние результаты', ar: 'آخر النتائج' };
const NEXT_LABEL: Record<Lang, string> = { es: 'Próximos partidos', en: 'Upcoming matches', fr: 'Prochains matchs', pt: 'Próximos jogos', de: 'Nächste Spiele', ru: 'Ближайшие матчи', ar: 'المباريات القادمة' };
const CTA_LOGIN: Record<Lang, string> = { es: 'Iniciar sesión', en: 'Log in', fr: 'Se connecter', pt: 'Entrar', de: 'Anmelden', ru: 'Войти', ar: 'تسجيل الدخول' };
const CTA_REGISTER: Record<Lang, string> = { es: 'Crear cuenta gratis', en: 'Create a free account', fr: 'Créer un compte gratuit', pt: 'Criar conta grátis', de: 'Kostenloses Konto erstellen', ru: 'Создать бесплатный аккаунт', ar: 'أنشئ حساباً مجانياً' };
const EXPLORE: Record<Lang, string> = { es: 'Explorar', en: 'Explore', fr: 'Explorer', pt: 'Explorar', de: 'Entdecken', ru: 'Разделы', ar: 'استكشف' };
const LINK_LABELS: Record<Lang, [string, string, string, string]> = {
  es: ['Calendario de partidos', 'Grupos y eliminatorias', 'Tabla de goleadores', 'Cómo funciona'],
  en: ['Match schedule', 'Groups & knockout bracket', 'Top scorers', 'How it works'],
  fr: ['Calendrier des matchs', 'Groupes et tableau final', 'Meilleurs buteurs', 'Comment ça marche'],
  pt: ['Calendário de jogos', 'Grupos e mata-mata', 'Artilharia', 'Como funciona'],
  de: ['Spielplan', 'Gruppen & K.-o.-Runde', 'Torschützenliste', 'So funktioniert’s'],
  ru: ['Календарь матчей', 'Группы и плей-офф', 'Бомбардиры', 'Как это работает'],
  ar: ['جدول المباريات', 'المجموعات والأدوار الإقصائية', 'ترتيب الهدافين', 'كيف يعمل'],
};

/** "Se han jugado X de Y partidos; el torneo está en {fase}." */
function buildState(played: number, total: number, phase: string | null, lang: Lang): string {
  const base: Record<Lang, string> = {
    es: `Ya se han jugado ${played} de los ${total} partidos del torneo`,
    en: `${played} of the tournament's ${total} matches have been played`,
    fr: `${played} des ${total} matchs du tournoi ont déjà été joués`,
    pt: `${played} dos ${total} jogos do torneio já foram disputados`,
    de: `${played} von ${total} Turnierspielen sind bereits absolviert`,
    ru: `Сыграно ${played} из ${total} матчей турнира`,
    ar: `أُقيمت ${played} من أصل ${total} مباراة في البطولة`,
  };
  if (!phase) return `${base[lang]}.`;
  const phasePart: Record<Lang, string> = {
    es: `; la competencia está en ${phase}`,
    en: `; the competition is now at ${phase}`,
    fr: ` ; la compétition en est à ${phase}`,
    pt: `; a competição está em ${phase}`,
    de: `; der Wettbewerb steht bei ${phase === 'das große Finale' ? 'dem großen Finale' : phase}`,
    ru: `; сейчас идёт ${phase}`,
    ar: `؛ وتجري الآن منافسات ${phase}`,
  };
  return `${base[lang]}${phasePart[lang]}.`;
}

export function buildHomeEditorial(fixtures: FixtureLite[], locale: string): HomeEditorial {
  const lang = pickLang(locale);
  const name = (t?: { name: string }) => localizeTeamName(t?.name, locale) || '?';
  const dateFmt = (d: Date) => {
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(d);
    } catch {
      return d.toISOString().slice(0, 10);
    }
  };

  const total = fixtures.length;
  const played = fixtures.filter(f => f.status === 'FINISHED').length;
  const nextScheduled = fixtures
    .filter(f => f.status === 'SCHEDULED' || f.status === 'LIVE')
    .sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime())[0];
  const stage = stageEntry(nextScheduled?.stageName);

  // Últimos 3 finalizados (más recientes primero), con penales si hubo tanda.
  const latestResults = fixtures
    .filter(f => f.status === 'FINISHED' && f.homeScore != null && f.awayScore != null)
    .sort((a, b) => b.kickoffAt.getTime() - a.kickoffAt.getTime())
    .slice(0, 3)
    .map(f => ({
      home: name(f.homeTeam),
      away: name(f.awayTeam),
      score: `${f.homeScore}-${f.awayScore}${f.homePenalty != null && f.awayPenalty != null ? ` (${f.homePenalty}-${f.awayPenalty})` : ''}`,
    }));

  // Próximos 4 programados/en vivo, con enlace a su ficha.
  const nextMatches = fixtures
    .filter(f => f.status === 'SCHEDULED' || f.status === 'LIVE')
    .sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime())
    .slice(0, 4)
    .map(f => ({ id: f.id, teams: `${name(f.homeTeam)} vs ${name(f.awayTeam)}`, date: dateFmt(f.kickoffAt) }));

  const [linkFixtures, linkGroups, linkScorers, linkFaq] = LINK_LABELS[lang];

  return {
    title: TITLE[lang],
    intro: INTRO[lang],
    state: buildState(played, total, stage?.label[lang] ?? null, lang),
    host: HOST[lang],
    played,
    total,
    phaseShort: stage?.short[lang] ?? null,
    playedLabel: PLAYED_LABEL[lang],
    phaseLabel: PHASE_LABEL[lang],
    latestLabel: LATEST_LABEL[lang],
    latestResults,
    nextLabel: NEXT_LABEL[lang],
    nextMatches,
    ctaLogin: CTA_LOGIN[lang],
    ctaRegister: CTA_REGISTER[lang],
    exploreLabel: EXPLORE[lang],
    links: [
      { href: 'fixtures', label: linkFixtures },
      { href: 'groups', label: linkGroups },
      { href: 'scorers', label: linkScorers },
      { href: 'faq', label: linkFaq },
    ],
  };
}
