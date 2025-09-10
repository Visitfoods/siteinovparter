'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Import de Image removido pois não é mais utilizado
import BackofficeAuthGuard from '../../components/BackofficeAuthGuard';
import { useAuth } from '../../hooks/useAuth';
// Imports relacionados ao Firebase removidos temporariamente
// Serão adicionados novamente quando o novo projeto Firebase for configurado
import styles from './backoffice.module.css';

// Interface simplificada sem referências a guias

// Esta página agora apenas redireciona para /conversations
export default function BackofficeRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // Estado simplificado sem referências a guias

  // Configuração do Firebase será feita posteriormente
  // após a criação do novo projeto Firebase

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!authLoading && !isAuthenticated) {
      console.log('🔍 DEBUG: Não autenticado, redirecionando para login...');
      router.push('/backoffice/login');
      return;
    }
    
    // Se estiver autenticado, carregar dados
    if (isAuthenticated && user) {

      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Removida a busca de guias pois o sistema terá apenas um guia estático

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Sempre redirecionar para a página de conversas
        router.push('/backoffice/conversations');
      } else {
        // Se não estiver autenticado, redirecionar para login
        router.push('/backoffice/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>A carregar...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  if (user?.role !== 'admin') {
    return null; // Será redirecionado
  }

  // Mostrar opções para superadmin
  return (
    <BackofficeAuthGuard requiredRole="admin">
      <div className={styles.backofficeHome}>
        {/* Barra de navegação pequena no topo */}
      <nav className={styles.topNav}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <img src="/logoinov/Inov-branco.png" alt="Inov Partner" className={styles.navLogoInov} />
          </div>
          <div className={styles.navRight}>
              <Link href="/backoffice/conversations" className={styles.navLink}>Conversas</Link>
              {/* Botão de adicionar guias removido */}
              <div className={styles.userInfo}>
                <span className={styles.userIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5z"/>
                  </svg>
                </span>
                <span className={styles.userName}>{user?.username ? String(user.username) : 'Admin'}</span>
              </div>
              <button 
                onClick={() => {
                  console.log('🔍 DEBUG: Logout solicitado...');
                  logout().then(() => {
                    console.log('🔍 DEBUG: Logout bem-sucedido, redirecionando...');
                    router.push('/backoffice/login');
                  }).catch((error) => {
                    console.error('🔍 DEBUG: Erro no logout:', error);
                  });
                }}
                className={styles.logoutButton}
              >
                <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
        </div>
      </nav>
      
      <div className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h1>Bem-vindo ao painel de administração</h1>
          <p>Gerencie as conversas do chat com o guia virtual</p>
        </div>
        
        <div className={styles.backofficeActions}>
          <Link href="/backoffice/conversations" className={styles.backofficeActionButton}>
            <span className={styles.actionIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"/>
              </svg>
            </span>
            <div className={styles.actionContent}>
              <h3>Conversas</h3>
              <p>Gerir conversas de chat com o guia virtual</p>
            </div>
          </Link>
        </div>

        {/* Secção de guias criados removida */}
      </div>
    </div>
    </BackofficeAuthGuard>
  );
} 