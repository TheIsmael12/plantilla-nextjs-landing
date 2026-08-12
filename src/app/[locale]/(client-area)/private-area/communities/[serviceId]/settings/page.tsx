import CommunitiesSettingsViewPage from '@/views/(client-area)/private-area/communities/details/settings/CommunitiesSettingsViewPage';

interface CommunitySettingsPageProps {
  params: Promise<{ serviceId: string }>;
}

/**
 * Página de configuración de una comunidad.
 * @param {CommunitySettingsPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de configuración renderizada
 */
export default async function CommunitySettingsPage({ params }: CommunitySettingsPageProps) {
  const { serviceId } = await params;

  return <CommunitiesSettingsViewPage serviceId={serviceId} />;
}
