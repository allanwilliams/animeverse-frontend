import type { Capitulo, LinkPagina } from '@/types/manga';

/**
 * ID do provedor armazenado diretamente no LinkPagina (`provedor_id` / FK `provedor`).
 */
export function provedorIdDoLink(link: LinkPagina): number | null {
  if (typeof link.provedor_id === 'number' && !Number.isNaN(link.provedor_id)) {
    return link.provedor_id;
  }
  const p = link.provedor as unknown;
  if (typeof p === 'number' && !Number.isNaN(p)) {
    return p;
  }
  if (typeof p === 'string') {
    const n = parseInt(p, 10);
    return Number.isNaN(n) ? null : n;
  }
  if (p && typeof p === 'object' && 'id' in p) {
    const id = (p as { id: unknown }).id;
    if (typeof id === 'number' && !Number.isNaN(id)) {
      return id;
    }
    if (typeof id === 'string') {
      const n = parseInt(id, 10);
      return Number.isNaN(n) ? null : n;
    }
  }
  return null;
}

/** IDs de provedor distintos vindos só dos links das páginas, ordenados (Servidor 1, 2…). */
export function getDistinctProvedorIds(capitulo: Capitulo): number[] {
  const ids = new Set<number>();
  for (const pagina of capitulo.paginas_list ?? []) {
    for (const link of pagina.links ?? []) {
      const pid = provedorIdDoLink(link);
      if (pid != null) {
        ids.add(pid);
      }
    }
  }
  return Array.from(ids).sort((a, b) => a - b);
}
