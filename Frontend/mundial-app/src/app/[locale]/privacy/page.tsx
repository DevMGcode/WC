'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

const CONTACT_EMAIL = 'orionixgol@gmail.com';
const ADS_SETTINGS_URL = 'https://www.google.com/settings/ads';
const ABOUTADS_URL = 'https://www.aboutads.info/choices';
const POLICIES_URL = 'https://policies.google.com/technologies/partner-sites';

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

type PrivacyCopy = {
  badge: string; title: string; updated: string; back: string; rights: string;
  s1T: string; s1Before: string; s1After: string;
  s2T: string; s2Intro: string; s2Items: string[]; s2Trailing: string;
  s3T: string; s3Items: string[];
  s4T: string; s4Body: string;
  s5T: string; s5Body: string;
  s6T: string; s6Body: string;
  s7T: string; s7Intro: string; s7Items: string[]; s7TrailBefore: string; s7TrailAfter: string;
  s8T: string; s8P1: string; s8P2: string;
  adsenseLabel: string; adsenseText: string; settingsLabel: string; adsenseMid: string; aboutadsLabel: string;
  adsterraLabel: string; adsterraText: string; gaLabel: string; gaText: string;
  premiumBefore: string; premiumStrong: string; premiumMid: string; policiesLabel: string;
  s9T: string; s9Body: string;
};

