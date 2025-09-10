'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuideView from './__pp_copy/page';
import { staticGuideData, GuideVideos } from '../../data/staticData';

type PageProps = { params: { guideSlug: string } };

export default function StaticGuidePage({ params }: PageProps) {
  const { guideSlug } = params;
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [guideVideos, setGuideVideos] = useState<GuideVideos>({
    backgroundVideoURL: null,
    welcomeVideoURL: null,
    systemPrompt: null,
    chatConfig: null,
    helpPoints: null,
    humanChatEnabled: null,
    faq: null,
    contactInfo: null,
    chatIconURL: null,
    captions: null
  });

  useEffect(() => {
    let aborted = false;
    
    async function loadStaticData() {
      try {
        console.log('🔍 Loading static guide with slug:', guideSlug);
        
        // Carregar dados estáticos
        // Só permitimos o acesso ao guia inovpartner
        if (guideSlug !== 'inovpartner') {
          console.log('❌ Acesso apenas ao guia inovpartner é permitido');
          if (!aborted) {
            setNotFound(true);
          }
          return;
        }
        
        const data = staticGuideData.inovpartner;

        // Verificar se o guia está ativo
        if (data.isActive === false) {
          console.log('❌ Guia inativo:', guideSlug);
          if (!aborted) {
            setNotFound(true);
          }
          return;
        }
        
        console.log('✅ Guia estático carregado com sucesso:', data?.name, 'isActive:', data?.isActive);

        // Extrair dados do guia encontrado
        const prompt = data?.systemPrompt || '';
        const videos = {
          backgroundVideoURL: data?.backgroundVideoURL || null,
          welcomeVideoURL: data?.welcomeVideoURL || null
        };
        
        // Atualizar título e meta description do documento (SEO)
        try {
          const metaTitle: string = data?.metaTitle || data?.name || 'Guia Virtual';
          const metaDescription: string = data?.metaDescription || 'Guia Virtual';
          if (typeof document !== 'undefined') {
            document.title = metaTitle;
            let descEl: HTMLMetaElement | null = document.querySelector('meta[name="description"]');
            if (!descEl) {
              descEl = document.createElement('meta');
              descEl.setAttribute('name', 'description');
              document.head.appendChild(descEl);
            }
            descEl.setAttribute('content', metaDescription);

            // Open Graph e Twitter dinâmicos
            const ensureTag = (selector: string, attr: 'content' | 'href', value: string) => {
              let el = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
              if (!el) {
                const isLink = selector.startsWith('link');
                el = document.createElement(isLink ? 'link' : 'meta') as any;
                const attrName = selector.includes('property=') ? 'property' : selector.includes('name=') ? 'name' : 'rel';
                const match = selector.match(/(?:property|name|rel)="([^"]+)"/);
                el.setAttribute(attrName, match?.[1] || '');
                document.head.appendChild(el);
              }
              el.setAttribute(attr, value);
            };

            const pageUrl = window.location.href;
            const imageCandidate = (data?.chatIconURL || '/imageminov.jpg') as string;
            const absoluteImage = imageCandidate.startsWith('http')
              ? imageCandidate
              : `${window.location.origin}${imageCandidate.startsWith('/') ? '' : '/'}${imageCandidate}`;

            ensureTag('meta[property="og:title"]', 'content', metaTitle);
            ensureTag('meta[property="og:description"]', 'content', metaDescription);
            ensureTag('meta[property="og:type"]', 'content', 'website');
            ensureTag('meta[property="og:url"]', 'content', pageUrl);
            ensureTag('meta[property="og:site_name"]', 'content', 'Inov Partner');
            ensureTag('meta[property="og:image"]', 'content', absoluteImage);

            ensureTag('meta[name="twitter:card"]', 'content', 'summary');
            ensureTag('meta[name="twitter:title"]', 'content', metaTitle);
            ensureTag('meta[name="twitter:description"]', 'content', metaDescription);
            ensureTag('meta[name="twitter:image"]', 'content', absoluteImage);

            ensureTag('link[rel="canonical"]', 'href', pageUrl);
          }
        } catch {
          // Ignorar erros silenciosamente para não bloquear render
        }

        if (!aborted) {
          setGuideVideos({
            backgroundVideoURL: videos.backgroundVideoURL,
            welcomeVideoURL: videos.welcomeVideoURL,
            systemPrompt: prompt,
            chatConfig: data?.chatConfig || null,
            helpPoints: data?.helpPoints || null,
            humanChatEnabled: typeof data?.humanChatEnabled === 'boolean' ? data.humanChatEnabled : null,
            faq: data?.faq || null,
            contactInfo: data?.contactInfo || null,
            chatIconURL: data?.chatIconURL || null,
            captions: data?.captions || null
          });
          setReady(true);
        }
      } catch (e) {
        console.error('Erro ao carregar dados estáticos do guia', e);
        setNotFound(true);
      } finally {
        if (!aborted) setReady(true);
      }
    }
    
    loadStaticData();
    return () => { aborted = true; };
  }, [guideSlug]);

  // Redirecionar quando não existir o guia
  useEffect(() => {
    if (notFound && ready) {
      router.replace('/404');
    }
  }, [notFound, ready, router]);

  if (!ready) {
    return null;
  }

  if (notFound) {
    return null;
  }

  console.log('📊 Dados estáticos passados para GuideView:', {
    backgroundVideoURL: guideVideos.backgroundVideoURL,
    welcomeVideoURL: guideVideos.welcomeVideoURL,
    systemPrompt: guideVideos.systemPrompt?.substring(0, 50) + '...',
    chatConfig: guideVideos.chatConfig,
    helpPoints: guideVideos.helpPoints,
    humanChatEnabled: guideVideos.humanChatEnabled,
    faq: guideVideos.faq ? `${guideVideos.faq.length} categorias` : null,
    contactInfo: guideVideos.contactInfo ? 'Configurado' : null,
    chatIconURL: guideVideos.chatIconURL,
    captions: guideVideos.captions ? 'Configurado' : null
  });
  
  return <GuideView guideVideos={guideVideos} guideSlug={guideSlug} />;
}
