/**
 * Tests para src/lib/apiFetch.ts
 *
 * apiFetch es el wrapper que añade automáticamente el header Authorization
 * con el JWT guardado en localStorage. Es la pieza que hace que los endpoints
 * privados (/api/v1/predictions, /api/v1/leagues, etc.) funcionen desde
 * componentes que antes usaban fetch() pelado.
 *
 * Casos cubiertos:
 *  1. Añade Bearer si hay token en localStorage
 *  2. No añade Bearer si NO hay token (anónimo)
 *  3. Respeta un Authorization que el caller ya puso (no lo sobrescribe)
 *  4. Pasa method, body y demás init sin tocarlos
 *  5. Funciona en SSR (sin window) sin lanzar
 */
import { apiFetch } from '@/lib/apiFetch';
import { mockResponse } from '../../_helpers/mockResponse';

describe('apiFetch — wrapper con Bearer automático', () => {
  let fetchSpy: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = jest.fn().mockResolvedValue(mockResponse(200, {}));
    (global as any).fetch = fetchSpy;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('añade Authorization Bearer cuando hay authToken en localStorage', async () => {
    localStorage.setItem('authToken', 'tok-abc-123');

    await apiFetch('/api/v1/predictions/user/2');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer tok-abc-123');
  });

  it('NO añade Authorization si no hay token (request anónimo)', async () => {
    await apiFetch('/api/v1/public/tournaments');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('respeta Authorization explícito puesto por el caller', async () => {
    localStorage.setItem('authToken', 'tok-localStorage');

    await apiFetch('/api/v1/test', {
      headers: { Authorization: 'Bearer tok-explicit' }
    });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    // El header explícito gana sobre el de localStorage.
    expect(headers.get('Authorization')).toBe('Bearer tok-explicit');
  });

  it('preserva method y body', async () => {
    localStorage.setItem('authToken', 'tok-x');

    await apiFetch('/api/v1/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: 1, predictedHomeScore: 2, predictedAwayScore: 1 })
    });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/v1/predictions');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      fixtureId: 1,
      predictedHomeScore: 2,
      predictedAwayScore: 1
    });
  });

  it('reenvía Content-Type custom intacto', async () => {
    await apiFetch('/api/v1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('Content-Type')).toBe('multipart/form-data');
  });

  it('no rompe si init es undefined', async () => {
    await expect(apiFetch('/api/v1/public/tournaments')).resolves.toBeDefined();
  });

  it('devuelve la Response del fetch subyacente', async () => {
    const response = await apiFetch('/api/v1/public/tournaments');
    expect(response.status).toBe(200);
  });

  it('en SSR (sin window) no intenta acceder a localStorage y no lanza', async () => {
    // Simula entorno server.
    const originalWindow = (global as any).window;
    delete (global as any).window;
    try {
      await expect(apiFetch('/api/v1/public/tournaments')).resolves.toBeDefined();
    } finally {
      (global as any).window = originalWindow;
    }
  });
});
