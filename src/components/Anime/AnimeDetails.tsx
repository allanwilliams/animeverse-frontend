'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { GenreBadge } from './GenreBadge';
import { Button } from '../Common/Button';
import { RatingComponent } from '../Common/RatingComponent';
import { useAuth } from '@/hooks/useAuth';
import { animeService } from '@/services/animeService';
import type { Anime } from '@/types/anime';
import { getImageUrl } from '@/utils/helpers';

interface AnimeDetailsProps {
  anime: Anime;
}

export function AnimeDetails({ anime }: AnimeDetailsProps) {
  const { isAuthenticated, user } = useAuth();
  const [isFavorito, setIsFavorito] = useState(anime.is_favorito === true);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const averageRating = Number(anime.rating_medio ?? 0);
  const displayAverageRating = Number.isFinite(averageRating) && averageRating > 0
    ? averageRating.toFixed(1)
    : '0';
  const totalVisualizacoes = Number(anime.total_visualizacoes ?? 0);

  // Atualizar estado quando anime.is_favorito mudar
  useEffect(() => {
    setIsFavorito(anime.is_favorito === true);
  }, [anime.is_favorito]);

  useEffect(() => {
    let active = true;

    const loadCurrentUserRating = async () => {
      if (!isAuthenticated || !user) {
        setUserRating(null);
        return;
      }

      try {
        const reviews = await animeService.getReviews(anime.id);
        const reviewDoUsuario = reviews.find((review) => {
          // Preferir match por id quando disponível; fallback por username.
          const sameUserId =
            typeof (user as any).id === 'number' &&
            review.usuario === (user as any).id;
          const sameUsername =
            typeof (user as any).username === 'string' &&
            review.usuario_nome === (user as any).username;

          return sameUserId || sameUsername;
        });

        if (active) {
          setUserRating(reviewDoUsuario?.rating ?? null);
        }
      } catch (error) {
        if (active) {
          setUserRating(null);
        }
        console.error('Erro ao carregar avaliação atual do usuário:', error);
      }
    };

    loadCurrentUserRating();

    return () => {
      active = false;
    };
  }, [anime.id, isAuthenticated, user]);

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
      await animeService.avaliarAnime(anime.id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Erro ao avaliar anime:', error);
      alert('Erro ao salvar avaliação');
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
          <div className="w-full md:w-52 lg:w-50 flex-shrink-0">
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

                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
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

            {/* Avaliações */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-semibold">Avaliação média:</span>
                <span className="text-gray-300">
                  {displayAverageRating}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">👁️</span>
                <span className="text-gray-300">
                  {totalVisualizacoes.toLocaleString('pt-BR')}
                </span>
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

          </div>
        </div>
      </div>
    </div>
  );
}

