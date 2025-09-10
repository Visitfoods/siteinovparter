'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackofficeAuthGuard from '../../../components/BackofficeAuthGuard';

export default function SelectRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de conversas
    router.push('/backoffice/conversations');
  }, [router]);

    return (
    <BackofficeAuthGuard>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>A redirecionar para a página de conversas...</p>
    </div>
    </BackofficeAuthGuard>
  );
}

