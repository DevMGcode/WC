/**
 * Helper para llamar a la API añadiendo automáticamente el JWT en el header
 * Authorization. Drop-in replacement de fetch() — misma firma:
 *
 *   const res = await apiFetch('/api/v1/...');
 *   const res = await apiFetch('/api/v1/...', { method: 'POST', body: ... });
 *
 * En SSR no hay localStorage, por lo que se llama sin token (los endpoints
 * realmente públicos como /tournaments / fixtures / players / rankings/global
 * siguen funcionando sin auth desde el server).
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('authToken');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(input, { ...init, headers });
}

export default apiFetch;
