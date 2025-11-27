'use client';

import { MangaCard } from './MangaCard';
import type { Manga } from '@/types/manga';

interface MangaGridProps {
  mangas: Manga[];
  emptyMessage?: string;
}

export function MangaGrid({ mangas, emptyMessage = 'Nenhum manga encontrado' }: MangaGridProps) {
  if (mangas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
      {mangas.map((manga) => (
        <MangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
}

