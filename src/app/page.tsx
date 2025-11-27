import Link from 'next/link';
import { AnimeGrid } from '@/components/Anime/AnimeGrid';
import { MangaGrid } from '@/components/Manga/MangaGrid';
import { HeroSection } from '@/components/Home/HeroSection';
import {
  getFavoritosServer,
  getAnimesPopularesServer,
  getAnimesRecentesServer,
  getMangasPopularesServer,
  getMangasRecentesServer,
} from '@/lib/api-server';
import type { Anime } from '@/types/anime';
import type { Manga } from '@/types/manga';

export default async function Home() {
  let popularesAnimes: Anime[] = [];
  let recentesAnimes: Anime[] = [];
  let popularesMangas: Manga[] = [];
  let recentesMangas: Manga[] = [];
  let ultimoEpisodioMap: Record<number, number | null> = {};

  try {
    const [populares, recentes, mangasPop, mangasRec, favoritosResponse] = await Promise.all([
      getAnimesPopularesServer(),
      getAnimesRecentesServer(),
      getMangasPopularesServer(),
      getMangasRecentesServer(),
      getFavoritosServer(),
    ]);

    popularesAnimes = populares;
    recentesAnimes = recentes;
    popularesMangas = mangasPop;
    recentesMangas = mangasRec;

    // Criar mapeamento de favoritos para último episódio
    if (favoritosResponse?.results) {
      favoritosResponse.results.forEach((favorito) => {
        if (favorito.ultimo_episodio_id && favorito.anime_detalhes?.id) {
          ultimoEpisodioMap[favorito.anime_detalhes.id] = favorito.ultimo_episodio_id;
        }
      });
    }
  } catch (error) {
    console.error('Erro ao carregar conteúdo:', error);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Animes Populares */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">🔥 Animes Populares</h2>
        </div>
        <AnimeGrid animes={popularesAnimes.slice(0, 12)} emptyMessage="Nenhum anime popular no momento" ultimoEpisodioMap={ultimoEpisodioMap} />
      </section>

      {/* Animes Recentes */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">✨ Animes Adicionados Recentemente</h2>
        </div>
        <AnimeGrid animes={recentesAnimes.slice(0, 12)} emptyMessage="Nenhum anime recente" ultimoEpisodioMap={ultimoEpisodioMap} />
      </section>

      {/* Mangas Populares */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">📚 Mangas Populares</h2>
          <Link href="/mangas?ordering=-rating_medio" className="text-purple-400 hover:text-purple-300">
            Ver todos →
          </Link>
        </div>
        <MangaGrid mangas={popularesMangas.slice(0, 12)} emptyMessage="Nenhum manga popular no momento" />
      </section>

      {/* Mangas Recentes */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">✨ Mangas Adicionados Recentemente</h2>
          <Link href="/mangas?ordering=-criado_em" className="text-purple-400 hover:text-purple-300">
            Ver todos →
          </Link>
        </div>
        <MangaGrid mangas={recentesMangas.slice(0, 12)} emptyMessage="Nenhum manga recente" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Por que usar o AnimeVerse?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Catálogo Completo</h3>
            <p className="text-gray-400">
              Milhares de animes e mangas catalogados com informações detalhadas
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Avaliações</h3>
            <p className="text-gray-400">
              Veja o que outros fãs estão dizendo e deixe sua opinião
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2">Sua Lista</h3>
            <p className="text-gray-400">
              Organize seus animes e mangas favoritos e acompanhe seu progresso
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
