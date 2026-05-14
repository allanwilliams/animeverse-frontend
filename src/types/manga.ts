export interface Genero {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  cor: string;
  criado_em: string;
}

/** Provedor no JSON pode vir como PK (número), objeto aninhado ou só `provedor_id`. */
export type ProvedorRefEmLink = number | { id: number };

export interface LinkPagina {
  id: number;
  pagina: number;
  /** FK ProvedoresManga (PK); preferir `provedorIdDoLink()` para comparação */
  provedor: number | ProvedorRefEmLink;
  /** Espelho explícito do FK no modelo LinkPagina */
  provedor_id?: number;
  provedor_nome?: string;
  /** Domínio base do provedor deste link (Referer na CDN); preferir ao do manga */
  provedor_dominio?: string | null;
  url: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Pagina {
  id: number;
  capitulo: number;
  numero: number;
  imagem: string;
  /** Preferir `links`; mantido para compat com API (primeiro link ativo) */
  pagina_url?: string | null;
  links?: LinkPagina[];
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
  /** Presente no GET /capitulos/{id}/ (detalhe) para navegação sem listar todos os capítulos */
  capitulo_anterior_id?: number | null;
  capitulo_proximo_id?: number | null;
  /** Fallback: domínio do provedor do manga (Referer no proxy se o link não tiver `provedor_dominio`) */
  provedor_imagem_referer?: string | null;
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
  total_visualizacoes?: number;
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
  page_size?: number;
  search?: string;
  genero?: string;
  genero_id?: number;
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
