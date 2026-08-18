import { ENV } from '@/config/env';
import type { BlogPostDetail } from '@/types/blog/blog';

interface ArticleJsonLdProps {
  post: BlogPostDetail;
  locale: string;
}

/**
 * Datos estructurados (JSON-LD) `Article` de un post del blog: título, autor, fechas de
 * publicación/edición e imagen de portada, en el formato que Google usa para enriquecer
 * resultados de búsqueda de contenido editorial (distinto de `LocalBusiness`/`FAQPage`, que
 * describen la empresa y sus servicios, no un artículo).
 *
 * Reutiliza exactamente la misma resolución de URL/imagen que
 * {@link import('@/lib/generateBlogPostMetadata').generateBlogPostMetadata} (canonical,
 * `ogImageUrl`/`coverUrl`, `firstPublishedAt`/`publishedAt`) para que el schema no diverja del
 * metadata ya publicado en la misma página — dos fuentes de verdad distintas sobre la misma
 * URL es peor que una sola, aunque la duplicaran hoy con los mismos valores.
 * @param {ArticleJsonLdProps} props - El post ya resuelto y el locale de la página
 * @returns {JSX.Element} El `<script type="application/ld+json">` con el marcado del artículo
 */
export default function ArticleJsonLd({ post, locale }: ArticleJsonLdProps) {
  const baseUrl = ENV.APP_URL.replace(/\/$/, '');
  const canonicalUrl = post.canonicalUrl || `${baseUrl}/${locale}/blog/${post.slug}`;

  const imageUrl = post.ogImageUrl || post.coverUrl || ENV.OG_IMAGE;
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: [absoluteImageUrl],
    datePublished: post.firstPublishedAt || post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: ENV.APP_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    ...(post.wordCount ? { wordCount: post.wordCount } : {}),
    ...(post.tags.length > 0 ? { keywords: post.tags.map((tag) => tag.name).join(', ') } : {}),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
