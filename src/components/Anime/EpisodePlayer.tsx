'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { animeService } from '@/services/animeService';
import { getImageUrl } from '@/utils/helpers';
import type { Episodio, LinkEpisodio } from '@/types/anime';
import YouTube from 'react-youtube';

// Função para extrair VIDEO_CONFIG de páginas do Blogger
function extractVideoConfig(html: string) {
  const idx = html.indexOf("var VIDEO_CONFIG =");
  if (idx === -1) return null;

  let start = html.indexOf("{", idx);
  let braceCount = 0;
  let end = start;

  while (end < html.length) {
    if (html[end] === "{") braceCount++;
    else if (html[end] === "}") braceCount--;
    end++;
    if (braceCount === 0) break;
  }

  const jsonStr = html.slice(start, end);
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Erro ao fazer parse do VIDEO_CONFIG:', error);
    return null;
  }
}

// Função para extrair ID do vídeo do YouTube a partir da URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

interface EpisodePlayerProps {
  episodioId: number;
  episodio?: Episodio;
}

type VideoType = 'legendado' | 'dublado';

export function EpisodePlayer({ episodioId, episodio }: EpisodePlayerProps) {
  const { isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const [hasMarked, setHasMarked] = useState(false);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<VideoType>('legendado');
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number>(0);
  const [bloggerStreams, setBloggerStreams] = useState<string[]>([]);
  const [isLoadingBlogger, setIsLoadingBlogger] = useState(false);
  const [selectedStreamIndex, setSelectedStreamIndex] = useState<number>(0);

  // Obter links do novo sistema ou fallback para campos antigos
  const getLinksForType = (tipo: VideoType): LinkEpisodio[] => {
    if (episodio?.links && episodio.links[tipo]) {
      return episodio.links[tipo].filter(link => link.ativo);
    }
    
    // Fallback para campos antigos
    if (tipo === 'legendado' && episodio?.url_video) {
      return [{
        id: 0,
        url: episodio.url_video,
        tipo: 'legendado',
        provedor: episodio.provedor_nome ? {
          id: episodio.provedor || 0,
          nome: episodio.provedor_nome,
          tipo: episodio.provedor_tipo || 'iframe'
        } : null,
        ativo: true,
        criado_em: '',
        atualizado_em: ''
      }];
    }
    
    if (tipo === 'dublado' && episodio?.url_video_dublado) {
      return [{
        id: 0,
        url: episodio.url_video_dublado,
        tipo: 'dublado',
        provedor: episodio.provedor_nome ? {
          id: episodio.provedor || 0,
          nome: episodio.provedor_nome,
          tipo: episodio.provedor_tipo || 'iframe'
        } : null,
        ativo: true,
        criado_em: '',
        atualizado_em: ''
      }];
    }
    
    return [];
  };

  const linksLegendado = getLinksForType('legendado');
  const linksDublado = getLinksForType('dublado');
  const currentLinks = activeTab === 'dublado' ? linksDublado : linksLegendado;
  const currentLink = currentLinks[selectedLinkIndex];

  // Verifica se há vídeo dublado disponível
  const hasDubbedVideo = linksDublado.length > 0;

  // Função para verificar se a URL é do Blogger
  const isBloggerUrl = (url: string): boolean => {
    return url.includes('blogger') || url.includes('blogspot');
  };

  // Função para processar URLs do Blogger
  const processBloggerUrl = async (url: string) => {
    if (!isBloggerUrl(url)) return;

    setIsLoadingBlogger(true);
    
    // Lista de serviços de proxy para tentar
    const proxyServices = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`
    ];

    try {
      let html = '';
      let success = false;

      // Tentar cada serviço de proxy
      for (const proxyUrl of proxyServices) {
        try {
          console.log(`Tentando proxy: ${proxyUrl}`);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': proxyUrl.includes('allorigins') ? 'application/json' : 'text/html',
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          if (proxyUrl.includes('allorigins')) {
            const data = await response.json();
            html = data.contents;
          } else {
            html = await response.text();
          }
          
          if (html) {
            success = true;
            console.log('Proxy funcionou:', proxyUrl);
            break;
          }
        } catch (proxyError) {
          console.warn(`Proxy falhou: ${proxyUrl}`, proxyError);
          continue;
        }
      }

      if (!success || !html) {
        throw new Error('Todos os serviços de proxy falharam');
      }

      const videoConfig = extractVideoConfig(html);

      if (videoConfig && videoConfig.streams) {
        // Extrair URLs dos streams
        const streamUrls = videoConfig.streams.map((stream: any) => stream.play_url || stream.url).filter(Boolean);
        setBloggerStreams(streamUrls);
        console.log(`Encontrados ${streamUrls.length} streams do Blogger`);
      } else {
        console.warn('VIDEO_CONFIG não encontrado ou sem streams');
      }
    } catch (error) {
      console.error('Erro ao processar URL do Blogger:', error);
      setBloggerStreams([]);
    } finally {
      setIsLoadingBlogger(false);
    }
  };

  useEffect(() => {
    if (episodio?.thumbnail) {
      setPoster(getImageUrl(episodio.thumbnail) || undefined);
    }
  }, [episodio]);

  // Resetar tab para legendado e hasMarked quando mudar de episódio
  useEffect(() => {
    setActiveTab('legendado');
    setSelectedLinkIndex(0);
    setHasMarked(false);
  }, [episodioId]);

  // Resetar índice do link quando mudar de tab
  useEffect(() => {
    setSelectedLinkIndex(0);
    setSelectedStreamIndex(0);
  }, [activeTab]);

  // Processar URL do Blogger quando o link atual mudar
  useEffect(() => {
    if (currentLink?.url && isBloggerUrl(currentLink.url)) {
      processBloggerUrl(currentLink.url);
    } else {
      setBloggerStreams([]);
      setSelectedStreamIndex(0);
    }
  }, [currentLink?.url]);

  // Funções do YouTube Player
  const onYouTubeReady = (event: any) => {
    youtubePlayerRef.current = event.target;
  };

  const onYouTubePlay = () => {
    handlePlay();
  };

  const changeStream = (streamIndex: number) => {
    setSelectedStreamIndex(streamIndex);
    if (youtubePlayerRef.current && bloggerStreams[streamIndex]) {
      const videoId = getYouTubeVideoId(bloggerStreams[streamIndex]);
      if (videoId) {
        youtubePlayerRef.current.loadVideoById(videoId);
      }
    }
  };

  const handlePlay = async () => {
    if (!isAuthenticated || hasMarked || !episodio) {
      console.log('Não marcando como visto:', { isAuthenticated, hasMarked, hasEpisodio: !!episodio });
      return;
    }
    
    try {
      console.log('Marcando episódio como visto:', episodioId);
      await animeService.marcarEpisodioVisto(episodioId);
      setHasMarked(true);
      console.log('Episódio marcado como visto com sucesso');
    } catch (error: any) {
      console.error('Erro ao marcar episódio como visto:', error);
      console.error('URL tentada:', `/episodios/${episodioId}/marcar-visto/`);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
  };

  // Marcar episódio como visto quando iframe carregar
  const handleIframeLoad = () => {
    // Só marcar se ainda não foi marcado e usuário está autenticado
    if (!hasMarked && isAuthenticated && episodio) {
      // Aguardar um pouco para garantir que o iframe realmente carregou
      setTimeout(() => {
        handlePlay();
      }, 2000); // 2 segundos após o iframe carregar
    }
  };

  if (!episodio) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!currentLink) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Nenhum vídeo disponível</p>
      </div>
    );
  }

  // Determinar o tipo de player baseado no provedor (padrão: iframe)
  const playerType = currentLink.provedor?.tipo || 'iframe';
  const isIframe = playerType === 'iframe' && bloggerStreams.length === 0;
  const isVideoPlayer = playerType === 'video_player' && bloggerStreams.length === 0;
  const isBloggerPlayer = bloggerStreams.length > 0;
  const isYouTubePlayer = isBloggerPlayer;

  return (
    <div className="w-full">
      {/* Tabs */}
      {hasDubbedVideo && (
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab('legendado')}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'legendado'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                : 'bg-gray-800 text-gray-300 border-transparent hover:bg-gray-700 hover:text-white'
            }`}
          >
            Legendado {linksLegendado.length > 1 && `(${linksLegendado.length})`}
          </button>
          <button
            onClick={() => setActiveTab('dublado')}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'dublado'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                : 'bg-gray-800 text-gray-300 border-transparent hover:bg-gray-700 hover:text-white'
            }`}
          >
            Dublado {linksDublado.length > 1 && `(${linksDublado.length})`}
          </button>
        </div>
      )}

      {/* Seletor de Fontes */}
      {currentLinks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Escolha o player ({currentLinks.length} disponíveis):
          </label>
          <div className="flex flex-wrap gap-2">
            {currentLinks.map((link, index) => (
              <button
                key={link.id || index}
                onClick={() => setSelectedLinkIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedLinkIndex === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Player {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seletor de Qualidade para Blogger */}
      {isBloggerPlayer && bloggerStreams.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Escolha a qualidade ({bloggerStreams.length} disponíveis):
          </label>
          <div className="flex flex-wrap gap-2">
            {bloggerStreams.map((stream, index) => (
              <button
                key={index}
                onClick={() => changeStream(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStreamIndex === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Qualidade {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player */}
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        {isLoadingBlogger ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Carregando streams do Blogger...</p>
          </div>
        ) : isYouTubePlayer && bloggerStreams.length > 0 ? (
          (() => {
            const currentStream = bloggerStreams[selectedStreamIndex];
            const videoId = getYouTubeVideoId(currentStream);
            
            if (!videoId) {
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">URL do vídeo inválida</p>
                </div>
              );
            }

            return (
              <YouTube
                key={`${episodioId}-${activeTab}-${selectedLinkIndex}-${selectedStreamIndex}`}
                videoId={videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                    rel: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    fs: 1,
                    cc_load_policy: 0,
                    iv_load_policy: 3,
                  },
                }}
                onReady={onYouTubeReady}
                onPlay={onYouTubePlay}
                className="w-full h-full"
              />
            );
          })()
        ) : isIframe && currentLink.url ? (
          <iframe
            key={`${episodioId}-${activeTab}-${selectedLinkIndex}`}
            src={currentLink.url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`${episodio.titulo} - ${activeTab === 'dublado' ? 'Dublado' : 'Legendado'} - Player ${selectedLinkIndex + 1}`}
            onLoad={handleIframeLoad}
          />
        ) : isVideoPlayer && currentLink.url ? (
          <video
            ref={videoRef}
            key={`${episodioId}-${activeTab}-${selectedLinkIndex}`}
            controls
            className="w-full h-full"
            poster={poster}
            src={currentLink.url}
            onPlay={handlePlay}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Nenhum vídeo disponível</p>
          </div>
        )}
      </div>

      {/* Informações do player atual */}
      <div className="mt-2 text-sm text-gray-400">
        {isYouTubePlayer && bloggerStreams.length > 0 ? (
          <span>
            YouTube Player - Qualidade {selectedStreamIndex + 1} de {bloggerStreams.length}
            {bloggerStreams.length > 1 && ' disponíveis'}
          </span>
        ) : currentLinks.length > 1 ? (
          <span>Player {selectedLinkIndex + 1} de {currentLinks.length}</span>
        ) : null}
      </div>
    </div>
  );
}