import { Tag } from 'lucide-react';

import { Link, resolveHref } from '@/i18n/navigation';

import '@/styles/04-components/blog/blogPostTags.scss';

/**
 * Tags del post, mostrados como pastillas enlazadas al filtro
 * correspondiente del listado (`/blog?tag=slug`), al final del artículo.
 * @param {BlogPostTagsProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Los tags renderizados, o `null` si el post no tiene ninguno
 */
export default function BlogPostTags({ tags }: BlogPostTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="blog__post-tags">
      <Tag size={16} aria-hidden="true" />
      {tags.map((tag) => (
        <Link key={tag.slug} href={resolveHref({ pathname: '/blog' }, { tag: tag.slug })} className="blog__post-tags-item">
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
