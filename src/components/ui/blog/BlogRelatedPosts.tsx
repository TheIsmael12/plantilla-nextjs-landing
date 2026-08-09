import { useTranslations } from 'next-intl';

import BlogPostCard from '@/components/ui/blog/BlogPostCard';

import '@/styles/04-components/blog/blogRelatedPosts.scss';

/**
 * Sección de "artículos relacionados" al final de la página de detalle de
 * un post, reutilizando {@link BlogPostCard} para cada uno.
 * @param {BlogRelatedPostsProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La sección renderizada, o `null` si no hay posts relacionados
 */
export default function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  const t = useTranslations('Blog.detail');

  if (posts.length === 0) return null;

  return (
    <section className="blog__related">
      <div className="blog__container">
        <h2 className="blog__related-title">{t('relatedTitle')}</h2>
        <div className="blog__grid">
          {posts.map((post) => (
            <BlogPostCard key={post.postId} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
