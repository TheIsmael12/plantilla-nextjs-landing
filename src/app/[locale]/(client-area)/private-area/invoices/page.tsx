import InvoicesViewPage from '@/views/(client-area)/private-area/invoices/InvoicesViewPage';

interface InvoicesPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de `/private-area/invoices`: listado de facturas. Reenvía locale y
 * query params porque el filtro por estado y la paginación viven en la URL y
 * los resuelve el propio Server Component de la vista.
 * @param {InvoicesPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de listado de facturas renderizada
 */
export default async function InvoicesPage({ params, searchParams }: InvoicesPageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    return <InvoicesViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
