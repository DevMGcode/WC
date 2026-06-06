import { NextRequest, NextResponse } from 'next/server';

// Crea la sesión firmada para el widget de Binance Connect.
// El backend genera la firma HMAC-SHA512 con el API Secret — nunca sale del servidor.
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/binance-connect/session`,
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  token,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear la sesión de Binance Connect.' },
      { status: 500 }
    );
  }
}
