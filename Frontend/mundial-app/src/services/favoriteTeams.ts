/**
 * Servicio de equipos favoritos del usuario.
 *
 * Backend:
 *   GET    /api/v1/users/{id}/favorite-teams
 *   POST   /api/v1/users/{id}/favorite-teams           { teamId, makePrimary? }
 *   PUT    /api/v1/users/{id}/favorite-teams/{teamId}/primary
 *   DELETE /api/v1/users/{id}/favorite-teams/{teamId}
 *
 * Reglas Free: maximo 3 favoritos. El backend responde 422 si se intenta agregar
 * el 4to, con mensaje "Hazte Premium...".
 */

import { apiFetch } from '@/lib/apiFetch';

export interface FavoriteTeam {
  teamId:    number;
  name:      string;
  shortName: string;
  fifaCode:  string;
  flagUrl:   string;
  isPrimary: boolean;
  position:  number;
}

export interface PublicTeam {
  id:        number;
  name:      string;
  shortName: string;
  fifaCode:  string;
  flagUrl:   string;
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message || `Error ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (json?.data ?? json) as T;
}

export const favoriteTeamsService = {
  /** Lista los equipos favoritos del usuario, en orden (primary primero por position=0). */
  async list(userId: string | number): Promise<FavoriteTeam[]> {
    const res = await apiFetch(`/api/v1/users/${userId}/favorite-teams`);
    return parseApiResponse<FavoriteTeam[]>(res);
  },

  /** Agrega un equipo a favoritos. Si es el primero del usuario o makePrimary=true, queda como principal. */
  async add(userId: string | number, teamId: number, makePrimary = false): Promise<FavoriteTeam> {
    const res = await apiFetch(`/api/v1/users/${userId}/favorite-teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, makePrimary }),
    });
    return parseApiResponse<FavoriteTeam>(res);
  },

  /** Marca un equipo como principal (estrella). El equipo ya debe estar en favoritos. */
  async setPrimary(userId: string | number, teamId: number): Promise<FavoriteTeam> {
    const res = await apiFetch(`/api/v1/users/${userId}/favorite-teams/${teamId}/primary`, {
      method: 'PUT',
    });
    return parseApiResponse<FavoriteTeam>(res);
  },

  /** Quita un equipo de favoritos. Si era el principal, el usuario queda sin principal. */
  async remove(userId: string | number, teamId: number): Promise<void> {
    const res = await apiFetch(`/api/v1/users/${userId}/favorite-teams/${teamId}`, {
      method: 'DELETE',
    });
    await parseApiResponse<unknown>(res);
  },

  /** Trae el listado completo de equipos del torneo (publico). */
  async listAllTeams(): Promise<PublicTeam[]> {
    const res = await apiFetch('/api/v1/public/teams');
    return parseApiResponse<PublicTeam[]>(res);
  },
};
