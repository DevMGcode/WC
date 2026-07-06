'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbCSQUjKrWQoNOUmGZ10';
const CONTACT_EMAIL = 'orionixgol@gmail.com';

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

type AboutCopy = {
  badge: string; title: string; subtitle: string; back: string; rights: string;
  whatT: string; whatB: string;
  offerT: string; offerItems: string[];
  premiumT: string; premiumB: string;
  dataT: string; dataB: string;
  whoT: string; whoB: string;
  contactT: string; contactIntro: string; contactMid: string; whatsappLabel: string;
};

const COPY: Record<Lang, AboutCopy> = {
  es: {
    badge: 'Nosotros', title: 'Acerca de Orionix Gol', subtitle: 'Tu plataforma para vivir el Mundial 2026', back: 'Volver', rights: '© 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS',
    whatT: 'Qué es Orionix Gol',
    whatB: 'Orionix Gol es un emprendimiento independiente que reúne en un solo lugar todo el Mundial 2026: calendario de partidos, tablas de cada grupo, goleadores, fase eliminatoria y el seguimiento minuto a minuto de los partidos en vivo. Todo en una experiencia rápida, moderna y pensada para el hincha.',
    offerT: 'Qué ofrecemos',
    offerItems: ['Calendario completo del Mundial 2026 con resultados y partidos en vivo', 'Tablas de posiciones de todos los grupos, actualizadas automáticamente', 'Ranking de goleadores y asistencias del torneo', 'Fase eliminatoria (bracket) y seguimiento de cada cruce', 'Detalle de cada partido: marcador en vivo, eventos, alineaciones y estadio', 'Porras: pronosticá los resultados y competí con otros usuarios'],
    premiumT: 'Pase Mundial (Premium)',
    premiumB: 'Orionix Gol es gratuito y la versión gratuita se mantiene siempre completa y funcional. Quienes quieran apoyar el proyecto pueden activar el <strong>Pase Mundial</strong>, que desbloquea estadísticas ampliadas, filtro por equipo y una experiencia totalmente <strong>sin anuncios</strong>.',
    dataT: 'De dónde vienen los datos',
    dataB: 'La información deportiva (partidos, marcadores, eventos, alineaciones y estadísticas) proviene de proveedores profesionales de datos de fútbol y se actualiza de forma automática en tiempo real.',
    whoT: 'Quiénes somos',
    whoB: 'Somos un emprendimiento independiente que une la pasión por el fútbol con la tecnología. Creamos Orionix Gol para ofrecer una forma simple, rápida y bonita de seguir el Mundial 2026, y lo hacemos crecer partido a partido junto a la comunidad de hinchas que lo usa.',
    contactT: 'Contacto', contactIntro: '¿Tenés dudas, sugerencias o querés reportar algo? Escribinos a ', contactMid: '. También podés seguir todas las novedades en nuestro ', whatsappLabel: 'canal de WhatsApp',
  },
  en: {
    badge: 'About us', title: 'About Orionix Gol', subtitle: 'Your platform to live the 2026 World Cup', back: 'Back', rights: '© 2026 ORIONIX GOL — ALL RIGHTS RESERVED',
    whatT: 'What is Orionix Gol',
    whatB: 'Orionix Gol is an independent project that brings together everything about the 2026 World Cup in one place: match schedule, group standings, top scorers, the knockout stage and minute-by-minute live match tracking. All in a fast, modern experience made for fans.',
    offerT: 'What we offer',
    offerItems: ['Full 2026 World Cup schedule with results and live matches', 'Standings for every group, updated automatically', 'Tournament top scorers and assists ranking', 'Knockout stage (bracket) and tracking of every tie', 'Match details: live score, events, line-ups and stadium', 'Predictions: forecast results and compete with other users'],
    premiumT: 'World Cup Pass (Premium)',
    premiumB: 'Orionix Gol is free and the free version always stays complete and functional. Those who want to support the project can activate the <strong>World Cup Pass</strong>, which unlocks extended statistics, team filtering and a fully <strong>ad-free</strong> experience.',
    dataT: 'Where the data comes from',
    dataB: 'The sports information (matches, scores, events, line-ups and statistics) comes from professional football data providers and is updated automatically in real time.',
    whoT: 'Who we are',
    whoB: 'We are an independent project that combines a passion for football with technology. We created Orionix Gol to offer a simple, fast and beautiful way to follow the 2026 World Cup, and we grow it match by match together with the community of fans who use it.',
    contactT: 'Contact', contactIntro: 'Have questions, suggestions or want to report something? Write to us at ', contactMid: '. You can also follow all the news on our ', whatsappLabel: 'WhatsApp channel',
  },
  fr: {
    badge: 'À propos', title: "À propos d'Orionix Gol", subtitle: 'Votre plateforme pour vivre la Coupe du Monde 2026', back: 'Retour', rights: '© 2026 ORIONIX GOL — TOUS DROITS RÉSERVÉS',
    whatT: "Qu'est-ce qu'Orionix Gol",
    whatB: "Orionix Gol est un projet indépendant qui réunit en un seul endroit toute la Coupe du Monde 2026 : calendrier des matchs, classements de chaque groupe, buteurs, phase à élimination directe et suivi minute par minute des matchs en direct. Le tout dans une expérience rapide et moderne, pensée pour les supporters.",
    offerT: 'Ce que nous proposons',
    offerItems: ['Calendrier complet de la Coupe du Monde 2026 avec résultats et matchs en direct', 'Classements de tous les groupes, mis à jour automatiquement', 'Classement des buteurs et passeurs du tournoi', 'Phase à élimination directe (tableau) et suivi de chaque confrontation', 'Détail de chaque match : score en direct, événements, compositions et stade', 'Pronostics : prédisez les résultats et affrontez les autres utilisateurs'],
    premiumT: 'Pass Mondial (Premium)',
    premiumB: "Orionix Gol est gratuit et la version gratuite reste toujours complète et fonctionnelle. Ceux qui souhaitent soutenir le projet peuvent activer le <strong>Pass Mondial</strong>, qui débloque des statistiques étendues, le filtre par équipe et une expérience entièrement <strong>sans publicité</strong>.",
    dataT: "D'où viennent les données",
    dataB: 'Les informations sportives (matchs, scores, événements, compositions et statistiques) proviennent de fournisseurs professionnels de données football et sont mises à jour automatiquement en temps réel.',
    whoT: 'Qui sommes-nous',
    whoB: "Nous sommes un projet indépendant qui allie la passion du football à la technologie. Nous avons créé Orionix Gol pour offrir une façon simple, rapide et élégante de suivre la Coupe du Monde 2026, et nous le faisons grandir match après match avec la communauté de supporters qui l'utilise.",
    contactT: 'Contact', contactIntro: 'Vous avez des questions, des suggestions ou souhaitez signaler quelque chose ? Écrivez-nous à ', contactMid: '. Vous pouvez aussi suivre toutes les actualités sur notre ', whatsappLabel: 'canal WhatsApp',
  },
  pt: {
    badge: 'Sobre nós', title: 'Sobre o Orionix Gol', subtitle: 'Sua plataforma para viver a Copa do Mundo 2026', back: 'Voltar', rights: '© 2026 ORIONIX GOL — TODOS OS DIREITOS RESERVADOS',
    whatT: 'O que é o Orionix Gol',
    whatB: 'O Orionix Gol é um projeto independente que reúne em um só lugar toda a Copa do Mundo 2026: calendário de jogos, classificação de cada grupo, artilheiros, fase eliminatória e acompanhamento minuto a minuto dos jogos ao vivo. Tudo em uma experiência rápida e moderna, pensada para o torcedor.',
    offerT: 'O que oferecemos',
    offerItems: ['Calendário completo da Copa do Mundo 2026 com resultados e jogos ao vivo', 'Classificação de todos os grupos, atualizada automaticamente', 'Ranking de artilheiros e assistências do torneio', 'Fase eliminatória (chave) e acompanhamento de cada confronto', 'Detalhe de cada jogo: placar ao vivo, eventos, escalações e estádio', 'Palpites: preveja os resultados e compita com outros usuários'],
    premiumT: 'Passe Mundial (Premium)',
    premiumB: 'O Orionix Gol é gratuito e a versão gratuita se mantém sempre completa e funcional. Quem quiser apoiar o projeto pode ativar o <strong>Passe Mundial</strong>, que desbloqueia estatísticas ampliadas, filtro por equipe e uma experiência totalmente <strong>sem anúncios</strong>.',
    dataT: 'De onde vêm os dados',
    dataB: 'As informações esportivas (jogos, placares, eventos, escalações e estatísticas) vêm de provedores profissionais de dados de futebol e são atualizadas automaticamente em tempo real.',
    whoT: 'Quem somos',
    whoB: 'Somos um projeto independente que une a paixão pelo futebol à tecnologia. Criamos o Orionix Gol para oferecer uma forma simples, rápida e bonita de acompanhar a Copa do Mundo 2026, e o fazemos crescer jogo a jogo junto à comunidade de torcedores que o usa.',
    contactT: 'Contato', contactIntro: 'Tem dúvidas, sugestões ou quer reportar algo? Escreva para nós em ', contactMid: '. Você também pode acompanhar todas as novidades no nosso ', whatsappLabel: 'canal do WhatsApp',
  },
  de: {
    badge: 'Über uns', title: 'Über Orionix Gol', subtitle: 'Deine Plattform für die WM 2026', back: 'Zurück', rights: '© 2026 ORIONIX GOL — ALLE RECHTE VORBEHALTEN',
    whatT: 'Was ist Orionix Gol',
    whatB: 'Orionix Gol ist ein unabhängiges Projekt, das die gesamte WM 2026 an einem Ort vereint: Spielplan, Gruppentabellen, Torschützen, die K.-o.-Runde und die Minute-für-Minute-Verfolgung der Live-Spiele. Alles in einem schnellen, modernen Erlebnis für Fans.',
    offerT: 'Was wir bieten',
    offerItems: ['Kompletter WM-2026-Spielplan mit Ergebnissen und Live-Spielen', 'Tabellen aller Gruppen, automatisch aktualisiert', 'Torschützen- und Vorlagen-Ranking des Turniers', 'K.-o.-Runde (Turnierbaum) und Verfolgung jedes Duells', 'Spieldetails: Live-Ergebnis, Ereignisse, Aufstellungen und Stadion', 'Tipps: Ergebnisse vorhersagen und gegen andere Nutzer antreten'],
    premiumT: 'WM-Pass (Premium)',
    premiumB: 'Orionix Gol ist kostenlos und die Gratis-Version bleibt stets vollständig und funktional. Wer das Projekt unterstützen möchte, kann den <strong>WM-Pass</strong> aktivieren, der erweiterte Statistiken, Team-Filter und ein komplett <strong>werbefreies</strong> Erlebnis freischaltet.',
    dataT: 'Woher die Daten kommen',
    dataB: 'Die Sportinformationen (Spiele, Ergebnisse, Ereignisse, Aufstellungen und Statistiken) stammen von professionellen Fußball-Datenanbietern und werden automatisch in Echtzeit aktualisiert.',
    whoT: 'Wer wir sind',
    whoB: 'Wir sind ein unabhängiges Projekt, das die Leidenschaft für Fußball mit Technologie verbindet. Wir haben Orionix Gol geschaffen, um die WM 2026 einfach, schnell und schön zu verfolgen, und lassen es Spiel für Spiel zusammen mit der Fan-Community wachsen, die es nutzt.',
    contactT: 'Kontakt', contactIntro: 'Hast du Fragen, Vorschläge oder möchtest du etwas melden? Schreib uns an ', contactMid: '. Du kannst auch alle Neuigkeiten auf unserem ', whatsappLabel: 'WhatsApp-Kanal',
  },
  ru: {
    badge: 'О нас', title: 'Об Orionix Gol', subtitle: 'Твоя платформа для Чемпионата мира 2026', back: 'Назад', rights: '© 2026 ORIONIX GOL — ВСЕ ПРАВА ЗАЩИЩЕНЫ',
    whatT: 'Что такое Orionix Gol',
    whatB: 'Orionix Gol — это независимый проект, который собирает весь Чемпионат мира 2026 в одном месте: расписание матчей, таблицы групп, бомбардиры, плей-офф и поминутное отслеживание матчей вживую. Всё в быстром и современном виде, созданном для болельщиков.',
    offerT: 'Что мы предлагаем',
    offerItems: ['Полное расписание ЧМ-2026 с результатами и матчами вживую', 'Таблицы всех групп, обновляются автоматически', 'Рейтинг бомбардиров и ассистентов турнира', 'Плей-офф (сетка) и отслеживание каждой пары', 'Детали матча: счёт вживую, события, составы и стадион', 'Прогнозы: предсказывай результаты и соревнуйся с другими'],
    premiumT: 'Мундиаль-пропуск (Premium)',
    premiumB: 'Orionix Gol бесплатен, и бесплатная версия всегда остаётся полной и функциональной. Желающие поддержать проект могут активировать <strong>Мундиаль-пропуск</strong>, который открывает расширенную статистику, фильтр по командам и полностью <strong>без рекламы</strong>.',
    dataT: 'Откуда берутся данные',
    dataB: 'Спортивная информация (матчи, счёт, события, составы и статистика) поступает от профессиональных поставщиков футбольных данных и обновляется автоматически в реальном времени.',
    whoT: 'Кто мы',
    whoB: 'Мы — независимый проект, объединяющий страсть к футболу с технологиями. Мы создали Orionix Gol, чтобы предложить простой, быстрый и красивый способ следить за Чемпионатом мира 2026, и развиваем его матч за матчем вместе с сообществом болельщиков.',
    contactT: 'Контакты', contactIntro: 'Есть вопросы, предложения или хотите что-то сообщить? Напишите нам на ', contactMid: '. Также вы можете следить за всеми новостями на нашем ', whatsappLabel: 'канале WhatsApp',
  },
  ar: {
    badge: 'من نحن', title: 'عن Orionix Gol', subtitle: 'منصّتك لمتابعة كأس العالم 2026', back: 'رجوع', rights: '© 2026 ORIONIX GOL — جميع الحقوق محفوظة',
    whatT: 'ما هو Orionix Gol',
    whatB: 'Orionix Gol مشروع مستقل يجمع كل ما يخص كأس العالم 2026 في مكان واحد: جدول المباريات، وترتيب كل مجموعة، والهدافين، والدور الإقصائي، ومتابعة المباريات المباشرة دقيقة بدقيقة. كل ذلك في تجربة سريعة وعصرية مصمّمة للمشجّع.',
    offerT: 'ماذا نقدّم',
    offerItems: ['جدول كامل لكأس العالم 2026 مع النتائج والمباريات المباشرة', 'ترتيب جميع المجموعات، يُحدَّث تلقائيًا', 'ترتيب هدّافي وصانعي اللعب في البطولة', 'الدور الإقصائي (المخطّط) ومتابعة كل مواجهة', 'تفاصيل كل مباراة: النتيجة المباشرة والأحداث والتشكيلات والملعب', 'التوقّعات: تنبّأ بالنتائج ونافس المستخدمين الآخرين'],
    premiumT: 'تذكرة المونديال (Premium)',
    premiumB: 'Orionix Gol مجاني وتبقى النسخة المجانية كاملة وفعّالة دائمًا. ومن يرغب في دعم المشروع يمكنه تفعيل <strong>تذكرة المونديال</strong>، التي تتيح إحصاءات موسّعة وتصفية حسب الفريق وتجربة <strong>خالية من الإعلانات</strong> تمامًا.',
    dataT: 'من أين تأتي البيانات',
    dataB: 'تأتي المعلومات الرياضية (المباريات والنتائج والأحداث والتشكيلات والإحصاءات) من مزوّدي بيانات كرة قدم محترفين، وتُحدَّث تلقائيًا في الوقت الفعلي.',
    whoT: 'من نحن',
    whoB: 'نحن مشروع مستقل يجمع بين شغف كرة القدم والتقنية. أنشأنا Orionix Gol لنقدّم طريقة بسيطة وسريعة وجميلة لمتابعة كأس العالم 2026، ونطوّره مباراة تلو الأخرى مع مجتمع المشجّعين الذي يستخدمه.',
    contactT: 'اتصل بنا', contactIntro: 'هل لديك أسئلة أو اقتراحات أو تريد الإبلاغ عن شيء؟ راسلنا على ', contactMid: '. يمكنك أيضًا متابعة كل المستجدات على ', whatsappLabel: 'قناة واتساب',
  },
};

