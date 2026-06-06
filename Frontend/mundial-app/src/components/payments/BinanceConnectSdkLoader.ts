'use client';

import { useEffect, useState } from 'react';

const SDK_URL =
  process.env.NEXT_PUBLIC_BINANCE_CONNECT_SDK_URL ??
  'https://public.bnbstatic.com/static/js/connect-sdk/binance-connect.min.js';

export type SdkStatus = 'idle' | 'loading' | 'ready' | 'error';

// Carga el SDK de Binance Connect de forma lazy — solo cuando se monta el widget.
// Reutiliza el script si ya fue inyectado en sesiones anteriores de la misma página.
export function useBinanceConnectSdk(): { status: SdkStatus } {
  const [status, setStatus] = useState<SdkStatus>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.BinanceConnect) {
      setStatus('ready');
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      setStatus('loading');
      existing.addEventListener('load',  () => setStatus('ready'));
      existing.addEventListener('error', () => setStatus('error'));
      return;
    }

    setStatus('loading');
    const script  = document.createElement('script');
    script.src    = SDK_URL;
    script.async  = true;
    script.onload = () => setStatus('ready');
    script.onerror = () => setStatus('error');
    document.head.appendChild(script);
  }, []);

  return { status };
}
