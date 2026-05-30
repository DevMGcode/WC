/**
 * Tests para src/services/auth.ts — flujo completo de autenticación.
 *
 * Cubre:
 *  - login OK: persiste tokens y user en localStorage
 *  - login KO: mapea mensajes del backend, incluyendo el nuevo
 *    "Credenciales inválidas" del Fix A (anti-enumeración)
 *  - login con EMAIL_NOT_VERIFIED: mensaje específico al usuario
 *  - register con verificación / sin verificación
 *  - errores de red devuelven mensaje legible
 *  - usa el path nuevo /api/v1/users (no /api/v1/public/users)
 */
import { authService } from '@/services/auth';
import { mockResponse } from '../../_helpers/mockResponse';

const jsonResponse = mockResponse;

describe('authService.login', () => {
  let fetchSpy: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('login OK guarda accessToken, refreshToken y user en localStorage', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          user: { id: '2', email: 'admin@example.com', displayName: 'Admin', status: 'ACTIVE', createdAt: '2026-05-26' },
          accessToken: 'access-jwt',
          refreshToken: 'refresh-jwt'
        }
      })
    );

    const res = await authService.login('admin@example.com', 'admin');

    expect(res.success).toBe(true);
    expect(localStorage.getItem('authToken')).toBe('access-jwt');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-jwt');
    expect(JSON.parse(localStorage.getItem('user')!).email).toBe('admin@example.com');
  });

  it('pega al endpoint correcto /api/v1/auth/login con email y password en body', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { success: true, data: { user: {}, accessToken: 'x' } }));

    await authService.login('foo@bar.com', 'p4ss');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/v1/auth/login');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ email: 'foo@bar.com', password: 'p4ss' });
  });

  it('Fix A: cuando backend devuelve 422 "Credenciales inválidas", el service lo propaga', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(422, { message: 'Credenciales inválidas' }));

    const res = await authService.login('ghost@x.com', 'bad');

    expect(res.success).toBe(false);
    expect(res.message).toBe('Credenciales inválidas');
  });

  it('cuando backend devuelve EMAIL_NOT_VERIFIED traduce a mensaje legible', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(422, { message: 'EMAIL_NOT_VERIFIED' }));

    const res = await authService.login('x@x.com', 'x');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/verificar tu email/i);
  });

  it('cuando backend 500 devuelve mensaje genérico de "servidor reiniciando"', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(500, {}));

    const res = await authService.login('x@x.com', 'x');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/servidor/i);
  });

  it('cuando fetch lanza (red caída), devuelve "Error de conexión"', async () => {
    fetchSpy.mockRejectedValue(new Error('network down'));

    const res = await authService.login('x@x.com', 'x');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/conexión/i);
  });

  it('login fallido NO persiste nada en localStorage', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(422, { message: 'Credenciales inválidas' }));

    await authService.login('x@x.com', 'x');

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

describe('authService.register', () => {
  let fetchSpy: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('usa el path nuevo /api/v1/users (sin /public)', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(201, { success: true, data: { emailVerified: false } })
    );

    await authService.register({
      username: 'qa',
      email: 'q@a.com',
      password: 'pwd',
      firstName: 'Q',
      lastName: 'A'
    });

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/v1/users');
  });

  it('cuando emailVerified=false marca emailVerificationRequired=true', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(201, { success: true, data: { emailVerified: false } })
    );

    const res = await authService.register({
      username: 'q', email: 'q@a.com', password: 'p', firstName: 'Q', lastName: 'A'
    });

    expect(res.success).toBe(true);
    expect(res.emailVerificationRequired).toBe(true);
  });

  it('cuando emailVerified=true NO requiere verificación', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(201, { success: true, data: { emailVerified: true } })
    );

    const res = await authService.register({
      username: 'q', email: 'q@a.com', password: 'p', firstName: 'Q', lastName: 'A'
    });

    expect(res.success).toBe(true);
    expect(res.emailVerificationRequired).toBe(false);
  });

  it('si el backend devuelve error, propaga el mensaje', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(400, { message: 'El email ya está registrado' }));

    const res = await authService.register({
      username: 'q', email: 'duplicado@x.com', password: 'p', firstName: 'Q', lastName: 'A'
    });

    expect(res.success).toBe(false);
    expect(res.message).toBe('El email ya está registrado');
  });
});
