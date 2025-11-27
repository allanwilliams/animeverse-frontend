'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimeGrid } from '../Anime/AnimeGrid';
import { RatingComponent } from '../Common/RatingComponent';
import { animeService } from '@/services/animeService';
import type { Favorito } from '@/types/anime';
import { useAuth } from '@/hooks/useAuth';

interface MeusAnimesProps {
  favoritos: Favorito[];
  onRatingUpdate?: () => void;
}

export function MeusAnimes({ favoritos, onRatingUpdate }: MeusAnimesProps) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const handleRatingChange = async (favoritoId: number, rating: number) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading({ ...loading, [favoritoId]: true });
      await animeService.atualizarRating(favoritoId, rating);
      onRatingUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar rating:', error);
    } finally {
      setLoading({ ...loading, [favoritoId]: false });
    }
  };

  return (
    <div>
      {/* Lista */}
      {favoritos.length > 0 ? (
        <div className="space-y-4">
          {favoritos.map((favorito) => (
            <div
              key={favorito.id}
              className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4"
            >
              <Link
                href={
                  favorito.ultimo_episodio_id
                    ? `/animes/${favorito.anime_detalhes.id}/episodio/${favorito.ultimo_episodio_id}`
                    : `/animes/${favorito.anime_detalhes.id}`
                }
                className="flex-shrink-0 w-full md:w-32 aspect-video relative rounded overflow-hidden"
              >
                {favorito.anime_detalhes.capa ? (
                  <img
                    src={favorito.anime_detalhes.capa}
                    alt={favorito.anime_detalhes.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link
                  href={
                    favorito.ultimo_episodio_id
                      ? `/animes/${favorito.anime_detalhes.id}/episodio/${favorito.ultimo_episodio_id}`
                      : `/animes/${favorito.anime_detalhes.id}`
                  }
                  className="text-white font-semibold text-lg hover:text-purple-400 transition-colors"
                >
                  {favorito.anime_detalhes.titulo}
                </Link>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <span className="text-gray-400 text-sm">
                    Status: <span className="text-white">{favorito.status}</span>
                  </span>
                  <span className="text-gray-400 text-sm">
                    Progresso: <span className="text-white">{favorito.progresso_episodios} episódios</span>
                  </span>
                </div>
                <div className="mt-3">
                  <RatingComponent
                    initialRating={favorito.avaliacao}
                    onRatingChange={(rating) => handleRatingChange(favorito.id, rating)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum anime nos favoritos</p>
        </div>
      )}
    </div>
  );
}

