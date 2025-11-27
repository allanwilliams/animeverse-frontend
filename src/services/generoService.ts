import api from './api';
import type { Genero } from '@/types/anime';

export const generoService = {
  getGeneros: async (): Promise<Genero[]> => {
    const response = await api.get('/generos/');
    const data = response.data as any;
    // Suporta resposta paginada (DRF) ou lista direta
    if (Array.isArray(data)) return data as Genero[];
    if (Array.isArray(data?.results)) return data.results as Genero[];
    return [];
  },

  getGeneroById: async (id: number): Promise<Genero> => {
    const response = await api.get<Genero>(`/generos/${id}/`);
    return response.data;
  },
};

