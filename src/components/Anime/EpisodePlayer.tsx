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

// Função para detectar qualidade da URL com múltiplas estratégias
function detectQualityFromUrl(url: string, streamData?: any): number {
  // Estratégia 1: Verificar dados do stream primeiro
  if (streamData) {
    if (streamData.quality && typeof streamData.quality === 'number') {
      return streamData.quality;
    }
    if (streamData.quality && typeof streamData.quality === 'string') {
      const qualityNum = parseInt(streamData.quality.replace('p', ''));
      if (qualityNum > 0) return qualityNum;
    }
    if (streamData.height && typeof streamData.height === 'number') {
      return streamData.height;
    }
    if (streamData.width && typeof streamData.width === 'number') {
      // Converter largura para altura aproximada (16:9)
      return Math.round(streamData.width * 9 / 16);
    }
  }

  // Estratégia 2: Analisar parâmetros da URL
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  
  // Verificar parâmetro de qualidade comum
  const qualityParam = urlParams.get('quality') || urlParams.get('q') || urlParams.get('res');
  if (qualityParam) {
    const qualityNum = parseInt(qualityParam.replace('p', ''));
    if (qualityNum > 0) return qualityNum;
  }

  // Estratégia 3: ITags do YouTube
  const itagMatch = url.match(/itag[=\/](\d+)/i);
  if (itagMatch) {
    const itag = parseInt(itagMatch[1]);
    const itagToQuality: { [key: number]: number } = {
      18: 360, 22: 720, 37: 1080, 38: 3072,
      82: 360, 83: 240, 84: 720, 85: 1080,
      133: 240, 134: 360, 135: 480, 136: 720, 137: 1080,
      298: 720, 299: 1080, 396: 360, 397: 480
    };
    if (itagToQuality[itag]) return itagToQuality[itag];
  }

  // Estratégia 4: Padrões na URL
  const qualityPatterns = [
    /(\d+)p/i,           // 720p, 480p, etc.
    /(\d+)P/,            // 720P, 480P, etc.
    /_(\d+)_/,           // _720_, _480_, etc.
    /quality[=:](\d+)/i, // quality=720, quality:480
    /res[=:](\d+)/i,     // res=720, res:480
    /(\d{3,4})(?=\D|$)/  // números de 3-4 dígitos (720, 1080, etc.)
  ];

  for (const pattern of qualityPatterns) {
    const match = url.match(pattern);
    if (match) {
      const quality = parseInt(match[1]);
      // Filtrar apenas resoluções válidas
      if (quality >= 144 && quality <= 4320) {
        return quality;
      }
    }
  }

  return 0;
}

// Função para analisar tamanho do arquivo (se disponível)
async function analyzeStreamSize(url: string): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout de 2s
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'Accept': '*/*',
        'Range': 'bytes=0-0' // Tentar apenas o primeiro byte
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length') || 
                           response.headers.get('content-range')?.split('/')[1];
      
      if (contentLength) {
        const sizeInMB = parseInt(contentLength) / (1024 * 1024);
        // Estimar qualidade baseada no tamanho (muito aproximado)
        if (sizeInMB > 500) return 1080;
        if (sizeInMB > 200) return 720;
        if (sizeInMB > 100) return 480;
        if (sizeInMB > 50) return 360;
        return 240;
      }
    }
  } catch (error) {
    // Ignorar erros de rede, CORS, timeout, etc.
    console.debug('Não foi possível analisar tamanho do stream:', error instanceof Error ? error.message : String(error));
  }
  return 0;
}



interface EpisodePlayerProps {
  episodioId: number;
  episodio?: Episodio;
}

type VideoType = 'legendado' | 'dublado';

