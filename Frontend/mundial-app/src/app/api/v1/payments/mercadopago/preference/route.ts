import { NextRequest, NextResponse } from 'next/server';

// Proxy que reenvía la creación de Preference al backend Spring Boot.
// El backend valida el JWT, crea la suscripción PENDING y la Preference real en Mercado Pago.
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/mercadopago/preference`,
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
      { error: 'Error al crear la preferencia de Mercado Pago.' },
      { status: 500 }
    );
  }
}
