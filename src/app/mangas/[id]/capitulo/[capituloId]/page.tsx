import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCapituloByIdServer, getCapitulosServer } from '@/lib/api-server';
import { ChapterReader } from '@/components/Manga/ChapterReader';

export default async function CapituloPage({
  params,
}: {
  params: Promise<{ id: string; capituloId: string }>;
}) {
  const { id, capituloId } = await params;
  const mangaId = parseInt(id);
  const currentCapituloId = parseInt(capituloId);

  if (isNaN(mangaId) || isNaN(currentCapituloId)) {
    notFound();
  }

  const [capitulo, capitulos] = await Promise.all([
    getCapituloByIdServer(currentCapituloId),
    getCapitulosServer(mangaId),
  ]);

  if (!capitulo) {
    notFound();
  }

  // Ordena por número e encontra anterior/próximo dentro do mesmo manga
  const capitulosDoManga = capitulos
    .filter((c) => c.manga === mangaId)
    .sort((a, b) => a.numero - b.numero);

  const indexAtual = capitulosDoManga.findIndex((c) => c.id === capitulo.id);
  const capituloAnterior = indexAtual > 0 ? capitulosDoManga[indexAtual - 1] : null;
  const proximoCapitulo =
    indexAtual >= 0 && indexAtual < capitulosDoManga.length - 1
      ? capitulosDoManga[indexAtual + 1]
      : null;

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {capitulo.manga_titulo} - Capítulo {capitulo.numero}
        </h1>
        <p className="text-gray-400 mb-6">{capitulo.titulo}</p>

        {/* Leitor de Mangas */}
        <ChapterReader capitulo={capitulo} capituloId={capitulo.id} />

        {/* Ações */}
        <div className="flex items-center gap-3 mt-6">
          <Link
            href={`/mangas/${mangaId}/capitulo/${capituloAnterior?.id ?? '#'}`}
            aria-disabled={!capituloAnterior}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              capituloAnterior ? '' : 'opacity-50 pointer-events-none'
            }`}
          >
            ← Capítulo anterior
          </Link>
          <Link
            href={`/mangas/${mangaId}`}
            className="px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-600 transition"
          >
            Página do manga
          </Link>
          <Link
            href={`/mangas/${mangaId}/capitulo/${proximoCapitulo?.id ?? '#'}`}
            aria-disabled={!proximoCapitulo}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              proximoCapitulo ? '' : 'opacity-50 pointer-events-none'
            }`}
          >
            Próximo capítulo →
          </Link>
        </div>

        {/* Meta */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {capitulo.sinopse && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-white font-semibold mb-2">Sinopse</h2>
                <p className="text-gray-300 leading-relaxed">{capitulo.sinopse}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-800 rounded-lg p-6 space-y-3">
            <div className="text-gray-300"><span className="text-gray-400">Páginas:</span> {capitulo.paginas}</div>
            <div className="text-gray-300"><span className="text-gray-400">Lançamento:</span> {new Date(capitulo.data_lancamento).toLocaleDateString()}</div>
            <div className="text-gray-300"><span className="text-gray-400">Visualizações:</span> {capitulo.visualizacoes}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
