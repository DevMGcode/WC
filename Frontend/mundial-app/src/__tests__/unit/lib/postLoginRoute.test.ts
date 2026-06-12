/**
 * Tests del helper que decide la ruta tras un login exitoso
 * (flujo "onboarding solo la primera vez").
 */
import { getPostLoginRoute } from '@/lib/postLoginRoute';
import type { AuthUser } from '@/services/auth';

const baseUser: AuthUser = {
  id: '1',
  email: 'test@test.com',
  displayName: 'Test',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('getPostLoginRoute', () => {
  it('usuario nuevo (onboardingCompleted=false) → /{idioma}/onboarding', () => {
    const user: AuthUser = { ...baseUser, onboardingCompleted: false, preferredLanguage: 'es' };
    expect(getPostLoginRoute(user, 'es')).toBe('/es/onboarding');
  });

  it('usuario que ya hizo onboarding → home en su idioma guardado', () => {
    const user: AuthUser = { ...baseUser, onboardingCompleted: true, preferredLanguage: 'fr' };
    expect(getPostLoginRoute(user, 'es')).toBe('/fr');
  });

  it('respeta el idioma del perfil aunque la página esté en otro locale', () => {
    const user: AuthUser = { ...baseUser, onboardingCompleted: false, preferredLanguage: 'en' };
    expect(getPostLoginRoute(user, 'es')).toBe('/en/onboarding');
  });

  it('idioma no soportado en el perfil → usa el locale actual como fallback', () => {
    const user: AuthUser = { ...baseUser, onboardingCompleted: true, preferredLanguage: 'xx' };
    expect(getPostLoginRoute(user, 'pt')).toBe('/pt');
  });

  it('usuario antiguo sin el campo (undefined) NO va a onboarding', () => {
    // Sesiones guardadas antes de esta versión no traen onboardingCompleted:
    // solo el false explícito del backend debe disparar el onboarding.
    const user: AuthUser = { ...baseUser };
    expect(getPostLoginRoute(user, 'es')).toBe('/es');
  });

  it('sin usuario (null) → home en el locale actual', () => {
    expect(getPostLoginRoute(null, 'de')).toBe('/de');
  });

  it('sin preferredLanguage → usa el locale actual', () => {
    const user: AuthUser = { ...baseUser, onboardingCompleted: false };
    expect(getPostLoginRoute(user, 'ar')).toBe('/ar/onboarding');
  });
});
