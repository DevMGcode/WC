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

    const username = email.split('@')[0] || 'user';
    
    // Test simple - devolver success
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          displayName: username,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        },
        accessToken: 'test-token-' + Date.now(),
        refreshToken: 'refresh-token'
      },
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
