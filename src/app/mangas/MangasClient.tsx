'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MangaGrid } from '@/components/Manga/MangaGrid';
import { Pagination } from '@/components/Common/Pagination';
import { Loading } from '@/components/Common/Loading';
import { SearchInput } from '@/components/Filters/SearchInput';
import { GenreAutocomplete } from '@/components/Filters/GenreAutocomplete';
import { StatusAutocomplete } from '@/components/Filters/StatusAutocomplete';
import { mangaService } from '@/services/mangaService';
import type { MangaList, Genero } from '@/types/anime';

interface MangasClientProps {
  initialData: MangaList | null;
  initialGeneros: Genero[];
  initialPage?: number;
  initialSearch?: string;
  initialGenerosFilter?: string[];
  initialStatusesFilter?: string[];
}

export function MangasClient({
  initialData,
  initialGeneros,
  initialPage = 1,
  initialSearch = '',
  initialGenerosFilter = [],
  initialStatusesFilter = [],
}: MangasClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<MangaList | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Estados temporários (não aplicados ainda)
  const [tempSearch, setTempSearch] = useState(initialSearch);
  const [tempGeneros, setTempGeneros] = useState<string[]>(initialGenerosFilter);
  const [tempStatuses, setTempStatuses] = useState<string[]>(initialStatusesFilter);
  
  // Estados aplicados (filtros ativos)
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [appliedGeneros, setAppliedGeneros] = useState<string[]>(initialGenerosFilter);
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>(initialStatusesFilter);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const generoFromUrl = searchParams.get('genero') || '';
    const statusFromUrl = searchParams.get('status') || '';
    const pageFromUrl = searchParams.get('page') || '1';
    
    setTempSearch(searchFromUrl);
    setAppliedSearch(searchFromUrl);
    setTempGeneros(generoFromUrl ? [generoFromUrl] : []);
    setAppliedGeneros(generoFromUrl ? [generoFromUrl] : []);
    setTempStatuses(statusFromUrl ? [statusFromUrl] : []);
    setAppliedStatuses(statusFromUrl ? [statusFromUrl] : []);
    setPage(parseInt(pageFromUrl, 10));
  }, [searchParams]);

  const updateURL = useCallback((search: string, generos: string[], statuses: string[], page: number) => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (generos.length > 0) params.set('genero', generos[0]); // Mangás suportam apenas um gênero
    if (statuses.length > 0) params.set('status', statuses[0]); // Mangás suportam apenas um status
    if (page > 1) params.set('page', page.toString());
    
    const queryString = params.toString();
    const newURL = queryString ? `/mangas?${queryString}` : '/mangas';
    router.push(newURL);
  }, [router]);

  const loadMangas = useCallback(async () => {
    try {
      setLoading(true);
      const result = await mangaService.getMangas({
        page,
        search: appliedSearch || undefined,
        genero: appliedGeneros.length > 0 ? appliedGeneros[0] : undefined,
        status: appliedStatuses.length > 0 ? appliedStatuses[0] : undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar mangas:', error);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, appliedGeneros, appliedStatuses]);

  useEffect(() => {
    // Só carrega se houver mudanças nos filtros ou página (não no mount inicial)
    const hasChanged = 
      page !== initialPage || 
      appliedSearch !== initialSearch || 
      JSON.stringify([...appliedGeneros].sort()) !== JSON.stringify([...initialGenerosFilter].sort()) ||
      JSON.stringify([...appliedStatuses].sort()) !== JSON.stringify([...initialStatusesFilter].sort());
    
    if (hasChanged) {
      loadMangas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedSearch, appliedGeneros, appliedStatuses]);

  const handleSearch = (query: string) => {
    setTempSearch(query);
  };

  const handleGenreChange = (newGeneros: string[]) => {
    setTempGeneros(newGeneros);
  };

  const handleStatusChange = (newStatuses: string[]) => {
    setTempStatuses(newStatuses);
  };

  const handleFilter = () => {
    setAppliedSearch(tempSearch);
    setAppliedGeneros(tempGeneros);
    setAppliedStatuses(tempStatuses);
    setPage(1);
    updateURL(tempSearch, tempGeneros, tempStatuses, 1);
  };

  const handleClearFilters = () => {
    setTempSearch('');
    setTempGeneros([]);
    setTempStatuses([]);
    setAppliedSearch('');
    setAppliedGeneros([]);
    setAppliedStatuses([]);
    setPage(1);
    updateURL('', [], [], 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL(appliedSearch, appliedGeneros, appliedStatuses, newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = appliedSearch || appliedGeneros.length > 0 || appliedStatuses.length > 0;
  const hasChanges = 
    tempSearch !== appliedSearch ||
    JSON.stringify(tempGeneros.sort()) !== JSON.stringify(appliedGeneros.sort()) ||
    JSON.stringify(tempStatuses.sort()) !== JSON.stringify(appliedStatuses.sort());

  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 bg-gray-800 p-4 rounded-lg">
          {/* Filter Toggle Button (Mobile) */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h3 className="text-white font-semibold">Filtros</h3>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span>{filtersOpen ? 'Ocultar' : 'Mostrar'}</span>
              <svg
                className={`w-5 h-5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Filter Content */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <SearchInput
                  value={tempSearch}
                  onChange={handleSearch}
                  onEnter={handleFilter}
                  placeholder="Buscar por título, editora..."
                />
              </div>
              <div className="flex-1">
                <GenreAutocomplete 
                  selectedGenres={tempGeneros} 
                  onGenreChange={handleGenreChange}
                  generos={initialGeneros}
                />
              </div>
              <div className="flex-1">
                <StatusAutocomplete 
                  selectedStatuses={tempStatuses} 
                  onStatusChange={handleStatusChange}
                  statusOptions={[
                    { value: 'em_lancamento', label: 'Em Lançamento' },
                    { value: 'completo', label: 'Completo' },
                    { value: 'cancelado', label: 'Cancelado' },
                  ]}
                />
              </div>
            </div>
            
            {/* Filter buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleFilter}
                disabled={!hasChanges}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Filtrar
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Carregando mangas..." />
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400">
              {data && <p>{data.count} manga(s) encontrado(s)</p>}
            </div>
            
            <MangaGrid mangas={data?.results || []} />

            {data && totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

