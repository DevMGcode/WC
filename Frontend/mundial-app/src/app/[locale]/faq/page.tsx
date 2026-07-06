import Link from 'next/link';

/**
 * Preguntas frecuentes (7 idiomas) — página de contenido editorial original.
 *
 * Server component sin JS de cliente: el acordeón usa <details>/<summary>
 * nativos (liviano y accesible) y TODO el texto queda en el HTML del servidor,
 * indexable. Incluye el schema FAQPage (JSON-LD) para que Google pueda mostrar
 * las preguntas desplegadas en los resultados de búsqueda.
 *
 * Los textos describen reglas REALES de la app: porras que se bloquean al
 * inicio del partido, puntaje 3/1/0, gate Free por equipos favoritos, penales
 * puntuados como empate y ligas privadas creadas por Premium.
 */

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
const pickLang = (locale: string): Lang => {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
};

type QA = { q: string; a: string };
type FaqCopy = { badge: string; title: string; subtitle: string; ctaText: string; ctaRegister: string; items: QA[] };

const COPY: Record<Lang, FaqCopy> = {
  es: {
    badge: 'Ayuda', title: 'Cómo funciona Orionix Gol', subtitle: 'Todo lo que necesitás saber sobre Orionix Gol y las porras del Mundial 2026', ctaText: '¿Listo para jugar?', ctaRegister: 'Crear cuenta gratis',
    items: [
      { q: '¿Qué es Orionix Gol?', a: 'Orionix Gol es una plataforma para vivir el Mundial 2026: calendario con resultados en vivo, tablas de todos los grupos, cuadro de eliminatorias, ranking de goleadores y porras para competir con tus amigos. Funciona desde el navegador en cualquier dispositivo.' },
      { q: '¿Cómo funcionan las porras?', a: 'Una porra es tu pronóstico del marcador de un partido. Podés registrarla y editarla hasta el inicio del encuentro; desde ese momento queda bloqueada. Al terminar el partido se compara con el resultado real y sumás puntos según tu acierto.' },
      { q: '¿Cómo se calculan los puntos?', a: 'Marcador exacto: 3 puntos. Resultado correcto (acertás el ganador o el empate, aunque no el marcador): 1 punto. Si no acertás el resultado: 0 puntos. Con esos puntos competís en el ranking global y en tus ligas privadas.' },
      { q: '¿Qué incluye el plan gratuito y qué el Premium?', a: 'Con la cuenta gratuita ves todo el torneo (calendario, grupos, cuadro y top 10 de goleadores), hacés porras en los partidos de tus equipos favoritos y podés unirte a ligas privadas. El Pase Mundial (Premium) desbloquea porras en todos los partidos, top 50 de goleadores y asistencias, creación de ligas privadas y una experiencia sin anuncios.' },
      { q: '¿Qué pasa si un partido se define por penales?', a: 'Para la porra vale el marcador con el que el partido llegó al final del tiempo de juego: si terminó empatado y se definió en la tanda de penales, la porra se puntúa como empate. Los penales no modifican el puntaje de la porra, aunque sí se muestran en la ficha del partido.' },
      { q: '¿Cómo juego con mis amigos en una liga privada?', a: 'Un usuario Premium crea la liga y comparte su código de invitación; con ese código puede unirse cualquier persona, incluso con cuenta gratuita. Cada liga tiene su propio ranking, así compiten solo entre ustedes.' },
      { q: '¿Cada cuánto se actualizan los resultados?', a: 'Durante los partidos, los marcadores y eventos (goles, tarjetas, penales) se actualizan automáticamente en tiempo real. Las tablas de grupos, el cuadro de eliminatorias y los goleadores se actualizan solos al finalizar cada partido.' },
    ],
  },
  en: {
    badge: 'Help', title: 'How Orionix Gol works', subtitle: 'Everything you need to know about Orionix Gol and 2026 World Cup predictions', ctaText: 'Ready to play?', ctaRegister: 'Create a free account',
    items: [
      { q: 'What is Orionix Gol?', a: 'Orionix Gol is a platform to live the 2026 World Cup: schedule with live scores, standings for every group, knockout bracket, top-scorer rankings and score predictions to compete with your friends. It works in the browser on any device.' },
      { q: 'How do predictions work?', a: 'A prediction is your forecast of a match score. You can submit and edit it until kick-off; from that moment it is locked. When the match ends it is compared with the real result and you earn points based on your accuracy.' },
      { q: 'How are points calculated?', a: 'Exact score: 3 points. Correct outcome (you get the winner or the draw right, but not the exact score): 1 point. Wrong outcome: 0 points. Those points rank you in the global leaderboard and in your private leagues.' },
      { q: 'What does the free plan include, and what does Premium add?', a: 'With a free account you see the whole tournament (schedule, groups, bracket and top-10 scorers), predict matches of your favourite teams and join private leagues. The World Cup Pass (Premium) unlocks predictions on every match, top-50 scorers and assists, private league creation and an ad-free experience.' },
      { q: 'What happens if a match goes to penalties?', a: 'Predictions are scored on the result the match reached at the end of play: if it finished level and was decided in a shootout, the prediction is scored as a draw. The shootout does not change your prediction points, although it is shown on the match page.' },
      { q: 'How do I play with my friends in a private league?', a: 'A Premium user creates the league and shares its invite code; anyone can join with that code, even with a free account. Each league has its own leaderboard, so you compete only among yourselves.' },
      { q: 'How often are results updated?', a: 'During matches, scores and events (goals, cards, penalties) update automatically in real time. Group standings, the bracket and scorer rankings update on their own when each match ends.' },
    ],
  },
  fr: {
    badge: 'Aide', title: 'Comment fonctionne Orionix Gol', subtitle: 'Tout ce qu\'il faut savoir sur Orionix Gol et les pronostics de la Coupe du Monde 2026', ctaText: 'Prêt à jouer ?', ctaRegister: 'Créer un compte gratuit',
    items: [
      { q: 'Qu\'est-ce qu\'Orionix Gol ?', a: 'Orionix Gol est une plateforme pour vivre la Coupe du Monde 2026 : calendrier avec scores en direct, classements de tous les groupes, tableau final, classement des buteurs et pronostics pour défier vos amis. Elle fonctionne dans le navigateur sur n\'importe quel appareil.' },
      { q: 'Comment fonctionnent les pronostics ?', a: 'Un pronostic est votre prédiction du score d\'un match. Vous pouvez l\'enregistrer et le modifier jusqu\'au coup d\'envoi ; il est ensuite verrouillé. À la fin du match, il est comparé au résultat réel et vous gagnez des points selon votre précision.' },
      { q: 'Comment les points sont-ils calculés ?', a: 'Score exact : 3 points. Bon résultat (vous trouvez le vainqueur ou le nul, sans le score exact) : 1 point. Résultat manqué : 0 point. Ces points vous classent au classement global et dans vos ligues privées.' },
      { q: 'Que comprend le plan gratuit et qu\'ajoute le Premium ?', a: 'Avec un compte gratuit, vous voyez tout le tournoi (calendrier, groupes, tableau et top 10 des buteurs), pronostiquez les matchs de vos équipes favorites et rejoignez des ligues privées. Le Pass Mondial (Premium) débloque les pronostics sur tous les matchs, le top 50 des buteurs et passeurs, la création de ligues privées et une expérience sans publicité.' },
      { q: 'Que se passe-t-il si un match se décide aux tirs au but ?', a: 'Le pronostic est noté sur le résultat atteint à la fin du temps de jeu : si le match s\'est terminé à égalité et s\'est décidé aux tirs au but, le pronostic est noté comme un nul. La séance de tirs au but ne change pas vos points, même si elle est affichée sur la fiche du match.' },
      { q: 'Comment jouer avec mes amis dans une ligue privée ?', a: 'Un utilisateur Premium crée la ligue et partage son code d\'invitation ; n\'importe qui peut la rejoindre avec ce code, même avec un compte gratuit. Chaque ligue a son propre classement : vous ne rivalisez qu\'entre vous.' },
      { q: 'À quelle fréquence les résultats sont-ils mis à jour ?', a: 'Pendant les matchs, les scores et les événements (buts, cartons, penaltys) se mettent à jour automatiquement en temps réel. Les classements des groupes, le tableau et les buteurs se mettent à jour dès la fin de chaque match.' },
    ],
  },
  pt: {
    badge: 'Ajuda', title: 'Como funciona o Orionix Gol', subtitle: 'Tudo o que você precisa saber sobre o Orionix Gol e os palpites da Copa do Mundo 2026', ctaText: 'Pronto para jogar?', ctaRegister: 'Criar conta grátis',
    items: [
      { q: 'O que é o Orionix Gol?', a: 'O Orionix Gol é uma plataforma para viver a Copa do Mundo 2026: calendário com placares ao vivo, classificação de todos os grupos, chaveamento do mata-mata, ranking de artilheiros e palpites para competir com seus amigos. Funciona no navegador em qualquer dispositivo.' },
      { q: 'Como funcionam os palpites?', a: 'Um palpite é a sua previsão do placar de um jogo. Você pode registrá-lo e editá-lo até o início da partida; a partir daí ele fica bloqueado. Quando o jogo termina, ele é comparado com o resultado real e você soma pontos conforme o acerto.' },
      { q: 'Como os pontos são calculados?', a: 'Placar exato: 3 pontos. Resultado correto (você acerta o vencedor ou o empate, mas não o placar): 1 ponto. Errou o resultado: 0 pontos. Com esses pontos você compete no ranking global e nas suas ligas privadas.' },
      { q: 'O que inclui o plano gratuito e o que o Premium adiciona?', a: 'Com a conta gratuita você vê todo o torneio (calendário, grupos, chaveamento e top 10 de artilheiros), faz palpites nos jogos dos seus times favoritos e entra em ligas privadas. O Passe Mundial (Premium) desbloqueia palpites em todos os jogos, top 50 de artilheiros e assistências, criação de ligas privadas e uma experiência sem anúncios.' },
      { q: 'O que acontece se um jogo for decidido nos pênaltis?', a: 'O palpite é pontuado pelo placar com que o jogo chegou ao fim do tempo de jogo: se terminou empatado e foi decidido nos pênaltis, o palpite é pontuado como empate. A disputa de pênaltis não altera seus pontos, embora apareça na página do jogo.' },
      { q: 'Como jogo com meus amigos em uma liga privada?', a: 'Um usuário Premium cria a liga e compartilha o código de convite; qualquer pessoa pode entrar com esse código, mesmo com conta gratuita. Cada liga tem seu próprio ranking, então vocês competem só entre si.' },
      { q: 'Com que frequência os resultados são atualizados?', a: 'Durante os jogos, os placares e eventos (gols, cartões, pênaltis) são atualizados automaticamente em tempo real. A classificação dos grupos, o chaveamento e a artilharia se atualizam sozinhos ao fim de cada partida.' },
    ],
  },
  de: {
    badge: 'Hilfe', title: 'So funktioniert Orionix Gol', subtitle: 'Alles Wichtige über Orionix Gol und die WM-2026-Tipps', ctaText: 'Bereit zu spielen?', ctaRegister: 'Kostenloses Konto erstellen',
    items: [
      { q: 'Was ist Orionix Gol?', a: 'Orionix Gol ist eine Plattform für die WM 2026: Spielplan mit Live-Ergebnissen, Tabellen aller Gruppen, K.-o.-Baum, Torschützenliste und Tipps, um gegen Freunde anzutreten. Läuft im Browser auf jedem Gerät.' },
      { q: 'Wie funktionieren die Tipps?', a: 'Ein Tipp ist deine Vorhersage des Spielstands. Du kannst ihn bis zum Anpfiff abgeben und ändern; danach ist er gesperrt. Nach Spielende wird er mit dem echten Ergebnis verglichen und du bekommst Punkte je nach Treffsicherheit.' },
      { q: 'Wie werden die Punkte berechnet?', a: 'Exaktes Ergebnis: 3 Punkte. Richtiger Ausgang (Sieger oder Unentschieden richtig, aber nicht das exakte Ergebnis): 1 Punkt. Falscher Ausgang: 0 Punkte. Mit diesen Punkten trittst du in der globalen Rangliste und deinen privaten Ligen an.' },
      { q: 'Was enthält der Gratis-Plan und was bringt Premium?', a: 'Mit dem Gratis-Konto siehst du das ganze Turnier (Spielplan, Gruppen, Baum und Top-10-Torschützen), tippst die Spiele deiner Lieblingsteams und trittst privaten Ligen bei. Der WM-Pass (Premium) schaltet Tipps für alle Spiele, Top-50-Torschützen und -Vorlagen, das Erstellen privater Ligen und ein werbefreies Erlebnis frei.' },
      { q: 'Was passiert bei einem Elfmeterschießen?', a: 'Gewertet wird das Ergebnis am Ende der Spielzeit: Endete das Spiel unentschieden und wurde im Elfmeterschießen entschieden, zählt der Tipp als Unentschieden. Das Elfmeterschießen ändert deine Punkte nicht, wird aber auf der Spielseite angezeigt.' },
      { q: 'Wie spiele ich mit Freunden in einer privaten Liga?', a: 'Ein Premium-Nutzer erstellt die Liga und teilt den Einladungscode; mit diesem Code kann jeder beitreten, auch mit Gratis-Konto. Jede Liga hat ihre eigene Rangliste — ihr tretet nur untereinander an.' },
      { q: 'Wie oft werden die Ergebnisse aktualisiert?', a: 'Während der Spiele aktualisieren sich Spielstände und Ereignisse (Tore, Karten, Elfmeter) automatisch in Echtzeit. Gruppentabellen, Turnierbaum und Torschützenliste aktualisieren sich nach jedem Spielende von selbst.' },
    ],
  },
  ru: {
    badge: 'Помощь', title: 'Как работает Orionix Gol', subtitle: 'Всё, что нужно знать об Orionix Gol и прогнозах на ЧМ 2026', ctaText: 'Готовы играть?', ctaRegister: 'Создать бесплатный аккаунт',
    items: [
      { q: 'Что такое Orionix Gol?', a: 'Orionix Gol — платформа для Чемпионата мира 2026: календарь со счётом в прямом эфире, таблицы всех групп, сетка плей-офф, список бомбардиров и прогнозы, чтобы соревноваться с друзьями. Работает в браузере на любом устройстве.' },
      { q: 'Как работают прогнозы?', a: 'Прогноз — это ваша ставка на счёт матча. Его можно оформить и изменить до стартового свистка; после этого он блокируется. Когда матч заканчивается, прогноз сравнивается с реальным результатом и вы получаете очки за точность.' },
      { q: 'Как считаются очки?', a: 'Точный счёт: 3 очка. Верный исход (угадали победителя или ничью, но не точный счёт): 1 очко. Неверный исход: 0 очков. С этими очками вы соревнуетесь в общем рейтинге и в частных лигах.' },
      { q: 'Что входит в бесплатный план, а что даёт Premium?', a: 'С бесплатным аккаунтом вы видите весь турнир (календарь, группы, сетку и топ-10 бомбардиров), делаете прогнозы на матчи любимых команд и вступаете в частные лиги. Пропуск ЧМ (Premium) открывает прогнозы на все матчи, топ-50 бомбардиров и ассистентов, создание частных лиг и режим без рекламы.' },
      { q: 'Что происходит, если матч решается по пенальти?', a: 'Прогноз оценивается по счёту на конец игрового времени: если матч завершился вничью и исход решила серия пенальти, прогноз засчитывается как ничья. Серия пенальти не меняет ваши очки, хотя и отображается на странице матча.' },
      { q: 'Как играть с друзьями в частной лиге?', a: 'Пользователь Premium создаёт лигу и делится кодом приглашения; по этому коду присоединиться может любой, даже с бесплатным аккаунтом. У каждой лиги свой рейтинг — вы соревнуетесь только между собой.' },
      { q: 'Как часто обновляются результаты?', a: 'Во время матчей счёт и события (голы, карточки, пенальти) обновляются автоматически в реальном времени. Таблицы групп, сетка и список бомбардиров обновляются сами после окончания каждого матча.' },
    ],
  },
  ar: {
    badge: 'مساعدة', title: 'كيف يعمل Orionix Gol', subtitle: 'كل ما تحتاج معرفته عن Orionix Gol وتوقعات كأس العالم 2026', ctaText: 'جاهز للعب؟', ctaRegister: 'أنشئ حساباً مجانياً',
    items: [
      { q: 'ما هو Orionix Gol؟', a: 'Orionix Gol منصة لمتابعة كأس العالم 2026: جدول بنتائج مباشرة، ترتيب جميع المجموعات، مخطط الأدوار الإقصائية، ترتيب الهدافين وتوقعات لمنافسة أصدقائك. تعمل من المتصفح على أي جهاز.' },
      { q: 'كيف تعمل التوقعات؟', a: 'التوقع هو تخمينك لنتيجة المباراة. يمكنك تسجيله وتعديله حتى انطلاق المباراة؛ وبعدها يُقفل. عند انتهاء المباراة يُقارن بالنتيجة الحقيقية وتحصل على نقاط بحسب دقتك.' },
      { q: 'كيف تُحتسب النقاط؟', a: 'النتيجة الدقيقة: 3 نقاط. النتيجة الصحيحة (أصبت الفائز أو التعادل دون النتيجة الدقيقة): نقطة واحدة. إن أخطأت النتيجة: 0 نقاط. بهذه النقاط تنافس في الترتيب العام وفي دورياتك الخاصة.' },
      { q: 'ماذا تشمل الخطة المجانية وماذا يضيف Premium؟', a: 'بالحساب المجاني ترى البطولة كاملة (الجدول والمجموعات والمخطط وأفضل 10 هدافين)، وتتوقع مباريات فرقك المفضلة وتنضم إلى دوريات خاصة. يفتح Premium التوقعات في كل المباريات، وأفضل 50 هدافاً وصانع أهداف، وإنشاء الدوريات الخاصة، وتجربة بلا إعلانات.' },
      { q: 'ماذا يحدث إذا حُسمت المباراة بركلات الترجيح؟', a: 'يُحتسب التوقع على النتيجة عند نهاية وقت اللعب: إذا انتهت المباراة بالتعادل وحُسمت بركلات الترجيح، يُحتسب التوقع كتعادل. ركلات الترجيح لا تغيّر نقاطك، لكنها تظهر في صفحة المباراة.' },
      { q: 'كيف ألعب مع أصدقائي في دوري خاص؟', a: 'ينشئ مستخدم Premium الدوري ويشارك رمز الدعوة؛ ويمكن لأي شخص الانضمام بهذا الرمز حتى بحساب مجاني. لكل دوري ترتيبه الخاص، فتتنافسون بينكم فقط.' },
      { q: 'كم مرة تُحدَّث النتائج؟', a: 'أثناء المباريات تُحدَّث النتائج والأحداث (الأهداف والبطاقات والركلات) تلقائياً في الوقت الفعلي. ويُحدَّث ترتيب المجموعات والمخطط والهدافون تلقائياً عند نهاية كل مباراة.' },
    ],
  },
};

