'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
          onClick={() => {
            if (window.history.length > 1) router.back();
            else window.close();
          }}
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
              Política de Privacidad
            </h1>
            <p className="text-xs text-orionix-text-muted mt-2">Última actualización: mayo de 2026 · Orionix Gol</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.85)' }}>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">1. Quiénes somos</h2>
              <p>
                Orionix Gol es una aplicación de predicciones deportivas para el Mundial de Fútbol 2026.
                El responsable del tratamiento de tus datos es el equipo de Orionix Gol, contactable en{' '}
                <a href="mailto:orionixgol@gmail.com" className="underline" style={{ color: 'rgba(0,210,185,0.8)' }}>
                  orionixgol@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">2. Datos que recopilamos</h2>
              <p className="mb-3">Al crear una cuenta recopilamos los siguientes datos:</p>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Nombre y apellido',
                  'Nombre de usuario',
                  'Dirección de correo electrónico',
                  'Contraseña (almacenada de forma cifrada con bcrypt, nunca en texto plano)',
                  'País, región y ciudad (opcionales)',
                  'Número de teléfono (opcional)',
                  'Idioma preferido y zona horaria',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(0,210,185,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                También registramos automáticamente tu actividad dentro de la app (predicciones realizadas, ligas creadas o unidas, puntuaciones).
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">3. Para qué usamos tus datos</h2>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Gestionar tu cuenta y autenticación (JWT)',
                  'Mostrarte tu historial de predicciones y ranking',
                  'Permitirte crear y participar en ligas privadas',
                  'Enviarte tu contraseña temporal en caso de recuperación de acceso',
                  'Mejorar la experiencia y el funcionamiento de la aplicación',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(0,210,185,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">4. Compartición de datos</h2>
              <p>
                No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales.
                Tu nombre de usuario y puntuación pueden ser visibles públicamente en el ranking global de la aplicación.
                El resto de tu información personal es privada.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">5. Seguridad</h2>
              <p>
                Tus datos se transmiten siempre mediante conexiones cifradas (HTTPS/TLS).
                Las contraseñas se almacenan con hash bcrypt. Utilizamos tokens JWT con caducidad para gestionar las sesiones.
                Aun así, ningún sistema es 100 % seguro; te recomendamos usar una contraseña única para esta aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">6. Conservación de datos</h2>
              <p>
                Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta,
                borraremos tus datos personales en un plazo razonable, salvo que la ley nos obligue a conservarlos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">7. Tus derechos</h2>
              <p className="mb-3">Tienes derecho a:</p>
              <ul className="space-y-1.5 pl-4">
                {[
                  'Acceder a los datos que tenemos sobre ti',
                  'Corregir datos incorrectos o incompletos',
                  'Solicitar la eliminación de tu cuenta y datos',
                  'Oponerte al tratamiento de tus datos',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(0,210,185,0.6)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Para ejercer cualquiera de estos derechos, escríbenos a{' '}
                <a href="mailto:orionixgol@gmail.com" className="underline" style={{ color: 'rgba(0,210,185,0.8)' }}>
                  orionixgol@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">8. Cookies y almacenamiento local</h2>
              <p>
                Usamos almacenamiento local del navegador (localStorage) para mantener tu sesión activa y recordar tus preferencias de interfaz.
                No utilizamos cookies de rastreo de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">9. Cambios en esta política</h2>
              <p>
                Podemos actualizar esta política ocasionalmente. En caso de cambios relevantes, te notificaremos
                mediante un aviso en la aplicación. El uso continuado de la app tras los cambios implica aceptación de la nueva versión.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-orionix-text-muted tracking-widest uppercase">
              © 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
