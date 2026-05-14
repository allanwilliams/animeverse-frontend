import { Header } from '@/components/Layout/Header';
import { MangasClient } from './MangasClient';
import { getGenerosMangasCadastradosServer, getMangasServer } from '@/lib/api-server';

interface MangasPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    genero?: string | string[];
  }>;
}

export default async function MangasPage({ searchParams }: MangasPageProps) {
  // Buscar dados no servidor
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const generoParam = params.genero;

  // Normalizar arrays de filtros
  const generosFilter = Array.isArray(generoParam)
    ? generoParam
    : generoParam
      ? [generoParam]
      : [];

  // Buscar gêneros e mangas em paralelo no servidor
  const [generos, mangasData] = await Promise.all([
    getGenerosMangasCadastradosServer(),
    getMangasServer({
      page,
      page_size: 24,
      search: search || undefined,
      genero: generosFilter.length > 0 ? generosFilter[0] : undefined,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Catálogo de Mangas" subtitle="Explore nossa coleção completa" />
      <MangasClient
        initialData={mangasData}
        initialGeneros={generos}
        initialPage={page}
        initialSearch={search}
        initialGenerosFilter={generosFilter}
      />
    </div>
  );
}
