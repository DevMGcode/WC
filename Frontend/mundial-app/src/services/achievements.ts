/**
 * Servicio de logros y rachas del usuario.
 *
 * Backend: GET /api/v1/achievements/{tournamentId}?userId={id}
 * Devuelve la racha actual/mejor y el catálogo de insignias (desbloqueadas y
 * bloqueadas con progreso). Todo se calcula del scoring que ya existe.
 */
import { apiFetch } from '@/lib/apiFetch';

export interface Achievement {
  code:        string;
  name:        string;
  description: string;
  icon:        string;   // nombre del icono react-icons/fi que pinta el front
  unlocked:    boolean;
  current:     number;
  target:      number;
}

export interface AchievementSummary {
  currentStreak: number;
  bestStreak:    number;
  totalPoints:   number;
  exactScores:   number;
  unlockedCount: number;
  totalCount:    number;
  achievements:  Achievement[];
}

export const achievementsService = {
  async get(tournamentId: number, userId: number): Promise<AchievementSummary> {
    const res = await apiFetch(`/api/v1/achievements/${tournamentId}?userId=${userId}`);
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
    return (json?.data ?? json) as AchievementSummary;
  },
};
