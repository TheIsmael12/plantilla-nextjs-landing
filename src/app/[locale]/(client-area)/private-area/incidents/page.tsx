import IncidentsListViewPage from '@/views/(client-area)/private-area/incidents/IncidentsListViewPage';

interface IncidentsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de `/private-area/incidents`: listado de todas las incidencias del
 * cliente y punto de entrada para abrir una nueva.
 * @param {IncidentsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de incidencias renderizada
 */
export default async function IncidentsPage({ params, searchParams }: IncidentsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return <IncidentsListViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
