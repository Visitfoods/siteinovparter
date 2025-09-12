import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToAmen } from '@/lib/amenFtp';
import { sanitizeGuideSlug, isAllowedFileSize } from '@/utils/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Tamanho máximo permitido (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const guideSlug = (formData.get('guideSlug') || formData.get('slug')) as string | null;
		const captionType = (formData.get('captionType') || formData.get('variant')) as 'desktop' | 'tablet' | 'mobile' | null;

		if (!file || !guideSlug || !captionType) {
			return NextResponse.json(
				{ error: 'Ficheiro, slug e variante são obrigatórios' },
				{ status: 400 }
			);
		}

		// Verificar se é um ficheiro VTT
		if (!file.name.endsWith('.vtt')) {
			return NextResponse.json(
				{ error: 'Apenas ficheiros .vtt são permitidos' },
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

		// Sanitizar slug
		const sanitizedSlug = sanitizeGuideSlug(guideSlug);
		const timestamp = Date.now();
		const fileName = `captions_${captionType}_${timestamp}.vtt`;
		const remotePath = `guides/${sanitizedSlug}/${fileName}`;
		
		const buffer = Buffer.from(await file.arrayBuffer());
		const publicUrl = await uploadBufferToAmen(remotePath, buffer);
		return NextResponse.json({ success: true, stored: true, path: publicUrl, fileName, message: 'Legendas guardadas no servidor (FTP) com sucesso' });
	} catch (error) {
		// Erro ao fazer upload de legendas
		return NextResponse.json(
			{ error: 'Erro interno do servidor ao fazer upload de legendas' },
			{ status: 500 }
		);
	}
}