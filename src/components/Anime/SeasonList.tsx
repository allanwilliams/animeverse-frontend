'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Temporada, Episodio } from '@/types/anime';
import { Card } from '../Common/Card';
import Link from 'next/link';
import { getImageUrl } from '@/utils/helpers';
import { animeService } from '@/services/animeService';

interface SeasonListProps {
  temporadas: Temporada[];
  animeId: number;
}

export function SeasonList({ temporadas, animeId }: SeasonListProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
  const [episodiosBySeason, setEpisodiosBySeason] = useState<Record<number, Episodio[]>>({});
  const [loadingSeasons, setLoadingSeasons] = useState<Set<number>>(new Set());

  const toggleSeason = async (temporadaId: number) => {
    if (expandedSeasons.has(temporadaId)) {
      // Collapse
      const newExpanded = new Set(expandedSeasons);
      newExpanded.delete(temporadaId);
      setExpandedSeasons(newExpanded);
    } else {
      // Expand - Load episodes if not already loaded
      if (!episodiosBySeason[temporadaId]) {
        setLoadingSeasons(new Set([...loadingSeasons, temporadaId]));
        try {
          const episodios = await animeService.getEpisodiosPorTemporada(temporadaId);
          setEpisodiosBySeason({ ...episodiosBySeason, [temporadaId]: episodios });
        } catch (error) {
          console.error('Erro ao carregar episódios:', error);
        } finally {
          setLoadingSeasons((prev) => {
            const newSet = new Set(prev);
            newSet.delete(temporadaId);
            return newSet;
          });
        }
      }
      setExpandedSeasons(new Set([...expandedSeasons, temporadaId]));
    }
  };

  if (temporadas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhuma temporada disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {temporadas.map((temporada) => {
        const isExpanded = expandedSeasons.has(temporada.id);
        const episodios = episodiosBySeason[temporada.id] || [];
        const isLoading = loadingSeasons.has(temporada.id);

        return (
          <Card key={temporada.id} padding="md" hover>
            <div className="cursor-pointer" onClick={() => toggleSeason(temporada.id)}>
              <div className="flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-32 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-700">
                  {getImageUrl(temporada.thumbnail) ? (
                    <Image
                      src={getImageUrl(temporada.thumbnail)!}
                      alt={temporada.titulo || `Temporada ${temporada.numero}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {temporada.titulo || `Temporada ${temporada.numero}`}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {temporada.total_episodios || temporada.episodios_totais || 0} episódios
                      </p>
                      {temporada.descricao && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {temporada.descricao}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {isLoading ? (
                        <span>Carregando...</span>
                      ) : (
                        <span>{isExpanded ? '▼' : '▶'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes List */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Carregando episódios...</p>
                  </div>
                ) : episodios.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Nenhum episódio disponível</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {episodios.map((episodio) => (
                      <Link
                        key={episodio.id}
                        href={`/animes/${animeId}/episodio/${episodio.id}`}
                        className="block p-3 rounded bg-gray-800 hover:bg-gray-700 transition group"
                      >
                        <div className="flex gap-4 items-center">
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
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <span className="text-purple-400 font-semibold text-sm group-hover:underline">
                                Episódio {episodio.numero}
                              </span>
                              <h4 className="text-white font-medium mt-1 group-hover:underline">
                                {episodio.titulo}
                              </h4>
                              {episodio.sinopse && (
                                <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                  {episodio.sinopse}
                                </p>
                              )}
                              {episodio.data_lancamento && (
                                <p className="text-gray-500 text-xs mt-1">
                                  📅 {new Date(episodio.data_lancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-4">
                              <span className="text-gray-400 text-sm">{episodio.duracao} min</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

