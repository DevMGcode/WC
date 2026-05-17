const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_PUBLIC_API_URL ||
  'http://localhost:8080';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

async function request<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  // Construir la URL completa
  const fullPath = `/api/v1/public${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(fullPath, PUBLIC_API_URL).toString();
  
  // Agregar parámetros de query si existen
  const urlWithParams = new URL(url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlWithParams.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(urlWithParams.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

export { PUBLIC_API_URL, request };