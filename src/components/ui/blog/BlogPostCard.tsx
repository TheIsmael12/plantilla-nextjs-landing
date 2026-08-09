import { useLocale, useTranslations } from 'next-intl';
import { Clock, ImageOff, User } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';
import BackendImage from '@/components/ui/images/BackendImage';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogPostCard.scss';

/**
 * Tarjeta de un post en el listado del blog: portada con overlay degradado
 * y categoría superpuesta, título, extracto, y una franja de autor/fecha/
 * tiempo de lectura al pie.
 * @param {BlogPostCardProps} props - Propiedades de la tarjeta
 * @returns {JSX.Element} La tarjeta de post renderizada
 */
export default function BlogPostCard({ post }: BlogPostCardProps) {
  const t = useTranslations('Blog.card');
  const locale = useLocale();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const postHref = resolveHref({ pathname: `/blog/${post.slug}` });

  return (
    <article className="blog__card">
      <Link href={postHref} className="blog__card-media" tabIndex={-1} aria-hidden="true">
        <BackendImage
          src={post.coverUrl}
          alt=""
          fill
          className="blog__card-image"
          fallback={<ImageOff size={28} />}
        />
        <span className="blog__card-overlay" aria-hidden="true" />
        {post.category && <span className="blog__card-tag">{post.category.name}</span>}
      </Link>

      <div className="blog__card-body">
        <h2 className="blog__card-title">
          <Link href={postHref}>{post.title}</Link>
        </h2>
        <p className="blog__card-excerpt">{post.excerpt}</p>

        <div className="blog__card-meta">
          <span className="blog__card-avatar" aria-hidden="true">
            <User size={14} />
          </span>
          <span className="blog__card-author">{post.author.name}</span>
          <span className="blog__card-meta-sep" aria-hidden="true">
            ·
          </span>
          <time className="blog__card-date" dateTime={post.publishedAt}>
            {formattedDate}
          </time>
          <span className="blog__card-reading">
            <Clock size={13} aria-hidden="true" />
            {t('readingMinutes', { minutes: post.readingMinutes })}
          </span>
        </div>
      </div>
    </article>
  );
}
