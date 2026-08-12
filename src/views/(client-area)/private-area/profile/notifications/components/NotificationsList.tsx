import { getTranslations } from 'next-intl/server';

import Badge from '@/components/ui/buttons/Badge';
import ClientListEmptyState from '@/views/(client-area)/private-area/components/ClientListEmptyState';
import ClientListPagination from '@/views/(client-area)/private-area/components/ClientListPagination';
import StatusFilter from '@/views/(client-area)/private-area/components/StatusFilter';
import MarkAllReadButton from '@/views/(client-area)/private-area/profile/notifications/components/MarkAllReadButton';
import NotificationLink from '@/views/(client-area)/private-area/profile/notifications/components/NotificationLink';

import { formatCommunityDateTime } from '@/utils/communityFormatUtils';
import {
  NOTIFICATION_SEVERITY_VARIANTS,
  resolveNotificationText,
} from '@/utils/notificationFormatUtils';

import type { NotificationResponseDto } from '@/types/client-portal/notifications';
import type { PaginationMeta } from '@/types/responses';

import '@/styles/04-components/client-area/notifications-list.scss';

/** Los tres estados del filtro. `undefined` es «todas». */
export type NotificationReadFilter = 'unread' | 'read' | undefined;

interface NotificationsListProps {
  notifications: NotificationResponseDto[];
  pagination: PaginationMeta | undefined;
  page: number;
  readFilter: NotificationReadFilter;
  /** Cuántas hay sin leer en total; decide si se ofrece «marcar todas». */
  unreadCount: number;
  locale: string;
}

/**
 * El histórico de notificaciones: filtro por leídas, filas y paginación.
 *
 * **La fila entera es pulsable y marca como leída al abrirla**, que es lo que se espera de una bandeja: si
 * hay que leerla en un sitio y marcarla en otro, nadie marca nada y el contador de la campana no baja nunca.
 * Las no leídas llevan un punto y el fondo levemente teñido — dos señales y no solo el color, porque quien no
 * distingue tonos se quedaba sin saber cuáles eran nuevas.
 *
 * La fecha va con hora: en una bandeja, «11 ago 2026» repetido nueve veces no ordena nada; lo que sitúa cada
 * aviso es la hora.
 * @param {NotificationsListProps} props - Página de notificaciones, filtro activo, pendientes y locale
 * @returns {Promise<JSX.Element>} El histórico renderizado
 */
export default async function NotificationsList({
  notifications,
  pagination,
  page,
  readFilter,
  unreadCount,
  locale,
}: NotificationsListProps) {
  const t = await getTranslations('Views.ClientArea.Notifications');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  return (
    <>
      <div className="notifications-list__toolbar">
        <StatusFilter
          paramName="read"
          label={t('filterLabel')}
          allLabel={t('filterAll')}
          activeStatus={readFilter}
          options={[
            { value: 'unread', label: t('filterUnread') },
            { value: 'read', label: t('filterRead') },
          ]}
        />

        {/* Solo cuando hay algo que marcar: un botón que no haría nada es un botón que sobra. */}
        {unreadCount > 0 && <MarkAllReadButton unreadCount={unreadCount} />}
      </div>

      {notifications.length > 0 ? (
        <>
          <ul className="notifications-list">
            {notifications.map((notification) => {
              const { title, body } = resolveNotificationText(notification, t);
              const isUnread = notification.readAt === null;

              return (
                <li key={notification.id} className="notifications-list__item">
                  <NotificationLink
                    id={notification.id}
                    url={notification.url}
                    isUnread={isUnread}
                  >
                    {/*
                      El punto es decorativo: lo que anuncia el estado a un lector de pantalla es el texto
                      de al lado, no un `span` de color.
                    */}
                    <span
                      className={`notifications-list__dot${isUnread ? ' notifications-list__dot--unread' : ''}`}
                      aria-hidden="true"
                    />

                    <span className="notifications-list__body">
                      <span className="notifications-list__head">
                        <span className="notifications-list__title">{title}</span>
                        <Badge
                          variant={NOTIFICATION_SEVERITY_VARIANTS[notification.severity]}
                          text={t(`Severity.${notification.severity}`)}
                        />
                      </span>

                      {body && <span className="notifications-list__text">{body}</span>}

                      <span className="notifications-list__meta">
                        <time dateTime={notification.createdAt}>
                          {formatCommunityDateTime(
                            notification.createdAt,
                            locale,
                            tCommon('notAvailable'),
                          )}
                        </time>
                        {isUnread && (
                          <span className="notifications-list__unread-label">{t('unread')}</span>
                        )}
                      </span>
                    </span>
                  </NotificationLink>
                </li>
              );
            })}
          </ul>

          <ClientListPagination
            basePath="/private-area/profile/notifications"
            currentPage={pagination?.page ?? page}
            totalPages={pagination?.totalPages ?? 1}
            searchParams={{ read: readFilter }}
          />
        </>
      ) : (
        <ClientListEmptyState
          resource="notifications"
          /* Con filtro puesto, el vacío no significa «no tienes notificaciones» sino «ninguna cumple esto». */
          title={readFilter ? t('emptyFilteredTitle') : t('emptyTitle')}
          description={readFilter ? t('emptyFilteredDescription') : t('emptyDescription')}
        />
      )}
    </>
  );
}
