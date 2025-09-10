import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Cache para armazenar informações de rate limiting
const rateLimitCache = new LRUCache<string, number>({
  max: 10000, // Máximo de 10000 IPs diferentes
  ttl: 1000 * 60 * 60, // Tempo de vida de 1 hora
});

// Configurações de rate limiting
const RATE_LIMIT = {
  // Limites por minuto
  PUBLIC_ROUTES: 60,    // 60 requisições por minuto
  PROTECTED_ROUTES: 30, // 30 requisições por minuto
  ADMIN_ROUTES: 20,     // 20 requisições por minuto
};

// Lista de rotas protegidas que requerem autenticação
const PROTECTED_ROUTES = [
  '/api/upload-video',
  '/api/upload-image',
  '/api/api-keys',
  '/api/close-session',
  '/api/close-guide-session',
  '/api/blob-token',
  '/api/upload-captions'
];

// Lista de rotas administrativas (requerem role admin)
const ADMIN_ROUTES = [
  '/api/api-keys'
];

// Lista de rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = [
  '/api/ask',
  '/api/chat',
  '/api/ask/stream'
];

// Função para obter o IP real do cliente
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip || '127.0.0.1';
}

// Função para verificar rate limiting
async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientIp = getClientIp(request);
  const path = request.nextUrl.pathname;
  const key = `${clientIp}:${path}`;
  
  // Determinar limite baseado no tipo de rota
  let limit = RATE_LIMIT.PUBLIC_ROUTES;
  if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    limit = RATE_LIMIT.PROTECTED_ROUTES;
  } else if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
    limit = RATE_LIMIT.ADMIN_ROUTES;
  }
  
  // Obter contagem atual
  const currentCount = rateLimitCache.get(key) || 0;
  
  if (currentCount >= limit) {
    return NextResponse.json(
      { error: 'Limite de requisições excedido. Tente novamente em breve.' },
      { status: 429 }
    );
  }
  
  // Incrementar contagem
  rateLimitCache.set(key, currentCount + 1);
  return null;
}

// Função para verificar autenticação via API Key
function hasValidApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
  const validApiKey = process.env.SIMPLE_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
  
  return apiKey === validApiKey;
}

// Função para verificar sessão válida
function hasValidSession(request: NextRequest): boolean {
  try {
    const sessionData = request.cookies.get('sessionData');
    if (!sessionData?.value) return false;
    
    const session = JSON.parse(decodeURIComponent(sessionData.value));
    if (!session.sessionId || !session.token) return false;
    
    // Verificar expiração (24 horas)
    const now = Date.now();
    if (session.timestamp && (now - session.timestamp) > 25 * 60 * 60 * 1000) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Função para verificar se é admin
function isAdmin(request: NextRequest): boolean {
  try {
    const sessionData = request.cookies.get('sessionData');
    if (!sessionData?.value) return false;
    
    const session = JSON.parse(decodeURIComponent(sessionData.value));
    return session.role === 'admin';
  } catch {
    return false;
  }
}

// Middleware híbrido principal
export async function hybridAuthMiddleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    
    // 1. Verificar rate limiting para todas as rotas
    const rateLimitResult = await checkRateLimit(request);
    if (rateLimitResult) return rateLimitResult;
    
    // 2. Verificar se é uma rota pública
    if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
      return null; // Permitir acesso
    }
    
    // 3. Verificar se é uma rota protegida
    if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
      // Verificar se tem API Key OU sessão válida
      if (!hasValidApiKey(request) && !hasValidSession(request)) {
        return NextResponse.json(
          { error: 'Autenticação obrigatória' },
          { status: 401 }
        );
      }
      
      // Se for rota admin, verificar permissões
      if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
        if (!isAdmin(request)) {
          return NextResponse.json(
            { error: 'Permissão negada' },
            { status: 403 }
          );
        }
      }
    }
    
    // Se chegou aqui, permitir acesso
    return null;
    
  } catch (error) {
    // Erro no middleware híbrido
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
