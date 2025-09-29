/**
 * Gera um slug a partir de um título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas diacríticas
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
    .substring(0, 50); // Limita a 50 caracteres
}

/**
 * Gera uma URL amigável para o site
 */
export function generateSiteUrl(site: { slug?: string; id: string; title: string }, isPreview = false): string {
  const baseUrl = isPreview ? 'http://localhost:5173' : window.location.origin;
  const slug = site.slug || generateSlug(site.title);
  return `${baseUrl}/s/${slug}`;
}

/**
 * Determina se um identificador é um UUID
 */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}