export function EpisodePlayer({ episodioId, episodio }: EpisodePlayerProps) {
  const { isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasMarked, setHasMarked] = useState(false);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<VideoType>('legendado');
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number>(0);
  const [bloggerStreams, setBloggerStreams] = useState<string[]>([]);
  const [isLoadingBlogger, setIsLoadingBlogger] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number>(0);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [detectedQualities, setDetectedQualities] = useState<number[]>([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);

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
    // Só verificar se o usuário estiver autenticado
    if (!isAuthenticated) return false;
    return url.includes('blogger') || url.includes('blogspot');
  };

  // Função para processar URLs do Blogger
  const processBloggerUrl = async (url: string) => {
    // Só processar se o usuário estiver autenticado
    if (!isAuthenticated || !isBloggerUrl(url)) return;

    setIsLoadingBlogger(true);
    
    // Lista de serviços de proxy para tentar
    const proxyServices = [
      // `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
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
        // Processar streams com detecção avançada
        const streams = await Promise.all(
          videoConfig.streams.map(async (stream: any, index: number) => {
            const url = stream.play_url || stream.url;
            if (!url) return null;

            // Tentar múltiplas estratégias de detecção
            let detectedQuality = detectQualityFromUrl(url, stream);
            
            // Se não conseguiu detectar, tentar analisar tamanho do arquivo (com timeout)
            if (detectedQuality === 0) {
              try {
                detectedQuality = await Promise.race([
                  analyzeStreamSize(url),
                  new Promise<number>((resolve) => setTimeout(() => resolve(0), 3000)) // Timeout de 3s
                ]);
              } catch (error) {
                console.warn('Erro ao analisar tamanho do stream:', error);
                detectedQuality = 0;
              }
            }

            // Fallback baseado na posição (assumindo ordem comum)
            if (detectedQuality === 0) {
              const fallbackQualities = [1080, 720, 480, 360, 240];
              detectedQuality = fallbackQualities[index] || (720 - (index * 120));
            }

            return {
              url: url,
              quality: detectedQuality,
              originalIndex: index,
              streamData: stream
            };
          })
        );

        // Filtrar streams válidos
        const validStreams = streams.filter((stream: any) => stream !== null);

        // Ordenar por qualidade (maior primeiro)
        validStreams.sort((a: any, b: any) => b.quality - a.quality);

        // Se todas as qualidades são iguais, manter ordem original
        const uniqueQualities = [...new Set(validStreams.map((s: any) => s.quality))];
        if (uniqueQualities.length === 1) {
          validStreams.sort((a: any, b: any) => b.originalIndex - a.originalIndex);
        }

        const streamUrls = validStreams.map((stream: any) => stream.url);
        const qualities = validStreams.map((stream: any) => stream.quality);
        
        setBloggerStreams(streamUrls);
        setDetectedQualities(qualities);
        setSelectedQuality(0);
        
        console.log(`Encontrados ${streamUrls.length} streams do Blogger`);
        console.log('Análise de qualidade:', validStreams.map((s: any) => ({ 
          originalIndex: s.originalIndex, 
          detectedQuality: s.quality,
          url: s.url.substring(0, 100) + '...'
        })));
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
    setDetectedQualities([]);
    setIsPlayerReady(false); // Resetar estado do player
    setCurrentVideoTime(0); // Resetar progresso salvo
  }, [episodioId]);

  // Carregar progresso salvo do episódio
  useEffect(() => {
    const carregarProgressoSalvo = async () => {
      if (!isAuthenticated || !episodioId) return;

      try {
        console.log('🔄 Carregando progresso salvo para episódio:', episodioId);
        const progressoData = await animeService.obterProgressoEpisodio(episodioId);
        
        if (progressoData.progresso !== null && progressoData.progresso > 0 && progressoData.progresso < 100) {
          console.log(`📍 Progresso encontrado: ${progressoData.progresso}% - será aplicado quando o vídeo carregar`);
          
          // Aguardar o vídeo estar pronto e aplicar o progresso
          const aplicarProgresso = () => {
            const video = videoRef.current;
            if (video && video.duration > 0 && progressoData.progresso !== null) {
              const tempoSalvo = (progressoData.progresso / 100) * video.duration;
              console.log(`⏰ Aplicando progresso salvo: ${tempoSalvo.toFixed(2)}s (${progressoData.progresso}%)`);
              video.currentTime = tempoSalvo;
              
              // Mostrar notificação para o usuário
              console.log(`✅ Vídeo retomado do minuto ${Math.floor(tempoSalvo / 60)}:${Math.floor(tempoSalvo % 60).toString().padStart(2, '0')}`);
            }
          };

          // Aguardar o vídeo estar pronto e aplicar o progresso
          const tentarAplicarProgresso = () => {
            const video = videoRef.current;
            if (video && video.duration > 0) {
              aplicarProgresso();
              return true; // Sucesso
            }
            return false; // Ainda não está pronto
          };

          // Tentar aplicar imediatamente
          if (!tentarAplicarProgresso()) {
            // Se não conseguiu, tentar a cada 500ms por até 10 segundos
            let tentativas = 0;
            const maxTentativas = 20; // 10 segundos
            
            const intervalo = setInterval(() => {
              tentativas++;
              
              if (tentarAplicarProgresso()) {
                clearInterval(intervalo);
                console.log(`✅ Progresso aplicado na tentativa ${tentativas}`);
              } else if (tentativas >= maxTentativas) {
                clearInterval(intervalo);
                console.log('⚠️ Timeout ao aguardar vídeo carregar para aplicar progresso');
              }
            }, 500);
            
            // Cleanup se o componente desmontar
            return () => {
              clearInterval(intervalo);
            };
          }
        } else if (progressoData.progresso === 100) {
          console.log('📺 Episódio já foi assistido completamente');
        } else {
          console.log('🆕 Episódio novo - começando do início');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar progresso salvo:', error);
      }
    };

    carregarProgressoSalvo();
  }, [episodioId, isAuthenticated]);

  // Preservar progresso e resetar índice do link quando mudar de tab
  useEffect(() => {
    // Salvar progresso atual antes de trocar
    const video = videoRef.current;
    if (video && video.currentTime > 0) {
      console.log(`💾 Salvando progresso atual antes de trocar tab: ${video.currentTime}s`);
      setCurrentVideoTime(video.currentTime);
    }
    
    setSelectedLinkIndex(0);
    setSelectedQuality(0);
    setShowQualitySelector(false);
    setDetectedQualities([]);
  }, [activeTab]);

  // Fechar seletor de qualidade quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQualitySelector) {
        setShowQualitySelector(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showQualitySelector]);

  // Processar URL do Blogger quando o link atual mudar
  useEffect(() => {
    if (isAuthenticated && currentLink?.url && isBloggerUrl(currentLink.url)) {
      processBloggerUrl(currentLink.url);
    } else {
      setBloggerStreams([]);
      setDetectedQualities([]);
      setSelectedQuality(0);
    }
  }, [currentLink?.url, isAuthenticated]);

  // Função para trocar qualidade do vídeo
  const changeQuality = (qualityIndex: number) => {
    // Salvar progresso atual antes de trocar qualidade
    const video = videoRef.current;
    if (video && video.currentTime > 0) {
      console.log(`💾 [QUALIDADE] Salvando progresso atual antes de trocar qualidade: ${video.currentTime}s (de ${qualityIndex === selectedQuality ? 'mesma' : getQualityName(selectedQuality)} para ${getQualityName(qualityIndex)})`);
      setCurrentVideoTime(video.currentTime);
    } else {
      console.log(`ℹ️ [QUALIDADE] Trocando qualidade sem progresso a salvar (currentTime: ${video?.currentTime || 'N/A'}s)`);
    }
    
    setSelectedQuality(qualityIndex);
    setShowQualitySelector(false);
  };

  // Função para trocar de player preservando progresso
  const changePlayer = (index: number) => {
    // Salvar progresso atual antes de trocar
    const video = videoRef.current;
    if (video && video.currentTime > 0) {
      console.log(`💾 Salvando progresso atual antes de trocar player: ${video.currentTime}s`);
      setCurrentVideoTime(video.currentTime);
    }
    
    setSelectedLinkIndex(index);
  };

  // Função para trocar de tab preservando progresso
  const changeTab = (tab: VideoType) => {
    // Salvar progresso atual antes de trocar
    const video = videoRef.current;
    if (video && video.currentTime > 0) {
      console.log(`💾 Salvando progresso atual antes de trocar tab: ${video.currentTime}s`);
      setCurrentVideoTime(video.currentTime);
    }
    
    setActiveTab(tab);
  };

  // Função para obter nome da qualidade baseado no índice
  const getQualityName = (index: number) => {
    // Usar qualidades detectadas se disponíveis
    if (detectedQualities.length > index && detectedQualities[index] > 0) {
      const quality = detectedQualities[index];
      return `${quality}p`;
    }
    
    // Fallback para detecção em tempo real
    if (bloggerStreams.length > index) {
      const url = bloggerStreams[index];
      const detectedQuality = detectQualityFromUrl(url);
      if (detectedQuality > 0) {
        return `${detectedQuality}p`;
      }
    }
    
    // Fallback final: nomes genéricos ordenados
    const fallbackQualities = ['Alta', 'Média', 'Baixa', 'Muito Baixa'];
    return fallbackQualities[index] || `Qualidade ${index + 1}`;
  };

  // Atualizar fonte do vídeo quando qualidade mudar
  useEffect(() => {
    if (isBloggerPlayer && bloggerStreams.length > 0 && videoRef.current) {
      const video = videoRef.current;
      // Priorizar currentVideoTime (progresso salvo) sobre currentTime atual
      const savedTime = currentVideoTime > 0 ? currentVideoTime : video.currentTime;
      const wasPlaying = !video.paused;
      
      console.log(`🔄 [QUALIDADE] Trocando para ${getQualityName(selectedQuality)} - progresso a ser preservado: ${savedTime}s`);
      
      video.src = bloggerStreams[selectedQuality];
      video.load();
      
      // Restaurar posição e estado de reprodução
      const handleLoadedMetadata = () => {
        if (savedTime > 0) {
          video.currentTime = savedTime;
          console.log(`✅ [QUALIDADE] Progresso restaurado após troca para ${getQualityName(selectedQuality)}: ${savedTime}s`);
          // Limpar o progresso salvo após aplicar
          if (currentVideoTime > 0) {
            setCurrentVideoTime(0);
          }
        } else {
          console.log(`ℹ️ [QUALIDADE] Nova qualidade ${getQualityName(selectedQuality)} carregada sem progresso a restaurar`);
        }
        if (wasPlaying) {
          video.play().catch(console.error);
        }
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      
      // Cleanup
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [selectedQuality, bloggerStreams, isBloggerPlayer, currentVideoTime]);

  // Aplicar progresso salvo quando trocar de player/tab
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentVideoTime > 0) {
      const applyProgress = () => {
        if (video.duration > 0) {
          video.currentTime = currentVideoTime;
          console.log(`🔄 Progresso restaurado após troca de player/tab: ${currentVideoTime}s`);
          setCurrentVideoTime(0); // Limpar após aplicar
        }
      };

      if (video.readyState >= 1) {
        // Vídeo já carregou
        applyProgress();
      } else {
        // Aguardar carregar
        video.addEventListener('loadedmetadata', applyProgress, { once: true });
      }

      // Cleanup
      return () => {
        video.removeEventListener('loadedmetadata', applyProgress);
      };
    }
  }, [selectedLinkIndex, activeTab, currentVideoTime]);

  // Gerenciar timer de progresso para vídeos blogger
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isBloggerPlayer || !isAuthenticated) return;

    const handlePause = () => {
      console.log('Vídeo pausado - parando timer de progresso');
      stopProgressTimer();
    };

    const handlePlay = () => {
      console.log('Vídeo reproduzindo - verificando se deve iniciar timer');
      const isCurrentLinkBlogger = currentLink?.url ? isBloggerUrl(currentLink.url) : false;
      const shouldUseTimer = isBloggerPlayer || isCurrentLinkBlogger;
      
      console.log('Estado atual:', { 
        hasMarked, 
        isBloggerPlayer, 
        isCurrentLinkBlogger,
        shouldUseTimer,
        isAuthenticated,
        bloggerStreamsLength: bloggerStreams.length,
        timerJaRodando: !!progressIntervalRef.current
      });
      
      if (hasMarked && shouldUseTimer && !progressIntervalRef.current) {
        console.log('Episódio marcado como visto e é blogger - iniciando timer de progresso');
        startProgressTimer();
      } else if (hasMarked && !shouldUseTimer) {
        console.log('Episódio marcado mas não é blogger - timer não necessário');
      } else if (progressIntervalRef.current) {
        console.log('Timer já está rodando - não iniciando novamente');
      } else {
        console.log('Episódio ainda não foi marcado como visto');
      }
    };

    const handleEnded = () => {
      console.log('Vídeo terminou - parando timer e atualizando progresso para 100%');
      stopProgressTimer();
      // Atualizar progresso para 100% quando o vídeo terminar
      if (video.duration > 0) {
        updateProgress(video.duration, video.duration);
      }
    };

    // Adicionar event listeners apenas quando o vídeo estiver pronto
    const handleLoadedMetadata = () => {
      console.log('Vídeo carregado - adicionando event listeners');
      video.addEventListener('pause', handlePause);
      video.addEventListener('play', handlePlay);
      video.addEventListener('ended', handleEnded);
    };

    if (video.readyState >= 1) {
      // Vídeo já está carregado
      handleLoadedMetadata();
    } else {
      // Aguardar o vídeo carregar
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    // Cleanup
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
      stopProgressTimer();
    };
  }, [isBloggerPlayer, isAuthenticated, bloggerStreams]);

  // Limpeza geral quando o componente for desmontado
  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, []);

  // Função para atualizar progresso do vídeo
  const updateProgress = async (currentTime: number, duration: number) => {
    console.log('updateProgress chamada:', { currentTime, duration, isAuthenticated, hasEpisodio: !!episodio });
    
    if (!isAuthenticated || !episodio || !duration) {
      console.log('updateProgress cancelada - condições não atendidas');
      return;
    }
    
    const progressPercent = Math.round((currentTime / duration) * 100);
    console.log(`Calculando progresso: ${currentTime}s / ${duration}s = ${progressPercent}%`);
    
    try {
      await animeService.atualizarProgressoEpisodio(episodioId, progressPercent);
      console.log(`✅ Progresso atualizado com sucesso: ${progressPercent}%`);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar progresso:', error);
    }
  };

  // Função para iniciar o timer de progresso (apenas para vídeos blogger)
  const startProgressTimer = () => {
    // Usar verificação mais robusta baseada na URL
    const isCurrentLinkBlogger = currentLink?.url ? isBloggerUrl(currentLink.url) : false;
    const shouldStartTimer = isBloggerPlayer || isCurrentLinkBlogger;
    
    if (!videoRef.current || !shouldStartTimer || !isAuthenticated) {
      console.log('Não iniciando timer:', { 
        hasVideo: !!videoRef.current, 
        isBlogger: isBloggerPlayer,
        isCurrentLinkBlogger,
        shouldStartTimer,
        isAuth: isAuthenticated 
      });
      return;
    }
    
    // Limpar timer anterior se existir
    if (progressIntervalRef.current) {
      console.log('Limpando timer anterior');
      clearInterval(progressIntervalRef.current);
    }
    
    // Iniciar novo timer a cada 30 segundos
    progressIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.duration > 0) {
        console.log(`Atualizando progresso: ${video.currentTime}s / ${video.duration}s`);
        updateProgress(video.currentTime, video.duration);
      } else {
        console.log('Vídeo pausado ou sem duração - pulando atualização de progresso');
      }
    }, 10000); // 10 segundos para teste (mudar para 30000 em produção)
    
    console.log('Timer de progresso iniciado para episódio blogger');
  };

  // Função para parar o timer de progresso
  const stopProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
      console.log('Timer de progresso parado');
    }
  };

  const handlePlay = async () => {
    if (!isAuthenticated || hasMarked || !episodio) {
      console.log('Não marcando como visto:', { isAuthenticated, hasMarked, hasEpisodio: !!episodio });
      return;
    }
    
    try {
      console.log('Verificando se episódio já tem progresso salvo antes de marcar como visto:', episodioId);
      
      // Verificar se já existe progresso salvo para este episódio
      const progressoExistente = await animeService.obterProgressoEpisodio(episodioId);
      
      if (progressoExistente.progresso !== null) {
        console.log(`📍 Episódio já tem progresso salvo (${progressoExistente.progresso}%) - não sobrescrevendo`);
        setHasMarked(true);
        
        // Para episódios blogger, iniciar timer mesmo se já tem progresso
        const isCurrentLinkBlogger = currentLink?.url ? isBloggerUrl(currentLink.url) : false;
        const shouldUseProgressTracking = isBloggerPlayer || isCurrentLinkBlogger;
        
        if (shouldUseProgressTracking) {
          console.log('🎯 Iniciando timer para episódio com progresso existente');
          startProgressTimer();
        }
        return;
      }
      
      // Se não tem progresso salvo, marcar como visto pela primeira vez
      console.log('🆕 Primeira vez assistindo - marcando episódio como visto:', episodioId);
      console.log('Estado no handlePlay:', {
        isBloggerPlayer,
        bloggerStreamsLength: bloggerStreams.length,
        currentLinkUrl: currentLink?.url,
        isBloggerUrl: currentLink?.url ? isBloggerUrl(currentLink.url) : false
      });
      
      // Para episódios blogger, marcar com progresso 0 inicialmente
      // Para outros tipos, manter o comportamento padrão (100%)
      // Usar verificação mais robusta baseada na URL
      const isCurrentLinkBlogger = currentLink?.url ? isBloggerUrl(currentLink.url) : false;
      const shouldUseProgressTracking = isBloggerPlayer || isCurrentLinkBlogger;
      const progressoInicial = shouldUseProgressTracking ? 0 : 100;
      
      console.log(`Progresso inicial calculado: ${progressoInicial}% (shouldUseProgressTracking: ${shouldUseProgressTracking})`);
      
      await animeService.marcarEpisodioVisto(episodioId, progressoInicial);
      setHasMarked(true);
      console.log(`Episódio marcado como visto com progresso inicial: ${progressoInicial}%`);
      
      // Iniciar timer imediatamente após marcar como visto para episódios blogger
      if (shouldUseProgressTracking) {
        console.log('🎯 Iniciando timer imediatamente após marcar como visto');
        startProgressTimer();
      }
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
            onClick={() => changeTab('legendado')}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'legendado'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                : 'bg-gray-800 text-gray-300 border-transparent hover:bg-gray-700 hover:text-white'
            }`}
          >
            Legendado {linksLegendado.length > 1 && `(${linksLegendado.length})`}
          </button>
          <button
            onClick={() => changeTab('dublado')}
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
                onClick={() => changePlayer(index)}
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
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        {isLoadingBlogger ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Carregando stream...</p>
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
          <>
            <video
              ref={videoRef}
              key={`${episodioId}-${activeTab}-${selectedLinkIndex}-${selectedQuality}`}
              controls
              className="w-full h-full"
              poster={poster}
              src={isBloggerPlayer ? bloggerStreams[selectedQuality] : currentLink.url}
              onPlay={handlePlay}
            />
            
            {/* Seletor de Qualidade Customizado para Blogger */}
            {isBloggerPlayer && bloggerStreams.length > 1 && (
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={() => setShowQualitySelector(!showQualitySelector)}
                    className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{getQualityName(selectedQuality)}</span>
                  </button>
                  
                  {showQualitySelector && (
                    <div className="absolute top-full right-0 mt-2 bg-black bg-opacity-90 rounded-lg overflow-hidden min-w-[120px] z-10">
                      {bloggerStreams.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => changeQuality(index)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-white hover:bg-opacity-20 transition-colors ${
                            selectedQuality === index ? 'bg-purple-600 text-white' : 'text-gray-300'
                          }`}
                        >
                          {getQualityName(index)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
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
            Player Customizado - {bloggerStreams.length} qualidade(s) disponível(is)
            {bloggerStreams.length > 1 && ` - Atual: ${getQualityName(selectedQuality)}`}
          </span>
        ) : currentLinks.length > 1 ? (
          <span>Player {selectedLinkIndex + 1} de {currentLinks.length}</span>
        ) : null}
      </div>
    </div>
  );
}