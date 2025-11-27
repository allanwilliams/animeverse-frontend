import { Header } from '@/components/Layout/Header';
import { MangasClient } from './MangasClient';
import { getGenerosServer, getMangasServer, getFavoritosServer } from '@/lib/api-server';

interface MangasPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    genero?: string | string[];
    status?: string | string[];
  }>;
}

export default async function MangasPage({ searchParams }: MangasPageProps) {
  // Buscar dados no servidor
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const generoParam = params.genero;
  const statusParam = params.status;
  
  // Normalizar arrays de filtros
  const generosFilter = Array.isArray(generoParam) 
    ? generoParam 
    : generoParam 
      ? [generoParam] 
      : [];
  const statusesFilter = Array.isArray(statusParam)
    ? statusParam
    : statusParam
      ? [statusParam]
      : [];

  // Buscar gêneros e mangas em paralelo no servidor
  const [generos, mangasData] = await Promise.all([
    getGenerosServer(),
    getMangasServer({
      page,
      search: search || undefined,
      genero: generosFilter.length > 0 ? generosFilter[0] : undefined,
      status: statusesFilter.length > 0 ? statusesFilter[0] : undefined,
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
        initialStatusesFilter={statusesFilter}
      />
    </div>
  );
}
