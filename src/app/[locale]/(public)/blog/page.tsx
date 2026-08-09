import BlogViewPage from '@/views/(public)/blog/BlogViewPage';

interface BlogPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
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
