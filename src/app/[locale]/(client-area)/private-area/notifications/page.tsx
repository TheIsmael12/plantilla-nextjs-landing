import NotificationsListViewPage from '@/views/(client-area)/private-area/notifications/NotificationsListViewPage';

interface NotificationsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Página de `/private-area/notifications`: histórico paginado completo, el
 * destino del enlace «ver todas» de la campana.
 * @param {NotificationsPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de notificaciones renderizada
 */
export default async function NotificationsPage({
  params,
  searchParams,
}: NotificationsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return <NotificationsListViewPage locale={locale} searchParams={resolvedSearchParams} />;
}
