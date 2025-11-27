'use client';

import Image from 'next/image';
import type { Capitulo } from '@/types/manga';
import { Card } from '../Common/Card';
import Link from 'next/link';
import { getImageUrl } from '@/utils/helpers';

interface ChapterListProps {
  capitulos: Capitulo[];
}

export function ChapterList({ capitulos }: ChapterListProps) {
  if (capitulos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhum capítulo disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {capitulos.map((capitulo) => (
        <Card key={capitulo.id} padding="md" hover>
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="w-32 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-700">
              {getImageUrl(capitulo.thumbnail) ? (
                <Image
                  src={getImageUrl(capitulo.thumbnail)!}
                  alt={capitulo.titulo}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/mangas/${capitulo.manga}/capitulo/${capitulo.id}`} className="group">
                    <span className="text-purple-400 font-semibold group-hover:underline">
                      Capítulo {capitulo.numero}
                    </span>
                    <h4 className="text-white font-semibold text-lg mt-1 group-hover:underline">
                      {capitulo.titulo}
                    </h4>
                  </Link>
                </div>
                <span className="text-gray-400 text-sm">{capitulo.paginas} págs</span>
              </div>
              
              {capitulo.sinopse && (
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {capitulo.sinopse}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>👁️ {capitulo.visualizacoes} visualizações</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

