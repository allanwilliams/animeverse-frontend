'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RatingComponent } from '../Common/RatingComponent';
import { mangaService } from '@/services/mangaService';
import type { FavoritoManga } from '@/types/manga';
import { useAuth } from '@/hooks/useAuth';

interface MeusMangasProps {
  favoritos: FavoritoManga[];
  onRatingUpdate?: () => void;
}

export function MeusMangas({ favoritos, onRatingUpdate }: MeusMangasProps) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const handleRatingChange = async (favoritoMangaId: number, rating: number) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading({ ...loading, [favoritoMangaId]: true });
      await mangaService.atualizarRatingManga(favoritoMangaId, rating);
      onRatingUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar rating:', error);
    } finally {
      setLoading({ ...loading, [favoritoMangaId]: false });
    }
  };

  return (
    <div>
      {/* Lista */}
      {favoritos.length > 0 ? (
        <div className="space-y-4">
          {favoritos.map((favorito) => {
            // Se houver último capítulo lido, navega para ele, senão vai para a página do manga
            const mangaHref = favorito.ultimo_capitulo_id
              ? `/mangas/${favorito.manga_detalhes.id}/capitulo/${favorito.ultimo_capitulo_id}`
              : `/mangas/${favorito.manga_detalhes.id}`;

            return (
              <div
                key={favorito.id}
                className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4"
              >
                <Link
                  href={mangaHref}
                  className="flex-shrink-0 w-full md:w-32 aspect-[2/3] relative rounded overflow-hidden"
                >
                  {favorito.manga_detalhes.capa ? (
                    <img
                      src={favorito.manga_detalhes.capa}
                      alt={favorito.manga_detalhes.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link
                    href={mangaHref}
                    className="text-white font-semibold text-lg hover:text-purple-400 transition-colors"
                  >
                    {favorito.manga_detalhes.titulo}
                  </Link>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <span className="text-gray-400 text-sm">
                    Status: <span className="text-white">{favorito.status}</span>
                  </span>
                  <span className="text-gray-400 text-sm">
                    Progresso: <span className="text-white">{favorito.progresso_capitulos} capítulos</span>
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
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum manga nos favoritos</p>
        </div>
      )}
    </div>
  );
}

