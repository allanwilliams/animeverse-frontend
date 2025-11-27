'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { GenreBadge } from './GenreBadge';
import { Button } from '../Common/Button';
import { useAuth } from '@/hooks/useAuth';
import { animeService } from '@/services/animeService';
import { RatingComponent } from '../Common/RatingComponent';
import type { Anime } from '@/types/anime';
import { STATUS_LABELS } from '@/utils/constants';
import { formatDate, getImageUrl } from '@/utils/helpers';

interface AnimeDetailsProps {
  anime: Anime;
}

export function AnimeDetails({ anime }: AnimeDetailsProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorito, setIsFavorito] = useState(anime.is_favorito === true);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Atualizar estado quando anime.is_favorito mudar
  useEffect(() => {
    setIsFavorito(anime.is_favorito === true);
  }, [anime.is_favorito]);

  const handleFavoritar = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para favoritar animes');
      return;
    }

    try {
      setIsLoading(true);
      const result = await animeService.favoritarAnime(anime.id);
      setIsFavorito(result.favorito);
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      alert('Erro ao favoritar anime');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para avaliar animes');
      return;
    }

    try {
      setRatingLoading(true);
      await animeService.avaliarAnime(anime.id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Erro ao avaliar anime:', error);
      alert('Erro ao avaliar anime');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      {getImageUrl(anime.banner) && (
        <div className="absolute inset-x-0 top-0 h-96 overflow-hidden">
          <Image
            src={getImageUrl(anime.banner)!}
            alt={anime.titulo}
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
              {getImageUrl(anime.capa) ? (
                <Image
                  src={getImageUrl(anime.capa)!}
                  alt={anime.titulo}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
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
            <h1 className="text-4xl font-bold text-white mb-2">{anime.titulo}</h1>
            {anime.titulo_original && (
              <p className="text-xl text-gray-400 mb-4">{anime.titulo_original}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">
                  {anime.rating_medio > 0 ? anime.rating_medio.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-400 text-sm">
                  ({anime.total_avaliacoes} avaliações)
                </span>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-white">{STATUS_LABELS[anime.status]}</span>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-white">{(anime.total_episodios ?? anime.episodios_totais) || 0} episódios</span>
              </div>
            </div>

            {/* Gêneros */}
            {anime.generos && anime.generos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Gêneros</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.generos.map((genero) => (
                    <GenreBadge key={genero.id} genero={genero} />
                  ))}
                </div>
              </div>
            )}

            {/* Sinopse */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Sinopse</h3>
              <p className="text-gray-300 leading-relaxed">{anime.sinopse}</p>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg">
              <div>
                <span className="text-gray-400">Estúdio:</span>
                <span className="text-white ml-2">{anime.estudio || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Data de Lançamento:</span>
                <span className="text-white ml-2">{formatDate(anime.data_lancamento)}</span>
              </div>
              <div>
                <span className="text-gray-400">Duração por Episódio:</span>
                <span className="text-white ml-2">{anime.duracao_episodio} minutos</span>
              </div>
              <div>
                <span className="text-gray-400">Total de Episódios:</span>
                <span className="text-white ml-2">
                  {anime.total_episodios || anime.episodios_totais || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

