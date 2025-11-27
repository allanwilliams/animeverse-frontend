import type { Anime } from './anime';
import type { Manga } from './manga';

export interface ContinuarAssistindo {
  anime: Anime;
  ultimo_episodio_id: number;
  ultimo_episodio_numero: number;
  temporada_numero: number | null;
  progresso: number;
  data_ultima_visualizacao: string;
}

export interface ContinuarLendo {
  manga: Manga;
  ultimo_capitulo_id: number;
  ultimo_capitulo_numero: number;
  progresso: number;
  data_ultima_leitura: string;
}
