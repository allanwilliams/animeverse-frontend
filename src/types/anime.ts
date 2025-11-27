export interface Genero {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  cor: string;
  criado_em: string;
}

export interface Temporada {
  id: number;
  anime: number;
  anime_titulo: string;
  numero: number;
  titulo: string;
  descricao: string;
  thumbnail: string | null;
  data_lancamento: string;
  episodios_totais: number;
  total_episodios?: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Provedor {
  id: number;
  nome: string;
  tipo: 'iframe' | 'video_player';
}

export interface LinkEpisodio {
  id: number;
  url: string;
  tipo: 'legendado' | 'dublado';
  provedor: Provedor | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface LinksEpisodio {
  legendado: LinkEpisodio[];
  dublado: LinkEpisodio[];
}

export interface Episodio {
  id: number;
  anime: number;
  anime_titulo: string;
  temporada: number;
  temporada_numero: number;
  temporada_titulo: string;
  numero: number;
  numero_global?: number | null;
  titulo: string;
  sinopse: string;
  thumbnail: string | null;
  // Campos deprecated - mantidos para compatibilidade
  url_video: string;
  url_video_dublado: string | null;
  provedor: number | null;
  provedor_nome: string | null;
  provedor_tipo: 'iframe' | 'video_player' | null;
  // Novo sistema de múltiplas fontes
  links: LinksEpisodio;
  duracao: number;
  data_lancamento: string;
  visualizacoes: number;
  criado_em: string;
}

export interface Anime {
  id: number;
  titulo: string;
  titulo_original: string;
  slug: string;
  sinopse: string;
  capa: string | null;
  banner: string | null;
  data_lancamento: string;
  status: 'em_exibicao' | 'completo' | 'cancelado';
  episodios_totais: number;
  duracao_episodio: number;
  estudio: string;
  rating_medio: number;
  total_avaliacoes: number;
  generos: Genero[];
  temporadas?: Temporada[];
  episodios?: Episodio[];
  episodios_sem_temporada?: Episodio[];
  total_episodios?: number;
  is_favorito?: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface AnimeFilters {
  page?: number;
  search?: string;
  genero?: string | string[];
  genero_id?: number | number[];
  status?: string | string[];
  ano?: number;
  rating_min?: number;
  rating_max?: number;
  ordering?: string;
}

export interface AnimeList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Anime[];
}

export interface Favorito {
  id: number;
  usuario: number;
  usuario_nome: string;
  anime: number;
  anime_detalhes: Anime;
  data_adicionado: string;
  status: 'assistindo' | 'completo' | 'pausado' | 'planejado';
  avaliacao: number | null;
  progresso_episodios: number;
  ultimo_episodio_id: number | null;
}

export interface Review {
  id: number;
  usuario: number;
  usuario_nome: string;
  anime: number;
  anime_titulo: string;
  titulo: string;
  texto: string;
  rating: number;
  curtidas: number;
  data: string;
  atualizado_em: string;
}

