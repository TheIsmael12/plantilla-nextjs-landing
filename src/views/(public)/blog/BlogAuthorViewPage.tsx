import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getBlogAuthor } from '@/actions/blog/blog-actions';
import { HTTPStatus } from '@/constants/httpStatus';

import BlogAuthorCard from '@/components/ui/blog/BlogAuthorCard';
import BlogPostCard from '@/components/ui/blog/BlogPostCard';
import BlogEmptyState from '@/components/ui/blog/BlogEmptyState';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogPostCard.scss';

interface BlogAuthorViewPageProps {
  locale: string;
  slug: string;
}

/**
 * Página pública de autor del blog: su tarjeta ({@link BlogAuthorCard}) y
 * sus últimas entradas publicadas (`GET /blog/authors/:slug`, hasta 20).
 * Server Component: si el autor no existe o está inactivo, dispara la
 * página 404 del proyecto.
 * @param {BlogAuthorViewPageProps} props - Locale actual y slug del autor
 * @returns {Promise<JSX.Element>} La vista de autor renderizada
 */
export default async function BlogAuthorViewPage({ locale, slug }: BlogAuthorViewPageProps) {
  const t = await getTranslations({ locale, namespace: 'Blog.empty' });

  const response = await getBlogAuthor(slug, locale);

  if (response.status === HTTPStatus.NOT_FOUND || !response.data) {
    notFound();
  }

  const author = response.data;

  return (
    <main className="blog">
      <section className="blog__list-section">
        <div className="blog__container blog__author-view">
          <BlogAuthorCard author={author} />

          {author.posts.length > 0 ? (
            <div className="blog__grid">
              {author.posts.map((post) => (
                <BlogPostCard key={post.postId} post={post} />
              ))}
            </div>
          ) : (
            <BlogEmptyState />
          )}
        </div>
      </section>
    </main>
  );
}
