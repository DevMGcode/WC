'use client';

/**
 * Footer institucional — agrupa los enlaces de información/legales que AdSense
 * espera encontrar accesibles desde cualquier página de contenido:
 *   Acerca de · Privacidad · Términos · Novedades · Contacto
 *
 * Se renderiza dentro del AppShell (no en páginas standalone de auth/legales).
 * `mt-auto` lo empuja al fondo; el padding inferior del shell lo separa del
 * dock fijo en móvil. Visible para todos (free y premium): no es publicidad.
 */
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, gradients } from '@/lib/design/effects';

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbCSQUjKrWQoNOUmGZ10';
const CONTACT_EMAIL = 'orionixgol@gmail.com';

export function Footer() {
  const locale = useLocale();
  const en = locale.toLowerCase().startsWith('en');
  const lh = (p: string) => `/${locale}${p}`;

  const L = {
    tagline:   en ? 'Live the 2026 World Cup, match by match.' : 'Viví el Mundial 2026, partido a partido.',
    links:     en ? 'Links'     : 'Enlaces',
    community: en ? 'Community'  : 'Comunidad',
    about:     en ? 'About'      : 'Acerca de',
    privacy:   en ? 'Privacy'    : 'Privacidad',
    terms:     en ? 'Terms'      : 'Términos',
    news:      en ? 'Updates'    : 'Novedades',
    contact:   en ? 'Contact'    : 'Contacto',
    rights:    en ? '© 2026 Orionix Gol — All rights reserved'
                  : '© 2026 Orionix Gol — Todos los derechos reservados',
  };

  // Letras más claras (legibles): links 0.80, hover → primario.
  const linkCls = 'text-[12px] transition-colors duration-200';
  const linkStyle = { color: alpha(hex.text.secondary, 0.80) };
  const onEnter = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = hex.text.primary);
  const onLeave = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = alpha(hex.text.secondary, 0.80));
  const colTitle = 'text-[9px] font-black tracking-[0.28em] uppercase mb-3.5';

  return (
    <footer
      className="mt-16 w-full relative z-10"
      style={{
        borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}`,
        background: `linear-gradient(180deg, transparent, ${alpha(hex.neutral.black, 0.35)})`,
      }}
    >
      {/* Línea de acento superior */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: gradients.divider('green', 0.45) }} />

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-9 sm:gap-6">

          {/* Marca — logo real */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Link href={lh('/')} className="flex items-center gap-2.5" aria-label="Orionix Gol">
              <Image src="/Logo_Pestaña.png" alt="Orionix Gol" width={64} height={64}
                className="h-9 w-auto object-contain" />
              <Image src="/texto_logo_pestaña.png" alt="Orionix Gol" width={220} height={48}
                className="h-5 w-auto object-contain" />
            </Link>
            <p className="text-[11px] leading-relaxed text-center sm:text-left max-w-[220px]"
              style={{ color: alpha(hex.text.secondary, 0.62) }}>
              {L.tagline}
            </p>
          </div>

          {/* Enlaces */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={colTitle} style={{ color: alphaOf('green', 0.85) }}>{L.links}</h3>
            <div className="flex flex-col items-center sm:items-start gap-2.5">
              <Link href={lh('/about')}   className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.about}</Link>
              <Link href={lh('/privacy')} className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.privacy}</Link>
              <Link href={lh('/terms')}   className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.terms}</Link>
            </div>
          </div>

          {/* Comunidad */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={colTitle} style={{ color: alphaOf('gold', 0.85) }}>{L.community}</h3>
            <div className="flex flex-col items-center sm:items-start gap-2.5">
              <a href={WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer" className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.news}</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{L.contact}</a>
            </div>
          </div>
        </div>

        {/* Separador + copyright */}
        <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
          <p className="text-[10px] tracking-[0.18em] uppercase text-center"
            style={{ color: alpha(hex.text.secondary, 0.5) }}>
            {L.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
