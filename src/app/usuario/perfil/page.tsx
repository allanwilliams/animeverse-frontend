import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PerfilUsuarioClient } from './PerfilUsuarioClient';

export default async function PerfilUsuarioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  return <PerfilUsuarioClient />;
}
