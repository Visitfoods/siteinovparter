'use client';
import React, { useRef, useEffect, useState } from 'react';

interface SynchronizedGifProps {
  gifSrc: string;
  audioSrc: string;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
  onMuteChange?: (muted: boolean) => void;
  syncOffset?: number; // Offset em ms para ajustar sincronização
}

const SynchronizedGif: React.FC<SynchronizedGifProps> = ({
  gifSrc,
  audioSrc,
  className,
  style,
  muted = true,
  onMuteChange,
  syncOffset = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [delays, setDelays] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Decodificar GIF em frames
  useEffect(() => {
    const decodeGif = async () => {
      try {
        console.log('Tentando decodificar GIF:', gifSrc);
        const response = await fetch(gifSrc);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        
        // Importar gifuct-js dinamicamente
        const { parseGIF, decompressFrames } = await import('gifuct-js');
        const parsedGif = parseGIF(buffer);
        const decompressedFrames = decompressFrames(parsedGif, true);
        
        console.log('Frames decodificados:', decompressedFrames.length);
        
        const frameImages: ImageData[] = [];
        const frameDelays: number[] = [];
        
        decompressedFrames.forEach((frame, index) => {
          const imageData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );
          frameImages.push(imageData);
          // Ajustar delays: alguns GIFs têm delays muito pequenos, normalizar
          let delay = frame.delay || 100;
          if (delay < 10) delay = 50; // Mínimo 50ms para frames muito rápidos
          if (delay > 1000) delay = 200; // Máximo 200ms para frames muito lentos
          frameDelays.push(delay);
        });
        
        setFrames(frameImages);
        setDelays(frameDelays);
        setIsLoaded(true);
        console.log('GIF decodificado com sucesso');
      } catch (error) {
        console.error('Erro ao decodificar GIF:', error);
        // Fallback: usar imagem estática
        setIsLoaded(true);
      }
    };

    decodeGif();
  }, [gifSrc]);

  // Função de animação sincronizada com áudio
  const animate = () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    
    if (!canvas || frames.length === 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Calcular frame baseado no tempo do áudio
    // Se o áudio não estiver a reproduzir, usar tempo baseado em performance.now()
    let audioTime = 0;
    if (audio && !audio.paused) {
      audioTime = audio.currentTime * 1000; // Converter para ms
      // Aplicar offset personalizado para ajustar sincronização
      audioTime += syncOffset;
    } else {
      // Fallback: usar tempo baseado em performance para manter animação
      audioTime = (performance.now() % 10000); // Loop a cada 10 segundos
    }

    let totalTime = 0;
    let frameIndex = 0;

    // Calcular duração total da animação
    const totalDuration = delays.reduce((sum, delay) => sum + delay, 0);
    
    // Normalizar o tempo do áudio para o loop da animação
    const normalizedTime = audioTime % totalDuration;

    for (let i = 0; i < delays.length; i++) {
      totalTime += delays[i];
      if (normalizedTime <= totalTime) {
        frameIndex = i;
        break;
      }
    }

    // Desenhar frame no canvas
    if (frames[frameIndex]) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(frames[frameIndex], 0, 0);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Iniciar animação quando carregado
  useEffect(() => {
    if (isLoaded && frames.length > 0) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, frames]);

  // Controlar áudio - sempre reproduzir para manter sincronização
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Sempre reproduzir o áudio para manter currentTime avançando
    audio.muted = muted;
    audio.volume = muted ? 0 : 1;
    
    // Reproduzir sempre, mesmo quando muted
    audio.play().catch(() => {});
  }, [muted]);

  // Iniciar áudio quando o componente monta
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Pequeno delay para garantir que o áudio carregou
    const timer = setTimeout(() => {
      audio.play().catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Configurar canvas quando frames carregam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;

    const firstFrame = frames[0];
    if (firstFrame) {
      canvas.width = firstFrame.width;
      canvas.height = firstFrame.height;
    }
  }, [frames]);

  return (
    <div style={{ position: 'relative', ...style }}>
      {frames.length > 0 ? (
        <canvas
          ref={canvasRef}
          className={className}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <img
          src={gifSrc}
          alt="GIF Animation"
          className={className}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SynchronizedGif;
