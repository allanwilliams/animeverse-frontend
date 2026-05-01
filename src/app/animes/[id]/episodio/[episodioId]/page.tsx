import { notFound } from 'next/navigation';
import Link from 'next/link';
import { animeService } from '@/services/animeService';
import { EpisodePlayer } from '@/components/Anime/EpisodePlayer';

export default async function EpisodioPage({
  params,
}: {
  params: Promise<{ id: string; episodioId: string }>;
}) {
  const { id, episodioId } = await params;
  const animeId = parseInt(id);
  const currentEpisodeId = parseInt(episodioId);

  if (isNaN(animeId) || isNaN(currentEpisodeId)) {
    notFound();
  }

  let episodio;
  let episodios = [] as Awaited<ReturnType<typeof animeService.getEpisodios>>;
  try {
    [episodio, episodios] = await Promise.all([
      animeService.getEpisodioById(currentEpisodeId),
      animeService.getEpisodios(animeId),
    ]);
  } catch (error) {
    console.error('Erro ao carregar episódio:', error);
    notFound();
  }

  // Ordena por temporada -> número e encontra anterior/próximo dentro do mesmo anime
  const episodiosDoAnime = episodios
    .filter((e) => e.anime === animeId)
    .sort((a, b) => {
      const temporadaA = a.temporada_numero ?? 1;
      const temporadaB = b.temporada_numero ?? 1;

      if (temporadaA !== temporadaB) {
        return temporadaA - temporadaB;
      }

      if (a.numero !== b.numero) {
        return a.numero - b.numero;
      }

      // desempate estável para evitar ordem inconsistente
      return a.id - b.id;
    });

  const indexAtual = episodiosDoAnime.findIndex((e) => e.id === episodio.id);
  const episodioAnterior = indexAtual > 0 ? episodiosDoAnime[indexAtual - 1] : null;
  const proximoEpisodio =
    indexAtual >= 0 && indexAtual < episodiosDoAnime.length - 1
      ? episodiosDoAnime[indexAtual + 1]
      : null;

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {episodio.anime_titulo} - Episódio {episodio.numero}
          </h1>
          <span className="inline-flex items-center gap-1 text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
            <span>👁️</span>
            <span>{Number(episodio.total_visualizacoes ?? 0).toLocaleString('pt-BR')}</span>
          </span>
        </div>

        {/* Player */}
        <EpisodePlayer episodioId={episodio.id} episodio={episodio} />

        {/* Ações */}
        <div className="flex items-center gap-3 mt-6">
          <Link
            href={`/animes/${animeId}/episodio/${episodioAnterior?.id ?? '#'}`}
            aria-disabled={!episodioAnterior}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              episodioAnterior ? '' : 'opacity-50 pointer-events-none'
            }`}
          >
            ← Episódio anterior
          </Link>
          <Link
            href={`/animes/${animeId}`}
            className="px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-600 transition"
          >
            Página do anime
          </Link>
          <Link
            href={`/animes/${animeId}/episodio/${proximoEpisodio?.id ?? '#'}`}
            aria-disabled={!proximoEpisodio}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              proximoEpisodio ? '' : 'opacity-50 pointer-events-none'
            }`}
          >
            Próximo episódio →
          </Link>
        </div>

        {episodio.sinopse && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-2">Sinopse</h2>
            <p className="text-gray-300 leading-relaxed">{episodio.sinopse}</p>
          </div>
        )}
      </section>
    </div>
  );
}


