import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new Response('Missing url param', { status: 400 });
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Response(blob, { headers: { 'Content-Type': blob.type } });
  } catch (e) {
    return new Response('Proxy error', { status: 500 });
  }
}
