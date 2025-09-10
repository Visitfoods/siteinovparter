// Serviço de chat do guia sem dependência do Firebase
// Implementa uma versão local do chat do guia usando localStorage

import { v4 as uuidv4 } from 'uuid';

// Tipos de dados
export interface GuideChatMessage {
  id: string;
  text: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  isRead: boolean;
  metadata?: {
    showWhenOpenedByGuide?: boolean;
    isTransitionMessage?: boolean;
    guideResponse?: boolean;
    closingMessage?: boolean;
    messageType?: 'text' | 'image' | 'file';
    fileUrl?: string;
    responseTime?: number;
    fromChatbot?: boolean;
  };
}

export interface GuideConversation {
  id: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  lastMessageAt?: number;
  status: 'active' | 'closed' | 'pending';
  userName: string;
  userContact: string;
  guideId: string;
  messages: GuideChatMessage[];
}

// Simulação de IDs
const GUIDE_ID = 'guide-system';
const SYSTEM_ID = 'system';
const USER_ID = 'user';

// Funções auxiliares para armazenamento local
function getLocalGuideConversations(): Record<string, GuideConversation> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const stored = localStorage.getItem('guide_conversations');
  if (!stored) {
    return {};
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    // Erro ao analisar conversas do guia armazenadas
    return {};
  }
}

function saveLocalGuideConversations(conversations: Record<string, GuideConversation>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('guide_conversations', JSON.stringify(conversations));
  } catch (error) {
    // Erro ao salvar conversas do guia
  }
}

// Funções para gerenciar cookies (necessário para compatibilidade)
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Função para criar uma nova conversa com o guia
export function createGuideConversation(
  userName: string,
  userContact: string,
  guideId: string
): string {
  const conversationId = uuidv4();
  const now = Date.now();
  
  // Criar mensagem de boas-vindas do sistema
  const welcomeMessage: GuideChatMessage = {
    id: uuidv4(),
    text: `Olá ${userName}! Bem-vindo ao chat com o guia. Como posso ajudar?`,
    timestamp: now,
    senderId: GUIDE_ID,
    senderName: 'Guia Virtual',
    isRead: false,
    metadata: {
      showWhenOpenedByGuide: true,
      guideResponse: true
    }
  };
  
  // Criar a conversa
  const conversation: GuideConversation = {
    id: conversationId,
    createdAt: now,
    updatedAt: now,
    lastMessage: welcomeMessage.text,
    lastMessageAt: now,
    status: 'active',
    userName,
    userContact,
    guideId,
    messages: [welcomeMessage]
  };
  
  // Salvar a conversa localmente
  const conversations = getLocalGuideConversations();
  conversations[conversationId] = conversation;
  saveLocalGuideConversations(conversations);
  
  // Salvar o ID da conversa em cookie para persistência
  setCookie('guide_conversation_id', conversationId);
  setCookie('guide_user_name', userName);
  setCookie('guide_user_contact', userContact);
  
  return conversationId;
}

// Função para enviar uma mensagem para o guia
export function sendGuideMessage(
  conversationId: string,
  text: string,
  fromUser: boolean = true
): GuideChatMessage {
  const conversations = getLocalGuideConversations();
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    throw new Error('Conversa com o guia não encontrada');
  }
  
  const now = Date.now();
  const message: GuideChatMessage = {
    id: uuidv4(),
    text,
    timestamp: now,
    senderId: fromUser ? USER_ID : GUIDE_ID,
    senderName: fromUser ? conversation.userName : 'Guia Virtual',
    isRead: false,
    metadata: fromUser ? undefined : {
      guideResponse: true
    }
  };
  
  // Adicionar a mensagem à conversa
  conversation.messages.push(message);
  conversation.lastMessage = text;
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;
  
  saveLocalGuideConversations(conversations);
  
  // Se for uma mensagem do usuário, simular uma resposta do guia após um pequeno atraso
  if (fromUser) {
    setTimeout(() => {
      // Simular uma resposta do guia
      const responseText = getGuideResponse(text);
      sendGuideMessage(conversationId, responseText, false);
    }, 1500); // Atraso de 1.5 segundos para simular processamento
  }
  
  return message;
}

// Função para obter uma resposta simulada do guia
function getGuideResponse(userMessage: string): string {
  // Lista de respostas genéricas
  const responses = [
    "Obrigado pela sua mensagem! Como posso ajudar mais?",
    "Estou aqui para ajudar. Tem mais alguma questão?",
    "Entendi sua pergunta. Vou procurar a melhor resposta para você.",
    "Ótima pergunta! Deixe-me pensar na melhor forma de ajudar.",
    "Agradeço seu contato. Estou aqui para fornecer as informações que precisa.",
    "Compreendo o que está perguntando. Vamos explorar isso juntos.",
    "Estou processando sua pergunta. Tem mais algum detalhe que gostaria de adicionar?",
    "Interessante! Vou ajudar com essa questão da melhor forma possível."
  ];
  
  // Selecionar uma resposta aleatória
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Função para escutar as mensagens de uma conversa com o guia
export function listenToGuideConversation(
  conversationId: string,
  callback: (messages: GuideChatMessage[]) => void
): () => void {
  // Implementação inicial: retornar as mensagens atuais
  const conversations = getLocalGuideConversations();
  const conversation = conversations[conversationId];
  
  if (conversation) {
    callback([...conversation.messages]);
  }
  
  // Configurar um intervalo para verificar novas mensagens (simula o listener em tempo real)
  const intervalId = setInterval(() => {
    const updatedConversations = getLocalGuideConversations();
    const updatedConversation = updatedConversations[conversationId];
    
    if (updatedConversation) {
      callback([...updatedConversation.messages]);
    }
  }, 1000); // Verificar a cada segundo
  
  // Retornar uma função para cancelar o listener
  return () => {
    clearInterval(intervalId);
  };
}

// Função para obter uma conversa com o guia
export function getGuideConversation(conversationId: string): GuideConversation | null {
  const conversations = getLocalGuideConversations();
  return conversations[conversationId] || null;
}

// Função para fechar uma conversa com o guia
export function closeGuideConversation(conversationId: string): void {
  const conversations = getLocalGuideConversations();
  const conversation = conversations[conversationId];
  
  if (conversation) {
    conversation.status = 'closed';
    conversation.updatedAt = Date.now();
    saveLocalGuideConversations(conversations);
    
    // Limpar cookies
    deleteCookie('guide_conversation_id');
    deleteCookie('guide_user_name');
    deleteCookie('guide_user_contact');
  }
}
