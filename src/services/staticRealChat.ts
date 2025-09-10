// Serviço de chat real sem dependência do Firebase
// Implementa uma versão local do chat real usando localStorage

import { v4 as uuidv4 } from 'uuid';

// Tipos de dados
export interface ChatMessage {
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
    isTyping?: boolean;
    fromChatbot?: boolean;
  };
}

export interface Conversation {
  id: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  lastMessageAt?: number;
  status: 'active' | 'closed' | 'pending';
  userName: string;
  userContact: string;
  guideId: string;
  messages: ChatMessage[];
}

// Simulação de IDs
const GUIDE_ID = 'guide-system';
const SYSTEM_ID = 'system';

// Funções auxiliares para armazenamento local
function getLocalRealConversations(): Record<string, Conversation> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const stored = localStorage.getItem('real_conversations');
  if (!stored) {
    return {};
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    // Erro ao analisar conversas reais armazenadas
    return {};
  }
}

function saveLocalRealConversations(conversations: Record<string, Conversation>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('real_conversations', JSON.stringify(conversations));
  } catch (error) {
    // Erro ao salvar conversas reais
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

// Função para criar uma nova conversa
export function createConversation(
  userName: string,
  userContact: string,
  guideId: string
): string {
  const conversationId = uuidv4();
  const now = Date.now();
  
  // Criar mensagem de boas-vindas do sistema
  const welcomeMessage: ChatMessage = {
    id: uuidv4(),
    text: `Olá ${userName}! Bem-vindo ao chat. Como posso ajudar?`,
    timestamp: now,
    senderId: SYSTEM_ID,
    senderName: 'Sistema',
    isRead: false,
    metadata: {
      showWhenOpenedByGuide: true
    }
  };
  
  // Criar a conversa
  const conversation: Conversation = {
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
  const conversations = getLocalRealConversations();
  conversations[conversationId] = conversation;
  saveLocalRealConversations(conversations);
  
  // Salvar o ID da conversa em cookie para persistência
  setCookie('chat_conversation_id', conversationId);
  setCookie('chat_user_name', userName);
  setCookie('chat_user_contact', userContact);
  
  return conversationId;
}

// Função para enviar uma mensagem
export function sendMessage(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string
): ChatMessage {
  const conversations = getLocalRealConversations();
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    throw new Error('Conversa não encontrada');
  }
  
  const now = Date.now();
  const message: ChatMessage = {
    id: uuidv4(),
    text,
    timestamp: now,
    senderId,
    senderName,
    isRead: false
  };
  
  // Adicionar a mensagem à conversa
  conversation.messages.push(message);
  conversation.lastMessage = text;
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;
  
  saveLocalRealConversations(conversations);
  
  return message;
}

// Função para escutar as mensagens de uma conversa (simula o listener do Firebase)
export function listenToConversation(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  // Implementação inicial: retornar as mensagens atuais
  const conversations = getLocalRealConversations();
  const conversation = conversations[conversationId];
  
  if (conversation) {
    callback([...conversation.messages]);
  }
  
  // Configurar um intervalo para verificar novas mensagens (simula o listener em tempo real)
  const intervalId = setInterval(() => {
    const updatedConversations = getLocalRealConversations();
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

// Função para obter uma conversa
export function getConversation(conversationId: string): Conversation | null {
  const conversations = getLocalRealConversations();
  return conversations[conversationId] || null;
}

// Função para fechar uma conversa
export function closeConversation(conversationId: string): void {
  const conversations = getLocalRealConversations();
  const conversation = conversations[conversationId];
  
  if (conversation) {
    conversation.status = 'closed';
    conversation.updatedAt = Date.now();
    saveLocalRealConversations(conversations);
    
    // Limpar cookies
    deleteCookie('chat_conversation_id');
    deleteCookie('chat_user_name');
    deleteCookie('chat_user_contact');
  }
}

// Função para salvar um pedido de contato
export function saveContactRequest(
  name: string,
  contact: string,
  guideId: string
): string {
  // Criar um ID para o pedido de contato
  const requestId = uuidv4();
  
  // Criar uma conversa especial para o pedido de contato
  const now = Date.now();
  const conversation: Conversation = {
    id: requestId,
    createdAt: now,
    updatedAt: now,
    lastMessage: `Pedido de contato de ${name}`,
    lastMessageAt: now,
    status: 'pending',
    userName: name,
    userContact: contact,
    guideId,
    messages: [{
      id: uuidv4(),
      text: `Pedido de contato de ${name} (${contact})`,
      timestamp: now,
      senderId: SYSTEM_ID,
      senderName: 'Sistema',
      isRead: false,
      metadata: {
        showWhenOpenedByGuide: true
      }
    }]
  };
  
  // Salvar a conversa localmente
  const conversations = getLocalRealConversations();
  conversations[requestId] = conversation;
  saveLocalRealConversations(conversations);
  
  return requestId;
}
