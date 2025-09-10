// Este arquivo agora importa os serviços estáticos em vez de usar o Firebase
// Isso mantém a compatibilidade com o código existente

import {
  createConversation as createStaticConversation,
  sendMessage as sendStaticMessage,
  listenToConversation as listenToStaticConversation,
  getConversation as getStaticConversation,
  closeConversation as closeStaticConversation,
  saveContactRequest as saveStaticContactRequest,
  ChatMessage,
  Conversation
} from '../services/staticRealChat';

// Reexportar tipos
export type { ChatMessage, Conversation };

// Reexportar funções com os mesmos nomes
export const createConversation = createStaticConversation;
export const sendMessage = sendStaticMessage;
export const listenToConversation = listenToStaticConversation;
export const getConversation = getStaticConversation;
export const closeConversation = closeStaticConversation;
export const saveContactRequest = saveStaticContactRequest;