/**
 * Referencia mínima a un autor, tal y como aparece embebida en el listado
 * de posts (`GET /blog/posts`).
 * @interface BlogAuthorRef
 */
export interface BlogAuthorRef {
  slug: string;
  name: string;
}

/**
 * Referencia mínima a una categoría o tag, tal y como aparece embebida en
 * el listado/detalle de posts.
 * @interface BlogTaxonomyRef
 */
export interface BlogTaxonomyRef {
  slug: string;
  name: string;
}

/**
 * Categoría o tag público completo (`GET /blog/categories`, `GET /blog/tags`).
 * @interface BlogTaxonomy
 */
export interface BlogTaxonomy extends BlogTaxonomyRef {
  description?: string;
  postCount: number;
}

/**
 * Entrada de la tabla de contenidos de un post, derivada de sus encabezados
 * Markdown (`headings[]` de `BlogPostDetail`).
 * @interface BlogHeading
 */
export interface BlogHeading {
  level: number;
  text: string;
  anchor: string;
}

/**
 * Elemento de un listado de posts (`GET /blog/posts`, `.../related`) —
 * la vista de "tarjeta", sin el cuerpo completo del artículo.
 * @interface BlogPostListItem
 */
export interface BlogPostListItem {
  postId: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  coverUrl?: string;
  coverImageAlt?: string;
  author: BlogAuthorRef;
  category?: BlogTaxonomyRef;
}

/**
 * Autor público completo (`GET /blog/authors/:slug`), sin el listado de
 * sus posts — nunca incluye `email`/`userId`, que son solo internos.
 * @interface BlogAuthorDetail
 */
export interface BlogAuthorDetail {
  slug: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

/**
 * Detalle completo de un post (`GET /blog/posts/:slug`).
 * @interface BlogPostDetail
 */
export interface BlogPostDetail extends BlogPostListItem {
  locale: string;
  /** Cuerpo del post en Markdown; se sanea y convierte al renderizar. */
  body: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  noindex: boolean;
  firstPublishedAt?: string;
  wordCount: number;
  headings: BlogHeading[];
  aiGenerated: boolean;
  author: BlogAuthorDetail;
  tags: BlogTaxonomyRef[];
  /** Slugs de este mismo post en cada locale en que también está publicado, para hreflang. */
  availableLocales: { locale: string; slug: string }[];
}

/**
 * Autor con sus últimas entradas publicadas (`GET /blog/authors/:slug`).
 * @interface BlogAuthorWithPosts
 */
export interface BlogAuthorWithPosts extends BlogAuthorDetail {
  posts: BlogPostListItem[];
}

/**
 * Resultado de `GET /blog/resolve`, para manejar redirects/gone de slugs
 * movidos o borrados. No conectado todavía (ver `resolveBlogSlug`).
 * @interface BlogResolveResult
 */
export interface BlogResolveResult {
  type: "post" | "redirect" | "gone";
  postId?: string;
  slug?: string;
  to?: string;
  status?: number;
}

/**
 * Parámetros de consulta de `GET /blog/posts`.
 * @interface BlogPostsQuery
 */
export interface BlogPostsQuery {
  locale: string;
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  search?: string;
  year?: number;
  month?: number;
}

/**
 * Entrada de `GET /blog/sitemap-entries`, para construir `sitemap.xml` con
 * las URLs y `lastmod` reales del backend en vez de reconstruirlos a mano.
 * @interface BlogSitemapEntry
 */
export interface BlogSitemapEntry {
  postId: string;
  slug: string;
  lastmod: string;
  publishedAt: string;
  alternates: { locale: string; slug: string }[];
}

/**
 * Entrada de `GET /blog/sitemap-entries/taxonomy`: slugs de categorías,
 * tags y autores, para incluir esas páginas de listado filtrado en el
 * sitemap si se decide indexarlas por separado.
 * @interface BlogTaxonomySitemap
 */
export interface BlogTaxonomySitemap {
  categories: { slug: string }[];
  tags: { slug: string }[];
  authors: { slug: string }[];
}

/**
 * Entrada de `GET /blog/feed-entries`, usada para generar el feed RSS
 * (`/feed.xml`). Solo trae el resumen del post, nunca el body completo.
 * @interface BlogFeedEntry
 */
export interface BlogFeedEntry {
  /** Identificador estable del post (el `postId`), no cambia aunque el slug se edite. */
  guid: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category?: string;
  coverUrl?: string;
}
