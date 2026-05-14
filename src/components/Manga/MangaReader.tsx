'use client';

import { useState } from 'react';
import { getImageUrl } from '@/utils/helpers';
import { buildMangaCdnProxiedSrc, isMangaCdnProxiedSrc } from '@/utils/mangaImageProxy';
import { provedorIdDoLink } from '@/utils/mangaProvedores';
import type { Capitulo, LinkPagina, Pagina } from '@/types/manga';

interface MangaReaderProps {
  capitulo: Capitulo;
  provedorSelecionadoId?: number | null;
}

/**
 * Link a exibir para a página.
 * Com servidor escolhido: **somente** o link daquele provedor (sem fallback para outro).
 * Sem seleção: primeiro link ativo, senão o primeiro da lista.
 */
function linkPreferidoParaPagina(
  pagina: Pagina,
  provedorSelecionadoId: number | null
): LinkPagina | null {
  const lista = pagina.links;
  if (!lista?.length) {
    return null;
  }
  if (provedorSelecionadoId != null) {
    return (
      lista.find(
        (l) => provedorIdDoLink(l) === provedorSelecionadoId && l.url?.trim()
      ) ?? null
    );
  }
  const ativo = lista.find((l) => l.ativo);
  const escolhido = ativo ?? lista[0];
  return escolhido?.url?.trim() ? escolhido : null;
}

function refererDoLinkPreferido(link: LinkPagina | null): string | null {
  const d = link?.provedor_dominio?.trim();
  return d || null;
}

/**
 * URL da imagem + Referer. Com servidor selecionado, **não** usa `pagina_url` / `imagem`
 * (evita mostrar URL de outro provedor após trocar o servidor).
 */
function getPaginaSrcEReferer(
  pagina: Pagina,
  provedorSelecionadoId: number | null,
  fallbackRefererManga: string | null | undefined
): { rawSrc: string | null; referer: string | null | undefined } {
  const link = linkPreferidoParaPagina(pagina, provedorSelecionadoId);
  if (link?.url?.trim()) {
    return {
      rawSrc: link.url.trim(),
      referer: refererDoLinkPreferido(link) || fallbackRefererManga,
    };
  }
  if (provedorSelecionadoId != null) {
    return { rawSrc: null, referer: fallbackRefererManga };
  }
  const urlCompat =
    typeof pagina.pagina_url === 'string' && pagina.pagina_url.trim().length > 0
      ? pagina.pagina_url.trim()
      : null;
  if (urlCompat) {
    return { rawSrc: urlCompat, referer: fallbackRefererManga };
  }
  return {
    rawSrc: getImageUrl(pagina.imagem),
    referer: fallbackRefererManga,
  };
}

const LARGURA_MIN = 30;
const LARGURA_MAX = 100;

export function MangaReader({
  capitulo,
  provedorSelecionadoId = null,
}: MangaReaderProps) {
  const [widthPercentage, setWidthPercentage] = useState(100);
  /** % da trilha 0–100 alinhada ao polegar (min=30 no início, max=100 no fim) */
  const larguraTrilhaPercent =
    ((widthPercentage - LARGURA_MIN) / (LARGURA_MAX - LARGURA_MIN)) * 100;

  const paginasOrdenadas =
    capitulo.paginas_list && capitulo.paginas_list.length > 0
      ? [...capitulo.paginas_list].sort((a, b) => a.numero - b.numero)
      : [];

  const paginasParaExibir =
    provedorSelecionadoId != null
      ? paginasOrdenadas.filter(
          (p) => linkPreferidoParaPagina(p, provedorSelecionadoId) != null
        )
      : paginasOrdenadas;

  if (paginasOrdenadas.length === 0) {
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

  if (provedorSelecionadoId != null && paginasParaExibir.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-black rounded-lg">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">📖 Leitor de Mangas</p>
          <p className="text-sm">Nenhuma página disponível para este servidor</p>
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
            min={LARGURA_MIN}
            max={LARGURA_MAX}
            step="5"
            value={widthPercentage}
            onChange={(e) => setWidthPercentage(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            style={{
              background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${larguraTrilhaPercent}%, rgb(55, 65, 81) ${larguraTrilhaPercent}%, rgb(55, 65, 81) 100%)`,
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
        {paginasParaExibir.map((pagina) => {
          const { rawSrc, referer } = getPaginaSrcEReferer(
            pagina,
            provedorSelecionadoId,
            capitulo.provedor_imagem_referer
          );
          const src = buildMangaCdnProxiedSrc(rawSrc, referer);
          const proxied = isMangaCdnProxiedSrc(src);
          const imgKey = `${pagina.id}-${provedorSelecionadoId ?? 'default'}`;
          return (
            <div key={pagina.id} className="w-full flex justify-center">
              {src ? (
                <img
                  key={imgKey}
                  src={src}
                  alt={`${capitulo.titulo} - Página ${pagina.numero}`}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                  referrerPolicy={proxied ? undefined : 'no-referrer'}
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
          );
        })}
      </div>
    </div>
  );
}

