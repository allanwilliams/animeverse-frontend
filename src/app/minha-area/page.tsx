import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PerfilClient } from './PerfilClient';
import {
  getFavoritosServer,
  getContinuarAssistindoServer,
  getContinuarLendoServer,
  getMeusMangasServer,
} from '@/lib/api-server';

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const [favoritosResponse, continuarAssistindo, continuarLendo, meusMangas] = await Promise.all([
    getFavoritosServer(),
    getContinuarAssistindoServer(),
    getContinuarLendoServer(),
    getMeusMangasServer(),
  ]);

  const favoritos = favoritosResponse?.results || [];

  return (
    <PerfilClient
      initialFavoritos={favoritos}
      initialContinuarAssistindo={continuarAssistindo}
      initialContinuarLendo={continuarLendo}
      initialMeusMangas={meusMangas}
    />
  );
}
