import type { Metadata } from 'next';
import { ReactNode } from 'react';
// Removido Firebase

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { guideSlug: string } }): Promise<Metadata> {
  const guideSlug = params.guideSlug;

  // Defaults
  let title = 'VirtualGuide - Guia Virtual Inteligente';
  let description = 'Sistema de guia virtual inteligente com IA';
  let image: string | undefined = undefined;
  const baseUrl = 'https://virtualguide.info';

  // Firebase removido: usar defaults

  const absoluteImage = image
    ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`)
    : `${baseUrl}/imageminov.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/${guideSlug}`,
      siteName: 'VirtualGuide',
      images: [absoluteImage],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [absoluteImage],
    },
    alternates: {
      canonical: `${baseUrl}/${guideSlug}`,
    },
  };
}

export default function GuideSegmentLayout({ children }: { children: ReactNode }) {
  return children as any;
}


