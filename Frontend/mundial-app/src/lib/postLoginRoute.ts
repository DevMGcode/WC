/**
 * Decide a dónde llevar al usuario después de un login exitoso.
 *
 * Reglas (flujo "onboarding solo la primera vez"):
 *   - onboardingCompleted === false → /{idioma}/onboarding
 *   - en cualquier otro caso        → /{idioma}  (home)
 *
 * El idioma sale de user.preferredLanguage (guardado en el backend); si no
 * viene o no es un locale soportado, se usa el locale actual de la página.
 */
import type { AuthUser } from '@/services/auth';
import { isLocale } from '@/i18n/locales';

export function getPostLoginRoute(user: AuthUser | null | undefined, fallbackLocale: string): string {
  const lang =
    user?.preferredLanguage && isLocale(user.preferredLanguage)
      ? user.preferredLanguage
      : fallbackLocale;

  // Solo redirige a onboarding con false EXPLÍCITO: un user antiguo en
  // localStorage sin el campo (undefined) no debe ser arrastrado al onboarding.
  if (user && user.onboardingCompleted === false) {
    return `/${lang}/onboarding`;
  }
  return `/${lang}`;
}

export default getPostLoginRoute;
