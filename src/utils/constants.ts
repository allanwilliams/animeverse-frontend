export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const STATUS_LABELS = {
  em_exibicao: 'Em Exibição',
  completo: 'Completo',
  cancelado: 'Cancelado',
} as const;

export const MANGA_STATUS_LABELS = {
  em_lancamento: 'Em Lançamento',
  completo: 'Completo',
  cancelado: 'Cancelado',
} as const;

export const FAVORITO_STATUS_LABELS = {
  assistindo: 'Assistindo',
  completo: 'Completo',
  pausado: 'Pausado',
  planejado: 'Planejado',
} as const;

export const MANGA_FAVORITO_STATUS_LABELS = {
  lendo: 'Lendo',
  completo: 'Completo',
  pausado: 'Pausado',
  planejado: 'Planejado',
} as const;

export const ITEMS_PER_PAGE = 20;

