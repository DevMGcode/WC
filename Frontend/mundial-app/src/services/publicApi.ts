/**
 * Base URL para llamadas a la API pública:
 *  - En el SERVIDOR (RSC / SSR): usa INTERNAL_API_BASE_URL para llegar al backend
 *    directamente por la red interna de Docker (backend:8080).
 *  - En el CLIENTE (browser): usa URL relativa vacía '' para que las llamadas
 *    pasen por el rewrite de Next.js (/api/* → backend:8080/api/*).
 */
const isServer = typeof window === 'undefined';
const BASE_URL: string = isServer
  ? (process.env.INTERNAL_API_BASE_URL || 'http://backend:8080')
  : '';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

async function request<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  // Construir la URL:
  //  - Si `path` empieza con "/api/v1/" → usar tal cual (endpoints privados que requieren auth)
  //  - Si no → prefijar con "/api/v1/public/" (endpoints realmente públicos del torneo)
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const fullPath = normalized.startsWith('/api/v1/')
    ? normalized
    : `/api/v1/public${normalized}`;
  const baseForUrl = BASE_URL || 'http://localhost:8080';
  const url = new URL(fullPath, baseForUrl).toString();

  // Agregar parámetros de query si existen
  const urlWithParams = new URL(url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlWithParams.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // En cliente, añade el JWT si existe — necesario para endpoints autenticados
  // como /predictions/user/X o /scores/user/X. En SSR no hay localStorage.
  if (!isServer) {
    const token = window.localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(urlWithParams.toString(), {
    method: 'GET',
    headers,
    cache: 'default',
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

export { request };