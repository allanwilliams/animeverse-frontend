'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { GenreBadge } from '../Anime/GenreBadge';
import { Button } from '../Common/Button';
import { useAuth } from '@/hooks/useAuth';
import { mangaService } from '@/services/mangaService';
import { RatingComponent } from '../Common/RatingComponent';
import type { Manga } from '@/types/manga';
import { getImageUrl } from '@/utils/helpers';

interface MangaDetailsProps {
  manga: Manga;
}

export function MangaDetails({ manga }: MangaDetailsProps) {
  const { isAuthenticated, user } = useAuth();
  const ratingSectionRef = useRef<HTMLDivElement | null>(null);
  const [isFavorito, setIsFavorito] = useState(manga.is_favorito === true);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const averageRating = Number(manga.rating_medio ?? 0);
  const displayAverageRating = Number.isFinite(averageRating) && averageRating > 0
    ? averageRating.toFixed(1)
    : '0';
  const totalVisualizacoes = Number(manga.total_visualizacoes ?? 0);

  // Atualizar estado quando manga.is_favorito mudar
  useEffect(() => {
    setIsFavorito(manga.is_favorito === true);
  }, [manga.is_favorito]);

  useEffect(() => {
    let active = true;

    const loadCurrentUserRating = async () => {
      if (!isAuthenticated || !user) {
        setUserRating(null);
        return;
      }

      try {
        const reviews = await mangaService.getReviews(manga.id);
        const reviewDoUsuario = reviews.find((review) => {
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
        console.error('Erro ao carregar avaliação atual do usuário (manga):', error);
      }
    };

    loadCurrentUserRating();

    return () => {
      active = false;
    };
  }, [manga.id, isAuthenticated, user]);

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

  const handleGoToRating = () => {
    ratingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          <div className="w-full md:w-52 lg:w-50 flex-shrink-0">
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
                  className="w-full mt-4 text-sm whitespace-nowrap"
                  variant={isFavorito ? 'secondary' : 'primary'}
                  onClick={handleFavoritar}
                  isLoading={isLoading}
                >
                  {isFavorito ? '❤️ Nos favoritos' : '🤍 Favoritar'}
                </Button>

                {/* Rating */}
                <div ref={ratingSectionRef} className="mt-4 p-4 bg-gray-800 rounded-lg">
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

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">
                  {displayAverageRating}
                </span>
                <span className="text-gray-400 text-sm">
                  ({Number(manga.total_avaliacoes ?? 0).toLocaleString('pt-BR')} avaliações)
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300">👁️</span>
                <span className="text-gray-400 text-sm">
                  {totalVisualizacoes.toLocaleString('pt-BR')}
                </span>
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

          </div>
        </div>
      </div>
    </div>
  );
}

