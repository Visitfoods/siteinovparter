'use client';

import React, { useState, useEffect } from 'react';
import styles from './PrivacyBanner.module.css';

export default function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se o utilizador já aceitou as políticas
    const hasAccepted = localStorage.getItem('privacy-policy-accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-policy-accepted', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Redirecionar para uma página de saída ou mostrar mensagem
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.text}>
          <p>
            <strong>🍪 Utilizamos cookies e recolhemos dados pessoais</strong>
          </p>
          <p>
            Este website utiliza cookies e recolhe dados pessoais para melhorar a sua experiência. 
            Ao continuar a navegar, aceita a nossa{' '}
            <a href="/politicas-privacidade" className={styles.link} target="_blank" rel="noopener noreferrer">
              Política de Privacidade
            </a>.
          </p>
        </div>
        <div className={styles.buttons}>
          <button 
            onClick={handleAccept}
            className={styles.acceptButton}
          >
            Aceitar
          </button>
          <button 
            onClick={handleDecline}
            className={styles.declineButton}
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
