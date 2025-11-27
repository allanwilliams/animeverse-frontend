'use client';

import { AnimeCard } from './AnimeCard';
import type { Anime } from '@/types/anime';

interface AnimeGridProps {
  animes: Anime[];
  emptyMessage?: string;
  ultimoEpisodioMap?: Record<number, number | null>;
}

export function AnimeGrid({ animes, emptyMessage = 'Nenhum anime encontrado', ultimoEpisodioMap }: AnimeGridProps) {
  if (animes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
      {animes.map((anime) => {
        const ultimoEpisodioId = ultimoEpisodioMap?.[anime.id];
        return (
          <AnimeCard 
            key={anime.id} 
            anime={anime} 
            ultimoEpisodioId={ultimoEpisodioId}
          />
        );
      })}
    </div>
  );
}

