'use client';

import React, { useEffect, useMemo } from 'react';
import MobileOptimizedVideo from './MobileOptimizedVideo';
import PiPOptimizedVideo from './PiPOptimizedVideo';
import { GuideVideos } from '../data/staticData';

type StaticGuideViewProps = {
  guideVideos: GuideVideos;
  guideSlug: string;
  onShowActionButtonsChange?: (show: boolean) => void;
};

export default function StaticGuideView({ guideVideos, guideSlug, onShowActionButtonsChange }: StaticGuideViewProps) {
  useEffect(() => {
    onShowActionButtonsChange?.(false);
  }, [onShowActionButtonsChange]);

  const hasBackground = Boolean(guideVideos.backgroundVideoURL);
  const hasWelcome = Boolean(guideVideos.welcomeVideoURL);

  const videoSrc = useMemo(() => {
    return hasWelcome ? guideVideos.welcomeVideoURL : hasBackground ? guideVideos.backgroundVideoURL : null;
  }, [hasBackground, hasWelcome, guideVideos.backgroundVideoURL, guideVideos.welcomeVideoURL]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {videoSrc ? (
        <MobileOptimizedVideo
          src={videoSrc}
          className="static-guide-bg-video"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          {guideVideos.captions?.desktop && (
            <track kind="captions" src={guideVideos.captions.desktop} srcLang="pt" label="Português (PC)" default />
          )}
          {guideVideos.captions?.tablet && (
            <track kind="captions" src={guideVideos.captions.tablet} srcLang="pt" label="Português (Tablet)" />
          )}
          {guideVideos.captions?.mobile && (
            <track kind="captions" src={guideVideos.captions.mobile} srcLang="pt" label="Português (Mobile)" />
          )}
        </MobileOptimizedVideo>
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <p style={{ fontSize: 18 }}>Conteúdo indisponível</p>
        </div>
      )}

      {/* Camada de branding mínima sem chat */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))',
          color: '#fff'
        }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 0.4 }}>Inov Partner</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>{guideSlug}</div>
      </div>
    </div>
  );
}


