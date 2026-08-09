import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Globe, User } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';
import BackendImage from '@/components/ui/images/BackendImage';

import '@/styles/04-components/blog/blogAuthorCard.scss';

/**
 * Tarjeta del autor de un post, en la página de detalle: avatar, nombre,
 * bio y enlaces a LinkedIn/sitio web si el autor los tiene.
 * @param {BlogAuthorCardProps} props - Propiedades del componente
 * @returns {JSX.Element} La tarjeta de autor renderizada
 */
export default function BlogAuthorCard({ author }: BlogAuthorCardProps) {
  const t = useTranslations('Blog.detail');

  return (
    <section className="blog__author-card" aria-labelledby="blog-author-card-title">
      <p className="blog__author-card-eyebrow" id="blog-author-card-title">
        {t('authorTitle')}
      </p>

      <div className="blog__author-card-body">
        <span className="blog__author-card-avatar">
          <BackendImage
            src={author.avatarUrl}
            alt={author.name}
            fill
            fallback={<User size={28} aria-hidden="true" />}
          />
        </span>

        <div>
          <p className="blog__author-card-name">
            <Link href={resolveHref({ pathname: `/blog/author/${author.slug}` })}>{author.name}</Link>
          </p>
          {author.bio && <p className="blog__author-card-bio">{author.bio}</p>}

          {(author.linkedinUrl || author.websiteUrl) && (
            <div className="blog__author-card-links">
              {author.linkedinUrl && (
                <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Image src="/images/assets/social/linkedin.svg" alt="" width={18} height={18} />
                </a>
              )}
              {author.websiteUrl && (
                <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Website">
                  <Globe size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
