/**
 * Base URL para llamadas a la API pública:
 *  - En el SERVIDOR (RSC / SSR): usa INTERNAL_API_BASE_URL para llegar al backend
 *    directamente por la red interna de Docker (backend:8080).
 *  - En el CLIENTE (browser): usa URL relativa '' para que las llamadas
 *    pasen por el rewrite de Next.js (/api/* → backend:8080/api/*).
 *    IMPORTANTE: nunca usar 'http://localhost:8080' como fallback en el cliente —
 *    el celular (ngrok) no puede alcanzar localhost de la PC.
 */
const isServer = typeof window === 'undefined';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

async function request<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const fullPath = normalized.startsWith('/api/v1/')
    ? normalized
    : `/api/v1/public${normalized}`;

  // Construir query string
  let finalPath = fullPath;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, String(value));
      }
    });
    const queryStr = qs.toString();
    if (queryStr) finalPath = `${fullPath}?${queryStr}`;
  }

  // En servidor: URL absoluta a la red interna Docker
  // En cliente: URL relativa → Next.js proxy la reenvía al backend
  let finalUrl: string;
  if (isServer) {
    const base = process.env.INTERNAL_API_BASE_URL || 'http://backend:8080';
    finalUrl = `${base}${finalPath}`;
  } else {
    finalUrl = finalPath;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!isServer) {
    const token = window.localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(finalUrl, {
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