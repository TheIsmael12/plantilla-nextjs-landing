import { getTranslations } from 'next-intl/server';

import { getClientNotifications } from '@/actions/client-portal/notifications-actions';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import {
  NOTIFICATION_SEVERITY_VARIANTS,
  resolveNotificationText,
} from '@/utils/notificationFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/components/ui/client-area/ClientListEmptyState';
import ClientListPagination from '@/components/ui/client-area/ClientListPagination';
import NotificationLink from '@/components/ui/client-area/NotificationLink';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';

const NOTIFICATIONS_PER_PAGE = 20;

interface NotificationsListViewPageProps {
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Listado paginado completo de notificaciones, el destino del enlace
 * «ver todas» de la campana. A diferencia del desplegable, aquí no hay estado
 * en vivo: es una vista de servidor que se repinta al navegar, porque quien
 * llega a esta pantalla viene a repasar el histórico, no a vigilar lo que
 * entra.
 * @param {NotificationsListViewPageProps} props - Locale y query params (página y filtro de no leídas)
 * @returns {Promise<JSX.Element>} La pantalla de notificaciones renderizada
 */
export default async function NotificationsListViewPage({
  locale,
  searchParams,
}: NotificationsListViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Notifications');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const unreadOnly = searchParams.unreadOnly === 'true';

  const response = await getClientNotifications({
    page,
    limit: NOTIFICATIONS_PER_PAGE,
    unreadOnly: unreadOnly || undefined,
  });

  const notifications = response.data?.items ?? [];
  const pagination = response.data?.pagination;

  return (
    <section className="client-list">
      <header className="client-list__header">
        <h1 className="client-list__title">{t('title')}</h1>
        <p className="client-list__description">{t('description')}</p>
      </header>

      {notifications.length > 0 ? (
        <>
          <ul className="client-list__items">
            {notifications.map((notification) => {
              const { title, body } = resolveNotificationText(notification, t);

              return (
                <li key={notification.id} className="client-list__item">
                  <NotificationLink
                    id={notification.id}
                    url={notification.url}
                    isUnread={notification.readAt === null}
                  >
                    <span className="client-list__item-header">
                      <strong>{title}</strong>
                      <Badge
                        variant={NOTIFICATION_SEVERITY_VARIANTS[notification.severity]}
                        text={t(`Severity.${notification.severity}`)}
                      />
                    </span>
                    {body && <span className="client-list__item-body">{body}</span>}
                    <span className="community-table__muted">
                      {formatBillingDate(
                        notification.createdAt,
                        locale,
                        tCommon('notAvailable'),
                      )}
                    </span>
                  </NotificationLink>
                </li>
              );
            })}
          </ul>

          <ClientListPagination
            basePath="/private-area/notifications"
            currentPage={pagination?.page ?? page}
            totalPages={pagination?.totalPages ?? 1}
            searchParams={{ unreadOnly: unreadOnly ? 'true' : undefined }}
          />
        </>
      ) : (
        <ClientListEmptyState
          resource="notifications"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </section>
  );
}
