import ServicesViewPage from '@/views/(client-area)/private-area/services/ServicesViewPage';

interface ServicesPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de `/private-area/services`: listado de servicios contratados.
 * Reenvía locale y query params porque el filtro por estado y la paginación
 * viven en la URL y los resuelve el propio Server Component de la vista.
 * @param {ServicesPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de listado de servicios renderizada
 */
export default async function ServicesPage({ params, searchParams }: ServicesPageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;

    return <ServicesViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
