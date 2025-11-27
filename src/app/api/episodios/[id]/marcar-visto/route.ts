import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const response = await axios.post(
      `${API_BASE_URL}/episodios/${id}/marcar-visto/`,
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
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    console.error('Erro ao marcar episódio como visto:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar episódio como visto' },
      { status: error.response?.status || 500 }
    );
  }
}

