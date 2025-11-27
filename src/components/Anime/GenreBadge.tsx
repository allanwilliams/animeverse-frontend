'use client';

import type { Genero } from '@/types/anime';

interface GenreBadgeProps {
  genero: Genero;
  onClick?: () => void;
}

export function GenreBadge({ genero, onClick }: GenreBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } transition-opacity`}
      style={{
        backgroundColor: genero.cor + '20',
        color: genero.cor,
        borderColor: genero.cor,
        borderWidth: '1px',
      }}
    >
      {genero.nome}
    </span>
  );
}

