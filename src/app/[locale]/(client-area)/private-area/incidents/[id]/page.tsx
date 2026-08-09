import IncidentDetailViewPage from '@/views/(client-area)/private-area/incidents/[id]/IncidentDetailViewPage';

interface IncidentDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Página de `/private-area/incidents/[id]`: detalle de una incidencia y
 * formulario para comentarla.
 * @param {IncidentDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} El detalle de la incidencia renderizado
 */
export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const { locale, id } = await params;

  return <IncidentDetailViewPage id={id} locale={locale} />;
}
