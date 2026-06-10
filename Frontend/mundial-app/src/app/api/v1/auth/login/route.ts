import { NextRequest, NextResponse } from 'next/server';

// Host interno del backend. En Docker es http://backend:8080 (nombre del servicio);
// en local sin Docker, http://localhost:8080. NUNCA hardcodear localhost: dentro
// del contenedor "localhost" es el propio contenedor del frontend, no el backend.
const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email || '';
    const password = body?.password || '';

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email y contraseña requeridos'
      }, { status: 400 });
    }

    // Llamar al backend real
    const backendResponse = await fetch(`${INTERNAL_API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Error en login'
      }, { status: backendResponse.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: 'Login exitoso'
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}