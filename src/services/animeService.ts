import api from './api';
import type { Anime, AnimeList, AnimeFilters, Episodio, Review, Temporada } from '@/types/anime';
import type { ContinuarAssistindo } from '@/types/user';

export const animeService = {
  getAnimes: async (filters?: AnimeFilters): Promise<AnimeList> => {
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
    
    const response = await api.get<AnimeList>('/animes/', { params });
    return response.data;
  },

  getAnimeById: async (id: number): Promise<Anime> => {
    const response = await api.get<Anime>(`/animes/${id}/`);
    return response.data;
  },

  getPopulares: async (): Promise<Anime[]> => {
    const response = await api.get<Anime[]>('/animes/populares/');
    return response.data;
  },

  getRecentes: async (): Promise<Anime[]> => {
    const response = await api.get<Anime[]>('/animes/recentes/');
    return response.data;
  },

  favoritarAnime: async (id: number): Promise<{ message: string; favorito: boolean }> => {
    const response = await api.post<{ message: string; favorito: boolean }>(
      `/animes/${id}/favoritar/`
    );
    return response.data;
  },

  getTemporadas: async (animeId: number): Promise<Temporada[]> => {
    const response = await api.get<Temporada[]>(`/animes/${animeId}/temporadas/`);
    return response.data;
  },

  getEpisodios: async (animeId: number): Promise<Episodio[]> => {
    const response = await api.get<Episodio[]>(`/animes/${animeId}/episodios/`);
    return response.data;
  },

  getEpisodiosPorTemporada: async (temporadaId: number): Promise<Episodio[]> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.get<Episodio[]>(`/api/temporadas/${temporadaId}/episodios`);
    return response.data;
  },

  getEpisodioById: async (episodioId: number): Promise<Episodio> => {
    const response = await api.get<Episodio>(`/episodios/${episodioId}/`);
    return response.data;
  },

  getReviews: async (animeId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/animes/${animeId}/reviews/`);
    return response.data;
  },

  criarReview: async (
    animeId: number,
    data: { titulo: string; texto: string; rating: number }
  ): Promise<Review> => {
    const response = await api.post<Review>('/reviews/', {
      ...data,
      anime: animeId,
    });
    return response.data;
  },

  continuarAssistindo: async (): Promise<ContinuarAssistindo[]> => {
    const response = await api.get<ContinuarAssistindo[]>('/usuarios/continuar-assistindo/');
    return response.data;
  },

  meusAnimes: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/favoritos/');
    return response.data;
  },

  avaliarAnime: async (animeId: number, rating: number): Promise<any> => {
    const response = await api.post<any>(`/animes/${animeId}/avaliar/`, { rating });
    return response.data;
  },

  atualizarRating: async (favoritoId: number, rating: number): Promise<any> => {
    const response = await api.put<any>(`/favoritos/${favoritoId}/avaliar/`, { rating });
    return response.data;
  },

  marcarEpisodioVisto: async (episodioId: number, progresso?: number): Promise<any> => {
    // Usar API route do Next.js para ocultar a rota do backend
    // Não usar barra no final para evitar redirect 308 do Next.js
    const progressoFinal = progresso !== undefined ? progresso : 100;
    console.log(`🔄 marcarEpisodioVisto - Enviando progresso: ${progressoFinal}% para episódio ${episodioId}`);
    
    const response = await api.post<any>(`/api/episodios/${episodioId}/marcar-visto`, {
      progresso: progressoFinal,
    });
    return response.data;
  },

  atualizarProgressoEpisodio: async (episodioId: number, progresso: number, progressoPorcentagem: number): Promise<any> => {
    // Usar API route do Next.js para ocultar a rota do backend
    // Não usar barra no final para evitar redirect 308 do Next.js
    const response = await api.patch<any>(`/api/episodios/${episodioId}/atualizar-progresso`, {
      progresso,
      progressoPorcentagem,
    });
    return response.data;
  },

  obterProgressoEpisodio: async (episodioId: number): Promise<{ progresso: number | null; data_visualizacao: string | null }> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.get<{ progresso: number | null; data_visualizacao: string | null }>(`/api/episodios/${episodioId}/progresso`);
    return response.data;
  },
};

