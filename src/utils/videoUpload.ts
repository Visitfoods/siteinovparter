// Interface para o progresso do upload
import { getAuthHeaders } from '@/services/apiKeyService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Faz upload direto de um vídeo para o servidor
 * @param file O arquivo de vídeo a ser enviado
 * @param guideSlug O slug do guia
 * @param fileType O tipo do arquivo ('background' ou 'welcome')
 * @param onProgress Callback para atualizar o progresso do upload
 * @returns Uma promessa com a URL do vídeo no servidor
 */
export async function uploadVideoDirect(
  file: File,
  guideSlug: string,
  fileType: 'background' | 'welcome',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  // Endpoint direto (externo) ou fallback para o endpoint interno
  const UPLOAD_ENDPOINT =
    (process.env.NEXT_PUBLIC_DIRECT_UPLOAD_URL as string | undefined) || '/api/upload-video';
  const UPLOAD_TOKEN = process.env.NEXT_PUBLIC_UPLOAD_TOKEN as string | undefined;



  // Criar FormData para o upload
  const formData = new FormData();
  formData.append('video', file);
  formData.append('guideSlug', guideSlug);
  formData.append('fileType', fileType);

  return await new Promise<string>((resolve, reject) => {
    try {


      const xhr = new XMLHttpRequest();
      xhr.open('POST', UPLOAD_ENDPOINT, true);
      // Adicionar token de upload se disponível
      if (UPLOAD_TOKEN) {
        xhr.setRequestHeader('X-Upload-Token', UPLOAD_TOKEN);
      }
      
      // Só adicionar headers de autenticação se NÃO for para o visitfoods.pt
      if (!UPLOAD_ENDPOINT.includes('visitfoods.pt')) {
        const authHeaders = getAuthHeaders();
        Object.entries(authHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.upload.onprogress = (evt) => {
        if (!onProgress) return;
        const total = evt.lengthComputable ? evt.total : file.size;
        const loaded = evt.loaded;
        const percentage = Math.min(100, Math.round((loaded / total) * 100));
        onProgress({ loaded, total, percentage });
      };

      xhr.onerror = () => {
        reject(new Error('Erro de rede durante o upload'));
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        const status = xhr.status;
        const text = xhr.responseText || '';
        if (status >= 200 && status < 300) {
          try {
            const data = JSON.parse(text);

            if (onProgress) onProgress({ loaded: file.size, total: file.size, percentage: 100 });
            if (data && data.success && data.path) {
              resolve(data.path);
            } else {
              reject(new Error('Resposta inválida do servidor'));
            }
          } catch (e) {
            reject(new Error('Falha ao processar a resposta do servidor'));
          }
        } else {
          // Tentar extrair erro JSON
          try {
            const err = JSON.parse(text);
            reject(new Error(`Erro HTTP ${status}: ${typeof err === 'string' ? err : err.error || text}`));
          } catch (_) {
            reject(new Error(`Erro HTTP ${status}: ${text || 'Sem detalhe'}`));
          }
        }
      };

      xhr.send(formData);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Erro desconhecido'));
    }
  });
}

/**
 * Função de upload de vídeo compatível com a API original
 * Esta função usa o método de upload direto
 */
export async function uploadVideo(
  file: File,
  guideSlug: string,
  fileType: 'background' | 'welcome',
  onProgress?: (progress: UploadProgress) => void
): Promise<{ path: string; fileName: string }> {
  try {
    // Usar o método de upload direto
    const path = await uploadVideoDirect(file, guideSlug, fileType, onProgress);
    
    // Extrair o nome do arquivo da URL
    const fileName = path.split('/').pop() || '';
    
    return { path, fileName };
  } catch (error) {
    // Erro no upload de vídeo
    throw error;
  }
}