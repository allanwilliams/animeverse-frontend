import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token de acesso não encontrado' }, { status: 401 });
    }

    const response = await axios.patch(
      `${API_BASE_URL}/episodios/${id}/atualizar-progresso/`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Token de acesso não encontrado' }, { status: 401 });
    }
    console.error('Erro ao atualizar progresso do episódio:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso do episódio' },
      { status: error.response?.status || 500 }
    );
  }
}