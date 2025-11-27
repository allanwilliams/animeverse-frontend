export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    em_exibicao: 'bg-green-500',
    completo: 'bg-blue-500',
    cancelado: 'bg-red-500',
    assistindo: 'bg-yellow-500',
    pausado: 'bg-orange-500',
    planejado: 'bg-purple-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getRatingColor(rating: number): string {
  if (rating >= 9) return 'text-green-400';
  if (rating >= 7) return 'text-yellow-400';
  if (rating >= 5) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Constrói uma URL absoluta para uma imagem.
 * O Next.js Image precisa de URLs absolutas que correspondam aos remotePatterns configurados.
 */
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Se já for uma URL absoluta, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Garante que o path comece com /
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // Constrói URL absoluta usando a base da API
  // O Next.js Image vai fazer proxy através dos remotePatterns configurados
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Remove /api se existir na base da URL
  const baseUrl = apiBase.replace(/\/api\/?$/, '');
  
  // Retorna URL absoluta completa
  return `${baseUrl}${path}`;
}