export default function FaqPage({ params }: { params: { locale: string } }) {
  const locale = params.locale ?? 'es';
  const lang = pickLang(locale);
  const C = COPY[lang];
  const isRtl = lang === 'ar';

  // Schema FAQPage → elegible para mostrar las preguntas desplegadas en Google.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: C.items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px 80px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.75)', margin: '0 0 10px' }}>{C.badge}</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: '#eafbea', margin: '0 0 8px', lineHeight: 1.25 }}>{C.title}</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(226,241,226,0.65)', margin: '0 0 28px' }}>{C.subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {C.items.map((item) => (
          <details key={item.q}
            style={{ borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 0' }}>
            <summary style={{ cursor: 'pointer', padding: '14px 18px', fontSize: 14.5, fontWeight: 700, color: '#d8ecd8', listStyle: 'none' }}>
              {item.q}
            </summary>
            <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'rgba(226,241,226,0.72)', margin: 0, padding: '0 18px 16px' }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(226,241,226,0.8)' }}>{C.ctaText}</span>
        <Link href={`/${locale}/register`}
          style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800, textDecoration: 'none', background: 'linear-gradient(135deg,#D4AF37,#b8962e)', color: '#0a0f0a', border: '1px solid rgba(212,175,55,0.65)' }}>
          {C.ctaRegister}
        </Link>
      </div>
    </div>
  );
}
