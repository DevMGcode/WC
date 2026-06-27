'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbCSQUjKrWQoNOUmGZ10';
const CONTACT_EMAIL = 'orionixgol@gmail.com';

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  const h2 = 'text-base font-bold text-orionix-text-secondary mb-3';
  const bullet = (item: string) => (
    <li key={item} className="flex items-start gap-2">
      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
      {item}
    </li>
  );

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
          Volver
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
              Nosotros
            </span>
            <h1 className="text-2xl font-black text-white mt-3" style={{ fontFamily: 'var(--font-display)' }}>
              Acerca de Orionix Gol
            </h1>
            <p className="text-xs text-orionix-text-muted mt-2">Tu plataforma para vivir el Mundial 2026</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: alpha(hex.accent.slate, 0.85) }}>

            <section>
              <h2 className={h2}>Qué es Orionix Gol</h2>
              <p>
                Orionix Gol es un emprendimiento independiente que reúne en un solo lugar todo el
                Mundial 2026: calendario de partidos, tablas de cada grupo, goleadores, fase
                eliminatoria y el seguimiento minuto a minuto de los partidos en vivo. Todo en una
                experiencia rápida, moderna y pensada para el hincha.
              </p>
            </section>

            <section>
              <h2 className={h2}>Qué ofrecemos</h2>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Calendario completo del Mundial 2026 con resultados y partidos en vivo',
                  'Tablas de posiciones de todos los grupos, actualizadas automáticamente',
                  'Ranking de goleadores y asistencias del torneo',
                  'Fase eliminatoria (bracket) y seguimiento de cada cruce',
                  'Detalle de cada partido: marcador en vivo, eventos, alineaciones y estadio',
                  'Porras: pronosticá los resultados y competí con otros usuarios',
                ].map(bullet)}
              </ul>
            </section>

            <section>
              <h2 className={h2}>Pase Mundial (Premium)</h2>
              <p>
                Orionix Gol es gratuito y la versión gratuita se mantiene siempre completa y funcional.
                Quienes quieran apoyar el proyecto pueden activar el <strong>Pase Mundial</strong>, que
                desbloquea estadísticas ampliadas, filtro por equipo y una experiencia totalmente
                <strong> sin anuncios</strong>.
              </p>
            </section>

            <section>
              <h2 className={h2}>De dónde vienen los datos</h2>
              <p>
                La información deportiva (partidos, marcadores, eventos, alineaciones y estadísticas)
                proviene de proveedores profesionales de datos de fútbol y se actualiza de forma
                automática en tiempo real.
              </p>
            </section>

            <section>
              <h2 className={h2}>Quiénes somos</h2>
              <p>
                Somos un emprendimiento independiente que une la pasión por el fútbol con la tecnología.
                Creamos Orionix Gol para ofrecer una forma simple, rápida y bonita de seguir el
                Mundial 2026, y lo hacemos crecer partido a partido junto a la comunidad de hinchas
                que lo usa.
              </p>
            </section>

            <section>
              <h2 className={h2}>Contacto</h2>
              <p>
                ¿Tenés dudas, sugerencias o querés reportar algo? Escribinos a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: alpha(hex.accent.teal, 0.85) }}>
                  {CONTACT_EMAIL}
                </a>
                . También podés seguir todas las novedades en nuestro{' '}
                <a href={WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: alpha(hex.accent.teal, 0.85) }}>
                  canal de WhatsApp
                </a>
                .
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <p className="text-[10px] text-orionix-text-muted tracking-widest uppercase">
              © 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
