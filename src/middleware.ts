import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se é uma rota de backoffice
  if (request.nextUrl.pathname.startsWith('/backoffice')) {
    // Verificar se o utilizador está autenticado
    const sessionCookie = request.cookies.get('sessionData');
    
    // Se não houver cookie de sessão, redirecionar para o login
    if (!sessionCookie || !sessionCookie.value) {
      // Redirecionar para o login se não estiver na página de login
      if (!request.nextUrl.pathname.startsWith('/backoffice/login')) {
        return NextResponse.redirect(new URL('/backoffice/login', request.url));
      }
      return NextResponse.next();
    }
    
    try {
      // Verificar se o cookie de sessão é válido
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      
      // Se não tiver dados de sessão válidos, redirecionar para o login
      if (!sessionData || !sessionData.sessionId || !sessionData.token) {
        if (!request.nextUrl.pathname.startsWith('/backoffice/login')) {
          return NextResponse.redirect(new URL('/backoffice/login', request.url));
        }
      }
      
      // Se estiver na página de login e já estiver autenticado, redirecionar para o backoffice
      if (request.nextUrl.pathname === '/backoffice/login' && sessionData && sessionData.sessionId) {
        return NextResponse.redirect(new URL('/backoffice', request.url));
      }
      
      // Continuar com a requisição
      return NextResponse.next();
    } catch (error) {
      // Em caso de erro ao processar o cookie, redirecionar para o login
      if (!request.nextUrl.pathname.startsWith('/backoffice/login')) {
        return NextResponse.redirect(new URL('/backoffice/login', request.url));
      }
      return NextResponse.next();
    }
  }
  
  // Para todas as outras rotas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ['/backoffice/:path*'],
}
