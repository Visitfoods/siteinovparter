// Este arquivo importa os serviços estáticos em vez de usar o Firebase
// Isso mantém a compatibilidade com o código existente

import {
  createGuideConversation as createStaticGuideConversation,
  sendGuideMessage as sendStaticGuideMessage,
  listenToGuideConversation as listenToStaticGuideConversation,
  getGuideConversation as getStaticGuideConversation,
  closeGuideConversation as closeStaticGuideConversation,
  GuideChatMessage,
  GuideConversation
} from '../services/staticGuideChat';

// Reexportar tipos
export type { GuideChatMessage, GuideConversation };

// Reexportar funções com os mesmos nomes
export const createGuideConversation = createStaticGuideConversation;
export const sendGuideMessage = sendStaticGuideMessage;
export const listenToGuideConversation = listenToStaticGuideConversation;
export const getGuideConversation = getStaticGuideConversation;
export const closeGuideConversation = closeStaticGuideConversation;