export default function AboutPage() {
  const router = useRouter();
  const locale = useLocale();
  const C = COPY[pickLang(locale)];

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  const h2 = 'text-base font-bold text-orionix-text-secondary mb-3';
  const linkStyle = { color: alpha(hex.accent.teal, 0.85) };

  return (
    <div className="w-full relative">
      {/* Ambient orbs */}
      <div className="fixed top-[-15%] right-[-5%] w-[38vw] h-[38vw] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${alpha(hex.accent.tealDeep, 0.07)} 0%, transparent 70%)`, filter: 'blur(55px)' }} />
      <div className="fixed bottom-[-10%] left-[-5%] w-[32vw] h-[32vw] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${alpha(hex.accent.skyBlue, 0.05)} 0%, transparent 70%)`, filter: 'blur(50px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => { if (window.history.length > 1) router.back(); else router.push('/'); }}
          className="flex items-center gap-2 mb-8 text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
          style={{ color: alpha(hex.accent.teal, 0.7) }}
          onMouseEnter={e => (e.currentTarget.style.color = hex.accent.teal)}
          onMouseLeave={e => (e.currentTarget.style.color = alpha(hex.accent.teal, 0.7))}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {C.back}
        </button>

        {/* Card */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: `linear-gradient(145deg, ${alpha(hex.accent.navyPanel, 0.97)}, ${alpha(hex.accent.navyPanelAlt, 0.95)})`,
            border: `1px solid ${alpha(hex.accent.sky, 0.10)}`,
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.50)}`,
          }}
        >
          {/* Header */}
          <div className="mb-8 pb-6" style={{ borderBottom: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
              style={{ background: alpha(hex.accent.teal, 0.10), color: hex.accent.teal, border: `1px solid ${alpha(hex.accent.teal, 0.20)}` }}>
              {C.badge}
            </span>
            <h1 className="text-2xl font-black text-white mt-3" style={{ fontFamily: 'var(--font-display)' }}>
              {C.title}
            </h1>
            <p className="text-xs text-orionix-text-muted mt-2">{C.subtitle}</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: alpha(hex.accent.slate, 0.85) }}>

            <section>
              <h2 className={h2}>{C.whatT}</h2>
              <p>{C.whatB}</p>
            </section>

            <section>
              <h2 className={h2}>{C.offerT}</h2>
              <ul className="space-y-1.5 pl-4">
                {C.offerItems.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={h2}>{C.premiumT}</h2>
              <p dangerouslySetInnerHTML={{ __html: C.premiumB }} />
            </section>

            <section>
              <h2 className={h2}>{C.dataT}</h2>
              <p>{C.dataB}</p>
            </section>

            <section>
              <h2 className={h2}>{C.whoT}</h2>
              <p>{C.whoB}</p>
            </section>

            <section>
              <h2 className={h2}>{C.contactT}</h2>
              <p>
                {C.contactIntro}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={linkStyle}>{CONTACT_EMAIL}</a>
                {C.contactMid}
                <a href={WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer" className="underline" style={linkStyle}>{C.whatsappLabel}</a>
                .
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <p className="text-[10px] text-orionix-text-muted tracking-widest uppercase">
              {C.rights}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
