'use client';

import { MangaDetails } from '@/components/Manga/MangaDetails';
import { ChapterList } from '@/components/Manga/ChapterList';
import type { Manga, Capitulo } from '@/types/manga';

interface MangaDetailsClientProps {
  manga: Manga;
  mangaId: number;
  capitulos: Capitulo[];
}

export function MangaDetailsClient({ manga, mangaId, capitulos }: MangaDetailsClientProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <MangaDetails manga={manga} />

      {/* Capítulos */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6">
          📖 Capítulos ({capitulos.length})
        </h2>
        <ChapterList capitulos={capitulos} />
      </section>
    </div>
  );
}

