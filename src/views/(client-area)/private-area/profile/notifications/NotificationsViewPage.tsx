import { getTranslations } from 'next-intl/server';

import {
  getClientNotifications,
  getClientUnreadCount,
} from '@/actions/client-portal/notifications-actions';

import NotificationsList from '@/views/(client-area)/private-area/profile/notifications/components/NotificationsList';

import type { NotificationReadFilter } from '@/views/(client-area)/private-area/profile/notifications/components/NotificationsList';

const NOTIFICATIONS_PER_PAGE = 20;

interface NotificationsViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Histórico completo de notificaciones, en el perfil.
 *
 * A diferencia del desplegable de la campana, aquí no hay estado en vivo: es una vista de servidor que se
 * repinta al navegar, porque quien llega viene a repasar lo que ha pasado, no a vigilar lo que entra.
 *
 * El título lo pone el `TitleComponent` del layout de perfil, así que esta vista no escribe cabecera: solo
 * resuelve el filtro y la página y entrega el bloque a `NotificationsList`.
 *
 * El recuento de pendientes se pide aparte del listado a propósito. Contar los que llegan en la página
 * visible daría «marcar 3 como leídas» en una bandeja con veinte sin leer, que es un botón que miente sobre
 * lo que va a hacer.
 * @param {NotificationsViewPageProps} props - Locale y query params (página y filtro de lectura)
 * @returns {Promise<JSX.Element>} La pantalla de notificaciones renderizada
 */
export default async function NotificationsViewPage({
  locale,
  searchParams,
}: NotificationsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Notifications');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  /*
   * `?read=unread|read`; cualquier otro valor es «todas».
   *
   * Se acepta también el viejo `?unreadOnly=true` porque es el enlace que la campana usaba antes de que esta
   * pantalla tuviera filtro, y puede estar guardado en un marcador de alguien.
   */
  const legacyUnreadOnly = searchParams.unreadOnly === 'true';
  const readFilter: NotificationReadFilter =
    searchParams.read === 'read'
      ? 'read'
      : searchParams.read === 'unread' || legacyUnreadOnly
        ? 'unread'
        : undefined;

  const [response, unread] = await Promise.all([
    getClientNotifications({
      page,
      limit: NOTIFICATIONS_PER_PAGE,
      unreadOnly: readFilter === 'unread' || undefined,
      readOnly: readFilter === 'read' || undefined,
    }),
    getClientUnreadCount(),
  ]);

  return (
    <>
      <p className="notifications-view__hint">{t('description')}</p>

      <NotificationsList
        notifications={response.data?.items ?? []}
        pagination={response.data?.pagination}
        page={page}
        readFilter={readFilter}
        unreadCount={unread.data?.count ?? 0}
        locale={locale}
      />
    </>
  );
}
