'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mangaService } from '@/services/mangaService';
import { MangaReader } from './MangaReader';
import type { Capitulo } from '@/types/manga';

interface ChapterReaderProps {
  capitulo: Capitulo;
  capituloId: number;
}

export function ChapterReader({ capitulo, capituloId }: ChapterReaderProps) {
  const { isAuthenticated } = useAuth();
  const [hasMarked, setHasMarked] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasMarked && capitulo.paginas_list && capitulo.paginas_list.length > 0) {
      const markAsRead = async () => {
        try {
          await mangaService.marcarCapituloLido(capituloId);
          setHasMarked(true);
        } catch (error) {
          console.error('Erro ao marcar capítulo como lido:', error);
        }
      };
      
      // Marca como lido quando a primeira página é carregada
      markAsRead();
    }
  }, [isAuthenticated, hasMarked, capituloId, capitulo.paginas_list]);

  return <MangaReader capitulo={capitulo} />;
}

