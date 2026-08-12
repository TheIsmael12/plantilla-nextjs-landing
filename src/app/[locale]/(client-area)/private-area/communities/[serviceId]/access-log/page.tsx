import CommunitiesAccessLogViewPage from '@/views/(client-area)/private-area/communities/details/access-log/CommunitiesAccessLogViewPage';

interface AccessLogPageProps {
  params: Promise<{ locale: string; serviceId: string }>;
}

/**
 * Página del registro de accesos de una comunidad.
 * @param {AccessLogPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista del registro de accesos renderizada
 */
export default async function AccessLogPage({ params }: AccessLogPageProps) {
  const { locale, serviceId } = await params;

  return <CommunitiesAccessLogViewPage serviceId={serviceId} locale={locale} />;
}
