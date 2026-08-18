import { ENV } from '@/config/env';

/**
 * Datos estructurados (JSON-LD) `WebSite`: identifica el sitio como entidad propia (distinta
 * de `LocalBusiness`, que describe la empresa) — es lo que ayuda a Google a asociar el
 * dominio con el nombre de marca para el knowledge panel.
 *
 * **Sin `SearchAction`**: esa propiedad exige una URL de búsqueda real con
 * `{search_term_string}` sustituible, y el blog (`BlogFilters.tsx`) solo filtra por
 * categoría/tag, no tiene buscador de texto libre — declarar `SearchAction` sobre algo que no
 * busca de verdad sería una promesa falsa a los rich results, no una mejora.
 * @returns {JSX.Element} El `<script type="application/ld+json">` con el marcado del sitio
 */
export default function WebSiteJsonLd() {
  const baseUrl = ENV.APP_URL.replace(/\/$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: ENV.APP_NAME,
    url: baseUrl,
    publisher: { '@id': `${baseUrl}/#organization` },
    inLanguage: 'es-ES',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
