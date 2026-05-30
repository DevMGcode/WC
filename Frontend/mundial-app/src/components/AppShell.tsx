'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { hex } from '@/lib/design/tokens';

const AUTH_ROUTES = ['/login', '/register', '/onboarding', '/privacy'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isAuth = AUTH_ROUTES.some(r => pathname.endsWith(r));
  const pl = mounted && !isAuth && isDesktop ? (collapsed ? 64 : 200) : 0;

  /** Bg verde intenso aplicado en TODAS las vistas autenticadas
   *  (Inicio, Calendario, Grupos, Goleadores, Porras, Admin, Perfil, etc.).
   *  Bloom verde extendido a toda la viewport, acentos amplios, opacidades visibles.
   *  Las capas usan `background-attachment: fixed` para que los blooms y el vignette
   *  no se recorten cuando el contenido excede 100vh y se hace scroll. */
  const premiumBg = [
    /* 1 — Grilla de puntos sutiles */
    'radial-gradient(circle, rgba(76,175,80,0.042) 1px, transparent 1px)',
    /* 2 — Bloom verde superior (extendido a toda la viewport) */
    'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(46,125,50,0.18) 0%, rgba(46,125,50,0.06) 50%, transparent 95%)',
    /* 3 — Acento inferior-izquierdo amplio */
    'radial-gradient(ellipse 60% 70% at 5% 100%, rgba(27,94,32,0.13) 0%, transparent 70%)',
    /* 4 — Acento superior-derecho amplio */
    'radial-gradient(ellipse 55% 65% at 95% 15%, rgba(46,125,50,0.10) 0%, transparent 65%)',
    /* 5 — Vignette base: más claro al centro, más oscuro en las esquinas */
    'radial-gradient(ellipse at 50% 48%, #07130B 0%, #050D07 46%, #020705 100%)',
  ].join(', ');

  return (
    <div
      className="app-shell flex flex-col pb-24 lg:pb-8 w-full relative"
      style={{
        paddingLeft: pl,
        transition: 'padding-left 0.38s cubic-bezier(0.22,1,0.36,1)',
        minHeight: '100dvh',
        ...(isAuth
          ? {}
          : {
              // Usamos las propiedades long-hand en lugar del shorthand `background`
              // para evitar el warning de React: "Updating background backgroundAttachment".
              backgroundColor: '#050D07',
              backgroundImage: premiumBg,
              backgroundSize: '30px 30px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
              backgroundAttachment: 'fixed, fixed, fixed, fixed, fixed',
              backgroundRepeat: 'repeat, no-repeat, no-repeat, no-repeat, no-repeat',
            }),
      }}
    >
      {children}
    </div>
  );
}
