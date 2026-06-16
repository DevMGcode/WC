/**
 * Servicio de preferencias de notificación del usuario.
 *
 * Fuente única de verdad en el backend, compartida por:
 *   - el onboarding (primera vez, opcional)
 *   - el perfil → Configuración (editor permanente)
 *
 * Backend:
 *   GET /api/v1/users/{id}/notifications
 *   PUT /api/v1/users/{id}/notifications   { fixtureReminders, resultNotifications, leagueUpdates, newsUpdates }
 */
import { apiFetch } from '@/lib/apiFetch';

export interface NotificationPreferences {
  fixtureReminders:    boolean;
  resultNotifications: boolean;
  leagueUpdates:       boolean;
  newsUpdates:         boolean;
}

async function parse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
  return (json?.data ?? json) as T;
}

export const notificationsService = {
  async get(userId: string | number): Promise<NotificationPreferences> {
    const res = await apiFetch(`/api/v1/users/${userId}/notifications`);
    return parse<NotificationPreferences>(res);
  },

  async update(userId: string | number, prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const res = await apiFetch(`/api/v1/users/${userId}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    return parse<NotificationPreferences>(res);
  },
};
