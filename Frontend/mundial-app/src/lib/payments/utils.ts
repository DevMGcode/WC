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
