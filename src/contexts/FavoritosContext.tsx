'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { favoritoService } from '@/services/favoritoService';
import type { Favorito } from '@/types/anime';

interface FavoritosContextType {
  favoritos: Favorito[];
  loading: boolean;
  refreshFavoritos: () => Promise<void>;
  ultimoEpisodioMap: Record<number, number | null>;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadFavoritos = useCallback(async () => {
    if (authLoading) {
      return; // Aguardar autenticação carregar
    }

    if (!isAuthenticated) {
      setFavoritos([]);
      return;
    }

    // Evitar múltiplas chamadas simultâneas
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      const response = await favoritoService.getFavoritos();
      setFavoritos(response.results || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavoritos([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadFavoritos();
  }, [loadFavoritos]);

  // Criar mapeamento de animeId -> ultimoEpisodioId
  const ultimoEpisodioMap = favoritos.reduce((acc, favorito) => {
    if (favorito.ultimo_episodio_id && favorito.anime_detalhes?.id) {
      acc[favorito.anime_detalhes.id] = favorito.ultimo_episodio_id;
    }
    return acc;
  }, {} as Record<number, number | null>);

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        loading,
        refreshFavoritos: loadFavoritos,
        ultimoEpisodioMap,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos deve ser usado dentro de um FavoritosProvider');
  }
  return context;
};

