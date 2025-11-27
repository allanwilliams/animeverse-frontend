import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Token não encontrado' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, first_name, last_name } = body;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/perfil/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        email,
        first_name,
        last_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Erro ao atualizar perfil' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
