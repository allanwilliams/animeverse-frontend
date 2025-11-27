'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GenreBadge } from '../Anime/GenreBadge';
import type { Manga } from '@/types/manga';
import { MANGA_STATUS_LABELS } from '@/utils/constants';
import { getImageUrl } from '@/utils/helpers';

interface MangaCardProps {
  manga: Manga;
}

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/mangas/${manga.id}`} className="block h-full">
      <div className="group relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col h-full">
        <div className="aspect-[2/3] relative flex-shrink-0">
          {getImageUrl(manga.capa) ? (
            <Image
              src={getImageUrl(manga.capa)!}
              alt={manga.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-bold text-sm">
                {manga.rating_medio > 0 ? manga.rating_medio.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow min-h-[120px]">
          <h3 className="font-bold text-white text-lg truncate mb-2">
            {manga.titulo}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 whitespace-nowrap">
              {MANGA_STATUS_LABELS[manga.status]}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {manga.capitulos_totais || 0} caps
            </span>
          </div>

          <div className="flex flex-wrap gap-1 min-h-[24px] max-h-[48px] overflow-hidden items-start">
            {manga.generos.slice(0, 3).map((genero) => (
              <GenreBadge key={genero.id} genero={genero} />
            ))}
            {manga.generos.length > 3 && (
              <span className="text-xs text-gray-400 leading-6">+{manga.generos.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

