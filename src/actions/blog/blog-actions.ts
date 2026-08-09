"use server";

import { fetchData } from "@/actions/fetch";
import { resolveBackendAssetUrl } from "@/utils/fetchUtils";
import type {
  BlogAuthorWithPosts,
  BlogFeedEntry,
  BlogPostDetail,
  BlogPostListItem,
  BlogPostsQuery,
  BlogResolveResult,
  BlogSitemapEntry,
  BlogTaxonomy,
  BlogTaxonomySitemap,
} from "@/types/blog/blog";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

// Alineado con `Cache-Control: public, max-age=300` que ya envía el backend
// en todas las rutas públicas de `/blog`.
const BLOG_REVALIDATE_SECONDS = 300;

/**
 * Resuelve `coverUrl` a una URL absoluta (ver {@link resolveBackendAssetUrl}):
 * el backend puede devolverlo como ruta relativa según el entorno.
 * @template T - Tipo con un `coverUrl` opcional
 * @param {T} item - Elemento con `coverUrl` a normalizar
 * @returns {T} El mismo elemento, con `coverUrl` ya absoluto
 */
function withAbsoluteCoverUrl<T extends { coverUrl?: string }>(item: T): T {
  return { ...item, coverUrl: resolveBackendAssetUrl(item.coverUrl) ?? undefined };
}

/**
 * Construye el query string de `GET /blog/posts` a partir de los filtros
 * activos, omitiendo cualquier valor vacío/`undefined`.
 * @param {BlogPostsQuery} params - Filtros de búsqueda (locale, página, categoría...)
 * @returns {string} El query string, incluyendo el `?` inicial
 */
function buildBlogPostsQuery(params: BlogPostsQuery): string {
  const query = new URLSearchParams();

  query.set("locale", params.locale);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params.tagSlug) query.set("tagSlug", params.tagSlug);
  if (params.authorSlug) query.set("authorSlug", params.authorSlug);
  if (params.search) query.set("search", params.search);
  if (params.year) query.set("year", String(params.year));
  if (params.month) query.set("month", String(params.month));

  return `?${query.toString()}`;
}

/**
 * Lista posts publicados de un locale, con filtros/paginación opcionales.
 * @param {BlogPostsQuery} params - Filtros de búsqueda
 * @returns {Promise<FetchResponse<PaginatedResult<BlogPostListItem>>>} Página de resultados
 */
export async function getBlogPosts(
  params: BlogPostsQuery,
): Promise<FetchResponse<PaginatedResult<BlogPostListItem>>> {
  const response = await fetchData<PaginatedResult<BlogPostListItem>, never>(
    `blog/posts${buildBlogPostsQuery(params)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: ["blog-posts"] },
  );

  if (!response.data) return response;
  return { ...response, data: { ...response.data, items: response.data.items.map(withAbsoluteCoverUrl) } };
}

/**
 * Obtiene el detalle completo de un post por su slug.
 * @param {string} slug - Slug del post en el locale indicado
 * @param {string} locale - Locale de la traducción a obtener
 * @returns {Promise<FetchResponse<BlogPostDetail>>} El post, o `status: 404` si no hay traducción publicada
 */
export async function getBlogPostBySlug(
  slug: string,
  locale: string,
): Promise<FetchResponse<BlogPostDetail>> {
  const response = await fetchData<BlogPostDetail, never>(
    `blog/posts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: [`blog-post-${slug}`] },
  );

  if (!response.data) return response;
  return {
    ...response,
    data: {
      ...withAbsoluteCoverUrl(response.data),
      ogImageUrl: resolveBackendAssetUrl(response.data.ogImageUrl) ?? undefined,
      author: { ...response.data.author, avatarUrl: resolveBackendAssetUrl(response.data.author.avatarUrl) ?? undefined },
    },
  };
}

/**
 * Obtiene posts relacionados con uno dado, para la sección "artículos
 * relacionados" de la página de detalle.
 * @param {string} slug - Slug del post de referencia
 * @param {string} locale - Locale activo
 * @param {number} [limit] - Número máximo de posts relacionados; por defecto 3
 * @returns {Promise<FetchResponse<BlogPostListItem[]>>} Los posts relacionados
 */
export async function getRelatedBlogPosts(
  slug: string,
  locale: string,
  limit = 3,
): Promise<FetchResponse<BlogPostListItem[]>> {
  const response = await fetchData<BlogPostListItem[], never>(
    `blog/posts/${encodeURIComponent(slug)}/related?locale=${encodeURIComponent(locale)}&limit=${limit}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS },
  );

  if (!response.data) return response;
  return { ...response, data: response.data.map(withAbsoluteCoverUrl) };
}

/**
 * Lista las categorías públicas de un locale, con su `postCount`.
 * @param {string} locale - Locale activo
 * @returns {Promise<FetchResponse<BlogTaxonomy[]>>} Las categorías disponibles
 */
export async function getBlogCategories(
  locale: string,
): Promise<FetchResponse<BlogTaxonomy[]>> {
  return fetchData<BlogTaxonomy[], never>(
    `blog/categories?locale=${encodeURIComponent(locale)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: ["blog-categories"] },
  );
}

