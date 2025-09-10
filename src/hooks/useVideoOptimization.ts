import { useEffect, useState, useCallback } from 'react';

interface VideoOptimizationConfig {
  isMobile: boolean;
  isLowEndDevice: boolean;
  connectionType: string;
  supportsPiP: boolean;
  recommendedPreload: string;
  recommendedVolume: number;
  devicePerformance: 'very-low' | 'low' | 'normal' | 'high';
  dynamicQuality: number;
  shouldReduceQuality: boolean;
  recommendedPlaybackRate: number;
  recommendedScale: number;
  recommendedBlur: number;
}

export const useVideoOptimization = (): VideoOptimizationConfig => {
  const [config, setConfig] = useState<VideoOptimizationConfig>({
    isMobile: false,
    isLowEndDevice: false,
    connectionType: 'unknown',
    supportsPiP: false,
    recommendedPreload: 'auto',
    recommendedVolume: 1.0,
    devicePerformance: 'normal',
    dynamicQuality: 1.0,
    shouldReduceQuality: false,
    recommendedPlaybackRate: 1.0,
    recommendedScale: 1.0,
    recommendedBlur: 0
  });

  const detectDeviceCapabilities = useCallback(() => {
    // Detectar se é mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detectar capacidades do dispositivo
    const memory = (navigator as any).deviceMemory || 4; // GB
    const cores = navigator.hardwareConcurrency || 4;
    const connection = (navigator as any).connection?.effectiveType || '4g';
    const isLowEndDevice = navigator.hardwareConcurrency <= 2;
    
    // Detectar tipo de conexão
    let connectionType = 'unknown';
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connectionType = connection.effectiveType || connection.type || 'unknown';
    }
    
    // Detectar suporte a PiP
    const supportsPiP = document.pictureInPictureEnabled || 'pictureInPictureEnabled' in document;
    
    // Calcular score de performance (0-100)
    let performanceScore = 100;
    
    // Penalizar por memória baixa
    if (memory <= 1) performanceScore -= 40;
    else if (memory <= 2) performanceScore -= 25;
    else if (memory <= 4) performanceScore -= 10;
    
    // Penalizar por poucos cores
    if (cores <= 1) performanceScore -= 30;
    else if (cores <= 2) performanceScore -= 20;
    else if (cores <= 4) performanceScore -= 10;
    
    // Penalizar por conexão lenta
    if (connection === 'slow-2g') performanceScore -= 35;
    else if (connection === '2g') performanceScore -= 25;
    else if (connection === '3g') performanceScore -= 15;
    
    // Penalizar por ser mobile (geralmente menos potente)
    if (isMobile) performanceScore -= 15;
    
    // Determinar performance do dispositivo
    let devicePerformance: 'very-low' | 'low' | 'normal' | 'high';
    let dynamicQuality = 1.0;
    let shouldReduceQuality = false;
    let recommendedPlaybackRate = 1.0;
    let recommendedScale = 1.0;
    let recommendedBlur = 0;
    
    if (performanceScore >= 80) {
      devicePerformance = 'high';
    } else if (performanceScore >= 60) {
      devicePerformance = 'normal';
    } else if (performanceScore >= 30) {
      devicePerformance = 'low';
      dynamicQuality = 0.8;
      shouldReduceQuality = true;
      recommendedPlaybackRate = 0.95;
      recommendedScale = 0.85;
      recommendedBlur = 0.3;
    } else {
      devicePerformance = 'very-low';
      dynamicQuality = 0.6;
      shouldReduceQuality = true;
      recommendedPlaybackRate = 0.9;
      recommendedScale = 0.7;
      recommendedBlur = 0.5;
    }
    
    // Determinar preload recomendado
    let recommendedPreload = 'auto';
    if (isMobile && connectionType === 'slow-2g') {
      recommendedPreload = 'metadata';
    } else if (isLowEndDevice) {
      recommendedPreload = 'metadata';
    } else if (devicePerformance === 'very-low') {
      recommendedPreload = 'none';
    }
    
    // Determinar volume recomendado
    let recommendedVolume = 1.0;
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      recommendedVolume = 0.7;
    } else if (devicePerformance === 'very-low') {
      recommendedVolume = 0.6;
    } else if (devicePerformance === 'low') {
      recommendedVolume = 0.8;
    }
    
    setConfig({
      isMobile,
      isLowEndDevice,
      connectionType,
      supportsPiP,
      recommendedPreload,
      recommendedVolume,
      devicePerformance,
      dynamicQuality,
      shouldReduceQuality,
      recommendedPlaybackRate,
      recommendedScale,
      recommendedBlur
    });

    console.log('🎯 Otimização de vídeo detectada:', {
      performanceScore,
      memory: `${memory}GB`,
      cores,
      connection,
      isMobile,
      devicePerformance,
      dynamicQuality,
      recommendedScale,
      recommendedBlur
    });
  }, []);

  useEffect(() => {
    detectDeviceCapabilities();
    
    // Re-detecta quando a conexão muda
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
             const handleConnectionChange = () => {
         detectDeviceCapabilities();
       };
      
      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, [detectDeviceCapabilities]);

  return config;
};

// Hook específico para otimizações de PiP
export const usePiPOptimization = () => {
  const { isMobile, isLowEndDevice, connectionType, supportsPiP } = useVideoOptimization();
  
  const getPiPOptimizations = useCallback(() => {
    const optimizations = {
      preload: 'metadata' as string,
      volume: 1.0 as number,
      playbackRate: 1.0 as number,
      bufferSize: 10 as number // segundos
    };

    if (isMobile) {
      if (isLowEndDevice) {
        optimizations.volume = 0.8;
        optimizations.bufferSize = 5;
      }
      
      if (connectionType === 'slow-2g' || connectionType === '2g') {
        optimizations.volume = 0.6;
        optimizations.bufferSize = 3;
      }
    }

         return optimizations;
  }, [isMobile, isLowEndDevice, connectionType]);

  return {
    supportsPiP,
    getPiPOptimizations,
    isMobile,
    isLowEndDevice,
    connectionType
  };
};
