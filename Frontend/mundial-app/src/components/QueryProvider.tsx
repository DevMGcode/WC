'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { STALE, GC_TIME_MS } from '@/constants/tournament';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Crear QueryClient dentro del estado para que cada sesión tenga su propia instancia
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            STALE.scores,   // 30s — datos frescos por defecto
            gcTime:               GC_TIME_MS,     // 5min — caché en memoria al navegar
            retry:                1,              // 1 reintento si falla (no 3)
            refetchOnWindowFocus: false,          // no re-fetch al cambiar pestaña
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
