import api from './api';
import type { Manga, MangaList, MangaFilters, Capitulo, ReviewManga } from '@/types/manga';
import type { ContinuarLendo } from '@/types/user';

export const mangaService = {
  getMangas: async (filters?: MangaFilters): Promise<MangaList> => {
    const response = await api.get<MangaList>('/mangas/', { params: filters });
    return response.data;
  },

  getMangaById: async (id: number): Promise<Manga> => {
    const response = await api.get<Manga>(`/mangas/${id}/`);
    return response.data;
  },

  getPopulares: async (): Promise<Manga[]> => {
    const response = await api.get<Manga[]>('/mangas/populares/');
    return response.data;
  },

  getRecentes: async (): Promise<Manga[]> => {
    const response = await api.get<Manga[]>('/mangas/recentes/');
    return response.data;
  },

  favoritarManga: async (id: number): Promise<{ message: string; favorito: boolean }> => {
    const response = await api.post<{ message: string; favorito: boolean }>(
      `/mangas/${id}/favoritar/`
    );
    return response.data;
  },

  getCapitulos: async (mangaId: number): Promise<Capitulo[]> => {
    const response = await api.get<Capitulo[]>(`/mangas/${mangaId}/capitulos/`);
    return response.data;
  },

  getCapituloById: async (capituloId: number): Promise<Capitulo> => {
    const response = await api.get<Capitulo>(`/capitulos/${capituloId}/`);
    return response.data;
  },

  getReviews: async (mangaId: number): Promise<ReviewManga[]> => {
    const response = await api.get<ReviewManga[]>(`/mangas/${mangaId}/reviews/`);
    return response.data;
  },

  criarReview: async (
    mangaId: number,
    data: { titulo: string; texto: string; rating: number }
  ): Promise<ReviewManga> => {
    const response = await api.post<ReviewManga>('/reviews-manga/', {
      ...data,
      manga: mangaId,
    });
    return response.data;
  },

  continuarLendo: async (): Promise<ContinuarLendo[]> => {
    const response = await api.get<ContinuarLendo[]>('/usuarios/continuar-lendo/');
    return response.data;
  },

  meusMangas: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/favoritos-manga/');
    return response.data;
  },

  avaliarManga: async (mangaId: number, rating: number): Promise<any> => {
    const response = await api.post<any>(`/mangas/${mangaId}/avaliar/`, { rating });
    return response.data;
  },

  atualizarRatingManga: async (favoritoMangaId: number, rating: number): Promise<any> => {
    const response = await api.put<any>(`/favoritos-manga/${favoritoMangaId}/avaliar/`, { rating });
    return response.data;
  },

  marcarCapituloLido: async (capituloId: number, progresso?: number): Promise<any> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.post<any>(`/api/capitulos/${capituloId}/marcar-lido`, {
      progresso: progresso || 100,
    });
    return response.data;
  },
};

