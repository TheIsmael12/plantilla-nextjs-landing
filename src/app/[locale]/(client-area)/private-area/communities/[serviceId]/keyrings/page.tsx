import CommunitiesKeyringsViewPage from '@/views/(client-area)/private-area/communities/details/keyrings/CommunitiesKeyringsViewPage';

interface KeyringsPageProps {
  params: Promise<{ locale: string; serviceId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de llaveros, credenciales y matriz de llaves de una comunidad.
 * @param {KeyringsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de llaveros renderizada
 */
export default async function KeyringsPage({ params, searchParams }: KeyringsPageProps) {
  const { locale, serviceId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CommunitiesKeyringsViewPage
      serviceId={serviceId}
      locale={locale}
      searchParams={resolvedSearchParams}
    />
  );
}
