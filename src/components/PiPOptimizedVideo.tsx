'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import MobileOptimizedVideo from './MobileOptimizedVideo';
import { useVideoOptimization } from '../hooks/useVideoOptimization';

interface PiPOptimizedVideoProps {
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

const PiPOptimizedVideo = forwardRef<HTMLVideoElement, PiPOptimizedVideoProps>(
  (props, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPiPReady, setIsPiPReady] = useState(false);
    const videoOptimization = useVideoOptimization();

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Aplicar otimizações baseadas na performance do dispositivo
      const { devicePerformance, recommendedPreload, recommendedVolume, recommendedPlaybackRate, recommendedScale, recommendedBlur } = videoOptimization;
      
      // Configurar para melhor performance em PiP
      video.playsInline = true;
      video.preload = recommendedPreload as any;
      video.volume = recommendedVolume;
      video.playbackRate = recommendedPlaybackRate;
      
      // Aplicar otimizações visuais baseadas na performance
      if (devicePerformance === 'low') {
        video.style.transform = `scale(${recommendedScale})`;
        video.style.filter = `blur(${recommendedBlur}px) contrast(1.02)`;
        video.classList.add('optimized-low');
      } else if (devicePerformance === 'very-low') {
        video.style.transform = `scale(${recommendedScale})`;
        video.style.filter = `blur(${recommendedBlur}px) contrast(1.05) brightness(0.98)`;
        video.classList.add('optimized-very-low');
      }
      
      // Detectar se o dispositivo suporta PiP
      if (document.pictureInPictureEnabled || 'pictureInPictureEnabled' in document) {
        // Preparar PiP com antecedência
        video.addEventListener('loadedmetadata', () => {
          setIsPiPReady(true);
          
          // Só carregar mais dados se não for dispositivo muito fraco
          if (devicePerformance !== 'very-low') {
            video.preload = 'auto';
          }
        }, { once: true });
      }

             // 3. Event listeners específicos para PiP
       const handleCanPlay = () => {
         // PiP - vídeo pronto para tocar
       };

       const handlePlay = () => {
         // PiP - iniciando reprodução
       };

       const handlePause = () => {
         // PiP - pausado
       };

       const handleError = (e: any) => {
         props.onError?.(e);
       };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }, [videoOptimization, props.onError]);

    return (
      <MobileOptimizedVideo
        ref={(node) => {
          videoRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        {...props}
      />
    );
  }
);

PiPOptimizedVideo.displayName = 'PiPOptimizedVideo';

export default PiPOptimizedVideo;
