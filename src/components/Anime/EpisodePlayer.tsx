'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { animeService } from '@/services/animeService';
import { getImageUrl } from '@/utils/helpers';
import type { Episodio, LinkEpisodio } from '@/types/anime';

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


interface EpisodePlayerProps {
  episodioId: number;
  episodio?: Episodio;
}

type VideoType = 'legendado' | 'dublado';

export function EpisodePlayer({ episodioId, episodio }: EpisodePlayerProps) {
  const { isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasMarked, setHasMarked] = useState(false);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<VideoType>('legendado');
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number>(0);
  const [bloggerStreams, setBloggerStreams] = useState<string[]>([]);
  const [isLoadingBlogger, setIsLoadingBlogger] = useState(false);

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

  // Determinar o tipo de player baseado no provedor (padrão: iframe)
  const playerType = currentLink?.provedor?.tipo || 'iframe';
  const isBloggerPlayer = bloggerStreams.length > 0;
  const isIframe = playerType === 'iframe' && !isBloggerPlayer;
  const isVideoPlayer = playerType === 'video_player' || isBloggerPlayer;

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
  }, [activeTab]);

  // Processar URL do Blogger quando o link atual mudar
  useEffect(() => {
    if (currentLink?.url && isBloggerUrl(currentLink.url)) {
      processBloggerUrl(currentLink.url);
    } else {
      setBloggerStreams([]);
    }
  }, [currentLink?.url]);

  // Função para configurar múltiplas fontes no player HTML5
  const setupVideoSources = () => {
    const video = videoRef.current;
    if (!video || bloggerStreams.length === 0) return;

    // Limpar fontes existentes
    video.innerHTML = '';

    // Adicionar cada stream como uma fonte
    bloggerStreams.forEach((streamUrl, index) => {
      const source = document.createElement('source');
      source.src = streamUrl;
      source.type = 'video/mp4';
      // Adicionar atributo de qualidade se possível detectar
      source.setAttribute('data-quality', `${720 + (index * 360)}p`);
      video.appendChild(source);
    });

    video.load();
  };

  // Configurar fontes quando streams do Blogger mudarem
  useEffect(() => {
    if (isBloggerPlayer && bloggerStreams.length > 0) {
      setupVideoSources();
    }
  }, [bloggerStreams, isBloggerPlayer]);

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


      {/* Player */}
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        {isLoadingBlogger ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Carregando streams do Blogger...</p>
          </div>
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
        ) : isVideoPlayer ? (
          <video
            ref={videoRef}
            key={`${episodioId}-${activeTab}-${selectedLinkIndex}`}
            controls
            className="w-full h-full"
            poster={poster}
            src={!isBloggerPlayer ? currentLink.url : undefined}
            onPlay={handlePlay}
          >
            {/* As fontes múltiplas serão adicionadas dinamicamente via setupVideoSources */}
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Nenhum vídeo disponível</p>
          </div>
        )}
      </div>

      {/* Informações do player atual */}
      <div className="mt-2 text-sm text-gray-400">
        {isBloggerPlayer && bloggerStreams.length > 0 ? (
          <span>
            Player HTML5 - {bloggerStreams.length} qualidade(s) disponível(is)
            {bloggerStreams.length > 1 && ' (use a engrenagem do player para alterar)'}
          </span>
        ) : currentLinks.length > 1 ? (
          <span>Player {selectedLinkIndex + 1} de {currentLinks.length}</span>
        ) : null}
      </div>
    </div>
  );
}