import type { Metadata } from 'next';

import { getBlogPosts } from '@/actions/blog/blog-actions';
import BlogViewPage from '@/views/(public)/blog/BlogViewPage';

interface BlogPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * `noindex` mientras el blog no tenga ningún artículo publicado en este idioma.
 *
 * El listado vacío es una página sin contenido propio, y Google la estaba indexando (sale en Search
 * Console). El resto de metadatos los pone `[locale]/layout.tsx` desde `Metadata.routes./blog`;
 * aquí solo se sobrescribe `robots`, que Next fusiona encima. Si la API no responde se deja
 * indexable: mejor que desindexar un blog con artículos por un fallo puntual.
 * @param {Pick<BlogPageProps, 'params'>} props - Parámetros de ruta de Next.js
 * @returns {Promise<Metadata>} `robots: noindex` si no hay artículos, nada si los hay
 */
export async function generateMetadata({ params }: Pick<BlogPageProps, 'params'>): Promise<Metadata> {
    const { locale } = await params;
    const response = await getBlogPosts({ locale, page: 1, limit: 1 });
    const total = response.data?.pagination?.totalItems;

    return total === 0 ? { robots: 'noindex, follow' } : {};
}

/**
 * Página de listado del blog público. A diferencia del resto de páginas
 * públicas (wrappers triviales de una línea), esta recibe y reenvía
 * `params`/`searchParams`: el listado necesita el locale y los filtros de
 * categoría/paginación de la URL para poder hacer el fetch en el propio
 * Server Component (ver `BlogViewPage`).
 * @param {BlogPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de listado del blog renderizada
 */
export default async function BlogPage({ params, searchParams }: BlogPageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    return <BlogViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
