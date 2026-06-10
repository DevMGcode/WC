'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface SidebarCtx {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nav-collapsed');
      if (stored !== null) setCollapsedState(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = useCallback((v: boolean) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try { localStorage.setItem('nav-collapsed', JSON.stringify(v)); } catch {}
    }, 300);
  }, []);

  useEffect(() => () => { if (persistTimer.current) clearTimeout(persistTimer.current); }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    persist(v);
  }, [persist]);

  const toggle = useCallback(() => {
    setCollapsedState(prev => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
