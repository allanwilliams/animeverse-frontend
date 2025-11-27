'use client';

import { useFavoritos } from '@/contexts/FavoritosContext';
import { AnimeGrid } from './AnimeGrid';
import type { Anime } from '@/types/anime';

interface AnimeGridWithLastEpisodeProps {
  animes: Anime[];
  emptyMessage?: string;
}

export function AnimeGridWithLastEpisode({ animes, emptyMessage }: AnimeGridWithLastEpisodeProps) {
  const { ultimoEpisodioMap } = useFavoritos();

  return (
    <AnimeGrid 
      animes={animes} 
      emptyMessage={emptyMessage}
      ultimoEpisodioMap={ultimoEpisodioMap}
    />
  );
}

