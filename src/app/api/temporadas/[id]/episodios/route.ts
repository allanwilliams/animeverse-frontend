import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/temporadas/${id}/episodios/`, {
      headers,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro ao buscar episódios da temporada:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar episódios' },
      { status: error.response?.status || 500 }
    );
  }
}

