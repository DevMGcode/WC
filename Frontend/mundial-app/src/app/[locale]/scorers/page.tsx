import ScorersClient from './ScorersClient';
import { getTopScorers } from '@/services/publicTournament';
import { localizeTeamName } from '@/lib/i18n/teamNames';
import { buildScorersNarrative } from './scorersNarrative';

/**
 * Server component de /scorers.
 *
 * La tabla interactiva vive en ScorersClient (datos por React Query), así que
 * NO llega al HTML del servidor. Este bloque SSR garantiza que el crawler
 * reciba contenido real e indexable: un h1, la narrativa del ranking en prosa
 * (7 idiomas) y la lista top-10 como texto. ScorersClient lo oculta al montar
 * (id "scorers-ssr-summary") porque él muestra la misma información con la
 * tabla interactiva — para el usuario no hay duplicado.
 */

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
const pickLang = (locale: string): Lang => {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
};
const H1: Record<Lang, string> = {
  es: 'Goleadores del Mundial 2026',
  en: '2026 World Cup Top Scorers',
  fr: 'Meilleurs buteurs de la Coupe du Monde 2026',
  pt: 'Artilheiros da Copa do Mundo 2026',
  de: 'WM 2026 Torschützenliste',
  ru: 'Бомбардиры ЧМ 2026',
  ar: 'هدافو كأس العالم 2026',
};
const GOALS_COL: Record<Lang, string> = {
  es: 'goles', en: 'goals', fr: 'buts', pt: 'gols', de: 'Tore', ru: 'голы', ar: 'أهداف',
};

export default async function ScorersPage({ params }: { params: { locale: string } }) {
  const locale = params.locale ?? 'es';
  const lang = pickLang(locale);
  const scorers = await getTopScorers(10);
  const localized = scorers.map((s) => ({ ...s, teamName: localizeTeamName(s.teamName, locale) || s.teamName }));
  const narrative = buildScorersNarrative(localized, 'goals', locale);

  return (
    <>
      <ScorersClient />
      {localized.length > 0 && (
        <section id="scorers-ssr-summary" aria-label={H1[lang]}
          style={{ maxWidth: 900, margin: '0 auto', padding: '4px 20px 40px' }}>
          <div style={{ borderRadius: 16, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#eafbea', margin: '0 0 8px', lineHeight: 1.35 }}>{H1[lang]}</h1>
            {narrative && (
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(226,241,226,0.72)', margin: '0 0 10px' }}>{narrative}</p>
            )}
            <ol style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(210,228,210,0.6)', margin: 0, paddingLeft: 18 }}>
              {localized.map((s, i) => (
                <li key={`${s.playerName}-${i}`}>
                  {s.playerName} — {s.teamName}: {s.goals} {GOALS_COL[lang]}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
