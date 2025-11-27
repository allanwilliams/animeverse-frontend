'use client';

import { useState } from 'react';
import { getImageUrl } from '@/utils/helpers';
import type { Capitulo } from '@/types/manga';

interface MangaReaderProps {
  capitulo: Capitulo;
}

export function MangaReader({ capitulo }: MangaReaderProps) {
  const [widthPercentage, setWidthPercentage] = useState(100);

  if (!capitulo.paginas_list || capitulo.paginas_list.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-black rounded-lg">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">📖 Leitor de Mangas</p>
          <p className="text-sm">Nenhuma página disponível</p>
          {capitulo.paginas > 0 && (
            <p className="text-sm mt-2">Capítulo tem {capitulo.paginas} página(s) cadastrada(s)</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {/* Controle de Largura */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-medium min-w-[100px]">
            Largura: {widthPercentage}%
          </span>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={widthPercentage}
            onChange={(e) => setWidthPercentage(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            style={{
              background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${widthPercentage}%, rgb(55, 65, 81) ${widthPercentage}%, rgb(55, 65, 81) 100%)`
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWidthPercentage(50)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
            >
              50%
            </button>
            <button
              onClick={() => setWidthPercentage(75)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
            >
              75%
            </button>
            <button
              onClick={() => setWidthPercentage(100)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* Páginas */}
      <div className="space-y-4 p-4" style={{ maxWidth: `${widthPercentage}%`, margin: '0 auto' }}>
        {capitulo.paginas_list.map((pagina) => (
          <div key={pagina.id} className="w-full flex justify-center">
            {getImageUrl(pagina.imagem) ? (
              <img
                src={getImageUrl(pagina.imagem)}
                alt={`${capitulo.titulo} - Página ${pagina.numero}`}
                className="max-w-full h-auto rounded-lg shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-full max-w-md h-96 bg-gray-700 flex items-center justify-center rounded-lg shadow-lg">
                <div className="text-center text-gray-400">
                  <span className="text-6xl block mb-2">📄</span>
                  <p>Página {pagina.numero}</p>
                  <p className="text-sm">Imagem não disponível</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

