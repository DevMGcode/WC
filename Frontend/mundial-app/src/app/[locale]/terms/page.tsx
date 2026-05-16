'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: 'radial-gradient(ellipse at 25% 60%, #080f22 0%, #010810 45%, #000509 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="fixed top-[-15%] right-[-5%] w-[38vw] h-[38vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,180,155,0.07) 0%, transparent 70%)', filter: 'blur(55px)' }} />
      <div className="fixed bottom-[-10%] left-[-5%] w-[32vw] h-[32vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,130,210,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
          style={{ color: 'rgba(0,210,185,0.7)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,210,185,1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,210,185,0.7)')}
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
            background: 'linear-gradient(145deg, rgba(9,14,31,0.97), rgba(11,22,40,0.95))',
            border: '1px solid rgba(56,189,248,0.10)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
          }}
        >
          {/* Header */}
          <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
              style={{ background: 'rgba(0,210,185,0.10)', color: '#00d2b9', border: '1px solid rgba(0,210,185,0.20)' }}>
              Legal
            </span>
            <h1 className="text-2xl font-black text-white mt-3" style={{ fontFamily: 'var(--font-display)' }}>
              Términos y Condiciones
            </h1>
            <p className="text-xs text-slate-500 mt-2">Última actualización: mayo de 2026 · Orionix Gol</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.85)' }}>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">1. Aceptación de los términos</h2>
              <p>
                Al registrarte o utilizar Orionix Gol, aceptas estos Términos y Condiciones en su totalidad.
                Si no estás de acuerdo, te pedimos que no utilices la aplicación.
                Estos términos pueden actualizarse; el uso continuado de la app implica aceptación de los cambios.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">2. Descripción del servicio</h2>
              <p>
                Orionix Gol es una plataforma gratuita de predicciones deportivas para el Mundial de Fútbol 2026.
                Los usuarios pueden realizar predicciones de partidos, acumular puntos según la precisión de sus pronósticos,
                crear ligas privadas con amigos y consultar rankings globales. La aplicación no implica apuestas de dinero real.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">3. Requisitos de edad</h2>
              <p>
                Debes tener al menos 13 años para registrarte. Si eres menor de 18 años, debes contar con el
                consentimiento de tu tutor legal para usar la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">4. Cuenta de usuario</h2>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Eres responsable de mantener la confidencialidad de tu contraseña.',
                  'Cada persona puede registrar una sola cuenta. Las cuentas múltiples o falsas están prohibidas.',
                  'Debes proporcionar información veraz durante el registro.',
                  'Puedes solicitar la eliminación de tu cuenta en cualquier momento contactando con nosotros.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(0,210,185,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">5. Uso aceptable</h2>
              <p className="mb-3">Queda prohibido:</p>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Manipular resultados o sistemas de puntuación de forma fraudulenta.',
                  'Intentar acceder a cuentas o datos de otros usuarios.',
                  'Publicar contenido ofensivo, discriminatorio o ilegal (nombres de usuario, perfiles de liga).',
                  'Usar bots, scripts o medios automatizados para interactuar con la app.',
                  'Realizar ingeniería inversa o intentar comprometer la seguridad del sistema.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(239,68,68,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">6. Suspensión y cancelación de cuentas</h2>
              <p>
                Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos,
                sin previo aviso y a nuestra entera discreción. En casos graves (fraude, acceso no autorizado),
                podemos bloquear permanentemente el acceso a la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">7. Propiedad intelectual</h2>
              <p>
                Todo el contenido de Orionix Gol — incluyendo diseño, código, logotipos, animaciones y textos —
                es propiedad de Orionix Gol o de sus respectivos titulares. No puedes reproducir, distribuir
                ni modificar ningún elemento sin autorización expresa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">8. Disponibilidad del servicio</h2>
              <p>
                Nos esforzamos por mantener la aplicación disponible en todo momento, pero no garantizamos
                un servicio ininterrumpido. Podemos realizar tareas de mantenimiento, actualizaciones o
                suspender el servicio temporalmente sin previo aviso. No somos responsables de los perjuicios
                ocasionados por interrupciones del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">9. Limitación de responsabilidad</h2>
              <p>
                Orionix Gol es una aplicación de entretenimiento. Los resultados, puntuaciones y rankings
                son meramente informativos y no tienen valor económico ni legal. No nos hacemos responsables
                de pérdidas o daños derivados del uso de la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-200 mb-3">10. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos términos, puedes escribirnos a{' '}
                <a href="mailto:orionixgol@gmail.com" className="underline" style={{ color: 'rgba(0,210,185,0.8)' }}>
                  orionixgol@gmail.com
                </a>.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-slate-600 tracking-widest uppercase">
              © 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
