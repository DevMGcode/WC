import type { TourStep } from './CustomTour';

type Locale = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'ru' | 'ar';

type TourSteps = {
  dashboard: TourStep[];
  calendar: TourStep[];
  groups: TourStep[];
  predictions: TourStep[];
  admin: TourStep[];
};

const STEPS: Record<Locale, TourSteps> = {
  es: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Tus estadísticas',
        content: 'Las 4 fichas resumen tu actividad: porras realizadas, exactas (marcador perfecto), puntos acumulados y tu posición en el ranking global. Se actualizan automáticamente cuando los árbitros pitan el final.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Cuenta regresiva al Mundial',
        content: 'Días, horas y minutos que faltan para el pitazo inicial del Mundial 2026. Una vez arrancado el torneo, este espacio mostrará el estado "En curso". ¡Haz tus porras antes de que empiece cada partido!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Cómo hacer una porra',
        content: 'Pulsa "⚡ Porra" en cualquier partido pendiente → escribe tu marcador (ej: 2-1) → confirma. El botón se cierra con 🔒 unos minutos antes del pitido del partido. Si ya predijiste, aparece "✓ Editar" para cambiar tu apuesta mientras siga abierto.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Ranking global en tiempo real',
        content: 'Tabla con los jugadores mejor puntuados del torneo. Tu fila aparece resaltada en cyan. Usa el botón de compartir (📤) para presumir tu posición en redes sociales o WhatsApp.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Resumen del torneo',
        content: 'Cuatro cifras clave de un vistazo: total de partidos, cuántos están en vivo ahora mismo, pendientes de jugarse y ya terminados. Haz clic en cualquier filtro de abajo para ver solo ese grupo.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Filtros de partidos',
        content: 'Filtra por estado: "Todos" muestra el calendario completo, "En vivo" solo los que se juegan ahora (con indicador rojo pulsante), "Pendientes" los que aún no han empezado, y "Terminados" los que ya tienen resultado final.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 Cómo leer una tarjeta de partido',
        content: 'Cada tarjeta muestra: estado (En vivo/Pendiente/Terminado), equipos con sus banderas, marcador real si ya terminó o la hora de inicio si está pendiente. Haz clic en la tarjeta para entrar al detalle y registrar tu porra antes del partido.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Dos secciones del torneo',
        content: '"Grupos" muestra las 8 tablas de posiciones donde los 2 primeros de cada grupo se clasifican a octavos. "Eliminatorias" muestra el bracket de octavos → cuartos → semis → final con los cruces ya definidos.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 Cómo leer la tabla de grupos',
        content: 'Cada fila es un equipo. Las columnas son: PJ = cuántos partidos jugó · G = cuántos ganó (verde) · E = empates (amarillo) · P = cuántos perdió (rojo) · PTS = puntos totales. Ganar da 3 pts, empatar 1 pt, perder 0. Los 2 equipos con más PTS pasan a la siguiente ronda — están marcados en verde brillante.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Tres secciones disponibles',
        content: '"Mis Porras" lista todas tus predicciones con su resultado. "Ranking" muestra el top global de jugadores por puntos. "Ligas" te permite crear o unirte a grupos privados para competir solo contra tus amigos.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Tu rendimiento de un vistazo',
        content: 'Cuatro indicadores clave: total de porras enviadas, partidos ya terminados (de los que apostaste), exactas conseguidas (marcador perfecto = 3 pts) y tu porcentaje de acierto global. ¡Trata de subir ese % cada jornada!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Sistema de puntuación',
        content: '3 puntos si aciertas el marcador exacto (ej: predijiste 2-1 y fue 2-1). 1 punto si aciertas solo el ganador o el empate (ej: predijiste 2-1 y fue 3-0). 0 puntos si fallaste. Los puntos se suman al ranking en cuanto el árbitro pita el final.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 Historial de tus porras',
        content: 'Cada tarjeta muestra el partido, tu predicción y el resultado real. El color del borde indica el resultado: verde = exacto (3 pts), cyan = acertaste el ganador (1 pt), rojo = fallaste (0 pts), amarillo = partido aún pendiente.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Ligas privadas',
        content: 'Compite solo contra tu círculo. Para UNIRTE: pulsa "Unirse" e ingresa el código de 6 letras que te compartió el creador. Para CREAR (requiere Pase Mundial ⚡): dale nombre a tu liga y comparte el código generado. Cada liga tiene su propio ranking y clasificación.',
        placement: 'top',
      },
    ],
    admin: [
      {
        target: '[data-tour="admin-fixtures"]',
        title: '⚙️ Gestión de partidos',
        content: 'Lista de todos los partidos del torneo. Aquí puedes actualizar el resultado real de cada partido una vez terminado. Al guardar, el sistema recalcula automáticamente los puntos de todos los usuarios que apostaron a ese partido.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="admin-users"]',
        title: '👤 Gestión de usuarios',
        content: 'Consulta todos los usuarios registrados: nombre, email, fecha de registro y estado de la cuenta. Puedes buscar usuarios específicos y ver su actividad en la plataforma.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="admin-scores"]',
        title: '📝 Ingresar resultado de partido',
        content: 'Escribe el marcador final (goles local — goles visitante) y pulsa Guardar. Orionix Gol comparará este resultado con todas las porras registradas y distribuirá los puntos: 3 pts exacto, 1 pt ganador, 0 pts fallido.',
        placement: 'top',
      },
    ],
  },

  en: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Your stats',
        content: 'Four tiles summarise your activity: predictions made, exact scores (perfect result), points earned and your global ranking position. They update automatically when each match ends.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Countdown to the World Cup',
        content: 'Days, hours and minutes until the 2026 World Cup kick-off. Once the tournament starts this area shows "In progress". Make your predictions before each match begins!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Matches and how to predict',
        content: 'Upcoming fixtures are listed here. Tap "+ Predict" on any card to enter your score (e.g. 2-1). You can only submit before kick-off — once the match starts the button disappears.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Live global ranking',
        content: 'Top players ranked by total points. Your row is highlighted in cyan. Use the share button (📤) to show off your ranking on social media or WhatsApp.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Tournament overview',
        content: 'Four key figures at a glance: total matches, how many are live right now, still to be played, and already finished. Click any filter button below to show only that group.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Match filters',
        content: 'Filter by status: "All" shows the full schedule, "Live" shows matches in progress (red pulsing dot), "Scheduled" shows upcoming matches, and "Finished" shows completed matches with final scores.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 How to read a match card',
        content: 'Each card shows: status badge, teams with flags, real score if finished or kick-off time if upcoming. Click the card to open the match detail page where you can submit your prediction before kick-off.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Two tournament sections',
        content: '"Groups" shows the 8 group tables — the top 2 from each group advance to the Round of 16. "Knockout" shows the bracket from Round of 16 → Quarter-finals → Semi-finals → Final with all the matchups.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 How to read the group table',
        content: 'Each row is a team: position, flag, points (blue column), played, wins (green), draws (yellow), losses (red). The top two rows have a cyan/green highlight — those teams advance to the knockout stage.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Three sections available',
        content: '"My Predictions" lists all your bets with results. "Ranking" shows the global leaderboard. "Leagues" lets you create or join a private group to compete only against your friends with a unique invite code.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Your performance at a glance',
        content: 'Four key metrics: total predictions submitted, finished matches (that you predicted), exact scores achieved (3 pts each), and your global accuracy percentage. Try to push that % higher every matchday!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Scoring system explained',
        content: '3 points for an exact score (e.g. you predicted 2-1 and it was 2-1). 1 point for the correct winner or draw (e.g. you predicted 2-1 and it was 3-0). 0 points if you miss. Points are applied the moment the final whistle blows.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 Your predictions history',
        content: 'Each card shows the match, your prediction and the real result. Border colour tells the outcome: green = exact (3 pts), cyan = correct winner (1 pt), red = missed (0 pts), yellow = match still pending.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Private leagues',
        content: 'Compete only within your circle. To JOIN: tap "Join" and enter the 6-letter code shared by the creator. To CREATE (requires World Cup Pass ⚡): name your league and share the generated code. Each league has its own leaderboard.',
        placement: 'top',
      },
    ],
    admin: [
      {
        target: '[data-tour="admin-fixtures"]',
        title: '⚙️ Match management',
        content: 'Full list of tournament matches. Update the real result for each finished match here. On save, the system automatically recalculates points for everyone who predicted that match.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="admin-users"]',
        title: '👤 User management',
        content: 'View all registered users: name, email, registration date and account status. Search for specific users and review their activity on the platform.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="admin-scores"]',
        title: '📝 Enter match result',
        content: 'Enter the final score (home goals — away goals) and click Save. Orionix Gol will compare this against all submitted predictions and award points: 3 for exact, 1 for correct winner, 0 for a miss.',
        placement: 'top',
      },
    ],
  },

  fr: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Vos statistiques',
        content: 'Quatre tuiles résument votre activité: pronostics envoyés, scores exacts (résultat parfait), points accumulés et votre position dans le classement mondial. Elles se mettent à jour automatiquement à la fin de chaque match.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Compte à rebours',
        content: 'Jours, heures et minutes avant le coup d\'envoi de la Coupe du Monde 2026. Une fois le tournoi lancé, cet espace affichera "En cours". Faites vos pronostics avant chaque match!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Matchs et comment pronostiquer',
        content: 'Les prochains matchs sont listés ici. Appuyez sur "+ Pronostic" pour saisir votre score (ex: 2-1). Vous ne pouvez soumettre qu\'avant le coup d\'envoi — une fois le match commencé le bouton disparaît.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Classement mondial en direct',
        content: 'Meilleurs joueurs classés par points totaux. Votre ligne est surlignée en cyan. Utilisez le bouton de partage (📤) pour montrer votre position sur les réseaux sociaux.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Vue d\'ensemble du tournoi',
        content: 'Quatre chiffres clés: total de matchs, combien sont en direct maintenant, à venir, et déjà terminés. Cliquez sur un filtre pour n\'afficher que ce groupe.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Filtres de matchs',
        content: 'Filtrez par statut: "Tous" montre le calendrier complet, "En direct" les matchs en cours (point rouge clignotant), "Planifiés" les prochains matchs, et "Terminés" les matchs avec scores finaux.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 Comment lire une carte de match',
        content: 'Chaque carte montre: badge de statut, équipes avec drapeaux, score réel si terminé ou heure de coup d\'envoi si à venir. Cliquez pour ouvrir le détail et soumettre votre pronostic.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Deux sections du tournoi',
        content: '"Groupes" affiche les 8 tableaux — les 2 premiers de chaque groupe passent en huitièmes. "Éliminatoires" montre le tableau des phases finales de la poule de 16 jusqu\'à la finale.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 Comment lire le tableau de groupe',
        content: 'Chaque ligne est une équipe: position, drapeau, points (colonne bleue), joués, victoires (vert), nuls (jaune), défaites (rouge). Les deux premières lignes ont une surbrillance cyan/vert — ces équipes se qualifient.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Trois sections disponibles',
        content: '"Mes Pronostics" liste tous vos paris avec les résultats. "Classement" montre le top mondial. "Ligues" vous permet de créer ou rejoindre un groupe privé pour concourir uniquement contre vos amis.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Vos performances',
        content: 'Quatre métriques clés: pronostics soumis, matchs terminés que vous avez pronostiqués, scores exacts (3 pts chacun) et votre pourcentage de précision global. Essayez de faire monter ce % chaque journée!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Système de points expliqué',
        content: '3 points pour le score exact (ex: vous avez prédit 2-1 et c\'était 2-1). 1 point pour le bon vainqueur ou le nul (ex: prédit 2-1, résultat 3-0). 0 point si vous ratez. Les points s\'appliquent au coup de sifflet final.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 Historique de vos pronostics',
        content: 'Chaque carte montre le match, votre pronostic et le vrai résultat. La couleur de bordure indique: vert = exact (3 pts), cyan = bon vainqueur (1 pt), rouge = raté (0 pt), jaune = match en attente.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Ligues privées',
        content: 'Concourez uniquement avec vos amis. Pour REJOINDRE: appuyez sur "Rejoindre" et entrez le code à 6 lettres partagé par le créateur. Pour CRÉER (Pass Coupe du Monde ⚡ requis): nommez votre ligue et partagez le code généré. Chaque ligue a son propre classement.',
        placement: 'top',
      },
    ],
    admin: [
      { target: '[data-tour="admin-fixtures"]', title: '⚙️ Gestion des matchs',   content: 'Liste complète des matchs du tournoi. Mettez à jour le résultat réel ici. À la sauvegarde, le système recalcule automatiquement les points pour tous ceux qui ont pronostiqué ce match.', placement: 'bottom' },
      { target: '[data-tour="admin-users"]',    title: '👤 Gestion des utilisateurs', content: 'Consultez tous les utilisateurs: nom, email, date d\'inscription et statut. Recherchez des utilisateurs spécifiques et consultez leur activité.', placement: 'bottom' },
      { target: '[data-tour="admin-scores"]',   title: '📝 Saisir un résultat',    content: 'Entrez le score final (buts domicile — buts visiteur) et cliquez Sauvegarder. Le système comparera avec toutes les prédictions et attribuera 3 pts exact, 1 pt vainqueur, 0 pt raté.', placement: 'top' },
    ],
  },

  de: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Ihre Statistiken',
        content: 'Vier Kacheln zeigen Ihre Aktivität: abgegebene Tipps, genaue Ergebnisse (perfektes Resultat), gesammelte Punkte und Ihre globale Ranglistenposition. Sie aktualisieren sich automatisch nach jedem Spielende.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Countdown zur WM',
        content: 'Tage, Stunden und Minuten bis zum Anpfiff der WM 2026. Sobald das Turnier beginnt, zeigt dieser Bereich "Läuft". Geben Sie Ihre Tipps vor jedem Spielbeginn ab!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Spiele und Tipp abgeben',
        content: 'Bevorstehende Spiele werden hier aufgelistet. Tippen Sie auf "+ Tipp", um Ihr Ergebnis einzugeben (z.B. 2-1). Sie können nur vor Anpfiff tippen — danach verschwindet der Knopf.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Live-Weltrangliste',
        content: 'Top-Spieler nach Gesamtpunkten. Ihre Zeile ist cyan hervorgehoben. Nutzen Sie die Teilen-Schaltfläche (📤), um Ihre Platzierung in sozialen Medien zu zeigen.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Turnier-Übersicht',
        content: 'Vier Schlüsselzahlen: Gesamtspiele, aktuell live, noch ausstehend und bereits beendet. Klicken Sie auf einen Filter-Button, um nur diese Gruppe anzuzeigen.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Spielfilter',
        content: 'Filtern nach Status: "Alle" zeigt den vollständigen Spielplan, "Live" laufende Spiele (roter Pulspunkt), "Geplant" bevorstehende Spiele, "Beendet" abgeschlossene Spiele mit Endergebnis.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 Spielkarte lesen',
        content: 'Jede Karte zeigt: Status-Badge, Teams mit Flaggen, echtes Ergebnis wenn beendet oder Anstoßzeit wenn ausstehend. Klicken Sie für Details und um Ihren Tipp vor Anpfiff abzugeben.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Zwei Turnier-Bereiche',
        content: '"Gruppen" zeigt die 8 Tabellen — die ersten 2 jeder Gruppe kommen ins Achtelfinale. "K.O.-Runde" zeigt den Turnierbaum vom Achtelfinale bis zum Finale mit allen Paarungen.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 Gruppentabelle lesen',
        content: 'Jede Zeile ist ein Team: Position, Flagge, Punkte (blaue Spalte), Spiele, Siege (grün), Unentschieden (gelb), Niederlagen (rot). Die ersten zwei Zeilen sind cyan/grün markiert — sie kommen weiter.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Drei Bereiche',
        content: '"Meine Tipps" listet alle Ihre Vorhersagen. "Rangliste" zeigt das globale Leaderboard. "Ligen" ermöglicht das Erstellen oder Beitreten einer privaten Gruppe, um nur gegen Freunde zu spielen.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Ihre Leistung',
        content: 'Vier Kennzahlen: abgegebene Tipps, beendete Spiele (die Sie getippt haben), genaue Treffer (je 3 Punkte) und Ihre globale Trefferquote in Prozent. Versuchen Sie, diesen Wert jeden Spieltag zu verbessern!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Punktesystem erklärt',
        content: '3 Punkte für genaues Ergebnis (z.B. 2-1 vorhergesagt, 2-1 Endstand). 1 Punkt für den richtigen Sieger (z.B. 2-1 vorhergesagt, 3-0 Endstand). 0 Punkte bei Fehler. Punkte werden beim Abpfiff vergeben.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 Ihre Tipp-Historie',
        content: 'Jede Karte zeigt Spiel, Ihren Tipp und das echte Ergebnis. Rahmenfarbe zeigt das Resultat: grün = genau (3 Pkt), cyan = richtiger Sieger (1 Pkt), rot = falsch (0 Pkt), gelb = Spiel ausstehend.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Private Ligen',
        content: 'Spielen Sie nur gegen Ihre Gruppe. Zum BEITRETEN: "Beitreten" tippen und 6-Buchstaben-Code eingeben. Zum ERSTELLEN (WM-Pass ⚡ erforderlich): Liga benennen und generierten Code teilen. Jede Liga hat eine eigene Rangliste.',
        placement: 'top',
      },
    ],
    admin: [
      { target: '[data-tour="admin-fixtures"]', title: '⚙️ Spielverwaltung',   content: 'Vollständige Spielliste. Tragen Sie das Endergebnis ein. Beim Speichern berechnet das System automatisch Punkte für alle, die auf dieses Spiel getippt haben.', placement: 'bottom' },
      { target: '[data-tour="admin-users"]',    title: '👤 Benutzerverwaltung', content: 'Alle registrierten Benutzer einsehen: Name, E-Mail, Registrierungsdatum und Kontostatus. Suchen und Aktivität prüfen.', placement: 'bottom' },
      { target: '[data-tour="admin-scores"]',   title: '📝 Ergebnis eingeben',  content: 'Endstand eingeben (Heimtore — Auswärtstore) und Speichern. Das System vergleicht mit allen Tipps: 3 Pkt genau, 1 Pkt Sieger, 0 Pkt falsch.', placement: 'top' },
    ],
  },

  pt: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Suas estatísticas',
        content: 'Quatro fichas resumem sua atividade: apostas enviadas, placares exatos (resultado perfeito), pontos acumulados e sua posição no ranking global. Atualizam automaticamente ao fim de cada partida.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Contagem regressiva',
        content: 'Dias, horas e minutos até o apito inicial da Copa do Mundo 2026. Quando o torneio começar, esta área exibirá "Em andamento". Faça suas apostas antes de cada jogo!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Jogos e como apostar',
        content: 'Próximas partidas listadas aqui. Toque em "+ Apostar" para digitar seu placar (ex: 2-1). Só é possível enviar antes do apito inicial — após o início o botão desaparece.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Ranking global em tempo real',
        content: 'Melhores jogadores por pontos totais. Sua linha está destacada em ciano. Use o botão compartilhar (📤) para mostrar sua posição nas redes sociais ou WhatsApp.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Visão geral do torneio',
        content: 'Quatro números-chave: total de partidas, quantas estão ao vivo agora, ainda a jogar e já terminadas. Clique em qualquer filtro abaixo para ver apenas esse grupo.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Filtros de partidas',
        content: 'Filtre por status: "Todos" mostra o calendário completo, "Ao vivo" as partidas em andamento (ponto vermelho pulsante), "Agendados" as próximas, e "Terminados" os jogos com placar final.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 Como ler um card de partida',
        content: 'Cada card mostra: badge de status, times com bandeiras, placar real se terminado ou horário de início se pendente. Clique no card para abrir o detalhe e registrar sua aposta antes do apito.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Duas seções do torneio',
        content: '"Grupos" exibe as 8 tabelas — os 2 primeiros de cada grupo avançam para as oitavas. "Eliminatórias" mostra o bracket das oitavas → quartas → semi → final com todos os confrontos já definidos.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 Como ler a tabela de grupos',
        content: 'Cada linha é um time: posição, bandeira, pontos (coluna azul), jogos, vitórias (verde), empates (amarelo), derrotas (vermelho). As duas primeiras linhas têm destaque ciano/verde — são os que avançam.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Três seções disponíveis',
        content: '"Minhas Apostas" lista todas as suas previsões. "Ranking" mostra o top global. "Ligas" permite criar ou entrar em um grupo privado para competir apenas com amigos usando um código de convite.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Seu desempenho',
        content: 'Quatro métricas principais: apostas enviadas, partidas terminadas que você apostou, placares exatos conquistados (3 pts cada) e seu percentual de acerto global. Tente aumentar esse % a cada rodada!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Sistema de pontuação explicado',
        content: '3 pontos por placar exato (ex: previu 2-1 e foi 2-1). 1 ponto por acertar apenas o vencedor (ex: previu 2-1 e foi 3-0). 0 pontos se errar. Os pontos são aplicados ao apito final do árbitro.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 Histórico de apostas',
        content: 'Cada card mostra a partida, sua previsão e o resultado real. A cor da borda indica: verde = exato (3 pts), ciano = vencedor certo (1 pt), vermelho = errou (0 pts), amarelo = jogo ainda pendente.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Ligas privadas',
        content: 'Compita apenas com seu grupo. Para ENTRAR: toque em "Entrar" e insira o código de 6 letras compartilhado pelo criador. Para CRIAR (requer Passe Copa ⚡): dê nome à liga e compartilhe o código gerado. Cada liga tem seu próprio ranking.',
        placement: 'top',
      },
    ],
    admin: [
      { target: '[data-tour="admin-fixtures"]', title: '⚙️ Gestão de partidas',    content: 'Lista completa das partidas. Atualize o resultado real aqui. Ao salvar, o sistema recalcula automaticamente os pontos de todos que apostaram nesse jogo.', placement: 'bottom' },
      { target: '[data-tour="admin-users"]',    title: '👤 Gestão de usuários',     content: 'Veja todos os usuários: nome, email, data de registro e status. Pesquise usuários específicos e veja sua atividade.', placement: 'bottom' },
      { target: '[data-tour="admin-scores"]',   title: '📝 Inserir resultado',      content: 'Digite o placar final (gols mandante — gols visitante) e clique Salvar. O sistema compara com todas as apostas: 3 pts exato, 1 pt vencedor, 0 pts errou.', placement: 'top' },
    ],
  },

  ru: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 Ваша статистика',
        content: 'Четыре плитки показывают вашу активность: отправленные прогнозы, точные счета (идеальный результат), накопленные очки и ваша позиция в мировом рейтинге. Обновляются автоматически после каждого матча.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ Обратный отсчёт до ЧМ',
        content: 'Дни, часы и минуты до стартового свистка ЧМ 2026. После начала турнира здесь появится "Идёт". Делайте прогнозы до начала каждого матча!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ Матчи и как делать прогноз',
        content: 'Предстоящие матчи перечислены здесь. Нажмите "+ Прогноз", чтобы ввести счёт (напр. 2-1). Отправить можно только до стартового свистка — после начала матча кнопка исчезает.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 Мировой рейтинг в реальном времени',
        content: 'Лучшие игроки по общим очкам. Ваша строка выделена cyan. Используйте кнопку поделиться (📤), чтобы показать свою позицию в соцсетях.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 Обзор турнира',
        content: 'Четыре ключевые цифры: всего матчей, сейчас в прямом эфире, ещё не сыграно и уже завершено. Нажмите на кнопку фильтра ниже, чтобы показать только эту группу.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 Фильтры матчей',
        content: 'Фильтрация по статусу: "Все" — полное расписание, "Вживую" — текущие матчи (красная пульсирующая точка), "Запланированные" — предстоящие, "Завершённые" — с финальным счётом.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 Как читать карточку матча',
        content: 'Каждая карточка показывает: значок статуса, команды с флагами, реальный счёт если завершён или время начала если предстоит. Нажмите для деталей и отправки прогноза до свистка.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 Два раздела турнира',
        content: '"Группы" показывает 8 таблиц — первые 2 каждой группы выходят в 1/8. "Плей-офф" показывает сетку от 1/8 до финала со всеми парами.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 Как читать таблицу группы',
        content: 'Каждая строка — команда: позиция, флаг, очки (синяя колонка), игры, победы (зелёный), ничьи (жёлтый), поражения (красный). Первые две строки cyan/зелёные — они выходят дальше.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 Три раздела',
        content: '"Мои прогнозы" — список ваших ставок с результатами. "Рейтинг" — глобальная таблица. "Лиги" — создайте или вступите в приватную группу, чтобы соревноваться только с друзьями.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 Ваши показатели',
        content: 'Четыре метрики: отправленные прогнозы, завершённые матчи (которые вы предсказывали), точные счета (по 3 очка каждый) и ваш процент точности. Старайтесь улучшать этот показатель каждый тур!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 Система очков',
        content: '3 очка за точный счёт (напр.: предсказали 2-1, итог 2-1). 1 очко за правильного победителя (напр.: предсказали 2-1, итог 3-0). 0 очков при ошибке. Очки начисляются по финальному свистку.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 История прогнозов',
        content: 'Каждая карточка показывает матч, ваш прогноз и реальный счёт. Цвет рамки: зелёный = точно (3 очка), cyan = правильный победитель (1 очко), красный = промах (0 очков), жёлтый = матч ещё не сыгран.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 Приватные лиги',
        content: 'Соревнуйтесь только со своими. Чтобы ВСТУПИТЬ: нажмите "Вступить" и введите 6-буквенный код. Чтобы СОЗДАТЬ (требуется Пасс ЧМ ⚡): дайте название лиге и поделитесь кодом. У каждой лиги свой рейтинг.',
        placement: 'top',
      },
    ],
    admin: [
      { target: '[data-tour="admin-fixtures"]', title: '⚙️ Управление матчами',    content: 'Полный список матчей турнира. Введите реальный результат здесь. При сохранении система автоматически пересчитывает очки для всех, кто прогнозировал этот матч.', placement: 'bottom' },
      { target: '[data-tour="admin-users"]',    title: '👤 Управление пользователями', content: 'Все зарегистрированные пользователи: имя, email, дата регистрации и статус аккаунта. Поиск и просмотр активности.', placement: 'bottom' },
      { target: '[data-tour="admin-scores"]',   title: '📝 Ввод результата',       content: 'Введите финальный счёт (голы хозяев — голы гостей) и нажмите Сохранить. Система сравнит со всеми прогнозами: 3 очка точно, 1 победитель, 0 промах.', placement: 'top' },
    ],
  },

  ar: {
    dashboard: [
      {
        target: '[data-tour="stats"]',
        title: '📊 إحصائياتك',
        content: 'أربع بطاقات تلخص نشاطك: التوقعات المرسلة، النتائج الدقيقة (الهدف المثالي)، النقاط المتراكمة وترتيبك في التصنيف العالمي. تتحدث تلقائياً بعد نهاية كل مباراة.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="countdown"]',
        title: '⏱ العد التنازلي لكأس العالم',
        content: 'أيام وساعات ودقائق حتى صافرة البداية لكأس العالم 2026. بمجرد انطلاق البطولة، سيعرض هذا القسم "جارٍ الآن". قدّم توقعاتك قبل انطلاق كل مباراة!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matches"]',
        title: '⚽ المباريات وكيفية التوقع',
        content: 'المباريات القادمة مدرجة هنا. اضغط "+ توقع" لإدخال نتيجتك (مثل 2-1). يمكنك الإرسال فقط قبل صافرة البداية — بعد بدء المباراة يختفي الزر.',
        placement: 'top',
      },
      {
        target: '[data-tour="ranking"]',
        title: '🏆 التصنيف العالمي المباشر',
        content: 'أفضل اللاعبين بحسب النقاط الإجمالية. صفك مميز باللون السماوي. استخدم زر المشاركة (📤) لإظهار ترتيبك على وسائل التواصل الاجتماعي.',
        placement: 'top',
      },
    ],
    calendar: [
      {
        target: '[data-tour="calendar-kpi"]',
        title: '📊 نظرة عامة على البطولة',
        content: 'أربعة أرقام أساسية: إجمالي المباريات، كم منها يُلعب الآن مباشرة، لم تُلعب بعد، وانتهت. انقر على أي زر فلتر أدناه لعرض تلك المجموعة فقط.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: '🔍 فلاتر المباريات',
        content: 'فلترة حسب الحالة: "الكل" يعرض الجدول الكامل، "مباشر" المباريات الجارية (نقطة حمراء نابضة)، "مجدولة" المباريات القادمة، و"منتهية" المباريات بنتائجها النهائية.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="calendar-match"]',
        title: '📅 كيفية قراءة بطاقة مباراة',
        content: 'كل بطاقة تُظهر: شارة الحالة، الفريقين مع أعلامهما، النتيجة الحقيقية إن انتهت أو وقت الانطلاق إن كانت قادمة. انقر للتفاصيل وتسجيل توقعك قبل الصافرة.',
        placement: 'top',
      },
    ],
    groups: [
      {
        target: '[data-tour="groups-tabs"]',
        title: '📂 قسمان للبطولة',
        content: '"المجموعات" يعرض الجداول الـ8 — أفضل فريقين من كل مجموعة يتأهلان لدور الـ16. "الأدوار الإقصائية" يعرض مسابقة الخروج من دور الـ16 حتى النهائي.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="groups-grid"]',
        title: '📊 كيفية قراءة جدول المجموعة',
        content: 'كل صف فريق: الترتيب، العلم، النقاط (العمود الأزرق)، المباريات، الانتصارات (أخضر)، التعادلات (أصفر)، الخسائر (أحمر). أول صفين بإطار سماوي/أخضر — هم المتأهلون.',
        placement: 'top',
      },
    ],
    predictions: [
      {
        target: '[data-tour="predictions-tabs"]',
        title: '📑 ثلاثة أقسام متاحة',
        content: '"توقعاتي" يسرد جميع رهاناتك مع النتائج. "التصنيف" يعرض أفضل اللاعبين عالمياً. "الدوريات" يتيح إنشاء أو الانضمام لمجموعة خاصة للتنافس مع الأصدقاء فقط.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-stats"]',
        title: '📈 أداؤك',
        content: 'أربعة مقاييس رئيسية: التوقعات المرسلة، المباريات المنتهية التي توقعتها، النتائج الدقيقة المحققة (3 نقاط لكل منها) ونسبة دقتك العامة. حاول رفع هذه النسبة كل جولة!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="predictions-rules"]',
        title: '🎯 نظام النقاط شرح',
        content: '3 نقاط للنتيجة الدقيقة (مثلاً: توقعت 2-1 وكانت 2-1). نقطة واحدة لتوقع الفائز فقط (توقعت 2-1 وكانت 3-0). 0 نقاط إن أخطأت. تُضاف النقاط فور صافرة النهاية.',
        placement: 'top',
      },
      {
        target: '[data-tour="predictions-list"]',
        title: '🔮 سجل توقعاتك',
        content: 'كل بطاقة تُظهر المباراة وتوقعك والنتيجة الحقيقية. لون الإطار يشير: أخضر = دقيق (3 نقاط)، سماوي = الفائز صحيح (نقطة)، أحمر = خطأ (0 نقاط)، أصفر = مباراة لم تُلعب بعد.',
        placement: 'top',
      },
      {
        target: '[data-tour="leagues-create-join"]',
        title: '🏅 الدوريات الخاصة',
        content: 'تنافس فقط مع مجموعتك. للانضمام: اضغط "انضم" وأدخل الرمز المكون من 6 أحرف. لإنشاء دوري (يتطلب تصريح كأس العالم ⚡): سمِّ الدوري وشارك الرمز المُولَّد. لكل دوري ترتيبه الخاص.',
        placement: 'top',
      },
    ],
    admin: [
      { target: '[data-tour="admin-fixtures"]', title: '⚙️ إدارة المباريات',    content: 'قائمة كاملة بمباريات البطولة. أدخل النتيجة الحقيقية هنا. عند الحفظ يعيد النظام حساب النقاط تلقائياً لجميع من توقعوا هذه المباراة.', placement: 'bottom' },
      { target: '[data-tour="admin-users"]',    title: '👤 إدارة المستخدمين',   content: 'جميع المستخدمين المسجلين: الاسم والبريد وتاريخ التسجيل والحالة. ابحث عن مستخدمين محددين وراجع نشاطهم.', placement: 'bottom' },
      { target: '[data-tour="admin-scores"]',   title: '📝 إدخال نتيجة',        content: 'أدخل النتيجة النهائية (أهداف المضيف — أهداف الضيف) واضغط حفظ. سيقارن النظام مع جميع التوقعات: 3 نقاط دقيق، نقطة للفائز، 0 خطأ.', placement: 'top' },
    ],
  },
};

export function getTourSteps(locale: string, page: keyof TourSteps): TourStep[] {
  const loc = (Object.keys(STEPS).includes(locale) ? locale : 'es') as Locale;
  return STEPS[loc][page] ?? [];
}
