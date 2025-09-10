'use client';

import { useEffect, useRef, forwardRef } from 'react';
import { useState } from 'react';
import { useVideoOptimization } from '../hooks/useVideoOptimization';

interface MobileOptimizedVideoProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  preload?: string;
  playsInline?: boolean;
  crossOrigin?: string;
  onError?: (e: any) => void;
  onLoadedMetadata?: () => void;
  onCanPlayThrough?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  autoPlay?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const MobileOptimizedVideo = forwardRef<HTMLVideoElement, MobileOptimizedVideoProps>(
  ({ src, className, muted = false, loop = false, preload = "auto", playsInline = true, crossOrigin = "anonymous", onError, onLoadedMetadata, onCanPlayThrough, onPlay, onPause, autoPlay, style, children, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const videoOptimization = useVideoOptimization();

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Aplicar otimizações baseadas na performance do dispositivo
      const { devicePerformance, recommendedPreload, recommendedVolume, recommendedPlaybackRate, recommendedScale, recommendedBlur } = videoOptimization;
      
      // Aplicar configurações de vídeo
      video.preload = recommendedPreload as any;
      video.volume = recommendedVolume;
      video.playbackRate = recommendedPlaybackRate;
      
      // Aplicar otimizações visuais baseadas na performance
      if (devicePerformance === 'low') {
        video.style.transform = `scale(${recommendedScale})`;
        video.style.filter = `blur(${recommendedBlur}px) contrast(1.05)`;
        video.classList.add('optimized-low');
      } else if (devicePerformance === 'very-low') {
        video.style.transform = `scale(${recommendedScale})`;
        video.style.filter = `blur(${recommendedBlur}px) contrast(1.1) brightness(0.95)`;
        video.classList.add('optimized-very-low');
      }
        
      // Event listeners otimizados
      const handleLoadedMetadata = () => {
        setIsLoaded(true);
        // Só carregar tudo se não for dispositivo muito fraco
        if (devicePerformance !== 'very-low') {
          video.preload = 'auto';
        }
        onLoadedMetadata?.();
      };

      const handleCanPlay = () => {
        // Vídeo otimizado e pronto para tocar
      };

      const handleCanPlayThrough = () => {
        onCanPlayThrough?.();
      };

      const handlePlay = () => {
        onPlay?.();
      };

      const handlePause = () => {
        onPause?.();
      };

      const handleError = (e: any) => {
        onError?.(e);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }, [videoOptimization, onLoadedMetadata, onCanPlayThrough, onPlay, onPause, onError]);

    // Combinar refs
    const combinedRef = (node: HTMLVideoElement) => {
      videoRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <video
        ref={combinedRef}
        className={className}
        src={src}
        muted={muted}
        loop={loop}
        preload={preload}
        playsInline={playsInline}
        crossOrigin={crossOrigin}
        autoPlay={autoPlay}
        style={style}
        {...props}
      >
        {children}
      </video>
    );
  }
);

MobileOptimizedVideo.displayName = 'MobileOptimizedVideo';

export default MobileOptimizedVideo;
