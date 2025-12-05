import { Header } from '@/components/Layout/Header';
import { AnimesClient } from './AnimesClient';
import { getGenerosServer, getAnimesServer, getFavoritosServer } from '@/lib/api-server';

interface AnimesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    genero?: string | string[];
    status?: string | string[];
  }>;
}

export default async function AnimesPage({ searchParams }: AnimesPageProps) {
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

  // Buscar gêneros, animes e favoritos em paralelo no servidor
  const [generos, animesData, favoritosResponse] = await Promise.all([
    getGenerosServer(),
    getAnimesServer({
      page,
      search: search || undefined,
      genero: generosFilter,
      status: statusesFilter,
      ordering: 'titulo',
    }),
    getFavoritosServer(),
  ]);

  // Criar mapeamento de favoritos para último episódio
  const ultimoEpisodioMap: Record<number, number | null> = {};
  if (favoritosResponse?.results) {
    favoritosResponse.results.forEach((favorito) => {
      if (favorito.ultimo_episodio_id && favorito.anime_detalhes?.id) {
        ultimoEpisodioMap[favorito.anime_detalhes.id] = favorito.ultimo_episodio_id;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Catálogo de Animes" subtitle="Explore nossa coleção completa" />
      <AnimesClient
        initialData={animesData}
        initialGeneros={generos}
        initialPage={page}
        initialSearch={search}
        initialGenerosFilter={generosFilter}
        initialStatusesFilter={statusesFilter}
        initialUltimoEpisodioMap={ultimoEpisodioMap}
      />
    </div>
  );
}
