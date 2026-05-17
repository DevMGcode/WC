'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

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

  return (
    <div
      className="app-shell flex flex-col pb-24 lg:pb-8 w-full relative"
      style={{
        paddingLeft: pl,
        transition: 'padding-left 0.38s cubic-bezier(0.22,1,0.36,1)',
        minHeight: '100dvh',
        backgroundColor: isAuth ? undefined : '#010508',
      }}
    >
      {children}
    </div>
  );
}
