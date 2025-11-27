'use client';

import { useState, useRef, useEffect } from 'react';
import type { Genero } from '@/types/anime';

interface GenreAutocompleteProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  generos: Genero[];
}

export function GenreAutocomplete({ selectedGenres = [], onGenreChange, generos }: GenreAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected genre names
  const selectedGenreNames = generos
    .filter(g => selectedGenres && selectedGenres.includes(g.slug))
    .map(g => g.nome);

  // Filter genres based on search term
  const filteredGeneros = generos.filter(
    genero =>
      genero.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(selectedGenres && selectedGenres.includes(genero.slug))
  );

  const handleSelect = (generoSlug: string) => {
    if (!selectedGenres || !selectedGenres.includes(generoSlug)) {
      onGenreChange([...(selectedGenres || []), generoSlug]);
    }
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (generoSlug: string) => {
    onGenreChange((selectedGenres || []).filter(s => s !== generoSlug));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <label htmlFor="genre-autocomplete" className="block text-sm font-medium text-gray-300 mb-2">
        Gêneros
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            id="genre-autocomplete"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Buscar gêneros..."
            className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Selected tags - fixed position below input */}
        {selectedGenreNames.length > 0 && (
          <div className="mt-2 max-h-20 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {selectedGenreNames.map((nome) => {
                const genero = generos.find(g => g.nome === nome);
                if (!genero) return null;
                return (
                  <span
                    key={genero.slug}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-md"
                  >
                    {nome}
                    <button
                      type="button"
                      onClick={() => handleRemove(genero.slug)}
                      className="hover:text-gray-200 focus:outline-none"
                      aria-label={`Remover ${nome}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Dropdown */}
        {isOpen && filteredGeneros.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredGeneros.map((genero) => (
              <button
                key={genero.id}
                type="button"
                onClick={() => handleSelect(genero.slug)}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors"
              >
                {genero.nome}
              </button>
            ))}
          </div>
        )}

        {isOpen && searchTerm && filteredGeneros.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="px-4 py-2 text-gray-400 text-sm">
              Nenhum gênero encontrado
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

