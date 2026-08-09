import { useLocale, useTranslations } from 'next-intl';
import { Clock, ImageOff, User } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';
import BackendImage from '@/components/ui/images/BackendImage';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogPostHeader.scss';

/**
 * Cabecera de la página de detalle de un post: imagen a ancho completo con
 * overlay degradado y título superpuesto (mismo lenguaje visual que
 * {@link BlogFeaturedPostCard}), con la franja de autor/fecha/tiempo de
 * lectura sobre la imagen — el autor enlaza directamente a su página
 * pública. Sin portada, el mismo bloque se muestra sobre fondo plano.
 * @param {BlogPostHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} La cabecera del post renderizada
 */
export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const t = useTranslations('Blog.card');
  const locale = useLocale();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const authorHref = resolveHref({ pathname: `/blog/author/${post.author.slug}` });

  return (
    <header className={`blog__post-header${post.coverUrl ? '' : ' blog__post-header--plain'}`}>
      {post.coverUrl && (
        <div className="blog__post-header-media">
          <BackendImage
            src={post.coverUrl}
            alt=""
            fill
            className="blog__post-header-image"
            fallback={<ImageOff size={40} />}
          />
          <span className="blog__post-header-overlay" aria-hidden="true" />
        </div>
      )}

      <div className="blog__container blog__post-header-inner">
        <h1 className="blog__post-title">{post.title}</h1>

        <div className="blog__post-header-meta">
          <Link href={authorHref} className="blog__post-header-author">
            <span className="blog__post-header-avatar" aria-hidden="true">
              <BackendImage src={post.author.avatarUrl} alt="" fill fallback={<User size={13} />} />
            </span>
            {post.author.name}
          </Link>
          <span className="blog__post-header-meta-sep" aria-hidden="true">
            ·
          </span>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span className="blog__post-header-meta-sep" aria-hidden="true">
            ·
          </span>
          <span className="blog__post-header-reading">
            <Clock size={14} aria-hidden="true" />
            {t('readingMinutes', { minutes: post.readingMinutes })}
          </span>
        </div>
      </div>
    </header>
  );
}
