'use client';

/**
 * Footer institucional — agrupa los enlaces de información/legales que AdSense
 * espera encontrar accesibles desde cualquier página de contenido:
 *   Navegación · Acerca de · Privacidad · Términos · Novedades · Contacto
 *
 * Se renderiza dentro del AppShell (no en páginas standalone de auth/legales).
 * `mt-auto` lo empuja al fondo; el padding inferior del shell lo separa del
 * dock fijo en móvil. Visible para todos (free y premium): no es publicidad.
 */
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { FiMail, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, gradients } from '@/lib/design/effects';

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbCSQUjKrWQoNOUmGZ10';
const CONTACT_EMAIL = 'orionixgol@gmail.com';

export function Footer() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const FOOTER_COPY = {
    es: { tagline: 'Viví el Mundial 2026, partido a partido.', host: 'USA · México · Canadá', nav: 'Navegación', links: 'Enlaces', community: 'Comunidad', home: 'Inicio', calendar: 'Calendario', groups: 'Grupos', scorers: 'Goleadores', predictions: 'Porras', about: 'Acerca de', privacy: 'Privacidad', terms: 'Términos', news: 'Novedades', contact: 'Contacto', rights: '© 2026 Orionix Gol — Todos los derechos reservados' },
    en: { tagline: 'Live the 2026 World Cup, match by match.', host: 'USA · Mexico · Canada', nav: 'Navigation', links: 'Links', community: 'Community', home: 'Home', calendar: 'Schedule', groups: 'Groups', scorers: 'Top scorers', predictions: 'Predictions', about: 'About', privacy: 'Privacy', terms: 'Terms', news: 'Updates', contact: 'Contact', rights: '© 2026 Orionix Gol — All rights reserved' },
    fr: { tagline: 'Vivez la Coupe du Monde 2026, match après match.', host: 'USA · Mexique · Canada', nav: 'Navigation', links: 'Liens', community: 'Communauté', home: 'Accueil', calendar: 'Calendrier', groups: 'Groupes', scorers: 'Buteurs', predictions: 'Pronostics', about: 'À propos', privacy: 'Confidentialité', terms: 'Conditions', news: 'Actualités', contact: 'Contact', rights: '© 2026 Orionix Gol — Tous droits réservés' },
    pt: { tagline: 'Viva a Copa do Mundo 2026, jogo a jogo.', host: 'EUA · México · Canadá', nav: 'Navegação', links: 'Links', community: 'Comunidade', home: 'Início', calendar: 'Calendário', groups: 'Grupos', scorers: 'Artilheiros', predictions: 'Palpites', about: 'Sobre', privacy: 'Privacidade', terms: 'Termos', news: 'Novidades', contact: 'Contato', rights: '© 2026 Orionix Gol — Todos os direitos reservados' },
    de: { tagline: 'Erlebe die WM 2026, Spiel für Spiel.', host: 'USA · Mexiko · Kanada', nav: 'Navigation', links: 'Links', community: 'Community', home: 'Startseite', calendar: 'Spielplan', groups: 'Gruppen', scorers: 'Torschützen', predictions: 'Tipps', about: 'Über uns', privacy: 'Datenschutz', terms: 'AGB', news: 'Neuigkeiten', contact: 'Kontakt', rights: '© 2026 Orionix Gol — Alle Rechte vorbehalten' },
    ru: { tagline: 'Живи Чемпионатом мира 2026, матч за матчем.', host: 'США · Мексика · Канада', nav: 'Навигация', links: 'Ссылки', community: 'Сообщество', home: 'Главная', calendar: 'Расписание', groups: 'Группы', scorers: 'Бомбардиры', predictions: 'Прогнозы', about: 'О нас', privacy: 'Конфиденциальность', terms: 'Условия', news: 'Новости', contact: 'Контакты', rights: '© 2026 Orionix Gol — Все права защищены' },
    ar: { tagline: 'عِش كأس العالم 2026، مباراة تلو الأخرى.', host: 'الولايات المتحدة · المكسيك · كندا', nav: 'التنقل', links: 'روابط', community: 'المجتمع', home: 'الرئيسية', calendar: 'التقويم', groups: 'المجموعات', scorers: 'الهدافون', predictions: 'التوقعات', about: 'من نحن', privacy: 'الخصوصية', terms: 'الشروط', news: 'المستجدات', contact: 'اتصل بنا', rights: '© 2026 Orionix Gol — جميع الحقوق محفوظة' },
  } as const;
  const lang = (Object.keys(FOOTER_COPY) as (keyof typeof FOOTER_COPY)[])
    .find(k => k === locale.toLowerCase().slice(0, 2)) ?? 'es';
  const L = FOOTER_COPY[lang];

  // Links más grandes y legibles; hover → color primario.
  const linkCls = 'inline-flex items-center gap-2 text-[14px] leading-none transition-colors duration-200';
  const linkStyle = { color: alpha(hex.text.secondary, 0.82) };
  const onEnter = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = hex.text.primary);
  const onLeave = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = alpha(hex.text.secondary, 0.82));

  const ColTitle = ({ title, color }: { title: string; color: string }) => (
    <h3 className="flex items-center gap-2 mb-5">
      <span className="w-4 h-[2px] rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[11px] font-black tracking-[0.26em] uppercase" style={{ color: alpha(hex.text.secondary, 0.9) }}>
        {title}
      </span>
    </h3>
  );

  return (
    <footer
      className="mt-20 w-full relative z-10"
      style={{
        borderTop: `1px solid ${alpha(hex.neutral.white, 0.08)}`,
        background: `linear-gradient(180deg, transparent, ${alpha(hex.neutral.black, 0.45)})`,
      }}
    >
      {/* Línea de acento superior */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: gradients.divider('green', 0.5) }} />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-8">

          {/* Marca */}
          <div className="col-span-2 md:col-span-4 flex flex-col items-center md:items-start gap-4">
            <Link href={lh('/')} className="flex items-center gap-3" aria-label="Orionix Gol">
              <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={80} height={80}
                className="h-12 w-auto object-contain" />
              <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={260} height={56}
                className="h-7 w-auto object-contain" />
            </Link>
            <p className="text-[14px] leading-relaxed text-center md:text-left max-w-[260px]"
              style={{ color: alpha(hex.text.secondary, 0.7) }}>
              {L.tagline}
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: alphaOf('gold', 0.08), border: `1px solid ${alphaOf('gold', 0.22)}` }}>
              <span className="text-[12px]">🏆</span>
              <span className="text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: hex.gold.base }}>
                {L.host}
              </span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="md:col-span-3 flex flex-col items-center md:items-start">
            <ColTitle title={L.nav} color={hex.green.bright} />
            <div className="flex flex-col items-center md:items-start gap-3.5">
              {[
                { label: L.home,        href: lh('/') },
                { label: L.calendar,    href: lh('/fixtures') },
                { label: L.groups,      href: lh('/groups') },
                { label: L.scorers,     href: lh('/scorers') },
                { label: L.predictions, href: lh('/predictions') },
              ].map(item => (
                <Link key={item.href} href={item.href} className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Enlaces (legales) */}
          <nav className="md:col-span-2 flex flex-col items-center md:items-start">
            <ColTitle title={L.links} color={hex.green.hover} />
            <div className="flex flex-col items-center md:items-start gap-3.5">
              <Link href={lh('/about')}   className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.about}</Link>
              <Link href={lh('/privacy')} className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.privacy}</Link>
              <Link href={lh('/terms')}   className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.terms}</Link>
            </div>
          </nav>

          {/* Comunidad */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <ColTitle title={L.community} color={hex.gold.base} />
            <div className="flex flex-col items-center md:items-start gap-3.5">
              <a href={WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer" className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                <FiMessageCircle size={15} style={{ color: hex.green.bright }} /> {L.news}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                <FiMail size={15} style={{ color: hex.gold.base }} /> {L.contact}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[13px] mt-1 break-all" style={{ color: alpha(hex.text.muted, 0.7) }}>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* Separador + copyright */}
        <div className="mt-14 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
          <p className="text-[12px] tracking-[0.14em] uppercase" style={{ color: alpha(hex.text.secondary, 0.5) }}>
            {L.rights}
          </p>
          <Link href={lh('/about')} className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wide transition-colors"
            style={{ color: alphaOf('green', 0.8) }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hex.green.bright)}
            onMouseLeave={(e) => (e.currentTarget.style.color = alphaOf('green', 0.8))}>
            {L.about} <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
