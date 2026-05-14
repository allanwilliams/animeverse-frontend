import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCapituloByIdServer } from '@/lib/api-server';
import { CapituloReaderSection } from '@/components/Manga/CapituloReaderSection';

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

  const capitulo = await getCapituloByIdServer(currentCapituloId);

  if (!capitulo) {
    notFound();
  }

  const idAnterior = capitulo.capitulo_anterior_id ?? null;
  const idProximo = capitulo.capitulo_proximo_id ?? null;

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="container mx-auto px-4 py-8">
        {/* Título, visualizações, seletor de servidor (se >1 provedor), leitor */}
        <CapituloReaderSection key={currentCapituloId} capitulo={capitulo} />

        {/* Ações */}
        <div className="flex items-center gap-3 mt-6">
          <Link
            href={
              idAnterior
                ? `/mangas/${mangaId}/capitulo/${idAnterior}`
                : '#'
            }
            aria-disabled={!idAnterior}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              idAnterior ? '' : 'opacity-50 pointer-events-none'
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
            href={
              idProximo ? `/mangas/${mangaId}/capitulo/${idProximo}` : '#'
            }
            aria-disabled={!idProximo}
            className={`px-4 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition ${
              idProximo ? '' : 'opacity-50 pointer-events-none'
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
          </div>
        </div>
      </section>
    </div>
  );
}
