'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChapterReader } from '@/components/Manga/ChapterReader';
import { getDistinctProvedorIds } from '@/utils/mangaProvedores';
import type { Capitulo } from '@/types/manga';

type CapituloReaderSectionProps = {
  capitulo: Capitulo;
};

export function CapituloReaderSection({ capitulo }: CapituloReaderSectionProps) {
  const provedorIds = useMemo(() => getDistinctProvedorIds(capitulo), [capitulo]);

  const [provedorSelecionadoId, setProvedorSelecionadoId] = useState<number | null>(() =>
    provedorIds.length > 1 ? provedorIds[0] : null
  );

  useEffect(() => {
    if (provedorIds.length > 1) {
      setProvedorSelecionadoId((prev) =>
        prev != null && provedorIds.includes(prev) ? prev : provedorIds[0]
      );
    } else {
      setProvedorSelecionadoId(null);
    }
  }, [capitulo.id, provedorIds]);

  const tituloCompleto =
    !capitulo.titulo.toLowerCase().includes('capítulo') ? ` - ${capitulo.titulo}` : '';

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {capitulo.manga_titulo} - Capítulo {capitulo.numero}
          {tituloCompleto}
        </h1>
        <span className="inline-flex items-center gap-1 text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
          <span aria-hidden>👁️</span>
          <span>{Number(capitulo.visualizacoes ?? 0).toLocaleString('pt-BR')}</span>
        </span>
        {provedorIds.length > 1 && provedorSelecionadoId != null && (
          <label className="inline-flex items-center gap-2 text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
            <span className="sr-only">Servidor de leitura</span>
            <select
              className="bg-transparent text-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md py-0.5 pr-6 pl-1 max-w-[11rem]"
              value={provedorSelecionadoId}
              onChange={(e) => setProvedorSelecionadoId(Number(e.target.value))}
            >
              {provedorIds.map((id, idx) => (
                <option key={id} value={id} className="bg-gray-900 text-gray-100">
                  Servidor {idx + 1}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <ChapterReader
        capitulo={capitulo}
        capituloId={capitulo.id}
        provedorSelecionadoId={provedorIds.length > 1 ? provedorSelecionadoId : null}
      />
    </>
  );
}
