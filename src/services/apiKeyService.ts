// Obtém a chave API das variáveis de ambiente
export const getApiKey = () => {
  return process.env.NEXT_PUBLIC_API_KEY;
};

// Headers padrão para todas as requisições que precisam de autenticação
export const getAuthHeaders = () => {
  const apiKey = getApiKey();
  return apiKey ? { 'x-api-key': apiKey } : {};
};

// Função auxiliar para adicionar headers de autenticação ao fetch
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
  };

  // Só adicionar headers de autenticação se for para o nosso servidor
  if (url.startsWith('/api/') || url.includes('virtualguide.info')) {
    const authHeaders = getAuthHeaders();
    Object.assign(headers, authHeaders);
  }

  return fetch(url, { ...options, headers });
};