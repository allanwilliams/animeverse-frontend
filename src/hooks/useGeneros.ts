import { useState, useEffect } from 'react';
import { generoService } from '@/services/generoService';
import type { Genero } from '@/types/anime';

export function useGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        setLoading(true);
        const result = await generoService.getGeneros();
        setGeneros(result);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar gêneros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneros();
  }, []);

  return { generos, loading, error };
}

