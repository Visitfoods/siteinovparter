import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToAmen } from '@/lib/amenFtp';
import { sanitizeGuideSlug, sanitizeFilename, isAllowedMimeType, isAllowedFileSize } from '@/utils/sanitize';
import { strictRateLimit } from '@/middleware/rateLimitMiddleware';
import { simpleApiKeyAuth } from '@/middleware/simpleApiKeyMiddleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Lista de tipos MIME permitidos
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
// Tamanho máximo permitido (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
	try {
		// Aplicar rate limiting mais rigoroso para uploads de vídeo
		const rateLimitResult = await strictRateLimit()(request);
		if (rateLimitResult) {
			return rateLimitResult;
		}
		
		// Verificar autenticação via API Key simples
		const authResult = await simpleApiKeyAuth()(request);
		if (authResult) {
			return authResult;
		}

		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const guideSlug = (formData.get('guideSlug') || formData.get('slug')) as string | null;
		const fileType = (formData.get('fileType') || formData.get('type')) as 'background' | 'welcome' | null;

		if (!file || !guideSlug || !fileType) {
			return NextResponse.json(
				{ error: 'Ficheiro, slug e tipo são obrigatórios' },
				{ status: 400 }
			);
		}

		// Validar tipo MIME
		if (!isAllowedMimeType(file.type, ALLOWED_MIME_TYPES)) {
			return NextResponse.json(
				{ error: 'Tipo de ficheiro não permitido. Apenas vídeos MP4, WebM, OGG e QuickTime são permitidos.' },
				{ status: 400 }
			);
		}

		// Validar tamanho do ficheiro
		if (!isAllowedFileSize(file.size, MAX_FILE_SIZE)) {
			return NextResponse.json(
				{ error: `Tamanho do ficheiro excede o limite máximo de ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
				{ status: 400 }
			);
		}

		// Sanitizar slug e nome do ficheiro
		const sanitizedSlug = sanitizeGuideSlug(guideSlug);
		const timestamp = Date.now();
		const sanitizedFileName = sanitizeFilename(file.name || 'video');
		const fileName = `${fileType}_${timestamp}_${sanitizedFileName}`;
		const remotePath = `guides/${sanitizedSlug}/${fileName}`;
		
		const buffer = Buffer.from(await file.arrayBuffer());
		const publicUrl = await uploadBufferToAmen(remotePath, buffer);
		return NextResponse.json({ success: true, stored: true, path: publicUrl, fileName, message: 'Vídeo guardado no servidor (FTP) com sucesso' });
	} catch (error) {
		// Erro ao fazer upload de vídeo
		return NextResponse.json(
			{ error: 'Erro interno do servidor ao fazer upload de vídeo' },
			{ status: 500 }
		);
	}
}