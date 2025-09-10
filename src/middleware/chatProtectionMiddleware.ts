import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Cache para armazenar informações de rate limiting por IP
const chatRateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000,
  ttl: 1000 * 60 * 60, // 1 hora
});

// Cache para detectar spam de mensagens
const spamDetectionCache = new LRUCache<string, { messages: string[]; lastMessage: number }>({
  max: 5000,
  ttl: 1000 * 60 * 30, // 30 minutos
});

// Configurações de proteção para chats
const CHAT_PROTECTION = {
  // Rate limiting por IP
  MAX_REQUESTS_PER_MINUTE: 30,        // 30 requisições por minuto
  MAX_REQUESTS_PER_HOUR: 200,         // 200 requisições por hora
  
  // Proteção contra spam
  MAX_SIMILAR_MESSAGES: 3,            // Máximo 3 mensagens similares em 5 minutos
  MIN_MESSAGE_INTERVAL: 1000,         // Mínimo 1 segundo entre mensagens
  MAX_MESSAGE_LENGTH: 2000,           // Máximo 2000 caracteres por mensagem
  
  // Proteção contra abuso
  MAX_CONVERSATIONS_PER_HOUR: 10,     // Máximo 10 conversas por hora por IP
  BLOCK_DURATION: 60 * 60 * 1000,     // Bloquear por 1 hora se exceder limites
};

// Lista de origens permitidas
const ALLOWED_ORIGINS = [
  'https://inovpartner.com',
  'https://www.inovpartner.com',
  'http://localhost:3000', // Para desenvolvimento
];

// Função para obter o IP real do cliente
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip || '127.0.0.1';
}

// Função para verificar origem permitida
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin) return true; // Permitir se não houver origem (ex: Postman em desenvolvimento)
  
  try {
    const originUrl = new URL(origin);
    return ALLOWED_ORIGINS.some(allowed => 
      originUrl.hostname === allowed.replace(/^https?:\/\//, '')
    );
  } catch {
    return false;
  }
}

// Função para verificar rate limiting
function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate_limit:${clientIp}`;
  const cached = chatRateLimitCache.get(key);
  
  if (!cached || now > cached.resetTime) {
    // Reset do contador
    const resetTime = now + (60 * 1000); // Reset a cada minuto
    chatRateLimitCache.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: CHAT_PROTECTION.MAX_REQUESTS_PER_MINUTE - 1, resetTime };
  }
  
  if (cached.count >= CHAT_PROTECTION.MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0, resetTime: cached.resetTime };
  }
  
  // Incrementar contador
  cached.count++;
  chatRateLimitCache.set(key, cached);
  
  return { 
    allowed: true, 
    remaining: CHAT_PROTECTION.MAX_REQUESTS_PER_MINUTE - cached.count, 
    resetTime: cached.resetTime 
  };
}

// Função para detectar spam
function detectSpam(clientIp: string, message: string): boolean {
  const key = `spam:${clientIp}`;
  const now = Date.now();
  const cached = spamDetectionCache.get(key);
  
  if (!cached) {
    spamDetectionCache.set(key, { messages: [message], lastMessage: now });
    return false;
  }
  
  // Verificar intervalo mínimo entre mensagens
  if (now - cached.lastMessage < CHAT_PROTECTION.MIN_MESSAGE_INTERVAL) {
    return true;
  }
  
  // Verificar mensagens similares
  const similarCount = cached.messages.filter(msg => 
    msg.toLowerCase().trim() === message.toLowerCase().trim()
  ).length;
  
  if (similarCount >= CHAT_PROTECTION.MAX_SIMILAR_MESSAGES) {
    return true;
  }
  
  // Adicionar mensagem atual
  cached.messages.push(message);
  cached.lastMessage = now;
  
  // Manter apenas as últimas 10 mensagens
  if (cached.messages.length > 10) {
    cached.messages = cached.messages.slice(-10);
  }
  
  spamDetectionCache.set(key, cached);
  return false;
}

// Função para validar mensagem
function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Mensagem inválida' };
  }
  
  if (message.length > CHAT_PROTECTION.MAX_MESSAGE_LENGTH) {
    return { valid: false, error: 'Mensagem muito longa' };
  }
  
  if (message.trim().length === 0) {
    return { valid: false, error: 'Mensagem vazia' };
  }
  
  // Verificar caracteres suspeitos (opcional)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(message))) {
    return { valid: false, error: 'Mensagem contém conteúdo suspeito' };
  }
  
  return { valid: true };
}

// Middleware principal de proteção de chats
export async function chatProtectionMiddleware(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const path = request.nextUrl.pathname;
    
    // 1. Verificar se é rota de chat com IA (sem autenticação)
    const isAiChat = path.startsWith('/api/ask') || path.startsWith('/api/chat');
    
    // 2. Verificar origem permitida
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { error: 'Origem não permitida' },
        { status: 403 }
      );
    }
    
    // 3. Verificar rate limiting
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': CHAT_PROTECTION.MAX_REQUESTS_PER_MINUTE.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
          }
        }
      );
    }
    
    // 4. Para rotas POST, validar mensagem
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const message = body.q || body.message || body.text || '';
        
        // Validar mensagem
        const validation = validateMessage(message);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }
        
        // Detectar spam apenas para chat com IA
        if (isAiChat && detectSpam(clientIp, message)) {
          return NextResponse.json(
            { error: 'Mensagem detectada como spam' },
            { status: 429 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Dados inválidos' },
          { status: 400 }
        );
      }
    }
    
    // 5. Adicionar headers de rate limiting
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', CHAT_PROTECTION.MAX_REQUESTS_PER_MINUTE.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());
    
    // 6. Logging para monitorização
    
    return response;
    
  } catch (error) {
    // Erro no middleware de proteção de chats
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para limpar cache (útil para testes)
export function clearChatProtectionCache(): void {
  chatRateLimitCache.clear();
  spamDetectionCache.clear();
}

// Função para obter estatísticas de proteção
export function getChatProtectionStats(): { 
  rateLimitEntries: number; 
  spamDetectionEntries: number; 
} {
  return {
    rateLimitEntries: chatRateLimitCache.size,
    spamDetectionEntries: spamDetectionCache.size
  };
}
