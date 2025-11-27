'use client';

import { ContinuarAssistindo } from '@/components/User/ContinuarAssistindo';
import { ContinuarLendo } from '@/components/User/ContinuarLendo';
import { MeusAnimes } from '@/components/User/MeusAnimes';
import { MeusMangas } from '@/components/User/MeusMangas';
import type { ContinuarAssistindo as ContinuarAssistindoType } from '@/types/user';
import type { ContinuarLendo as ContinuarLendoType } from '@/types/user';
import type { Favorito } from '@/types/anime';
import type { FavoritoManga } from '@/types/manga';

interface PerfilClientProps {
  initialFavoritos: Favorito[];
  initialContinuarAssistindo: ContinuarAssistindoType[];
  initialContinuarLendo: ContinuarLendoType[];
  initialMeusMangas: FavoritoManga[];
}

export function PerfilClient({
  initialFavoritos,
  initialContinuarAssistindo,
  initialContinuarLendo,
  initialMeusMangas,
}: PerfilClientProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Minha Área</h1>

        {/* Continuar Assistindo */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">📺 Continuar Assistindo</h2>
          <ContinuarAssistindo items={initialContinuarAssistindo} />
        </section>

        {/* Continuar Lendo */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">📚 Continuar Lendo</h2>
          <ContinuarLendo items={initialContinuarLendo} />
        </section>

        {/* Meus Animes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">🎬 Meus Animes</h2>
          <MeusAnimes favoritos={initialFavoritos} />
        </section>

        {/* Meus Mangas */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">📖 Meus Mangas</h2>
          <MeusMangas favoritos={initialMeusMangas} />
        </section>
      </div>
    </div>
  );
}

