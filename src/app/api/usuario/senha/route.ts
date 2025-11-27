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
    const { current_password, new_password } = body;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/alterar-senha/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password,
        new_password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Erro ao alterar senha' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
