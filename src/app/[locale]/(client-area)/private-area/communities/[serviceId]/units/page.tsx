import CommunitiesUnitsViewPage from '@/views/(client-area)/private-area/communities/details/units/CommunitiesUnitsViewPage';

interface UnitsPageProps {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de unidades de una comunidad.
 * @param {UnitsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de unidades renderizada
 */
export default async function UnitsPage({ params, searchParams }: UnitsPageProps) {
  const { serviceId } = await params;
  const resolvedSearchParams = await searchParams;

  return <CommunitiesUnitsViewPage serviceId={serviceId} searchParams={resolvedSearchParams} />;
}
