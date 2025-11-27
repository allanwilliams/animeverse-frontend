import { useState, useEffect } from 'react';
import { animeService } from '@/services/animeService';
import type { Anime, AnimeList, AnimeFilters } from '@/types/anime';

export function useAnimes(filters?: AnimeFilters) {
  const [data, setData] = useState<AnimeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setLoading(true);
        const result = await animeService.getAnimes(filters);
        setData(result);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar animes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}

export function useAnime(id: number) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        const result = await animeService.getAnimeById(id);
        setAnime(result);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar anime');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnime();
    }
  }, [id]);

  return { anime, loading, error };
}

