/**
 * Servicio de notificaciones Web Push (lado cliente).
 *
 * Flujo:
 *   1. Pide permiso al navegador.
 *   2. Trae la clave pública VAPID del backend.
 *   3. Se suscribe vía PushManager y manda la suscripción al backend.
 *   4. El backend luego envía push a esa suscripción (gratis, vía el navegador).
 *
 * Soporte: Chrome/Edge/Firefox/Android. En iPhone solo si la PWA está
 * instalada ("Agregar a inicio"). Si no hay soporte, los métodos no rompen.
 */
import { apiFetch } from '@/lib/apiFetch';

/** Convierte la clave VAPID base64url a Uint8Array (lo exige PushManager). */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export const pushService = {
  /** ¿El navegador soporta Web Push? */
  isSupported(): boolean {
    return typeof window !== 'undefined'
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  },

  /** Estado del permiso: 'default' | 'granted' | 'denied'. */
  permission(): NotificationPermission {
    return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  },

  /** ¿Este navegador ya está suscrito? */
  async isSubscribed(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      return !!(await reg.pushManager.getSubscription());
    } catch { return false; }
  },

  /**
   * Pide permiso, se suscribe y registra la suscripción en el backend.
   * Devuelve true si quedó activado.
   */
  async subscribe(userId: string | number): Promise<boolean> {
    if (!this.isSupported()) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const keyRes = await apiFetch('/api/v1/push/vapid-public-key');
    const keyJson = await keyRes.json().catch(() => null);
    const publicKey = keyJson?.data?.publicKey;
    if (!publicKey) return false;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
    });

    const json: any = sub.toJSON();
    await apiFetch(`/api/v1/users/${userId}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      }),
    });
    return true;
  },

  /** Quita la suscripción de este navegador (en el navegador y en el backend). */
  async unsubscribe(userId: string | number): Promise<void> {
    if (!this.isSupported()) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    try {
      await apiFetch(`/api/v1/users/${userId}/push/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
    } catch { /* igual desuscribimos localmente */ }
    await sub.unsubscribe();
  },

  /** Envía una notificación de prueba a este usuario. Devuelve cuántas se enviaron. */
  async sendTest(userId: string | number): Promise<number> {
    const res = await apiFetch(`/api/v1/users/${userId}/push/test`, { method: 'POST' });
    const json = await res.json().catch(() => null);
    return json?.data?.sent ?? 0;
  },
};
