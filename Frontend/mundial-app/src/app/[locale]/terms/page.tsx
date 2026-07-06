'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

const CONTACT_EMAIL = 'orionixgol@gmail.com';

type Lang = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ru' | 'ar';
const LANGS: readonly Lang[] = ['es', 'en', 'fr', 'pt', 'de', 'ru', 'ar'];
function pickLang(locale: string): Lang {
  const l = locale.toLowerCase().slice(0, 2) as Lang;
  return LANGS.includes(l) ? l : 'es';
}

type Section = { t: string; body?: string; intro?: string; items?: string[]; danger?: boolean };
type TermsCopy = {
  badge: string; title: string; updated: string; back: string; rights: string;
  sections: Section[];
  contact: { t: string; before: string; after: string };
};

const COPY: Record<Lang, TermsCopy> = {
  es: {
    badge: 'Legal', title: 'Términos y Condiciones', updated: 'Última actualización: mayo de 2026 · Orionix Gol', back: 'Volver', rights: '© 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS',
    sections: [
      { t: '1. Aceptación de los términos', body: 'Al registrarte o utilizar Orionix Gol, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, te pedimos que no utilices la aplicación. Estos términos pueden actualizarse; el uso continuado de la app implica aceptación de los cambios.' },
      { t: '2. Descripción del servicio', body: 'Orionix Gol es una plataforma gratuita de predicciones deportivas para el Mundial de Fútbol 2026. Los usuarios pueden realizar predicciones de partidos, acumular puntos según la precisión de sus pronósticos, crear ligas privadas con amigos y consultar rankings globales. La aplicación no implica apuestas de dinero real.' },
      { t: '3. Requisitos de edad', body: 'Debes tener al menos 13 años para registrarte. Si eres menor de 18 años, debes contar con el consentimiento de tu tutor legal para usar la aplicación.' },
      { t: '4. Cuenta de usuario', items: ['Eres responsable de mantener la confidencialidad de tu contraseña.', 'Cada persona puede registrar una sola cuenta. Las cuentas múltiples o falsas están prohibidas.', 'Debes proporcionar información veraz durante el registro.', 'Puedes solicitar la eliminación de tu cuenta en cualquier momento contactando con nosotros.'] },
      { t: '5. Uso aceptable', intro: 'Queda prohibido:', danger: true, items: ['Manipular resultados o sistemas de puntuación de forma fraudulenta.', 'Intentar acceder a cuentas o datos de otros usuarios.', 'Publicar contenido ofensivo, discriminatorio o ilegal (nombres de usuario, perfiles de liga).', 'Usar bots, scripts o medios automatizados para interactuar con la app.', 'Realizar ingeniería inversa o intentar comprometer la seguridad del sistema.'] },
      { t: '6. Suspensión y cancelación de cuentas', body: 'Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos, sin previo aviso y a nuestra entera discreción. En casos graves (fraude, acceso no autorizado), podemos bloquear permanentemente el acceso a la plataforma.' },
      { t: '7. Propiedad intelectual', body: 'Todo el contenido de Orionix Gol — incluyendo diseño, código, logotipos, animaciones y textos — es propiedad de Orionix Gol o de sus respectivos titulares. No puedes reproducir, distribuir ni modificar ningún elemento sin autorización expresa por escrito.' },
      { t: '8. Disponibilidad del servicio', body: 'Nos esforzamos por mantener la aplicación disponible en todo momento, pero no garantizamos un servicio ininterrumpido. Podemos realizar tareas de mantenimiento, actualizaciones o suspender el servicio temporalmente sin previo aviso. No somos responsables de los perjuicios ocasionados por interrupciones del servicio.' },
      { t: '9. Limitación de responsabilidad', body: 'Orionix Gol es una aplicación de entretenimiento. Los resultados, puntuaciones y rankings son meramente informativos y no tienen valor económico ni legal. No nos hacemos responsables de pérdidas o daños derivados del uso de la aplicación.' },
    ],
    contact: { t: '10. Contacto', before: 'Para cualquier consulta sobre estos términos, puedes escribirnos a ', after: '.' },
  },
  en: {
    badge: 'Legal', title: 'Terms and Conditions', updated: 'Last updated: May 2026 · Orionix Gol', back: 'Back', rights: '© 2026 ORIONIX GOL — ALL RIGHTS RESERVED',
    sections: [
      { t: '1. Acceptance of terms', body: 'By registering or using Orionix Gol, you fully accept these Terms and Conditions. If you do not agree, we ask that you do not use the application. These terms may be updated; continued use of the app implies acceptance of the changes.' },
      { t: '2. Service description', body: 'Orionix Gol is a free sports prediction platform for the 2026 Football World Cup. Users can make match predictions, earn points based on the accuracy of their forecasts, create private leagues with friends and check global rankings. The application does not involve real-money betting.' },
      { t: '3. Age requirements', body: 'You must be at least 13 years old to register. If you are under 18, you must have the consent of your legal guardian to use the application.' },
      { t: '4. User account', items: ['You are responsible for keeping your password confidential.', 'Each person may register only one account. Multiple or fake accounts are prohibited.', 'You must provide truthful information during registration.', 'You may request the deletion of your account at any time by contacting us.'] },
      { t: '5. Acceptable use', intro: 'The following is prohibited:', danger: true, items: ['Manipulating results or scoring systems fraudulently.', 'Attempting to access other users\' accounts or data.', 'Posting offensive, discriminatory or illegal content (usernames, league profiles).', 'Using bots, scripts or automated means to interact with the app.', 'Reverse engineering or attempting to compromise the system\'s security.'] },
      { t: '6. Account suspension and termination', body: 'We reserve the right to suspend or delete accounts that breach these terms, without notice and at our sole discretion. In serious cases (fraud, unauthorized access), we may permanently block access to the platform.' },
      { t: '7. Intellectual property', body: 'All Orionix Gol content — including design, code, logos, animations and text — is the property of Orionix Gol or its respective owners. You may not reproduce, distribute or modify any element without express written authorization.' },
      { t: '8. Service availability', body: 'We strive to keep the application available at all times, but we do not guarantee uninterrupted service. We may carry out maintenance, updates or temporarily suspend the service without notice. We are not liable for damages caused by service interruptions.' },
      { t: '9. Limitation of liability', body: 'Orionix Gol is an entertainment application. Results, scores and rankings are merely informational and have no economic or legal value. We are not responsible for losses or damages arising from the use of the application.' },
    ],
    contact: { t: '10. Contact', before: 'For any questions about these terms, you can write to us at ', after: '.' },
  },
  fr: {
    badge: 'Légal', title: 'Conditions générales', updated: 'Dernière mise à jour : mai 2026 · Orionix Gol', back: 'Retour', rights: '© 2026 ORIONIX GOL — TOUS DROITS RÉSERVÉS',
    sections: [
      { t: '1. Acceptation des conditions', body: "En vous inscrivant ou en utilisant Orionix Gol, vous acceptez pleinement ces Conditions générales. Si vous n'êtes pas d'accord, nous vous demandons de ne pas utiliser l'application. Ces conditions peuvent être mises à jour ; l'utilisation continue de l'application implique l'acceptation des changements." },
      { t: '2. Description du service', body: "Orionix Gol est une plateforme gratuite de pronostics sportifs pour la Coupe du Monde de football 2026. Les utilisateurs peuvent pronostiquer des matchs, accumuler des points selon la précision de leurs pronostics, créer des ligues privées entre amis et consulter des classements mondiaux. L'application n'implique aucun pari d'argent réel." },
      { t: "3. Conditions d'âge", body: "Vous devez avoir au moins 13 ans pour vous inscrire. Si vous avez moins de 18 ans, vous devez disposer du consentement de votre tuteur légal pour utiliser l'application." },
      { t: '4. Compte utilisateur', items: ['Vous êtes responsable de la confidentialité de votre mot de passe.', 'Chaque personne ne peut créer qu\'un seul compte. Les comptes multiples ou faux sont interdits.', "Vous devez fournir des informations véridiques lors de l'inscription.", 'Vous pouvez demander la suppression de votre compte à tout moment en nous contactant.'] },
      { t: '5. Utilisation acceptable', intro: 'Il est interdit de :', danger: true, items: ['Manipuler les résultats ou les systèmes de points de manière frauduleuse.', "Tenter d'accéder aux comptes ou aux données d'autres utilisateurs.", 'Publier des contenus offensants, discriminatoires ou illégaux (noms d\'utilisateur, profils de ligue).', "Utiliser des bots, scripts ou moyens automatisés pour interagir avec l'application.", "Procéder à de l'ingénierie inverse ou tenter de compromettre la sécurité du système."] },
      { t: '6. Suspension et résiliation des comptes', body: "Nous nous réservons le droit de suspendre ou de supprimer les comptes qui enfreignent ces conditions, sans préavis et à notre entière discrétion. Dans les cas graves (fraude, accès non autorisé), nous pouvons bloquer définitivement l'accès à la plateforme." },
      { t: '7. Propriété intellectuelle', body: "Tout le contenu d'Orionix Gol — y compris le design, le code, les logos, les animations et les textes — est la propriété d'Orionix Gol ou de leurs titulaires respectifs. Vous ne pouvez reproduire, distribuer ni modifier aucun élément sans autorisation écrite expresse." },
      { t: '8. Disponibilité du service', body: "Nous nous efforçons de maintenir l'application disponible à tout moment, mais nous ne garantissons pas un service ininterrompu. Nous pouvons effectuer des opérations de maintenance, des mises à jour ou suspendre temporairement le service sans préavis. Nous ne sommes pas responsables des préjudices causés par les interruptions du service." },
      { t: '9. Limitation de responsabilité', body: "Orionix Gol est une application de divertissement. Les résultats, scores et classements sont purement informatifs et n'ont aucune valeur économique ni légale. Nous ne sommes pas responsables des pertes ou dommages résultant de l'utilisation de l'application." },
    ],
    contact: { t: '10. Contact', before: 'Pour toute question concernant ces conditions, vous pouvez nous écrire à ', after: '.' },
  },
  pt: {
    badge: 'Legal', title: 'Termos e Condições', updated: 'Última atualização: maio de 2026 · Orionix Gol', back: 'Voltar', rights: '© 2026 ORIONIX GOL — TODOS OS DIREITOS RESERVADOS',
    sections: [
      { t: '1. Aceitação dos termos', body: 'Ao se registrar ou utilizar o Orionix Gol, você aceita estes Termos e Condições na íntegra. Se não concordar, pedimos que não utilize a aplicação. Estes termos podem ser atualizados; o uso contínuo do app implica aceitação das alterações.' },
      { t: '2. Descrição do serviço', body: 'O Orionix Gol é uma plataforma gratuita de palpites esportivos para a Copa do Mundo de Futebol 2026. Os usuários podem fazer palpites de jogos, acumular pontos conforme a precisão de seus prognósticos, criar ligas privadas com amigos e consultar rankings globais. A aplicação não envolve apostas de dinheiro real.' },
      { t: '3. Requisitos de idade', body: 'Você deve ter pelo menos 13 anos para se registrar. Se for menor de 18 anos, deve ter o consentimento de seu responsável legal para usar a aplicação.' },
      { t: '4. Conta de usuário', items: ['Você é responsável por manter a confidencialidade da sua senha.', 'Cada pessoa pode registrar apenas uma conta. Contas múltiplas ou falsas são proibidas.', 'Você deve fornecer informações verdadeiras durante o registro.', 'Você pode solicitar a exclusão da sua conta a qualquer momento entrando em contato conosco.'] },
      { t: '5. Uso aceitável', intro: 'É proibido:', danger: true, items: ['Manipular resultados ou sistemas de pontuação de forma fraudulenta.', 'Tentar acessar contas ou dados de outros usuários.', 'Publicar conteúdo ofensivo, discriminatório ou ilegal (nomes de usuário, perfis de liga).', 'Usar bots, scripts ou meios automatizados para interagir com o app.', 'Realizar engenharia reversa ou tentar comprometer a segurança do sistema.'] },
      { t: '6. Suspensão e cancelamento de contas', body: 'Reservamo-nos o direito de suspender ou excluir contas que violem estes termos, sem aviso prévio e a nosso exclusivo critério. Em casos graves (fraude, acesso não autorizado), podemos bloquear permanentemente o acesso à plataforma.' },
      { t: '7. Propriedade intelectual', body: 'Todo o conteúdo do Orionix Gol — incluindo design, código, logotipos, animações e textos — é propriedade do Orionix Gol ou de seus respectivos titulares. Você não pode reproduzir, distribuir nem modificar nenhum elemento sem autorização expressa por escrito.' },
      { t: '8. Disponibilidade do serviço', body: 'Esforçamo-nos para manter a aplicação disponível o tempo todo, mas não garantimos um serviço ininterrupto. Podemos realizar manutenções, atualizações ou suspender o serviço temporariamente sem aviso prévio. Não somos responsáveis por prejuízos causados por interrupções do serviço.' },
      { t: '9. Limitação de responsabilidade', body: 'O Orionix Gol é uma aplicação de entretenimento. Os resultados, pontuações e rankings são meramente informativos e não têm valor econômico nem legal. Não nos responsabilizamos por perdas ou danos decorrentes do uso da aplicação.' },
    ],
    contact: { t: '10. Contato', before: 'Para qualquer dúvida sobre estes termos, você pode nos escrever em ', after: '.' },
  },
  de: {
    badge: 'Rechtliches', title: 'Allgemeine Geschäftsbedingungen', updated: 'Zuletzt aktualisiert: Mai 2026 · Orionix Gol', back: 'Zurück', rights: '© 2026 ORIONIX GOL — ALLE RECHTE VORBEHALTEN',
    sections: [
      { t: '1. Annahme der Bedingungen', body: 'Mit der Registrierung oder Nutzung von Orionix Gol akzeptierst du diese Allgemeinen Geschäftsbedingungen vollständig. Wenn du nicht einverstanden bist, bitten wir dich, die App nicht zu nutzen. Diese Bedingungen können aktualisiert werden; die fortgesetzte Nutzung der App gilt als Zustimmung zu den Änderungen.' },
      { t: '2. Beschreibung des Dienstes', body: 'Orionix Gol ist eine kostenlose Sport-Tippplattform für die Fußball-WM 2026. Nutzer können Spiele tippen, je nach Genauigkeit ihrer Tipps Punkte sammeln, private Ligen mit Freunden erstellen und globale Ranglisten einsehen. Die App beinhaltet keine Wetten mit echtem Geld.' },
      { t: '3. Altersanforderungen', body: 'Du musst mindestens 13 Jahre alt sein, um dich zu registrieren. Wenn du unter 18 bist, benötigst du die Zustimmung deines gesetzlichen Vertreters, um die App zu nutzen.' },
      { t: '4. Benutzerkonto', items: ['Du bist dafür verantwortlich, dein Passwort vertraulich zu behandeln.', 'Jede Person darf nur ein Konto registrieren. Mehrfache oder gefälschte Konten sind verboten.', 'Du musst bei der Registrierung wahrheitsgemäße Angaben machen.', 'Du kannst die Löschung deines Kontos jederzeit durch Kontaktaufnahme mit uns beantragen.'] },
      { t: '5. Zulässige Nutzung', intro: 'Verboten ist:', danger: true, items: ['Ergebnisse oder Punktesysteme betrügerisch zu manipulieren.', 'Zu versuchen, auf Konten oder Daten anderer Nutzer zuzugreifen.', 'Beleidigende, diskriminierende oder illegale Inhalte zu veröffentlichen (Benutzernamen, Liga-Profile).', 'Bots, Skripte oder automatisierte Mittel zur Interaktion mit der App zu verwenden.', 'Reverse Engineering durchzuführen oder die Sicherheit des Systems zu gefährden.'] },
      { t: '6. Sperrung und Kündigung von Konten', body: 'Wir behalten uns das Recht vor, Konten, die gegen diese Bedingungen verstoßen, ohne Vorankündigung und nach eigenem Ermessen zu sperren oder zu löschen. In schweren Fällen (Betrug, unbefugter Zugriff) können wir den Zugang zur Plattform dauerhaft sperren.' },
      { t: '7. Geistiges Eigentum', body: 'Alle Inhalte von Orionix Gol — einschließlich Design, Code, Logos, Animationen und Texte — sind Eigentum von Orionix Gol oder der jeweiligen Inhaber. Du darfst keine Elemente ohne ausdrückliche schriftliche Genehmigung reproduzieren, verbreiten oder verändern.' },
      { t: '8. Verfügbarkeit des Dienstes', body: 'Wir bemühen uns, die App jederzeit verfügbar zu halten, garantieren jedoch keinen ununterbrochenen Dienst. Wir können Wartungsarbeiten, Updates durchführen oder den Dienst vorübergehend ohne Vorankündigung aussetzen. Wir haften nicht für Schäden durch Dienstunterbrechungen.' },
      { t: '9. Haftungsbeschränkung', body: 'Orionix Gol ist eine Unterhaltungs-App. Ergebnisse, Punkte und Ranglisten sind rein informativ und haben keinen wirtschaftlichen oder rechtlichen Wert. Wir haften nicht für Verluste oder Schäden, die aus der Nutzung der App entstehen.' },
    ],
    contact: { t: '10. Kontakt', before: 'Bei Fragen zu diesen Bedingungen kannst du uns schreiben an ', after: '.' },
  },
  ru: {
    badge: 'Правовое', title: 'Условия использования', updated: 'Последнее обновление: май 2026 · Orionix Gol', back: 'Назад', rights: '© 2026 ORIONIX GOL — ВСЕ ПРАВА ЗАЩИЩЕНЫ',
    sections: [
      { t: '1. Принятие условий', body: 'Регистрируясь или используя Orionix Gol, вы полностью принимаете настоящие Условия использования. Если вы не согласны, просим не использовать приложение. Эти условия могут обновляться; продолжение использования приложения означает согласие с изменениями.' },
      { t: '2. Описание сервиса', body: 'Orionix Gol — это бесплатная платформа спортивных прогнозов на Чемпионат мира по футболу 2026. Пользователи могут делать прогнозы на матчи, набирать очки в зависимости от точности прогнозов, создавать частные лиги с друзьями и смотреть глобальные рейтинги. Приложение не предполагает ставок на реальные деньги.' },
      { t: '3. Возрастные требования', body: 'Для регистрации вам должно быть не менее 13 лет. Если вам меньше 18 лет, для использования приложения требуется согласие вашего законного представителя.' },
      { t: '4. Учётная запись', items: ['Вы несёте ответственность за сохранение конфиденциальности своего пароля.', 'Каждый человек может зарегистрировать только одну учётную запись. Множественные или поддельные аккаунты запрещены.', 'При регистрации вы должны предоставлять достоверную информацию.', 'Вы можете запросить удаление своей учётной записи в любой момент, связавшись с нами.'] },
      { t: '5. Допустимое использование', intro: 'Запрещается:', danger: true, items: ['Мошеннически манипулировать результатами или системой начисления очков.', 'Пытаться получить доступ к аккаунтам или данным других пользователей.', 'Публиковать оскорбительный, дискриминационный или незаконный контент (имена пользователей, профили лиг).', 'Использовать ботов, скрипты или автоматизированные средства для взаимодействия с приложением.', 'Выполнять обратную разработку или пытаться нарушить безопасность системы.'] },
      { t: '6. Приостановка и удаление аккаунтов', body: 'Мы оставляем за собой право приостанавливать или удалять аккаунты, нарушающие эти условия, без предупреждения и по нашему усмотрению. В серьёзных случаях (мошенничество, несанкционированный доступ) мы можем навсегда заблокировать доступ к платформе.' },
      { t: '7. Интеллектуальная собственность', body: 'Весь контент Orionix Gol — включая дизайн, код, логотипы, анимации и тексты — является собственностью Orionix Gol или соответствующих правообладателей. Вы не можете воспроизводить, распространять или изменять какие-либо элементы без явного письменного разрешения.' },
      { t: '8. Доступность сервиса', body: 'Мы стремимся поддерживать приложение доступным в любое время, но не гарантируем бесперебойную работу. Мы можем проводить обслуживание, обновления или временно приостанавливать сервис без предупреждения. Мы не несём ответственности за ущерб, вызванный перебоями в работе сервиса.' },
      { t: '9. Ограничение ответственности', body: 'Orionix Gol — это развлекательное приложение. Результаты, очки и рейтинги являются исключительно информационными и не имеют экономической или юридической ценности. Мы не несём ответственности за потери или ущерб, возникшие в результате использования приложения.' },
    ],
    contact: { t: '10. Контакты', before: 'По любым вопросам об этих условиях вы можете написать нам на ', after: '.' },
  },
  ar: {
    badge: 'قانوني', title: 'الشروط والأحكام', updated: 'آخر تحديث: مايو 2026 · Orionix Gol', back: 'رجوع', rights: '© 2026 ORIONIX GOL — جميع الحقوق محفوظة',
    sections: [
      { t: '1. قبول الشروط', body: 'بتسجيلك أو استخدامك Orionix Gol، فإنك تقبل هذه الشروط والأحكام بالكامل. وإذا كنت لا توافق، نرجو منك عدم استخدام التطبيق. وقد تُحدَّث هذه الشروط؛ ويُعدّ استمرار استخدام التطبيق قبولًا للتغييرات.' },
      { t: '2. وصف الخدمة', body: 'Orionix Gol منصّة مجانية لتوقّعات كرة القدم لكأس العالم 2026. يمكن للمستخدمين توقّع نتائج المباريات وجمع النقاط بحسب دقّة توقّعاتهم وإنشاء دوريات خاصة مع الأصدقاء والاطّلاع على التصنيفات العالمية. ولا يتضمّن التطبيق أي مراهنات بأموال حقيقية.' },
      { t: '3. متطلبات العمر', body: 'يجب أن يكون عمرك 13 عامًا على الأقل للتسجيل. وإذا كان عمرك أقل من 18 عامًا، فيجب أن تحصل على موافقة وليّك القانوني لاستخدام التطبيق.' },
      { t: '4. حساب المستخدم', items: ['أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك.', 'يحقّ لكل شخص تسجيل حساب واحد فقط. ويُمنع إنشاء حسابات متعدّدة أو مزيّفة.', 'يجب تقديم معلومات صحيحة أثناء التسجيل.', 'يمكنك طلب حذف حسابك في أي وقت عبر التواصل معنا.'] },
      { t: '5. الاستخدام المقبول', intro: 'يُمنع ما يلي:', danger: true, items: ['التلاعب بالنتائج أو بأنظمة النقاط بطريقة احتيالية.', 'محاولة الوصول إلى حسابات أو بيانات مستخدمين آخرين.', 'نشر محتوى مسيء أو تمييزي أو غير قانوني (أسماء المستخدمين، ملفات الدوريات).', 'استخدام البوتات أو السكربتات أو الوسائل الآلية للتفاعل مع التطبيق.', 'إجراء هندسة عكسية أو محاولة المساس بأمن النظام.'] },
      { t: '6. تعليق الحسابات وإلغاؤها', body: 'نحتفظ بالحق في تعليق أو حذف الحسابات التي تخالف هذه الشروط، دون إشعار مسبق ووفق تقديرنا الكامل. وفي الحالات الخطيرة (الاحتيال، الوصول غير المصرّح به)، يمكننا حظر الوصول إلى المنصّة بشكل دائم.' },
      { t: '7. الملكية الفكرية', body: 'جميع محتويات Orionix Gol — بما في ذلك التصميم والشيفرة والشعارات والرسوم المتحرّكة والنصوص — مملوكة لـ Orionix Gol أو لأصحابها المعنيّين. ولا يجوز لك إعادة إنتاج أو توزيع أو تعديل أي عنصر دون إذن خطّي صريح.' },
      { t: '8. توفّر الخدمة', body: 'نسعى إلى إبقاء التطبيق متاحًا في جميع الأوقات، لكننا لا نضمن خدمة دون انقطاع. وقد نُجري أعمال صيانة أو تحديثات أو نوقف الخدمة مؤقتًا دون إشعار مسبق. ولسنا مسؤولين عن الأضرار الناتجة عن انقطاع الخدمة.' },
      { t: '9. تحديد المسؤولية', body: 'Orionix Gol تطبيق ترفيهي. النتائج والنقاط والتصنيفات لأغراض إعلامية فقط وليست لها قيمة اقتصادية أو قانونية. ولسنا مسؤولين عن أي خسائر أو أضرار ناتجة عن استخدام التطبيق.' },
    ],
    contact: { t: '10. اتصل بنا', before: 'لأي استفسار حول هذه الشروط، يمكنك مراسلتنا على ', after: '.' },
  },
};

export default function TermsPage() {
  const router = useRouter();
  const locale = useLocale();
  const C = COPY[pickLang(locale)];

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  const h2 = 'text-base font-bold text-orionix-text-secondary mb-3';

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
          onClick={() => router.back()}
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

            {C.sections.map(sec => (
              <section key={sec.t}>
                <h2 className={h2}>{sec.t}</h2>
                {sec.body && <p>{sec.body}</p>}
                {sec.intro && <p className="mb-3">{sec.intro}</p>}
                {sec.items && (
                  <ul className="space-y-1.5 pl-4">
                    {sec.items.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: alpha(sec.danger ? hex.accent.red : hex.accent.teal, 0.6) }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section>
              <h2 className={h2}>{C.contact.t}</h2>
              <p>
                {C.contact.before}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>{CONTACT_EMAIL}</a>
                {C.contact.after}
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
