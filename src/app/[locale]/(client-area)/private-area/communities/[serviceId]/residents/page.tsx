import CommunitiesResidentsViewPage from '@/views/(client-area)/private-area/communities/details/residents/CommunitiesResidentsViewPage';

interface ResidentsPageProps {
  params: Promise<{ locale: string; serviceId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de vecinos de una comunidad.
 * @param {ResidentsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de vecinos renderizada
 */
export default async function ResidentsPage({ params, searchParams }: ResidentsPageProps) {
  const { locale, serviceId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CommunitiesResidentsViewPage
      serviceId={serviceId}
      locale={locale}
      searchParams={resolvedSearchParams}
    />
  );
}
