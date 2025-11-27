'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { GenreBadge } from '../Anime/GenreBadge';
import { Button } from '../Common/Button';
import { useAuth } from '@/hooks/useAuth';
import { mangaService } from '@/services/mangaService';
import { RatingComponent } from '../Common/RatingComponent';
import type { Manga } from '@/types/manga';
import { MANGA_STATUS_LABELS } from '@/utils/constants';
import { formatDate, getImageUrl } from '@/utils/helpers';

interface MangaDetailsProps {
  manga: Manga;
}

export function MangaDetails({ manga }: MangaDetailsProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorito, setIsFavorito] = useState(manga.is_favorito === true);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Atualizar estado quando manga.is_favorito mudar
  useEffect(() => {
    setIsFavorito(manga.is_favorito === true);
  }, [manga.is_favorito]);

  const handleFavoritar = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para favoritar mangas');
      return;
    }

    try {
      setIsLoading(true);
      const result = await mangaService.favoritarManga(manga.id);
      setIsFavorito(result.favorito);
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      alert('Erro ao favoritar manga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para avaliar mangas');
      return;
    }

    try {
      setRatingLoading(true);
      await mangaService.avaliarManga(manga.id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Erro ao avaliar manga:', error);
      alert('Erro ao avaliar manga');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      {getImageUrl(manga.banner) && (
        <div className="absolute inset-x-0 top-0 h-96 overflow-hidden">
          <Image
            src={getImageUrl(manga.banner)!}
            alt={manga.titulo}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
        </div>
      )}

      <div className="relative container mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Capa */}
          <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
              {getImageUrl(manga.capa) ? (
                <Image
                  src={getImageUrl(manga.capa)!}
                  alt={manga.titulo}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
              )}
            </div>

            {/* Botão Favoritar */}
            {isAuthenticated && (
              <>
                <Button
                  className="w-full mt-4"
                  variant={isFavorito ? 'secondary' : 'primary'}
                  onClick={handleFavoritar}
                  isLoading={isLoading}
                >
                  {isFavorito ? '❤️ Nos Favoritos' : '🤍 Adicionar aos Favoritos'}
                </Button>
                
                {/* Rating */}
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-white font-semibold mb-2 text-sm">Sua Avaliação</h3>
                  <RatingComponent
                    initialRating={userRating}
                    onRatingChange={handleRatingChange}
                    size="sm"
                    showLabel
                  />
                </div>
              </>
            )}
          </div>

          {/* Informações */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{manga.titulo}</h1>
            {manga.titulo_original && (
              <p className="text-xl text-gray-400 mb-4">{manga.titulo_original}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">
                  {manga.rating_medio > 0 ? manga.rating_medio.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-400 text-sm">
                  ({manga.total_avaliacoes} avaliações)
                </span>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-white">{MANGA_STATUS_LABELS[manga.status]}</span>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-white">{manga.capitulos_totais} capítulos</span>
              </div>
            </div>

            {/* Gêneros */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Gêneros</h3>
              <div className="flex flex-wrap gap-2">
                {manga.generos.map((genero) => (
                  <GenreBadge key={genero.id} genero={genero} />
                ))}
              </div>
            </div>

            {/* Sinopse */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Sinopse</h3>
              <p className="text-gray-300 leading-relaxed">{manga.sinopse}</p>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg">
              <div>
                <span className="text-gray-400">Editora:</span>
                <span className="text-white ml-2">{manga.editora || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Data de Lançamento:</span>
                <span className="text-white ml-2">{formatDate(manga.data_lancamento)}</span>
              </div>
              <div>
                <span className="text-gray-400">Páginas por Capítulo:</span>
                <span className="text-white ml-2">{manga.paginas_por_capitulo} páginas</span>
              </div>
              <div>
                <span className="text-gray-400">Total de Capítulos:</span>
                <span className="text-white ml-2">
                  {manga.total_capitulos || manga.capitulos_totais || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

