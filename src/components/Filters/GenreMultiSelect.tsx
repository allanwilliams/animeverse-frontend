'use client';

import { useGeneros } from '@/hooks/useGeneros';

interface GenreMultiSelectProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
}

export function GenreMultiSelect({ selectedGenres, onGenreChange }: GenreMultiSelectProps) {
  const { generos, loading } = useGeneros();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    onGenreChange(values);
  };

  if (loading) {
    return (
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gêneros
        </label>
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label htmlFor="genre-select" className="block text-sm font-medium text-gray-300 mb-2">
        Gêneros
      </label>
      <select
        id="genre-select"
        multiple
        value={selectedGenres}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        size={4}
      >
        {(generos ?? []).map((genero) => (
          <option key={genero.id} value={genero.slug} className="bg-gray-800 text-white">
            {genero.nome}
          </option>
        ))}
      </select>
      {selectedGenres.length > 0 && (
        <div className="mt-1 text-xs text-gray-400">
          {selectedGenres.length} selecionado(s)
        </div>
      )}
    </div>
  );
}

