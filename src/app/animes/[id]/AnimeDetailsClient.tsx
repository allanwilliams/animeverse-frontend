'use client';

import { AnimeDetails } from '@/components/Anime/AnimeDetails';
import { EpisodeList } from '@/components/Anime/EpisodeList';
import { SeasonList } from '@/components/Anime/SeasonList';
import type { Anime } from '@/types/anime';

interface AnimeDetailsClientProps {
  anime: Anime;
  animeId: number;
}

export function AnimeDetailsClient({ anime, animeId }: AnimeDetailsClientProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AnimeDetails anime={anime} />

      {/* Temporadas e Episódios */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6">Temporadas e Episódios</h2>
        {anime.temporadas && anime.temporadas.length > 0 ? (
          <>
            <SeasonList temporadas={anime.temporadas} animeId={animeId} />
            {anime.episodios_sem_temporada && anime.episodios_sem_temporada.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">Episódios Sem Temporada</h3>
                <EpisodeList episodios={anime.episodios_sem_temporada} />
              </div>
            )}
          </>
        ) : anime.episodios && anime.episodios.length > 0 ? (
          <EpisodeList episodios={anime.episodios} />
        ) : (
          <p className="text-gray-400">Nenhum episódio disponível</p>
        )}
      </section>
    </div>
  );
}

