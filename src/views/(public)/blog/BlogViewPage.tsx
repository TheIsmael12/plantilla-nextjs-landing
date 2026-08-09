import { getBlogCategories, getBlogPosts, getBlogTags } from '@/actions/blog/blog-actions';
import BlogHero from '@/components/ui/blog/BlogHero';
import BlogFilters from '@/components/ui/blog/BlogFilters';
import BlogFeaturedPostCard from '@/components/ui/blog/BlogFeaturedPostCard';
import BlogPostCard from '@/components/ui/blog/BlogPostCard';
import BlogPagination from '@/components/ui/blog/BlogPagination';
import BlogEmptyState from '@/components/ui/blog/BlogEmptyState';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogPostCard.scss';
import '@/styles/04-components/blog/blogFeaturedPostCard.scss';

const POSTS_PER_PAGE = 9;

interface BlogViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Página de listado del blog: hero, filtro por categoría y cuadrícula
 * paginada de posts publicados. Server Component (no sigue el patrón
 * `"use client"` del resto de `*ViewPage`) a propósito: el contenido es
 * indexable por buscadores desde la primera respuesta y aprovecha la Data
 * Cache de Next.js (`revalidate: 300`, alineado con el `Cache-Control` del
 * backend) en vez de perder esa cache con un `fetch` en cliente.
 * @param {BlogViewPageProps} props - Locale actual y query params de filtro/paginación
 * @returns {Promise<JSX.Element>} La página de listado del blog renderizada
 */
export default async function BlogViewPage({ locale, searchParams }: BlogViewPageProps) {
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const categorySlug = searchParams.category;
  const tagSlug = searchParams.tag;

  const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
    getBlogPosts({ locale, page, limit: POSTS_PER_PAGE, categorySlug, tagSlug }),
    getBlogCategories(locale),
    getBlogTags(locale),
  ]);

  const posts = postsResponse.data?.items ?? [];
  const pagination = postsResponse.data?.pagination;
  const categories = categoriesResponse.data ?? [];
  const tags = tagsResponse.data ?? [];

  // El primer post se destaca a ancho completo solo en la portada del
  // listado (primera página, sin filtros activos) — con un filtro aplicado
  // o en páginas siguientes, todos los resultados van en la cuadrícula
  // normal para no repetir el mismo post dos veces ni confundir qué se está
  // filtrando.
  const isUnfilteredFirstPage = page === 1 && !categorySlug && !tagSlug;
  const featuredPost = isUnfilteredFirstPage ? posts[0] : undefined;
  const restPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <main className="blog">
      <BlogHero />

      <section className="blog__list-section">
        <div className="blog__container">
          <BlogFilters categories={categories} tags={tags} activeCategory={categorySlug} activeTag={tagSlug} />

          {posts.length > 0 ? (
            <>
              {featuredPost && <BlogFeaturedPostCard post={featuredPost} />}

              <div className="blog__grid">
                {restPosts.map((post) => (
                  <BlogPostCard key={post.postId} post={post} />
                ))}
              </div>

              <BlogPagination
                currentPage={pagination?.page ?? page}
                totalPages={pagination?.totalPages ?? 1}
                searchParams={{ category: categorySlug, tag: tagSlug }}
              />
            </>
          ) : (
            <BlogEmptyState />
          )}
        </div>
      </section>
    </main>
  );
}
