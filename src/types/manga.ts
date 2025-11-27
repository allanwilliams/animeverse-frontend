export interface Genero {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  cor: string;
  criado_em: string;
}

export interface Pagina {
  id: number;
  capitulo: number;
  numero: number;
  imagem: string;
  criado_em: string;
}

export interface Capitulo {
  id: number;
  manga: number;
  manga_titulo: string;
  numero: number;
  titulo: string;
  sinopse: string;
  thumbnail: string | null;
  paginas: number;
  paginas_list?: Pagina[];
  data_lancamento: string;
  visualizacoes: number;
  criado_em: string;
}

export interface Manga {
  id: number;
  titulo: string;
  titulo_original: string;
  slug: string;
  sinopse: string;
  capa: string | null;
  banner: string | null;
  data_lancamento: string;
  status: 'em_lancamento' | 'completo' | 'cancelado';
  capitulos_totais: number;
  paginas_por_capitulo: number;
  editora: string;
  rating_medio: number;
  total_avaliacoes: number;
  generos: Genero[];
  capitulos?: Capitulo[];
  total_capitulos?: number;
  is_favorito?: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface MangaList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Manga[];
}

export interface MangaFilters {
  page?: number;
  search?: string;
  genero?: string;
  genero_id?: number;
  status?: string;
  ano?: number;
  ano_min?: number;
  ano_max?: number;
  rating_min?: number;
  rating_max?: number;
  capitulos_min?: number;
  capitulos_max?: number;
  ordering?: string;
}

export interface FavoritoManga {
  id: number;
  usuario: number;
  usuario_nome: string;
  manga: number;
  manga_detalhes: Manga;
  data_adicionado: string;
  status: 'lendo' | 'completo' | 'pausado' | 'planejado';
  avaliacao: number | null;
  progresso_capitulos: number;
  ultimo_capitulo_id: number | null;
}

export interface ReviewManga {
  id: number;
  usuario: number;
  usuario_nome: string;
  manga: number;
  manga_titulo: string;
  titulo: string;
  texto: string;
  rating: number;
  curtidas: number;
  data: string;
  atualizado_em: string;
}
