'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackofficeAuthGuard from '../../../components/BackofficeAuthGuard';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../backoffice.module.css';

// Interface simplificada para usuário
interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  active: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagement() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utilizador fixo em vez de lista dinâmica
  const [users] = useState<User[]>([
    {
      id: 'admin',
      username: 'admin',
      password: '********',
      role: 'admin',
      active: true,
      description: 'Administrador do sistema',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    // Definir loading como false após um curto período para simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <BackofficeAuthGuard>
      <div className={styles.backofficeContainer}>
        {/* Barra de navegação pequena no topo */}
        <nav className={styles.topNav}>
          <div className={styles.navContainer}>
            <div className={styles.navLeft}></div>
            <div className={styles.navRight}>
              <Link href="/backoffice" className={styles.navLink}>Administração</Link>
              <Link href="/backoffice/conversations" className={styles.navLink}>Conversas</Link>
              <Link href="/backoffice/users" className={styles.navLink}>Utilizador</Link>
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
                  logout().then(() => {
                    router.push('/backoffice/login');
                  }).catch((error) => {
                    console.error('Erro no logout:', error);
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
          <div className={styles.pageHeader}>
            <h1>Utilizador</h1>
            <p>Informações do utilizador administrador</p>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2>Utilizador do Sistema</h2>
              {error && <div className={styles.errorMessage}>{error}</div>}
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.filterBar}>
                <div className={styles.filterBarLeft}>
                  <h3>Detalhes do Utilizador</h3>
                </div>
              </div>
              
              <div className={styles.tableWrap}>
                {loading ? (
                  <div className={styles.loadingState}>A carregar...</div>
                ) : (
                  <table className={styles.dataTable}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #333' }}>
                        <th>Username</th>
                        <th>Função</th>
                        <th>Descrição</th>
                        <th>Criado</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className={styles.userCell}>
                              <span className={styles.userIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5z"/>
                                </svg>
                              </span>
                              <span className={styles.userName}>{userItem.username}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.roleTag} ${userItem.role === 'admin' ? styles.adminRole : styles.userRole}`}>
                              {userItem.role === 'admin' ? 'Admin' : 'Utilizador'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.descriptionCell}>
                              {userItem.description || '-'}
                            </div>
                          </td>
                          <td>
                            {new Date(userItem.createdAt).toLocaleDateString('pt-PT')}
                          </td>
                          <td>
                            <span className={`${styles.statusTag} ${userItem.active ? styles.activeStatus : styles.inactiveStatus}`}>
                              {userItem.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackofficeAuthGuard>
  );
}

