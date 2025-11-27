'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../Common/SearchBar';
import { Button } from '../Common/Button';

export function HeroSection() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/mangas?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-purple-900 via-purple-800 to-gray-900">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Bem-vindo ao AnimeVerse
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Descubra, acompanhe e avalie seus animes favoritos
        </p>
        
        <div className="flex justify-center mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar conteúdo..."
          />
        </div>
        
        <Link href="/mangas">
          <Button size="lg" variant="primary">
            Explorar Mangás
          </Button>
        </Link>
      </div>
    </section>
  );
}

