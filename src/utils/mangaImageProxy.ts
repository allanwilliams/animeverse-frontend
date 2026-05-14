const R2_CDN_HOST = 'aws.r2d2storage.com';

/**
 * Para imagens na CDN `aws.r2d2storage.com`, mascara o `src` apontando para a rota API do Next,
 * que repassa o pedido com o header Referer = domínio passado (ex.: provedor do LinkPagina).
 */
export function buildMangaCdnProxiedSrc(
  imageUrl: string | null,
  provedorDominio: string | null | undefined
): string | null {
  if (!imageUrl?.trim()) {
    return null;
  }
  const trimmed = imageUrl.trim();
  const ref = provedorDominio?.trim();
  let host: string;
  try {
    host = new URL(trimmed).hostname.toLowerCase();
  } catch {
    return trimmed;
  }
  if (host !== R2_CDN_HOST || !ref) {
    return trimmed;
  }
  const q = new URLSearchParams({
    target: trimmed,
    referer: ref,
  });
  return `/api/manga-pagina-imagem?${q.toString()}`;
}

export function isMangaCdnProxiedSrc(src: string | null): boolean {
  return typeof src === 'string' && src.includes('/api/manga-pagina-imagem');
}
