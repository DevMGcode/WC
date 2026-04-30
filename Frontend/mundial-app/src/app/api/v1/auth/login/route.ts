import { NextRequest, NextResponse } from 'next/server';

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
    const backendResponse = await fetch('http://localhost:8080/api/v1/auth/login', {
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