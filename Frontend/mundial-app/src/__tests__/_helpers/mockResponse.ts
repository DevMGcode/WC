/**
 * Helper compartido para tests: crea un objeto con la forma de Response
 * sin depender del constructor nativo (que jsdom no expone confiablemente).
 *
 * Uso:
 *   fetchSpy.mockResolvedValue(mockResponse(200, { success: true, data: {...} }));
 *   fetchSpy.mockResolvedValue(mockResponse(422, { message: 'Credenciales inválidas' }));
 */
export function mockResponse(status: number, body: any = {}): any {
  const json = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : status === 422 ? 'Unprocessable Entity' : '',
    headers: {
      get: (name: string) => {
        const lower = name.toLowerCase();
        if (lower === 'content-type') return 'application/json';
        return null;
      }
    },
    json: () => Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body),
    text: () => Promise.resolve(json)
  };
}
