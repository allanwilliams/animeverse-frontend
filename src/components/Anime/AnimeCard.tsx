'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GenreBadge } from './GenreBadge';
import type { Anime } from '@/types/anime';
import { getImageUrl } from '@/utils/helpers';

interface AnimeCardProps {
  anime: Anime;
  ultimoEpisodioId?: number | null;
}

export function AnimeCard({ anime, ultimoEpisodioId }: AnimeCardProps) {
  // Se houver último episódio visualizado, navega para ele, senão vai para a página do anime
  const href = ultimoEpisodioId && ultimoEpisodioId > 0
    ? `/animes/${anime.id}/episodio/${ultimoEpisodioId}`
    : `/animes/${anime.id}`;
  const averageRating = Number(anime.rating_medio ?? 0);
  const displayAverageRating = Number.isFinite(averageRating) && averageRating > 0
    ? averageRating.toFixed(1)
    : '0';
  const totalVisualizacoes = Number(anime.total_visualizacoes ?? 0);

  return (
    <Link href={href} className="block h-full">
      <div className="group relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col h-full">
        <div className="aspect-[2/3] relative flex-shrink-0">
          {getImageUrl(anime.capa) ? (
            <Image
              src={getImageUrl(anime.capa)!}
              alt={anime.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-bold text-sm">
                {displayAverageRating}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1.5">
          <h3 className="font-bold text-white text-base truncate">
            {anime.titulo}
          </h3>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>👁️</span>
            <span>{totalVisualizacoes.toLocaleString('pt-BR')}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 overflow-hidden items-start">
            {anime.generos.slice(0, 2).map((genero) => (
              <GenreBadge key={genero.id} genero={genero} />
            ))}
            {anime.generos.length > 2 && (
              <span className="text-xs text-gray-400 leading-5">+{anime.generos.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

