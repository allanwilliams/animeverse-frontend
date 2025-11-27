import { notFound } from 'next/navigation';
import { getMangaByIdServer, getCapitulosServer } from '@/lib/api-server';
import { MangaDetailsClient } from './MangaDetailsClient';

interface MangaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { id } = await params;
  const mangaId = parseInt(id);
  
  if (isNaN(mangaId)) {
    notFound();
  }

  const [manga, capitulos] = await Promise.all([
    getMangaByIdServer(mangaId),
    getCapitulosServer(mangaId),
  ]);

  if (!manga) {
    notFound();
  }

  return <MangaDetailsClient manga={manga} mangaId={mangaId} capitulos={capitulos} />;
}
