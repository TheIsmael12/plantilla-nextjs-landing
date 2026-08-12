import QuotesViewPage from '@/views/(client-area)/private-area/quotes/QuotesViewPage';

interface QuotesPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de `/private-area/quotes`: listado de presupuestos. Reenvía locale y
 * query params porque el filtro por estado y la paginación viven en la URL y
 * los resuelve el propio Server Component de la vista.
 * @param {QuotesPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de listado de presupuestos renderizada
 */
export default async function QuotesPage({ params, searchParams }: QuotesPageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    return <QuotesViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
