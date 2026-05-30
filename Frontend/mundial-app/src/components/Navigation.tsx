'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FiSettings } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTranslations, useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alphaOf } from '@/lib/design/effects';
import {
  getCurrentTournament,
  getAllFixtures,
  getTournamentGroups,
  getTournamentFixtures,
} from '@/services/publicTournament';
import { QUERY_KEYS } from '@/hooks/useTournamentData';
import { STALE } from '@/constants/tournament';
import { baseNavConfig } from './navigation/navConfig';
import { NavSidebar } from './navigation/NavSidebar';
import { NavMobile } from './navigation/NavMobile';

export { NavHeader as Header } from './navigation/NavHeader';

const fetchJson = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).then(d => d?.data ?? []);

export const Navigation: React.FC = () => {
  const pathname            = usePathname();
  const { user }            = useAuth();
  const { collapsed, toggle } = useSidebar();
  const t      = useTranslations();
  const locale = useLocale();
  const queryClient         = useQueryClient();

  const [mounted,       setMounted]       = useState(false);
  const [hovered,       setHovered]       = useState<string | null>(null);
  const [mobileVisible, setMobileVisible] = useState(true);
  const lastScrollY        = useRef(0);
  const prefetchedRoutes   = useRef<Set<string>>(new Set());

  useEffect(() => { setMounted(true); }, []);

  const prefetchRouteData = useCallback(async (originalHref: string) => {
    if (prefetchedRoutes.current.has(originalHref)) return;
    prefetchedRoutes.current.add(originalHref);
    try {
      if (originalHref === '/fixtures' || originalHref === '/predictions') {
        await queryClient.prefetchQuery({ queryKey: QUERY_KEYS.fixtures(), queryFn: () => getAllFixtures(), staleTime: STALE.scores });
      }
      if (originalHref === '/groups') {
        const tournament = await queryClient.fetchQuery({ queryKey: QUERY_KEYS.tournament, queryFn: getCurrentTournament, staleTime: STALE.tournament });
        if (tournament?.id) {
          await Promise.all([
            queryClient.prefetchQuery({ queryKey: QUERY_KEYS.groups(tournament.id), queryFn: () => getTournamentGroups(tournament.id), staleTime: STALE.scores }),
            queryClient.prefetchQuery({ queryKey: QUERY_KEYS.tournamentFixtures(tournament.id), queryFn: () => getTournamentFixtures(tournament.id), staleTime: STALE.scores }),
          ]);
        }
      }
      if (originalHref === '/scorers') {
        await Promise.all([
          queryClient.prefetchQuery({ queryKey: QUERY_KEYS.topScorers, queryFn: () => fetchJson('/api/v1/public/players/topscorers'), staleTime: STALE.scorers }),
          queryClient.prefetchQuery({ queryKey: QUERY_KEYS.topAssists,  queryFn: () => fetchJson('/api/v1/public/players/topassists'),  staleTime: STALE.scorers }),
        ]);
      }
    } catch {
      prefetchedRoutes.current.delete(originalHref);
    }
  }, [queryClient]);

  /* Mobile auto-hide on scroll */
  useEffect(() => {
    const onScroll = () => {
      const y  = window.scrollY;
      const dy = y - lastScrollY.current;
      if (dy > 10 && y > 90)  setMobileVisible(false);
      else if (dy < -10)       setMobileVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const authRoutes = ['/login', '/register', '/onboarding', '/privacy'];
  if (!mounted || authRoutes.some(r => pathname.endsWith(r))) return null;

  const toLocalHref = (h: string) => h === '/' ? `/${locale}` : `/${locale}${h}`;
  const isAdmin     = user?.email === 'admin@example.com';

  const navItems = [
    ...baseNavConfig.map(c => ({ ...c, label: t(`nav.${c.key}`), href: toLocalHref(c.href), originalHref: c.href })),
    ...(isAdmin ? [{
      key: 'admin', label: t('nav.admin'),
      href: toLocalHref('/admin'), originalHref: '/admin',
      icon: <FiSettings size={15} />,
      accentHex: hex.status.danger,
      glowRgba:  alphaOf('danger', 0.55),
      bgRgba:    alphaOf('danger', 0.10),
    }] : []),
  ];

  const activeItem = navItems.find(n => n.href === pathname || (n.originalHref === '/' && pathname === `/${locale}`));

  return (
    <>
      <NavSidebar
        navItems={navItems}
        hovered={hovered}
        setHovered={setHovered}
        prefetchRouteData={prefetchRouteData}
        collapsed={collapsed}
        toggle={toggle}
        user={user}
        locale={locale}
        t={t}
        activeItem={activeItem}
        pathname={pathname}
      />
      <NavMobile
        navItems={navItems}
        mobileVisible={mobileVisible}
        setMobileVisible={setMobileVisible}
        activeItem={activeItem}
        pathname={pathname}
        locale={locale}
        t={t}
      />
    </>
  );
};

export default { Navigation };