/**
 * Lista los tags públicos de un locale (solo los que tienen al menos un post).
 * @param {string} locale - Locale activo
 * @returns {Promise<FetchResponse<BlogTaxonomy[]>>} Los tags disponibles
 */
export async function getBlogTags(
  locale: string,
): Promise<FetchResponse<BlogTaxonomy[]>> {
  return fetchData<BlogTaxonomy[], never>(
    `blog/tags?locale=${encodeURIComponent(locale)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS },
  );
}

/**
 * Obtiene un autor público junto a sus últimas entradas publicadas.
 * @param {string} slug - Slug del autor
 * @param {string} locale - Locale activo
 * @returns {Promise<FetchResponse<BlogAuthorWithPosts>>} El autor y sus posts, o `status: 404` si no existe/inactivo
 */
export async function getBlogAuthor(
  slug: string,
  locale: string,
): Promise<FetchResponse<BlogAuthorWithPosts>> {
  const response = await fetchData<BlogAuthorWithPosts, never>(
    `blog/authors/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS },
  );

  if (!response.data) return response;
  return {
    ...response,
    data: {
      ...response.data,
      avatarUrl: resolveBackendAssetUrl(response.data.avatarUrl) ?? undefined,
      posts: response.data.posts.map(withAbsoluteCoverUrl),
    },
  };
}

/**
 * Resuelve un slug que ya no tiene traducción publicada, para saber si debe
 * redirigirse (301/308, el post se movió) o darse por definitivamente
 * eliminado (410/404). Consumida por `BlogPostViewPage` cuando
 * `getBlogPostBySlug` devuelve 404.
 * @param {string} locale - Locale activo
 * @param {string} slug - Slug que no se ha encontrado
 * @returns {Promise<FetchResponse<BlogResolveResult>>} Qué hacer con ese slug
 */
export async function resolveBlogSlug(
  locale: string,
  slug: string,
): Promise<FetchResponse<BlogResolveResult>> {
  return fetchData<BlogResolveResult, never>(
    `blog/resolve?locale=${encodeURIComponent(locale)}&slug=${encodeURIComponent(slug)}`,
  );
}

/**
 * Obtiene una página de `GET /blog/sitemap-entries` (1000 entradas por
 * página, fijado por el backend), para construir `sitemap.xml` con las
 * URLs y `lastmod` reales de cada post. Revalida más a menudo que el resto
 * de endpoints de blog porque un sitemap desactualizado retrasa la
 * indexación de contenido nuevo.
 * @param {string} locale - Locale activo
 * @param {number} [page] - Página a obtener; por defecto 1
 * @returns {Promise<FetchResponse<PaginatedResult<BlogSitemapEntry>>>} Página de entradas del sitemap
 */
export async function getBlogSitemapEntries(
  locale: string,
  page = 1,
): Promise<FetchResponse<PaginatedResult<BlogSitemapEntry>>> {
  return fetchData<PaginatedResult<BlogSitemapEntry>, never>(
    `blog/sitemap-entries?locale=${encodeURIComponent(locale)}&page=${page}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: ["blog-sitemap"] },
  );
}

/**
 * Obtiene los slugs de categorías, tags y autores para el sitemap
 * (`GET /blog/sitemap-entries/taxonomy`).
 * @param {string} locale - Locale activo
 * @returns {Promise<FetchResponse<BlogTaxonomySitemap>>} Los slugs de cada tipo de taxonomía
 */
export async function getBlogTaxonomySitemap(
  locale: string,
): Promise<FetchResponse<BlogTaxonomySitemap>> {
  return fetchData<BlogTaxonomySitemap, never>(
    `blog/sitemap-entries/taxonomy?locale=${encodeURIComponent(locale)}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS },
  );
}

/**
 * Obtiene las entradas más recientes para el feed RSS (`GET /blog/feed-entries`).
 * @param {string} locale - Locale activo
 * @param {number} [limit] - Número máximo de entradas; por defecto 20
 * @returns {Promise<FetchResponse<BlogFeedEntry[]>>} Las entradas del feed
 */
export async function getBlogFeedEntries(
  locale: string,
  limit = 20,
): Promise<FetchResponse<BlogFeedEntry[]>> {
  const response = await fetchData<BlogFeedEntry[], never>(
    `blog/feed-entries?locale=${encodeURIComponent(locale)}&limit=${limit}`,
    "GET",
    undefined,
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: ["blog-feed"] },
  );

  if (!response.data) return response;
  return { ...response, data: response.data.map(withAbsoluteCoverUrl) };
}
