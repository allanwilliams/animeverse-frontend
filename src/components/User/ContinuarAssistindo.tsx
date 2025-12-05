'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ContinuarAssistindo as ContinuarAssistindoType } from '@/types/user';
import { getImageUrl } from '@/utils/helpers';
import { Card } from '../Common/Card';

interface ContinuarAssistindoProps {
  items: ContinuarAssistindoType[];
  emptyMessage?: string;
}

export function ContinuarAssistindo({ items, emptyMessage = 'Nenhum anime em andamento' }: ContinuarAssistindoProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Link
          key={item.anime.id}
          href={`/animes/${item.anime.id}/episodio/${item.ultimo_episodio_id}`}
          className="group"
        >
          <Card padding="none" hover>
            <div className="aspect-[2/3] relative overflow-hidden">
              {getImageUrl(item.anime.capa) ? (
                <Image
                  src={getImageUrl(item.anime.capa)!}
                  alt={item.anime.titulo}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                  <span className="text-4xl">📺</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Badge de Progresso */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-center">
                  <span className="text-white text-xs font-semibold">
                    {item.temporada_numero && item.temporada_numero > 1
                      ? `S${item.temporada_numero}E${item.ultimo_episodio_numero}`
                      : `Ep. ${item.ultimo_episodio_numero}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-white font-semibold text-sm truncate mb-1">
                {item.anime.titulo}
              </h3>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${item.progresso_porcentagem}%` }}
                />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

