import { notFound } from 'next/navigation';
import { getAnimeByIdServer } from '@/lib/api-server';
import { AnimeDetailsClient } from './AnimeDetailsClient';

interface AnimeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const animeId = parseInt(id);
  
  if (isNaN(animeId)) {
    notFound();
  }

  const anime = await getAnimeByIdServer(animeId);

  if (!anime) {
    notFound();
  }

  return <AnimeDetailsClient anime={anime} animeId={animeId} />;
}
