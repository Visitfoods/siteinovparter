import { NextRequest } from 'next/server';
import { sanitizeFilename, isAllowedMimeType, isAllowedFileSize } from '@/utils/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Lista de origens permitidas para CORS
const ALLOWED_ORIGINS = new Set([
  'https://virtualguide.info',
  'https://www.virtualguide.info',
  'http://localhost:3000'
]);

// Configurar CORS para OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  // Se a origem não estiver na lista, não adicionar headers CORS
  if (!ALLOWED_ORIGINS.has(origin)) {
    return new Response(null, { status: 204 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Lista de tipos MIME permitidos
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
// Tamanho máximo permitido (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return new Response(JSON.stringify({ error: 'Ficheiro em falta' }), { status: 400 });

    if (!isAllowedMimeType(file.type)) return new Response(JSON.stringify({ error: 'Tipo de ficheiro inválido' }), { status: 400 });
    if (!isAllowedFileSize(file.size)) return new Response(JSON.stringify({ error: 'Ficheiro demasiado grande' }), { status: 400 });

    const safeName = sanitizeFilename(file.name);
    // Aqui poderias guardar em disco/externo; por agora eco simples
    return new Response(JSON.stringify({ success: true, filename: safeName }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro no upload' }), { status: 500 });
  }
}