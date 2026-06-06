// Detecta el canal de distribución en cliente para aplicar las reglas de tienda correctas.
// Retorna: 'ios' | 'android' | 'pwa' | 'web'
export function detectDistributionChannel(): string {
  if (typeof window === 'undefined') return 'web';

  const ua = navigator.userAgent.toLowerCase();

  if ('Capacitor' in window)
    return /iphone|ipad|ipod/.test(ua) ? 'ios' : 'android';

  if ('ReactNativeWebView' in window)
    return /iphone|ipad|ipod/.test(ua) ? 'ios' : 'android';

  if (document.referrer.includes('android-app://')) return 'android';

  if (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  ) return 'pwa';

  return 'web';
}

// Intenta abrir el deeplink de Binance Pay. Si la app no está instalada,
// hace fallback a la URL web después de 2.5 s.
export async function openBinancePayDeeplink(
  deeplink: string,
  fallbackUrl: string
): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    window.location.href = deeplink;

    setTimeout(() => {
      // Si la pestaña no perdió foco, la app no está instalada → fallback
      if (Date.now() - start < 3000) window.location.href = fallbackUrl;
      resolve();
    }, 2500);
  });
}