const COPY: Record<Lang, PrivacyCopy> = {
  es: {
    badge: 'Legal', title: 'Política de Privacidad', updated: 'Última actualización: junio de 2026 · Orionix Gol', back: 'Volver', rights: '© 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS',
    s1T: '1. Quiénes somos', s1Before: 'Orionix Gol es una aplicación de predicciones deportivas para el Mundial de Fútbol 2026. El responsable del tratamiento de tus datos es el equipo de Orionix Gol, contactable en ', s1After: '.',
    s2T: '2. Datos que recopilamos', s2Intro: 'Al crear una cuenta recopilamos los siguientes datos:', s2Items: ['Nombre y apellido', 'Nombre de usuario', 'Dirección de correo electrónico', 'Contraseña (almacenada de forma cifrada con bcrypt, nunca en texto plano)', 'País, región y ciudad (opcionales)', 'Número de teléfono (opcional)', 'Idioma preferido y zona horaria'], s2Trailing: 'También registramos automáticamente tu actividad dentro de la app (predicciones realizadas, ligas creadas o unidas, puntuaciones).',
    s3T: '3. Para qué usamos tus datos', s3Items: ['Gestionar tu cuenta y autenticación (JWT)', 'Mostrarte tu historial de predicciones y ranking', 'Permitirte crear y participar en ligas privadas', 'Enviarte tu contraseña temporal en caso de recuperación de acceso', 'Mejorar la experiencia y el funcionamiento de la aplicación'],
    s4T: '4. Compartición de datos', s4Body: 'No vendemos, alquilamos ni compartimos tus datos personales (nombre, correo, etc.) con terceros con fines comerciales. Tu nombre de usuario y puntuación pueden ser visibles públicamente en el ranking global de la aplicación. El resto de tu información personal es privada. Los servicios de publicidad y analítica descritos en la sección 8 pueden recopilar datos de forma automática mediante cookies, sujetos a sus propias políticas de privacidad.',
    s5T: '5. Seguridad', s5Body: 'Tus datos se transmiten siempre mediante conexiones cifradas (HTTPS/TLS). Las contraseñas se almacenan con hash bcrypt. Utilizamos tokens JWT con caducidad para gestionar las sesiones. Aun así, ningún sistema es 100 % seguro; te recomendamos usar una contraseña única para esta aplicación.',
    s6T: '6. Conservación de datos', s6Body: 'Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta, borraremos tus datos personales en un plazo razonable, salvo que la ley nos obligue a conservarlos.',
    s7T: '7. Tus derechos', s7Intro: 'Tienes derecho a:', s7Items: ['Acceder a los datos que tenemos sobre ti', 'Corregir datos incorrectos o incompletos', 'Solicitar la eliminación de tu cuenta y datos', 'Oponerte al tratamiento de tus datos'], s7TrailBefore: 'Para ejercer cualquiera de estos derechos, escríbenos a ', s7TrailAfter: '.',
    s8T: '8. Cookies y tecnologías de terceros', s8P1: 'Usamos almacenamiento local del navegador (localStorage) para mantener tu sesión activa y recordar tus preferencias de interfaz.', s8P2: 'En la versión gratuita mostramos publicidad y medimos el uso del sitio mediante servicios de terceros que pueden usar cookies y tecnologías similares:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' Google y sus socios utilizan cookies para mostrarte anuncios en función de tus visitas previas a este y otros sitios web. Podés desactivar la publicidad personalizada en la ', settingsLabel: 'Configuración de anuncios de Google', adsenseMid: ' o en ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' red de publicidad que puede usar cookies para mostrar y medir anuncios.', gaLabel: 'Google Analytics (GA4):', gaText: ' para entender de forma agregada y anónima cómo se usa el sitio y mejorarlo.',
    premiumBefore: 'Los usuarios ', premiumStrong: 'Premium (Pase Mundial) navegan sin anuncios', premiumMid: '. Para más detalle sobre cómo Google usa la información de los sitios que utilizan sus servicios, consultá ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Cambios en esta política', s9Body: 'Podemos actualizar esta política ocasionalmente. En caso de cambios relevantes, te notificaremos mediante un aviso en la aplicación. El uso continuado de la app tras los cambios implica aceptación de la nueva versión.',
  },
  en: {
    badge: 'Legal', title: 'Privacy Policy', updated: 'Last updated: June 2026 · Orionix Gol', back: 'Back', rights: '© 2026 ORIONIX GOL — ALL RIGHTS RESERVED',
    s1T: '1. Who we are', s1Before: 'Orionix Gol is a sports prediction application for the 2026 Football World Cup. The controller of your data is the Orionix Gol team, reachable at ', s1After: '.',
    s2T: '2. Data we collect', s2Intro: 'When you create an account we collect the following data:', s2Items: ['First and last name', 'Username', 'Email address', 'Password (stored encrypted with bcrypt, never in plain text)', 'Country, region and city (optional)', 'Phone number (optional)', 'Preferred language and time zone'], s2Trailing: 'We also automatically record your activity within the app (predictions made, leagues created or joined, scores).',
    s3T: '3. How we use your data', s3Items: ['Manage your account and authentication (JWT)', 'Show you your prediction history and ranking', 'Allow you to create and join private leagues', 'Send you a temporary password if you recover access', 'Improve the experience and operation of the application'],
    s4T: '4. Data sharing', s4Body: 'We do not sell, rent or share your personal data (name, email, etc.) with third parties for commercial purposes. Your username and score may be publicly visible in the app\'s global ranking. The rest of your personal information is private. The advertising and analytics services described in section 8 may automatically collect data via cookies, subject to their own privacy policies.',
    s5T: '5. Security', s5Body: 'Your data is always transmitted over encrypted connections (HTTPS/TLS). Passwords are stored with a bcrypt hash. We use expiring JWT tokens to manage sessions. Even so, no system is 100% secure; we recommend using a unique password for this application.',
    s6T: '6. Data retention', s6Body: 'We keep your data while your account is active. If you request the deletion of your account, we will erase your personal data within a reasonable time, unless the law requires us to retain it.',
    s7T: '7. Your rights', s7Intro: 'You have the right to:', s7Items: ['Access the data we hold about you', 'Correct inaccurate or incomplete data', 'Request the deletion of your account and data', 'Object to the processing of your data'], s7TrailBefore: 'To exercise any of these rights, write to us at ', s7TrailAfter: '.',
    s8T: '8. Cookies and third-party technologies', s8P1: 'We use the browser\'s local storage (localStorage) to keep your session active and remember your interface preferences.', s8P2: 'In the free version we show advertising and measure site usage through third-party services that may use cookies and similar technologies:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' Google and its partners use cookies to show you ads based on your previous visits to this and other websites. You can disable personalized advertising in ', settingsLabel: 'Google Ad Settings', adsenseMid: ' or at ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' an advertising network that may use cookies to display and measure ads.', gaLabel: 'Google Analytics (GA4):', gaText: ' to understand, in an aggregated and anonymous way, how the site is used and to improve it.',
    premiumBefore: '', premiumStrong: 'Premium (World Cup Pass) users browse without ads', premiumMid: '. For more detail on how Google uses information from the sites that use its services, see ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Changes to this policy', s9Body: 'We may update this policy occasionally. In the event of significant changes, we will notify you with a notice in the application. Continued use of the app after the changes implies acceptance of the new version.',
  },
  fr: {
    badge: 'Légal', title: 'Politique de confidentialité', updated: 'Dernière mise à jour : juin 2026 · Orionix Gol', back: 'Retour', rights: '© 2026 ORIONIX GOL — TOUS DROITS RÉSERVÉS',
    s1T: '1. Qui sommes-nous', s1Before: "Orionix Gol est une application de pronostics sportifs pour la Coupe du Monde de football 2026. Le responsable du traitement de vos données est l'équipe d'Orionix Gol, joignable à ", s1After: '.',
    s2T: '2. Données que nous collectons', s2Intro: 'Lors de la création d\'un compte, nous collectons les données suivantes :', s2Items: ['Nom et prénom', "Nom d'utilisateur", 'Adresse e-mail', 'Mot de passe (stocké chiffré avec bcrypt, jamais en clair)', 'Pays, région et ville (facultatifs)', 'Numéro de téléphone (facultatif)', 'Langue préférée et fuseau horaire'], s2Trailing: "Nous enregistrons aussi automatiquement votre activité dans l'application (pronostics réalisés, ligues créées ou rejointes, scores).",
    s3T: '3. À quoi servent vos données', s3Items: ['Gérer votre compte et votre authentification (JWT)', 'Vous montrer votre historique de pronostics et votre classement', 'Vous permettre de créer et de rejoindre des ligues privées', 'Vous envoyer un mot de passe temporaire en cas de récupération d\'accès', "Améliorer l'expérience et le fonctionnement de l'application"],
    s4T: '4. Partage des données', s4Body: "Nous ne vendons, ne louons ni ne partageons vos données personnelles (nom, e-mail, etc.) avec des tiers à des fins commerciales. Votre nom d'utilisateur et votre score peuvent être visibles publiquement dans le classement mondial de l'application. Le reste de vos informations personnelles est privé. Les services de publicité et d'analyse décrits à la section 8 peuvent collecter des données automatiquement via des cookies, soumis à leurs propres politiques de confidentialité.",
    s5T: '5. Sécurité', s5Body: "Vos données sont toujours transmises via des connexions chiffrées (HTTPS/TLS). Les mots de passe sont stockés avec un hachage bcrypt. Nous utilisons des jetons JWT à durée limitée pour gérer les sessions. Malgré cela, aucun système n'est sûr à 100 % ; nous vous recommandons d'utiliser un mot de passe unique pour cette application.",
    s6T: '6. Conservation des données', s6Body: "Nous conservons vos données tant que votre compte est actif. Si vous demandez la suppression de votre compte, nous effacerons vos données personnelles dans un délai raisonnable, sauf si la loi nous oblige à les conserver.",
    s7T: '7. Vos droits', s7Intro: 'Vous avez le droit de :', s7Items: ['Accéder aux données que nous détenons sur vous', 'Corriger des données inexactes ou incomplètes', 'Demander la suppression de votre compte et de vos données', "Vous opposer au traitement de vos données"], s7TrailBefore: "Pour exercer l'un de ces droits, écrivez-nous à ", s7TrailAfter: '.',
    s8T: '8. Cookies et technologies tierces', s8P1: "Nous utilisons le stockage local du navigateur (localStorage) pour maintenir votre session active et mémoriser vos préférences d'interface.", s8P2: 'Dans la version gratuite, nous affichons de la publicité et mesurons l\'utilisation du site via des services tiers susceptibles d\'utiliser des cookies et des technologies similaires :',
    adsenseLabel: 'Google AdSense :', adsenseText: ' Google et ses partenaires utilisent des cookies pour vous montrer des annonces en fonction de vos visites précédentes sur ce site et d\'autres. Vous pouvez désactiver la publicité personnalisée dans ', settingsLabel: 'les paramètres des annonces Google', adsenseMid: ' ou sur ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra :', adsterraText: ' réseau publicitaire pouvant utiliser des cookies pour diffuser et mesurer les annonces.', gaLabel: 'Google Analytics (GA4) :', gaText: ' pour comprendre de manière agrégée et anonyme comment le site est utilisé et l\'améliorer.',
    premiumBefore: 'Les utilisateurs ', premiumStrong: 'Premium (Pass Mondial) naviguent sans publicité', premiumMid: '. Pour plus de détails sur la façon dont Google utilise les informations des sites qui font appel à ses services, consultez ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Modifications de cette politique', s9Body: "Nous pouvons mettre à jour cette politique occasionnellement. En cas de changements importants, nous vous en informerons par un avis dans l'application. L'utilisation continue de l'application après les changements implique l'acceptation de la nouvelle version.",
  },
  pt: {
    badge: 'Legal', title: 'Política de Privacidade', updated: 'Última atualização: junho de 2026 · Orionix Gol', back: 'Voltar', rights: '© 2026 ORIONIX GOL — TODOS OS DIREITOS RESERVADOS',
    s1T: '1. Quem somos', s1Before: 'O Orionix Gol é uma aplicação de palpites esportivos para a Copa do Mundo de Futebol 2026. O responsável pelo tratamento dos seus dados é a equipe do Orionix Gol, que pode ser contatada em ', s1After: '.',
    s2T: '2. Dados que coletamos', s2Intro: 'Ao criar uma conta, coletamos os seguintes dados:', s2Items: ['Nome e sobrenome', 'Nome de usuário', 'Endereço de e-mail', 'Senha (armazenada criptografada com bcrypt, nunca em texto puro)', 'País, região e cidade (opcionais)', 'Número de telefone (opcional)', 'Idioma preferido e fuso horário'], s2Trailing: 'Também registramos automaticamente sua atividade dentro do app (palpites feitos, ligas criadas ou unidas, pontuações).',
    s3T: '3. Para que usamos seus dados', s3Items: ['Gerenciar sua conta e autenticação (JWT)', 'Mostrar seu histórico de palpites e ranking', 'Permitir que você crie e participe de ligas privadas', 'Enviar sua senha temporária em caso de recuperação de acesso', 'Melhorar a experiência e o funcionamento da aplicação'],
    s4T: '4. Compartilhamento de dados', s4Body: 'Não vendemos, alugamos nem compartilhamos seus dados pessoais (nome, e-mail, etc.) com terceiros para fins comerciais. Seu nome de usuário e pontuação podem ser visíveis publicamente no ranking global da aplicação. O restante das suas informações pessoais é privado. Os serviços de publicidade e análise descritos na seção 8 podem coletar dados automaticamente por meio de cookies, sujeitos às suas próprias políticas de privacidade.',
    s5T: '5. Segurança', s5Body: 'Seus dados são sempre transmitidos por conexões criptografadas (HTTPS/TLS). As senhas são armazenadas com hash bcrypt. Usamos tokens JWT com expiração para gerenciar as sessões. Ainda assim, nenhum sistema é 100% seguro; recomendamos usar uma senha exclusiva para esta aplicação.',
    s6T: '6. Retenção de dados', s6Body: 'Mantemos seus dados enquanto sua conta estiver ativa. Se você solicitar a exclusão da sua conta, apagaremos seus dados pessoais em um prazo razoável, salvo se a lei nos obrigar a conservá-los.',
    s7T: '7. Seus direitos', s7Intro: 'Você tem o direito de:', s7Items: ['Acessar os dados que temos sobre você', 'Corrigir dados incorretos ou incompletos', 'Solicitar a exclusão da sua conta e dados', 'Opor-se ao tratamento dos seus dados'], s7TrailBefore: 'Para exercer qualquer um desses direitos, escreva para nós em ', s7TrailAfter: '.',
    s8T: '8. Cookies e tecnologias de terceiros', s8P1: 'Usamos o armazenamento local do navegador (localStorage) para manter sua sessão ativa e lembrar suas preferências de interface.', s8P2: 'Na versão gratuita exibimos publicidade e medimos o uso do site por meio de serviços de terceiros que podem usar cookies e tecnologias similares:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' O Google e seus parceiros usam cookies para mostrar anúncios com base em suas visitas anteriores a este e a outros sites. Você pode desativar a publicidade personalizada nas ', settingsLabel: 'Configurações de anúncios do Google', adsenseMid: ' ou em ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' rede de publicidade que pode usar cookies para exibir e medir anúncios.', gaLabel: 'Google Analytics (GA4):', gaText: ' para entender de forma agregada e anônima como o site é usado e melhorá-lo.',
    premiumBefore: 'Os usuários ', premiumStrong: 'Premium (Passe Mundial) navegam sem anúncios', premiumMid: '. Para mais detalhes sobre como o Google usa as informações dos sites que utilizam seus serviços, consulte ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Alterações nesta política', s9Body: 'Podemos atualizar esta política ocasionalmente. Em caso de alterações relevantes, notificaremos você por meio de um aviso na aplicação. O uso contínuo do app após as alterações implica aceitação da nova versão.',
  },
  de: {
    badge: 'Rechtliches', title: 'Datenschutzrichtlinie', updated: 'Zuletzt aktualisiert: Juni 2026 · Orionix Gol', back: 'Zurück', rights: '© 2026 ORIONIX GOL — ALLE RECHTE VORBEHALTEN',
    s1T: '1. Wer wir sind', s1Before: 'Orionix Gol ist eine App für Sport-Tipps zur Fußball-WM 2026. Verantwortlich für die Verarbeitung deiner Daten ist das Orionix-Gol-Team, erreichbar unter ', s1After: '.',
    s2T: '2. Welche Daten wir erheben', s2Intro: 'Bei der Erstellung eines Kontos erheben wir folgende Daten:', s2Items: ['Vor- und Nachname', 'Benutzername', 'E-Mail-Adresse', 'Passwort (verschlüsselt mit bcrypt gespeichert, niemals im Klartext)', 'Land, Region und Stadt (optional)', 'Telefonnummer (optional)', 'Bevorzugte Sprache und Zeitzone'], s2Trailing: 'Wir erfassen außerdem automatisch deine Aktivität in der App (abgegebene Tipps, erstellte oder beigetretene Ligen, Punktzahlen).',
    s3T: '3. Wofür wir deine Daten nutzen', s3Items: ['Dein Konto und die Authentifizierung verwalten (JWT)', 'Dir deinen Tippverlauf und dein Ranking anzeigen', 'Dir das Erstellen und Beitreten privater Ligen ermöglichen', 'Dir bei der Wiederherstellung des Zugangs ein temporäres Passwort senden', 'Das Erlebnis und die Funktion der App verbessern'],
    s4T: '4. Weitergabe von Daten', s4Body: 'Wir verkaufen, vermieten oder teilen deine personenbezogenen Daten (Name, E-Mail usw.) nicht zu kommerziellen Zwecken mit Dritten. Dein Benutzername und deine Punktzahl können im globalen Ranking der App öffentlich sichtbar sein. Der Rest deiner persönlichen Informationen ist privat. Die in Abschnitt 8 beschriebenen Werbe- und Analysedienste können über Cookies automatisch Daten erheben, vorbehaltlich ihrer eigenen Datenschutzrichtlinien.',
    s5T: '5. Sicherheit', s5Body: 'Deine Daten werden stets über verschlüsselte Verbindungen (HTTPS/TLS) übertragen. Passwörter werden mit einem bcrypt-Hash gespeichert. Zur Verwaltung der Sitzungen verwenden wir JWT-Tokens mit Ablaufzeit. Dennoch ist kein System zu 100 % sicher; wir empfehlen, für diese App ein einzigartiges Passwort zu verwenden.',
    s6T: '6. Aufbewahrung von Daten', s6Body: 'Wir bewahren deine Daten auf, solange dein Konto aktiv ist. Wenn du die Löschung deines Kontos beantragst, löschen wir deine personenbezogenen Daten innerhalb einer angemessenen Frist, sofern wir nicht gesetzlich zur Aufbewahrung verpflichtet sind.',
    s7T: '7. Deine Rechte', s7Intro: 'Du hast das Recht:', s7Items: ['Auf die Daten zuzugreifen, die wir über dich haben', 'Unrichtige oder unvollständige Daten zu korrigieren', 'Die Löschung deines Kontos und deiner Daten zu verlangen', 'Der Verarbeitung deiner Daten zu widersprechen'], s7TrailBefore: 'Um eines dieser Rechte auszuüben, schreib uns an ', s7TrailAfter: '.',
    s8T: '8. Cookies und Technologien von Drittanbietern', s8P1: 'Wir verwenden den lokalen Speicher des Browsers (localStorage), um deine Sitzung aktiv zu halten und deine Oberflächeneinstellungen zu speichern.', s8P2: 'In der kostenlosen Version zeigen wir Werbung und messen die Nutzung der Website über Drittanbieterdienste, die Cookies und ähnliche Technologien verwenden können:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' Google und seine Partner verwenden Cookies, um dir Anzeigen auf Basis deiner früheren Besuche auf dieser und anderen Websites zu zeigen. Du kannst personalisierte Werbung in den ', settingsLabel: 'Google-Anzeigeneinstellungen', adsenseMid: ' oder auf ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' Werbenetzwerk, das Cookies zur Anzeige und Messung von Werbung verwenden kann.', gaLabel: 'Google Analytics (GA4):', gaText: ' um aggregiert und anonym zu verstehen, wie die Website genutzt wird, und sie zu verbessern.',
    premiumBefore: '', premiumStrong: 'Premium-Nutzer (WM-Pass) surfen werbefrei', premiumMid: '. Weitere Details dazu, wie Google Informationen von Websites nutzt, die seine Dienste verwenden, findest du unter ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Änderungen dieser Richtlinie', s9Body: 'Wir können diese Richtlinie gelegentlich aktualisieren. Bei wesentlichen Änderungen benachrichtigen wir dich mit einem Hinweis in der App. Die fortgesetzte Nutzung der App nach den Änderungen gilt als Annahme der neuen Version.',
  },
  ru: {
    badge: 'Правовое', title: 'Политика конфиденциальности', updated: 'Последнее обновление: июнь 2026 · Orionix Gol', back: 'Назад', rights: '© 2026 ORIONIX GOL — ВСЕ ПРАВА ЗАЩИЩЕНЫ',
    s1T: '1. Кто мы', s1Before: 'Orionix Gol — это приложение спортивных прогнозов на Чемпионат мира по футболу 2026. Ответственным за обработку ваших данных является команда Orionix Gol, с которой можно связаться по адресу ', s1After: '.',
    s2T: '2. Какие данные мы собираем', s2Intro: 'При создании учётной записи мы собираем следующие данные:', s2Items: ['Имя и фамилия', 'Имя пользователя', 'Адрес электронной почты', 'Пароль (хранится в зашифрованном виде с bcrypt, никогда в открытом виде)', 'Страна, регион и город (необязательно)', 'Номер телефона (необязательно)', 'Предпочитаемый язык и часовой пояс'], s2Trailing: 'Мы также автоматически фиксируем вашу активность в приложении (сделанные прогнозы, созданные или присоединённые лиги, очки).',
    s3T: '3. Для чего мы используем ваши данные', s3Items: ['Управление вашей учётной записью и аутентификацией (JWT)', 'Показ истории ваших прогнозов и рейтинга', 'Возможность создавать и присоединяться к частным лигам', 'Отправка временного пароля при восстановлении доступа', 'Улучшение работы и удобства приложения'],
    s4T: '4. Передача данных', s4Body: 'Мы не продаём, не сдаём в аренду и не передаём ваши персональные данные (имя, e-mail и т. д.) третьим лицам в коммерческих целях. Ваше имя пользователя и количество очков могут быть публично видны в глобальном рейтинге приложения. Остальная личная информация является конфиденциальной. Рекламные и аналитические сервисы, описанные в разделе 8, могут автоматически собирать данные с помощью файлов cookie в соответствии со своими политиками конфиденциальности.',
    s5T: '5. Безопасность', s5Body: 'Ваши данные всегда передаются по зашифрованным соединениям (HTTPS/TLS). Пароли хранятся с хешем bcrypt. Для управления сессиями мы используем JWT-токены с истечением срока действия. Тем не менее ни одна система не является на 100% безопасной; рекомендуем использовать уникальный пароль для этого приложения.',
    s6T: '6. Хранение данных', s6Body: 'Мы храним ваши данные, пока ваша учётная запись активна. Если вы запросите удаление учётной записи, мы удалим ваши персональные данные в разумный срок, если закон не обязывает нас их хранить.',
    s7T: '7. Ваши права', s7Intro: 'Вы имеете право:', s7Items: ['Получать доступ к данным, которые у нас есть о вас', 'Исправлять неточные или неполные данные', 'Запрашивать удаление вашей учётной записи и данных', 'Возражать против обработки ваших данных'], s7TrailBefore: 'Чтобы воспользоваться любым из этих прав, напишите нам на ', s7TrailAfter: '.',
    s8T: '8. Файлы cookie и сторонние технологии', s8P1: 'Мы используем локальное хранилище браузера (localStorage), чтобы поддерживать вашу сессию активной и запоминать настройки интерфейса.', s8P2: 'В бесплатной версии мы показываем рекламу и измеряем использование сайта с помощью сторонних сервисов, которые могут использовать файлы cookie и аналогичные технологии:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' Google и его партнёры используют файлы cookie, чтобы показывать вам рекламу на основе ваших предыдущих посещений этого и других сайтов. Вы можете отключить персонализированную рекламу в ', settingsLabel: 'настройках рекламы Google', adsenseMid: ' или на ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' рекламная сеть, которая может использовать файлы cookie для показа и измерения рекламы.', gaLabel: 'Google Analytics (GA4):', gaText: ' чтобы агрегированно и анонимно понимать, как используется сайт, и улучшать его.',
    premiumBefore: 'Пользователи ', premiumStrong: 'Premium (Мундиаль-пропуск) просматривают сайт без рекламы', premiumMid: '. Подробнее о том, как Google использует информацию с сайтов, которые применяют его сервисы, см. ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. Изменения в этой политике', s9Body: 'Мы можем время от времени обновлять эту политику. В случае существенных изменений мы уведомим вас сообщением в приложении. Продолжение использования приложения после изменений означает принятие новой версии.',
  },
  ar: {
    badge: 'قانوني', title: 'سياسة الخصوصية', updated: 'آخر تحديث: يونيو 2026 · Orionix Gol', back: 'رجوع', rights: '© 2026 ORIONIX GOL — جميع الحقوق محفوظة',
    s1T: '1. من نحن', s1Before: 'Orionix Gol تطبيق لتوقّعات كرة القدم لكأس العالم 2026. والمسؤول عن معالجة بياناتك هو فريق Orionix Gol، ويمكن التواصل معه عبر ', s1After: '.',
    s2T: '2. البيانات التي نجمعها', s2Intro: 'عند إنشاء حساب نجمع البيانات التالية:', s2Items: ['الاسم واللقب', 'اسم المستخدم', 'عنوان البريد الإلكتروني', 'كلمة المرور (تُخزَّن مشفّرة باستخدام bcrypt، وليست أبدًا كنص عادي)', 'الدولة والمنطقة والمدينة (اختياري)', 'رقم الهاتف (اختياري)', 'اللغة المفضّلة والمنطقة الزمنية'], s2Trailing: 'كما نسجّل تلقائيًا نشاطك داخل التطبيق (التوقّعات التي أجريتها، والدوريات التي أنشأتها أو انضممت إليها، والنقاط).',
    s3T: '3. لماذا نستخدم بياناتك', s3Items: ['إدارة حسابك والمصادقة (JWT)', 'عرض سجلّ توقّعاتك وترتيبك', 'تمكينك من إنشاء دوريات خاصة والانضمام إليها', 'إرسال كلمة مرور مؤقتة عند استعادة الوصول', 'تحسين تجربة التطبيق وأدائه'],
    s4T: '4. مشاركة البيانات', s4Body: 'لا نبيع بياناتك الشخصية (الاسم، البريد، إلخ) ولا نؤجّرها ولا نشاركها مع أطراف ثالثة لأغراض تجارية. وقد يكون اسم المستخدم والنقاط الخاصة بك ظاهرين للعموم في الترتيب العالمي للتطبيق. أما بقية معلوماتك الشخصية فهي خاصة. وقد تجمع خدمات الإعلانات والتحليلات الموضّحة في القسم 8 بيانات تلقائيًا عبر ملفات تعريف الارتباط، وفقًا لسياسات الخصوصية الخاصة بها.',
    s5T: '5. الأمان', s5Body: 'تُنقل بياناتك دائمًا عبر اتصالات مشفّرة (HTTPS/TLS). وتُخزَّن كلمات المرور باستخدام تجزئة bcrypt. ونستخدم رموز JWT منتهية الصلاحية لإدارة الجلسات. ومع ذلك، لا يوجد نظام آمن بنسبة 100٪؛ ننصح باستخدام كلمة مرور فريدة لهذا التطبيق.',
    s6T: '6. الاحتفاظ بالبيانات', s6Body: 'نحتفظ ببياناتك طالما أن حسابك نشط. وإذا طلبت حذف حسابك، فسنحذف بياناتك الشخصية خلال مدة معقولة، ما لم يُلزمنا القانون بالاحتفاظ بها.',
    s7T: '7. حقوقك', s7Intro: 'يحقّ لك:', s7Items: ['الوصول إلى البيانات التي نحتفظ بها عنك', 'تصحيح البيانات غير الصحيحة أو غير المكتملة', 'طلب حذف حسابك وبياناتك', 'الاعتراض على معالجة بياناتك'], s7TrailBefore: 'لممارسة أي من هذه الحقوق، راسلنا على ', s7TrailAfter: '.',
    s8T: '8. ملفات تعريف الارتباط وتقنيات الأطراف الثالثة', s8P1: 'نستخدم التخزين المحلي للمتصفّح (localStorage) لإبقاء جلستك نشطة وتذكّر تفضيلات الواجهة لديك.', s8P2: 'في النسخة المجانية نعرض إعلانات ونقيس استخدام الموقع عبر خدمات أطراف ثالثة قد تستخدم ملفات تعريف الارتباط وتقنيات مماثلة:',
    adsenseLabel: 'Google AdSense:', adsenseText: ' تستخدم Google وشركاؤها ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك السابقة لهذا الموقع ومواقع أخرى. ويمكنك تعطيل الإعلانات المخصّصة من ', settingsLabel: 'إعدادات إعلانات Google', adsenseMid: ' أو عبر ', aboutadsLabel: 'aboutads.info/choices',
    adsterraLabel: 'Adsterra:', adsterraText: ' شبكة إعلانات قد تستخدم ملفات تعريف الارتباط لعرض الإعلانات وقياسها.', gaLabel: 'Google Analytics (GA4):', gaText: ' لفهم كيفية استخدام الموقع بشكل مجمّع ومجهول الهوية وتحسينه.',
    premiumBefore: 'مستخدمو ', premiumStrong: 'Premium (تذكرة المونديال) يتصفّحون دون إعلانات', premiumMid: '. لمزيد من التفاصيل حول كيفية استخدام Google لمعلومات المواقع التي تستعين بخدماتها، راجع ', policiesLabel: 'policies.google.com/technologies/partner-sites',
    s9T: '9. التغييرات على هذه السياسة', s9Body: 'قد نحدّث هذه السياسة من حين لآخر. وفي حال وجود تغييرات جوهرية، سننبّهك عبر إشعار داخل التطبيق. ويُعدّ استمرار استخدام التطبيق بعد التغييرات قبولًا للنسخة الجديدة.',
  },
};

