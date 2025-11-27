import axios from 'axios';
import { cookies } from 'next/headers';
import type { Genero, Anime, Favorito } from '@/types/anime';
import type { AnimeList, AnimeFilters } from '@/types/anime';
import type { PaginatedResponse } from '@/types/api';
import type { ContinuarAssistindo, ContinuarLendo } from '@/types/user';
import type { FavoritoManga, Manga, MangaList, MangaFilters, Capitulo } from '@/types/manga';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Cliente axios para server-side (sem interceptors de autenticação)
const apiServer = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função helper para criar headers com autenticação
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    // Se não conseguir ler cookies, continua sem autenticação
    console.error('Erro ao ler cookies:', error);
  }
  
  return headers;
}

export async function getGenerosServer(): Promise<Genero[]> {
  try {
    const response = await apiServer.get('/generos/');
    const data = response.data as any;
    // Suporta resposta paginada (DRF) ou lista direta
    if (Array.isArray(data)) return data as Genero[];
    if (Array.isArray(data?.results)) return data.results as Genero[];
    return [];
  } catch (error) {
    console.error('Erro ao buscar gêneros no servidor:', error);
    return [];
  }
}

export async function getAnimesServer(filters?: AnimeFilters): Promise<AnimeList | null> {
  try {
    // Serializar arrays corretamente para o Django
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Para arrays, adicionar múltiplos parâmetros com o mesmo nome
            value.forEach((item) => {
              params.append(key, String(item));
            });
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const headers = await getAuthHeaders();
    const response = await apiServer.get<AnimeList>('/animes/', { params, headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar animes no servidor:', error);
    return null;
  }
}

export async function getAnimeByIdServer(id: number): Promise<Anime | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await apiServer.get<Anime>(`/animes/${id}/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar anime no servidor:', error);
    return null;
  }
}

export async function getFavoritosServer(): Promise<PaginatedResponse<Favorito> | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return null; // Não autenticado
    }
    const response = await apiServer.get<PaginatedResponse<Favorito>>('/favoritos/', { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar favoritos no servidor:', error);
    return null;
  }
}

export async function getEstatisticasServer(): Promise<{
  total: number;
  assistindo: number;
  completo: number;
  pausado: number;
  planejado: number;
  total_episodios_vistos: number;
} | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return null; // Não autenticado
    }
    const response = await apiServer.get('/favoritos/estatisticas/', { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas no servidor:', error);
    return null;
  }
}

export async function getContinuarAssistindoServer(): Promise<ContinuarAssistindo[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return []; // Não autenticado
    }
    const response = await apiServer.get<ContinuarAssistindo[]>('/usuarios/continuar_assistindo/', { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar continuar assistindo no servidor:', error);
    return [];
  }
}

export async function getContinuarLendoServer(): Promise<ContinuarLendo[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return []; // Não autenticado
    }
    const response = await apiServer.get<ContinuarLendo[]>('/usuarios/continuar_lendo/', { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar continuar lendo no servidor:', error);
    return [];
  }
}

export async function getMeusMangasServer(): Promise<FavoritoManga[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return []; // Não autenticado
    }
    const response = await apiServer.get<PaginatedResponse<FavoritoManga>>('/favoritos-manga/', { headers });
    return response.data.results || [];
  } catch (error) {
    console.error('Erro ao buscar meus mangas no servidor:', error);
    return [];
  }
}

export async function getUserServer(): Promise<import('@/types/user').User | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      return null; // Não autenticado
    }
    const response = await apiServer.get<import('@/types/user').User>('/usuarios/dados-basicos/', { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário no servidor:', error);
    return null;
  }
}

export async function getMangasServer(filters?: MangaFilters): Promise<MangaList | null> {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              params.append(key, String(item));
            });
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const headers = await getAuthHeaders();
    const response = await apiServer.get<MangaList>('/mangas/', { params, headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar mangas no servidor:', error);
    return null;
  }
}

export async function getMangaByIdServer(id: number): Promise<Manga | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await apiServer.get<Manga>(`/mangas/${id}/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar manga no servidor:', error);
    return null;
  }
}

export async function getCapitulosServer(mangaId: number): Promise<Capitulo[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await apiServer.get<Capitulo[]>(`/mangas/${mangaId}/capitulos/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar capítulos no servidor:', error);
    return [];
  }
}

export async function getCapituloByIdServer(capituloId: number): Promise<Capitulo | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await apiServer.get<Capitulo>(`/capitulos/${capituloId}/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar capítulo no servidor:', error);
    return null;
  }
}

export async function getAnimesPopularesServer(): Promise<Anime[]> {
  try {
    const response = await apiServer.get<Anime[]>('/animes/populares/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar animes populares no servidor:', error);
    return [];
  }
}

export async function getAnimesRecentesServer(): Promise<Anime[]> {
  try {
    const response = await apiServer.get<Anime[]>('/animes/recentes/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar animes recentes no servidor:', error);
    return [];
  }
}

export async function getMangasPopularesServer(): Promise<Manga[]> {
  try {
    const response = await apiServer.get<Manga[]>('/mangas/populares/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar mangas populares no servidor:', error);
    return [];
  }
}

export async function getMangasRecentesServer(): Promise<Manga[]> {
  try {
    const response = await apiServer.get<Manga[]>('/mangas/recentes/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar mangas recentes no servidor:', error);
    return [];
  }
}

