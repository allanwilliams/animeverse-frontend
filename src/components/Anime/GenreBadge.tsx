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
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
        onClick ? 'cursor-pointer hover:brightness-110' : ''
      } transition-all`}
      style={{
        // Fundo mais sólido para melhorar legibilidade em cards e páginas de detalhe.
        backgroundColor: genero.cor + 'B3',
        color: '#F9FAFB',
        borderColor: genero.cor,
        borderWidth: '1px',
        textShadow: '0 1px 1px rgba(0, 0, 0, 0.35)',
      }}
    >
      {genero.nome}
    </span>
  );
}

