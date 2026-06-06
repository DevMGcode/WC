import { NextRequest, NextResponse } from 'next/server';

// Crea una orden de Binance Pay. El backend firma la petición con las credenciales
// del Merchant API y retorna { checkoutUrl, deeplink }.
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/binance-pay/order`,
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
      { error: 'Error al crear la orden de Binance Pay.' },
      { status: 500 }
    );
  }
}
