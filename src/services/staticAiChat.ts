// Serviço de chat com IA usando system prompt estática

// Tipos para as mensagens de chat
export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Interface para armazenamento local das conversas
interface LocalConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Função para gerar um ID único
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Função para criar uma nova conversa
export function createStaticConversation(systemPrompt: string): string {
  const conversationId = generateId();
  const conversation: LocalConversation = {
    id: conversationId,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Armazenar a conversa localmente
  const conversations = getLocalConversations();
  conversations[conversationId] = conversation;
  saveLocalConversations(conversations);

  return conversationId;
}

// Função para enviar uma mensagem para a conversa
export async function sendStaticMessage(
  conversationId: string,
  message: string
): Promise<ChatMessage> {
  // Obter a conversa do armazenamento local
  const conversations = getLocalConversations();
  const conversation = conversations[conversationId];

  if (!conversation) {
    throw new Error('Conversa não encontrada');
  }

  // Adicionar a mensagem do usuário à conversa
  const userMessage: ChatMessage = {
    role: 'user',
    content: message
  };
  conversation.messages.push(userMessage);
  conversation.updatedAt = Date.now();
  saveLocalConversations(conversations);

  try {
    // Enviar a mensagem para a API de IA
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: message,
        opts: {
          history: conversation.messages.slice(0, -1), // Excluir a mensagem atual do usuário
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao obter resposta da IA');
    }

    const data = await response.json();
    const aiResponse = data.text || 'Desculpe, não consegui processar sua mensagem.';

    // Adicionar a resposta da IA à conversa
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse
    };
    conversation.messages.push(assistantMessage);
    conversation.updatedAt = Date.now();
    saveLocalConversations(conversations);

    return assistantMessage;
  } catch (error) {
    // Erro ao enviar mensagem
    
    // Em caso de erro, adicionar uma mensagem de erro à conversa
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.'
    };
    conversation.messages.push(errorMessage);
    conversation.updatedAt = Date.now();
    saveLocalConversations(conversations);
    
    return errorMessage;
  }
}

// Função para obter as mensagens de uma conversa
export function getStaticConversationMessages(conversationId: string): ChatMessage[] {
  const conversations = getLocalConversations();
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    return [];
  }
  
  // Retornar apenas as mensagens de usuário e assistente (excluir a system prompt)
  return conversation.messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
}

// Função para fechar uma conversa (opcional, pode ser usada para limpar)
export function closeStaticConversation(conversationId: string): void {
  const conversations = getLocalConversations();
  delete conversations[conversationId];
  saveLocalConversations(conversations);
}

// Funções auxiliares para armazenamento local
function getLocalConversations(): Record<string, LocalConversation> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const stored = localStorage.getItem('static_conversations');
  if (!stored) {
    return {};
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    // Erro ao analisar conversas armazenadas
    return {};
  }
}

function saveLocalConversations(conversations: Record<string, LocalConversation>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('static_conversations', JSON.stringify(conversations));
  } catch (error) {
    // Erro ao salvar conversas
  }
}
