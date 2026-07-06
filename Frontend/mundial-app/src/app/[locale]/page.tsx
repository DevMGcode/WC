import Link from 'next/link';
import HomeClient from './HomeClient';
import { getAllFixtures } from '@/services/publicTournament';
import { buildHomeEditorial } from './home/_components/homeNarrative';

/**
 * Server component de la home (Inicio).
 *
 * El dashboard interactivo vive en HomeClient (datos por React Query y solo
 * para usuarios autenticados), así que NO llega al HTML del servidor. Este
 * bloque SSR garantiza que el crawler — y el visitante anónimo — reciban
 * contenido real: qué es el sitio, estado del torneo, últimos resultados,
 * próximos partidos con enlace a su ficha y CTAs de registro/login.
 *
 * HomeClient lo oculta al montar SOLO si hay sesión (id "home-ssr-summary");
 * para el visitante anónimo queda visible como landing — coherente con la
 * decisión anti-cloaking: la home es pública y muestra a bots y humanos lo mismo.
 *
 * Diseño: hero centrado con la estética de la app (verde + dorado, glows
 * suaves), chips de estado del torneo, resultados como tarjetas de marcador y
 * próximos partidos clickeables. Sin JS de cliente: hovers por clases Tailwind.
 */
export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale ?? 'es';
  const fixtures = await getAllFixtures().catch(() => []);
  const ed = buildHomeEditorial(fixtures, locale);

  const gold = '#D4AF37';
  const cardBg = 'linear-gradient(160deg, rgba(18,34,18,0.72), rgba(7,12,7,0.92))';
  const cardBorder = '1px solid rgba(255,255,255,0.07)';
  const label: React.CSSProperties = {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(212,175,55,0.8)', margin: '0 0 10px',
  };

  return (
    <>
      <HomeClient />
      <section id="home-ssr-summary" aria-label={ed.title}
        style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px 64px' }}>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden text-center"
          style={{ borderRadius: 22, padding: '44px 26px 38px', background: cardBg, border: '1px solid rgba(212,175,55,0.16)' }}>
          {/* Glows decorativos */}
          <div aria-hidden style={{ position: 'absolute', width: 420, height: 420, top: -220, left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(74,222,128,0.14) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', width: 300, height: 300, bottom: -180, right: -100,
            background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div className="relative">
            {/* Badge del torneo */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.30)' }}>
              <span style={{ fontSize: 14 }}>🏆</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', color: gold }}>FIFA WORLD CUP 2026</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>·</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(226,241,226,0.75)' }}>{ed.host}</span>
            </div>

            <h1 className="text-transparent bg-clip-text mx-auto"
              style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 900, lineHeight: 1.18, maxWidth: 760,
                backgroundImage: 'linear-gradient(92deg, #eafbea 10%, #86efac 55%, #D4AF37 100%)' }}>
              {ed.title}
            </h1>

            <p className="mx-auto" style={{ fontSize: 14.5, lineHeight: 1.75, color: 'rgba(226,241,226,0.72)', maxWidth: 680, margin: '16px auto 0' }}>
              {ed.intro}
            </p>
            <p className="mx-auto" style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(212,175,55,0.85)', fontWeight: 600, maxWidth: 620, margin: '10px auto 0' }}>
              {ed.state}
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginTop: 26 }}>
              <Link href={`/${locale}/register`}
                className="transition-transform duration-200 hover:scale-[1.04]"
                style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 14, fontSize: 14, fontWeight: 900, letterSpacing: '0.02em', textDecoration: 'none',
                  background: `linear-gradient(135deg, ${gold}, #b8962e)`, color: '#0a0f0a',
                  border: '1px solid rgba(212,175,55,0.7)', boxShadow: '0 8px 28px rgba(212,175,55,0.35)' }}>
                {ed.ctaRegister}
              </Link>
              <Link href={`/${locale}/login`}
                className="transition-colors duration-200 hover:bg-white/10"
                style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 14, fontSize: 14, fontWeight: 800, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.05)', color: '#d8ecd8', border: '1px solid rgba(255,255,255,0.14)' }}>
                {ed.ctaLogin}
              </Link>
            </div>
          </div>
        </div>

        {/* ── CHIPS DE ESTADO DEL TORNEO ── */}
        <div className="grid grid-cols-2 gap-4" style={{ marginTop: 18 }}>
          <div className="text-center" style={{ borderRadius: 16, padding: '18px 14px', background: cardBg, border: cardBorder }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#86efac', lineHeight: 1, margin: 0 }}>
              {ed.played}<span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(226,241,226,0.45)' }}>/{ed.total}</span>
            </p>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(226,241,226,0.5)', margin: '8px 0 0' }}>{ed.playedLabel}</p>
          </div>
          <div className="text-center" style={{ borderRadius: 16, padding: '18px 14px', background: cardBg, border: cardBorder }}>
            <p style={{ fontSize: 19, fontWeight: 900, color: gold, lineHeight: 1.2, margin: '4px 0 0' }}>{ed.phaseShort ?? '—'}</p>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(226,241,226,0.5)', margin: '8px 0 0' }}>{ed.phaseLabel}</p>
          </div>
        </div>

        {/* ── ÚLTIMOS RESULTADOS (tarjetas de marcador) ── */}
        {ed.latestResults.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <p style={label}>{ed.latestLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ed.latestResults.map((r) => (
                <div key={`${r.home}-${r.away}`} className="text-center"
                  style={{ borderRadius: 14, padding: '16px 12px', background: cardBg, border: cardBorder }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(226,241,226,0.82)', margin: 0, lineHeight: 1.4 }}>{r.home}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#eafbea', margin: '6px 0', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{r.score}</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(226,241,226,0.82)', margin: 0, lineHeight: 1.4 }}>{r.away}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRÓXIMOS PARTIDOS (filas clickeables) ── */}
        {ed.nextMatches.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <p style={label}>{ed.nextLabel}</p>
            <div className="flex flex-col gap-2.5">
              {ed.nextMatches.map((m) => (
                <Link key={m.id} href={`/${locale}/fixtures/${m.id}`}
                  className="flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-white/[0.05]"
                  style={{ borderRadius: 14, padding: '14px 18px', background: cardBg, border: cardBorder, textDecoration: 'none' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#d8ecd8' }}>{m.teams}</span>
                  <span className="shrink-0 inline-flex items-center gap-2">
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(212,175,55,0.8)' }}>{m.date}</span>
                    <span aria-hidden style={{ fontSize: 14, color: 'rgba(226,241,226,0.4)' }}>›</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── EXPLORAR (pills) ── */}
        <div style={{ marginTop: 26 }}>
          <p style={label}>{ed.exploreLabel}</p>
          <div className="flex flex-wrap gap-2.5">
            {ed.links.map((l) => (
              <Link key={l.href} href={`/${locale}/${l.href}`}
                className="transition-colors duration-200 hover:bg-white/[0.08]"
                style={{ display: 'inline-block', padding: '9px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.045)', color: '#9fd89f', border: '1px solid rgba(159,216,159,0.22)' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
