import { NextRequest, NextResponse } from 'next/server';

// Host interno del backend (absoluto). En el servidor NO sirve NEXT_PUBLIC_API_URL
// porque en Docker vale "/api" (relativo) y fetch del lado servidor exige URL absoluta.
const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || 'http://localhost:8080';

// Verifica disponibilidad de las pasarelas de pago para el usuario autenticado.
// Delega la lógica de región, tipo de producto y canal al backend.
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ available: false, reason: 'REGION_RESTRICTED' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productType       = searchParams.get('productType') ?? '';
    const channel           = request.headers.get('X-Distribution-Channel') ?? 'web';

    const backendUrl = `${INTERNAL_API_BASE_URL}/api/v1/payments/availability?productType=${productType}`;

    const backendResponse = await fetch(backendUrl, {
      headers: {
        Authorization:           token,
        'X-Distribution-Channel': channel,
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { available: false, reason: 'MAINTENANCE', message: 'Servicio no disponible temporalmente.' },
      { status: 503 }
    );
  }
}
