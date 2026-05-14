import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOST = 'aws.r2d2storage.com';

/**
 * Proxy de imagem CDN no runtime do Next.js (não no Django).
 * A <img> do navegador aponta para esta rota; o servidor Next repassa o GET à CDN com Referer.
 */
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target');
  const referer = request.nextUrl.searchParams.get('referer');

  if (!target?.trim() || !referer?.trim()) {
    return new NextResponse('Parâmetros inválidos', { status: 400 });
  }

  if (target.length > 2048 || referer.length > 512) {
    return new NextResponse('Parâmetros muito longos', { status: 400 });
  }

  let hostname: string;
  try {
    hostname = new URL(target).hostname.toLowerCase();
  } catch {
    return new NextResponse('URL de imagem inválida', { status: 400 });
  }

  if (hostname !== ALLOWED_HOST) {
    return new NextResponse('Host não permitido', { status: 400 });
  }

  try {
    const refParsed = new URL(referer.trim());
    if (refParsed.protocol !== 'https:' && refParsed.protocol !== 'http:') {
      return new NextResponse('Referer inválido', { status: 400 });
    }
  } catch {
    return new NextResponse('Referer inválido', { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: {
        Referer: referer.trim(),
        'User-Agent': request.headers.get('user-agent') || 'AnimeVerse-NextImageProxy/1',
      },
      cache: 'no-store',
    });
  } catch {
    return new NextResponse('Falha ao contatar CDN', { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse('CDN retornou erro', { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  if (contentType.toLowerCase().includes('text/html')) {
    return new NextResponse('Tipo de resposta inesperado', { status: 502 });
  }

  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300',
    },
  });
}
