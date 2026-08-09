import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Clock, ImageOff } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';
import BackendImage from '@/components/ui/images/BackendImage';

import '@/styles/04-components/blog/blogFeaturedPostCard.scss';

/**
 * Card del post destacado (el más reciente) en la cabecera del listado del
 * blog: imagen a ancho completo con overlay degradado y texto superpuesto,
 * en vez de la tarjeta compacta de {@link BlogPostCard} — mismo lenguaje
 * visual que `home__service-card` (imagen + overlay + contenido absoluto).
 * @param {BlogFeaturedPostCardProps} props - Propiedades del componente
 * @returns {JSX.Element} La card destacada renderizada
 */
export default function BlogFeaturedPostCard({ post }: BlogFeaturedPostCardProps) {
  const t = useTranslations('Blog.card');
  const locale = useLocale();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const postHref = resolveHref({ pathname: `/blog/${post.slug}` });

  return (
    <article className="blog__featured">
      <Link href={postHref} className="blog__featured-media">
        <BackendImage
          src={post.coverUrl}
          alt=""
          fill
          className="blog__featured-image"
          fallback={<ImageOff size={40} />}
        />
        <span className="blog__featured-overlay" aria-hidden="true" />

        <div className="blog__featured-content">
          {post.category && <span className="blog__featured-tag">{post.category.name}</span>}
          <h2 className="blog__featured-title">{post.title}</h2>
          <p className="blog__featured-excerpt">{post.excerpt}</p>

          <div className="blog__featured-meta">
            <span className="blog__featured-author">{t('by', { author: post.author.name })}</span>
            <span className="blog__featured-meta-sep" aria-hidden="true">
              ·
            </span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
            <span className="blog__featured-meta-sep" aria-hidden="true">
              ·
            </span>
            <span className="blog__featured-reading">
              <Clock size={14} aria-hidden="true" />
              {t('readingMinutes', { minutes: post.readingMinutes })}
            </span>
          </div>

          <span className="blog__featured-cta">
            {t('readMore')}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
