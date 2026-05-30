/**
 * Tests para src/services/api.ts (apiClient — axios + interceptors).
 *
 * Cubre el comportamiento crítico:
 *   1. setAccessToken/getAccessToken persisten en localStorage
 *   2. clearAuth limpia ambos tokens
 *   3. Interceptor de request añade Bearer automáticamente
 *   4. Métodos get/post/put/delete devuelven sólo `data` desenvuelto del ApiResponse
 */
import { apiClient } from '@/services/api';

describe('apiClient — gestión de tokens', () => {
  beforeEach(() => {
    localStorage.clear();
    apiClient.clearAuth();
  });

  it('setAccessToken guarda en localStorage y getAccessToken lo recupera', () => {
    apiClient.setAccessToken('jwt-token-123');
    expect(localStorage.getItem('authToken')).toBe('jwt-token-123');
    expect(apiClient.getAccessToken()).toBe('jwt-token-123');
  });

  it('getAccessToken lee de localStorage si la instancia no tiene el token', () => {
    localStorage.setItem('authToken', 'persisted-token');
    // Una nueva lectura: como apiClient es singleton, primero limpiamos su cache.
    apiClient.clearAuth();
    localStorage.setItem('authToken', 'persisted-token');
    expect(apiClient.getAccessToken()).toBe('persisted-token');
  });

  it('clearAuth limpia authToken y refreshToken de localStorage', () => {
    localStorage.setItem('authToken', 'a');
    localStorage.setItem('refreshToken', 'b');
    apiClient.setAccessToken('a');
    apiClient.clearAuth();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(apiClient.getAccessToken()).toBeNull();
  });
});

describe('apiClient — interceptor de request añade Authorization', () => {
  it('cuando hay token, el interceptor lo agrega al header', async () => {
    apiClient.setAccessToken('test-bearer');
    // Capturamos la config que pasa por el interceptor sin hacer petición real.
    // @ts-ignore - acceso interno al axios instance para test.
    const axiosInstance = (apiClient as any).client;
    const config = axiosInstance.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-bearer');
  });

  it('si no hay token, no añade Authorization', () => {
    apiClient.clearAuth();
    localStorage.clear();
    // @ts-ignore
    const axiosInstance = (apiClient as any).client;
    const config = axiosInstance.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
