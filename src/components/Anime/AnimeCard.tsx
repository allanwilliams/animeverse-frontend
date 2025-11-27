'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GenreBadge } from './GenreBadge';
import type { Anime } from '@/types/anime';
import { STATUS_LABELS } from '@/utils/constants';
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
                {anime.rating_medio > 0 ? anime.rating_medio.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col flex-grow min-h-[100px]">
          <h3 className="font-bold text-white text-base truncate mb-1.5">
            {anime.titulo}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300 whitespace-nowrap">
              {STATUS_LABELS[anime.status]}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {(anime.total_episodios ?? anime.episodios_totais) || 0} eps
            </span>
          </div>

          <div className="flex flex-wrap gap-1 min-h-[20px] max-h-[40px] overflow-hidden items-start">
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

