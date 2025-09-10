// Exporta todos os serviços estáticos para facilitar a importação

// Reexportar serviços estáticos
export * from './staticAiChat';
export * from './staticRealChat';
export * from './staticGuideChat';

// Função para verificar se o navegador suporta localStorage
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Função para limpar todos os dados de chat do localStorage
export function clearAllChatData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('static_conversations');
    localStorage.removeItem('real_conversations');
    localStorage.removeItem('guide_conversations');
    
    // Limpar cookies relacionados
    const cookies = ['chat_conversation_id', 'chat_user_name', 'chat_user_contact', 
                     'guide_conversation_id', 'guide_user_name', 'guide_user_contact'];
    
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
    
  } catch (error) {
    // Erro ao limpar dados de chat
  }
}
