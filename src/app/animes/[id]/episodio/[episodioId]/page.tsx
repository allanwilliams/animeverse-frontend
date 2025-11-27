import { notFound } from 'next/navigation';
import Link from 'next/link';
import { animeService } from '@/services/animeService';
import { getImageUrl } from '@/utils/helpers';
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

  // Ordena por número e encontra anterior/próximo dentro do mesmo anime
  const episodiosDoAnime = episodios
    .filter((e) => e.anime === animeId)
    .sort((a, b) => a.numero - b.numero);

  const indexAtual = episodiosDoAnime.findIndex((e) => e.id === episodio.id);
  const episodioAnterior = indexAtual > 0 ? episodiosDoAnime[indexAtual - 1] : null;
  const proximoEpisodio =
    indexAtual >= 0 && indexAtual < episodiosDoAnime.length - 1
      ? episodiosDoAnime[indexAtual + 1]
      : null;

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {episodio.anime_titulo} - Episódio {episodio.numero}
        </h1>
        <p className="text-gray-400 mb-6">{episodio.titulo}</p>

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

        {/* Meta */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {episodio.sinopse && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-white font-semibold mb-2">Sinopse</h2>
                <p className="text-gray-300 leading-relaxed">{episodio.sinopse}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-800 rounded-lg p-6 space-y-3">
            <div className="text-gray-300"><span className="text-gray-400">Duração:</span> {episodio.duracao} min</div>
            <div className="text-gray-300"><span className="text-gray-400">Lançamento:</span> {new Date(episodio.data_lancamento).toLocaleDateString()}</div>
            <div className="text-gray-300"><span className="text-gray-400">Visualizações:</span> {episodio.visualizacoes}</div>
          </div>
        </div>
      </section>
    </div>
  );
}


