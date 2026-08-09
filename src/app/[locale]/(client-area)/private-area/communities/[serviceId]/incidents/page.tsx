import IncidentsViewPage from '@/views/(client-area)/private-area/communities/IncidentsViewPage';

interface IncidentsPageProps {
  params: Promise<{ locale: string; serviceId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de incidencias de una comunidad: listado paginado de solo lectura.
 * @param {IncidentsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de incidencias renderizada
 */
export default async function IncidentsPage({ params, searchParams }: IncidentsPageProps) {
  const { locale, serviceId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <IncidentsViewPage
      serviceId={serviceId}
      locale={locale}
      searchParams={resolvedSearchParams}
    />
  );
}
