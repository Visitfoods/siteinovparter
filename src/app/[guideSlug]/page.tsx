"use client";

import StaticGuidePage from './page-static';

type PageProps = { params: { guideSlug: string } };

export default function GuideWrapper({ params }: PageProps) {
  // Usar a versão estática da página, sem dependências do Firebase
  return <StaticGuidePage params={params} />;
}