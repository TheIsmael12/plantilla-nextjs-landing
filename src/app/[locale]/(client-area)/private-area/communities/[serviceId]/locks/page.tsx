import LocksViewPage from '@/views/(client-area)/private-area/communities/LocksViewPage';

interface LocksPageProps {
  params: Promise<{ locale: string; serviceId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de puertas de una comunidad: estado, horarios y liberaciones.
 * @param {LocksPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de puertas renderizada
 */
export default async function LocksPage({ params, searchParams }: LocksPageProps) {
  const { locale, serviceId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <LocksViewPage serviceId={serviceId} locale={locale} searchParams={resolvedSearchParams} />
  );
}
