import api from './api';
import type { Favorito } from '@/types/anime';
import type { PaginatedResponse } from '@/types/api';

export const favoritoService = {
  getFavoritos: async (): Promise<PaginatedResponse<Favorito>> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.get<PaginatedResponse<Favorito>>('/api/favoritos');
    return response.data;
  },

  adicionarFavorito: async (data: {
    anime: number;
    status?: string;
    avaliacao?: number;
    progresso_episodios?: number;
  }): Promise<Favorito> => {
    const response = await api.post<Favorito>('/favoritos/', data);
    return response.data;
  },

  atualizarFavorito: async (
    id: number,
    data: Partial<{
      status: string;
      avaliacao: number;
      progresso_episodios: number;
    }>
  ): Promise<Favorito> => {
    const response = await api.patch<Favorito>(`/favoritos/${id}/`, data);
    return response.data;
  },

  removerFavorito: async (id: number): Promise<void> => {
    await api.delete(`/favoritos/${id}/`);
  },

  getEstatisticas: async (): Promise<{
    total: number;
    assistindo: number;
    completo: number;
    pausado: number;
    planejado: number;
    total_episodios_vistos: number;
  }> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.get('/api/favoritos/estatisticas');
    return response.data;
  },
};

