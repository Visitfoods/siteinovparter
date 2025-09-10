'use client';

import StaticGuideWrapper from './static-page';

export default function HomeAsStaticVirtualGuide() {
  // Usa a versão estática da página, sem dependências do Firebase
  return <StaticGuideWrapper />;
}