export default function PrivacyPage() {
  const router = useRouter();
  const locale = useLocale();
  const C = COPY[pickLang(locale)];

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  const h2 = 'text-base font-bold text-orionix-text-secondary mb-3';
  const link = { color: alpha(hex.accent.teal, 0.8) };
  const dot = (color = hex.accent.teal) => (
    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(color, 0.6) }} />
  );
  const aProps = { target: '_blank', rel: 'noopener noreferrer', className: 'underline', style: link } as const;

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
          onClick={() => { if (window.history.length > 1) router.back(); else window.close(); }}
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
            <p className="text-xs text-orionix-text-muted mt-2">{C.updated}</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: alpha(hex.accent.slate, 0.85) }}>

            <section>
              <h2 className={h2}>{C.s1T}</h2>
              <p>{C.s1Before}<a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={link}>{CONTACT_EMAIL}</a>{C.s1After}</p>
            </section>

            <section>
              <h2 className={h2}>{C.s2T}</h2>
              <p className="mb-3">{C.s2Intro}</p>
              <ul className="space-y-1.5 pl-4">
                {C.s2Items.map(item => <li key={item} className="flex items-start gap-2">{dot()}{item}</li>)}
              </ul>
              <p className="mt-3">{C.s2Trailing}</p>
            </section>

            <section>
              <h2 className={h2}>{C.s3T}</h2>
              <ul className="space-y-1.5 pl-4">
                {C.s3Items.map(item => <li key={item} className="flex items-start gap-2">{dot()}{item}</li>)}
              </ul>
            </section>

            <section><h2 className={h2}>{C.s4T}</h2><p>{C.s4Body}</p></section>
            <section><h2 className={h2}>{C.s5T}</h2><p>{C.s5Body}</p></section>
            <section><h2 className={h2}>{C.s6T}</h2><p>{C.s6Body}</p></section>

            <section>
              <h2 className={h2}>{C.s7T}</h2>
              <p className="mb-3">{C.s7Intro}</p>
              <ul className="space-y-1.5 pl-4">
                {C.s7Items.map(item => <li key={item} className="flex items-start gap-2">{dot()}{item}</li>)}
              </ul>
              <p className="mt-3">{C.s7TrailBefore}<a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={link}>{CONTACT_EMAIL}</a>{C.s7TrailAfter}</p>
            </section>

            <section>
              <h2 className={h2}>{C.s8T}</h2>
              <p className="mb-3">{C.s8P1}</p>
              <p className="mb-3">{C.s8P2}</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">{dot()}
                  <span>
                    <strong className="text-orionix-text-secondary">{C.adsenseLabel}</strong>{C.adsenseText}
                    <a href={ADS_SETTINGS_URL} {...aProps}>{C.settingsLabel}</a>{C.adsenseMid}
                    <a href={ABOUTADS_URL} {...aProps}>{C.aboutadsLabel}</a>.
                  </span>
                </li>
                <li className="flex items-start gap-2">{dot()}
                  <span><strong className="text-orionix-text-secondary">{C.adsterraLabel}</strong>{C.adsterraText}</span>
                </li>
                <li className="flex items-start gap-2">{dot()}
                  <span><strong className="text-orionix-text-secondary">{C.gaLabel}</strong>{C.gaText}</span>
                </li>
              </ul>
              <p className="mt-3">
                {C.premiumBefore}<strong className="text-orionix-text-secondary">{C.premiumStrong}</strong>{C.premiumMid}
                <a href={POLICIES_URL} {...aProps}>{C.policiesLabel}</a>.
              </p>
            </section>

            <section><h2 className={h2}>{C.s9T}</h2><p>{C.s9Body}</p></section>

          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <p className="text-[10px] text-orionix-text-muted tracking-widest uppercase">{C.rights}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
