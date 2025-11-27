import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.18.150',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Desabilitar otimização em desenvolvimento para evitar erro 400 com proxy
    unoptimized: true,
  },
  // Permitir API externa (apenas para rotas que não existem no Next.js)
  // As rotas de API do Next.js em /app/api/ têm prioridade sobre os rewrites
  async rewrites() {
    // Usar variável de ambiente ou fallback para localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const backendBaseUrl = apiUrl.replace('/api', '');
    
    return [
      // Proxy para imagens de mídia
      {
        source: '/media/:path*',
        destination: `${backendBaseUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
