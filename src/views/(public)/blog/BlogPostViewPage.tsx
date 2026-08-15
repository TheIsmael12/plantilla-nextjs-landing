import { notFound, permanentRedirect } from 'next/navigation';

import { getBlogPostBySlug, getRelatedBlogPosts, resolveBlogSlug } from '@/actions/blog/blog-actions';
import { HTTPStatus } from '@/constants/httpStatus';

import ArticleJsonLd from '@/components/seo/ArticleJsonLd';
import BlogPostHeader from '@/components/ui/blog/BlogPostHeader';
import BlogPostToc from '@/components/ui/blog/BlogPostToc';
import BlogPostBody from '@/components/ui/blog/BlogPostBody';
import BlogPostTags from '@/components/ui/blog/BlogPostTags';
import BlogAuthorCard from '@/components/ui/blog/BlogAuthorCard';
import BlogRelatedPosts from '@/components/ui/blog/BlogRelatedPosts';

import '@/styles/04-components/blog/blogBase.scss';

interface BlogPostViewPageProps {
  locale: string;
  slug: string;
}

/**
 * Página de detalle de un post del blog: cabecera con imagen e overlay,
 * cuerpo en Markdown con la tabla de contenidos fija a la izquierda en
 * escritorio, tags y tarjeta de autor al final del artículo, y artículos
 * relacionados. Server Component.
 *
 * Si el slug no tiene traducción publicada, no se dispara el 404 de
 * inmediato: primero se consulta `GET /blog/resolve` para saber si el post
 * se movió (`type: "redirect"`, entonces se hace un 301 real al slug nuevo,
 * preservando el SEO acumulado) o si está definitivamente eliminado
 * (`type: "gone"` o `"post"` sin match, entonces sí es un 404/410).
 * @param {BlogPostViewPageProps} props - Locale actual y slug del post
 * @returns {Promise<JSX.Element>} La vista de detalle del post renderizada
 */
export default async function BlogPostViewPage({ locale, slug }: BlogPostViewPageProps) {
  const postResponse = await getBlogPostBySlug(slug, locale);

  if (postResponse.status === HTTPStatus.NOT_FOUND || !postResponse.data) {
    const resolution = await resolveBlogSlug(locale, slug);

    if (resolution.data?.type === 'redirect' && resolution.data.to) {
      permanentRedirect(resolution.data.to);
    }

    notFound();
  }

  const post = postResponse.data;
  const relatedResponse = await getRelatedBlogPosts(slug, locale);
  const relatedPosts = relatedResponse.data ?? [];

  const hasToc = post.headings.length > 1;

  return (
    <main className="blog">
      <ArticleJsonLd post={post} locale={locale} />
      <BlogPostHeader post={post} />

      <div className={`blog__container blog__post-layout${hasToc ? '' : ' blog__post-layout--no-toc'}`}>
        {hasToc && (
          <aside className="blog__post-layout-aside">
            <BlogPostToc headings={post.headings} />
          </aside>
        )}

        <div className="blog__post-layout-content">
          <BlogPostBody body={post.body} />
          <BlogPostTags tags={post.tags} />
          <BlogAuthorCard author={post.author} />
        </div>
      </div>

      <BlogRelatedPosts posts={relatedPosts} />
    </main>
  );
}
