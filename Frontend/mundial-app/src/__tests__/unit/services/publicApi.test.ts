/**
 * Tests para src/services/publicApi.ts
 *
 * `request()` decide el path final según el formato del path recibido:
 *   - Si empieza con "/api/v1/..." → lo usa tal cual (endpoint privado autenticado)
 *   - Si no → lo prefija con "/api/v1/public/" (endpoint público del torneo)
 *
 * En cliente añade Bearer si hay token en localStorage. En SSR usa BASE_URL
 * interno apuntando a http://backend:8080 para que el server hable directo
 * con el backend sin pasar por el rewrite de Next.
 */
import { request } from '@/services/publicApi';
import { mockResponse } from '../../_helpers/mockResponse';

describe('publicApi.request — routing inteligente público/privado', () => {
  let fetchSpy: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = jest.fn().mockResolvedValue(mockResponse(200, { data: { ok: true } }));
    (global as any).fetch = fetchSpy;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('path sin prefijo se trata como público (prefija /api/v1/public)', async () => {
    await request('/tournaments');
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/v1/public/tournaments');
  });

  it('path que empieza con /api/v1/ se usa tal cual (privado)', async () => {
    await request('/api/v1/predictions/user/2');
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/v1/predictions/user/2');
    expect(String(url)).not.toContain('/public/');
  });

  it('path sin slash inicial se normaliza correctamente', async () => {
    await request('teams');
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/v1/public/teams');
  });

  it('en cliente añade Authorization Bearer cuando hay token', async () => {
    localStorage.setItem('authToken', 'tok-public-api');
    await request('/api/v1/scores/user/2', { userId: 2 });

    const [, init] = fetchSpy.mock.calls[0];
    expect((init?.headers as any)?.Authorization).toBe('Bearer tok-public-api');
  });

  it('NO añade Authorization si no hay token', async () => {
    await request('/tournaments');
    const [, init] = fetchSpy.mock.calls[0];
    expect((init?.headers as any)?.Authorization).toBeUndefined();
  });

  it('serializa params como query string', async () => {
    await request('/scores/user/2', { userId: 2, limit: 10 });
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('userId=2');
    expect(String(url)).toContain('limit=10');
  });

  it('ignora params undefined / null / vacío', async () => {
    await request('/x', { a: 1, b: undefined, c: null, d: '' });
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('a=1');
    expect(String(url)).not.toContain('b=');
    expect(String(url)).not.toContain('c=');
    expect(String(url)).not.toContain('d=');
  });

  it('devuelve sólo el envelope.data del ApiResponse', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, { success: true, data: { foo: 'bar' } }));
    const result = await request('/x');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('si la response no tiene envelope, devuelve el JSON completo', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, [1, 2, 3]));
    const result = await request('/x');
    expect(result).toEqual([1, 2, 3]);
  });

  it('lanza error con status si la response no es ok', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(500, 'Server error'));
    await expect(request('/broken')).rejects.toThrow(/500/);
  });
});
