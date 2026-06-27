'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

export default function PrivacyPage() {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

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
          onClick={() => {
            if (window.history.length > 1) router.back();
            else window.close();
          }}
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
              Legal
            </span>
            <h1 className="text-2xl font-black text-white mt-3" style={{ fontFamily: 'var(--font-display)' }}>
              Política de Privacidad
            </h1>
            <p className="text-xs text-orionix-text-muted mt-2">Última actualización: junio de 2026 · Orionix Gol</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: alpha(hex.accent.slate, 0.85) }}>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">1. Quiénes somos</h2>
              <p>
                Orionix Gol es una aplicación de predicciones deportivas para el Mundial de Fútbol 2026.
                El responsable del tratamiento de tus datos es el equipo de Orionix Gol, contactable en{' '}
                <a href="mailto:orionixgol@gmail.com" className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>
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
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
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
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">4. Compartición de datos</h2>
              <p>
                No vendemos, alquilamos ni compartimos tus datos personales (nombre, correo, etc.) con terceros con fines comerciales.
                Tu nombre de usuario y puntuación pueden ser visibles públicamente en el ranking global de la aplicación.
                El resto de tu información personal es privada. Los servicios de publicidad y analítica descritos en la sección 8
                pueden recopilar datos de forma automática mediante cookies, sujetos a sus propias políticas de privacidad.
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
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Para ejercer cualquiera de estos derechos, escríbenos a{' '}
                <a href="mailto:orionixgol@gmail.com" className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>
                  orionixgol@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-orionix-text-secondary mb-3">8. Cookies y tecnologías de terceros</h2>
              <p className="mb-3">
                Usamos almacenamiento local del navegador (localStorage) para mantener tu sesión activa y recordar tus preferencias de interfaz.
              </p>
              <p className="mb-3">
                En la versión gratuita mostramos publicidad y medimos el uso del sitio mediante servicios de terceros que pueden
                usar cookies y tecnologías similares:
              </p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                  <span>
                    <strong className="text-orionix-text-secondary">Google AdSense:</strong> Google y sus socios utilizan cookies para
                    mostrarte anuncios en función de tus visitas previas a este y otros sitios web. Podés desactivar la publicidad
                    personalizada en la{' '}
                    <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>Configuración de anuncios de Google</a>{' '}
                    o en{' '}
                    <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>aboutads.info/choices</a>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                  <span><strong className="text-orionix-text-secondary">Adsterra:</strong> red de publicidad que puede usar cookies para mostrar y medir anuncios.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: alpha(hex.accent.teal, 0.6) }} />
                  <span><strong className="text-orionix-text-secondary">Google Analytics (GA4):</strong> para entender de forma agregada y anónima cómo se usa el sitio y mejorarlo.</span>
                </li>
              </ul>
              <p className="mt-3">
                Los usuarios <strong className="text-orionix-text-secondary">Premium (Pase Mundial) navegan sin anuncios</strong>. Para más
                detalle sobre cómo Google usa la información de los sitios que utilizan sus servicios, consultá{' '}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: alpha(hex.accent.teal, 0.8) }}>policies.google.com/technologies/partner-sites</a>.
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
