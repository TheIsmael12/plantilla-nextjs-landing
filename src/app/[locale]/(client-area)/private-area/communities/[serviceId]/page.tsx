import CommunitiesDetailsViewPage from '@/views/(client-area)/private-area/communities/details/CommunitiesDetailsViewPage';

interface CommunityHomePageProps {
  params: Promise<{ locale: string; serviceId: string }>;
}

/**
 * Página de `/private-area/communities/[serviceId]`: la portada de la comunidad.
 *
 * Antes redirigía a la lista de vecinos. Ahora es una pantalla propia con el tablón, las cifras del
 * edificio, los gráficos de sus incidencias y el resumen del registro de accesos — lo que se quiere saber al
 * abrir una comunidad, sin tener que recorrer sus cuatro pestañas.
 * @param {CommunityHomePageProps} props - Comunidad activa y locale
 * @returns {Promise<JSX.Element>} La portada de la comunidad renderizada
 */
export default async function CommunityHomePage({ params }: CommunityHomePageProps) {
  const { locale, serviceId } = await params;

  return <CommunitiesDetailsViewPage serviceId={serviceId} locale={locale} />;
}
