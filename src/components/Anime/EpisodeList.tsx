'use client';

import Image from 'next/image';
import type { Episodio } from '@/types/anime';
import { Card } from '../Common/Card';
import Link from 'next/link';
import { getImageUrl } from '@/utils/helpers';

interface EpisodeListProps {
  episodios: Episodio[];
}

export function EpisodeList({ episodios }: EpisodeListProps) {
  if (episodios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhum episódio disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {episodios.map((episodio) => (
        <Card key={episodio.id} padding="md" hover>
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="w-32 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-700">
              {getImageUrl(episodio.thumbnail) ? (
                <Image
                  src={getImageUrl(episodio.thumbnail)!}
                  alt={episodio.titulo}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">📺</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/animes/${episodio.anime}/episodio/${episodio.id}`} className="group">
                    <span className="text-purple-400 font-semibold group-hover:underline">
                      {episodio.temporada_numero > 1 ? (
                        <>Temporada {episodio.temporada_numero} - Episódio {episodio.numero}</>
                      ) : (
                        <>Episódio {episodio.numero}</>
                      )}
                    </span>
                  </Link>
                </div>
                <span className="text-gray-400 text-sm">{episodio.duracao} min</span>
              </div>
              
              {episodio.sinopse && (
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {episodio.sinopse}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{episodio.visualizacoes} visualizações</span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

