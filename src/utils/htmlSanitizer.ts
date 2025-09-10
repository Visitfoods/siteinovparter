"use client";

import DOMPurify from 'dompurify';

/**
 * Configuração de sanitização de HTML
 * Define quais tags e atributos são permitidos
 */
const sanitizeConfig = {
  ALLOWED_TAGS: [
    // Tags de texto básicas
    'p', 'b', 'i', 'em', 'strong', 'a', 'span', 'br', 'hr',
    // Títulos
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Listas
    'ul', 'ol', 'li',
    // Tabelas simples
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // Formatação básica
    'blockquote', 'pre', 'code',
    // Elementos interativos
    'button', 'div'
  ],
  ALLOWED_ATTR: [
    // Atributos básicos
    'id', 'class', 'style',
    // Links
    'href', 'target', 'rel',
    // Imagens (sem src para evitar XSS)
    'alt', 'title',
    // Tabelas
    'colspan', 'rowspan',
    // Eventos para botões específicos
    'onclick'
  ],
  // Não permitir dados de URI em atributos (para evitar XSS via data:)
  ALLOW_DATA_ATTR: false,
  // Não permitir scripts
  ALLOW_UNKNOWN_PROTOCOLS: false,
  // Não permitir formulários e elementos perigosos
  FORBID_TAGS: ['form', 'input', 'textarea', 'select', 'option', 'script', 'style', 'iframe', 'frame', 'object', 'embed', 'applet'],
  // Não permitir eventos JavaScript perigosos
  FORBID_ATTR: ['onerror', 'onload', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup', 'onkeypress']
};

/**
 * Sanitiza HTML para prevenir XSS
 * @param html HTML a ser sanitizado
 * @returns HTML sanitizado seguro
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // No servidor, retornar o HTML original (será sanitizado no cliente)
    return html;
  }
  
  // No cliente, sanitizar o HTML
  return DOMPurify.sanitize(html, sanitizeConfig);
}

/**
 * Hook para usar com dangerouslySetInnerHTML de forma segura
 * @param html HTML a ser sanitizado
 * @returns Objeto para usar com dangerouslySetInnerHTML
 */
export function useSanitizedHtml(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}
