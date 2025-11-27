'use client';

import { useGeneros } from '@/hooks/useGeneros';
import { GenreBadge } from '../Anime/GenreBadge';

interface GenreFilterProps {
  selectedGenre?: string;
  onGenreChange: (genre: string) => void;
}

export function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const { generos, loading } = useGeneros();

  if (loading) {
    return <div className="text-gray-400">Carregando gêneros...</div>;
  }

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Gêneros</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onGenreChange('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !selectedGenre
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        {(generos ?? []).map((genero) => (
          <button
            key={genero.id}
            onClick={() => onGenreChange(genero.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedGenre === genero.slug
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {genero.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

