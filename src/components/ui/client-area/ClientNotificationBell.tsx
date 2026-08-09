'use client';

import { useEffect, useRef, useState } from 'react';

import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  getClientNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/actions/client-portal/notifications-actions';
import { useRealtime } from '@/context/RealtimeProvider';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Link, useRouter, type AnyHref } from '@/i18n/navigation';
import {
  NOTIFICATION_SEVERITY_VARIANTS,
  resolveNotificationText,
} from '@/utils/notificationFormatUtils';

import Badge from '@/components/ui/buttons/Badge';

import type { NotificationResponseDto } from '@/types/client-portal/notifications';

import '@/styles/04-components/client-area/client-notification-bell.scss';

const DROPDOWN_SIZE = 15;

interface ClientNotificationBellProps {
  initialUnreadCount: number;
}

/**
 * Campana de notificaciones del área de cliente.
 *
 * El contador arranca con el valor resuelto en servidor para que no se pinte
 * un cero que salta a otro número al hidratar, y a partir de ahí lo mueven el
 * websocket (`unread.count`), las notificaciones nuevas y las marcas de
 * lectura. La lista se pide al abrir el desplegable, no al montar: la mayoría
 * de las visitas al portal no llegan a abrirlo.
 * @param {ClientNotificationBellProps} props - Contador inicial de no leídas, resuelto en el Server Component
 * @returns {JSX.Element} La campana con su desplegable
 */
export default function ClientNotificationBell({
  initialUnreadCount,
}: ClientNotificationBellProps) {
  const t = useTranslations('Views.ClientArea.Notifications');
  const router = useRouter();

  const {
    unreadCount: liveUnreadCount,
    setUnreadCount,
    onNotification,
    onNotificationRead,
  } = useRealtime();

  /* Mientras el tiempo real no diga nada, manda el contador del servidor. */
  const unreadCount = liveUnreadCount ?? initialUnreadCount;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, {
    onOutsideClick: () => setIsOpen(false),
    isActive: isOpen,
  });

  useEffect(
    () =>
      onNotification((incoming) => {
        setNotifications((current) => [
          incoming,
          ...current.filter((item) => item.id !== incoming.id),
        ]);
      }),
    [onNotification],
  );

  useEffect(
    () =>
      onNotificationRead((id) => {
        setNotifications((current) =>
          current.map((item) =>
            item.id === id && !item.readAt
              ? { ...item, readAt: new Date().toISOString() }
              : item,
          ),
        );
      }),
    [onNotificationRead],
  );

  const loadNotifications = async () => {
    if (hasLoaded || isLoading) return;

    setIsLoading(true);

    const response = await getClientNotifications({ page: 1, limit: DROPDOWN_SIZE });

    setNotifications(response.data?.items ?? []);
    setIsLoading(false);
    setHasLoaded(true);
  };

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    /* La lista se pide al abrir, no al montar: la mayoría de las visitas al
       portal no llegan a desplegar la campana. */
    if (willOpen) void loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const previous = notifications;
    const previousCount = unreadCount;
    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt })),
    );
    setUnreadCount(0);

    const response = await markAllNotificationsAsRead();

    if (!response.data) {
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponseDto) => {
    setIsOpen(false);

    /* `url` llega ya canónica del backend, pero es un `string` en tiempo de
       ejecución: no puede satisfacer la unión estricta de pathnames que genera
       next-intl, de ahí el escape hatch documentado en `i18n/navigation`. */
    if (notification.url) router.push(notification.url as AnyHref);

    if (notification.readAt) return;

    const previous = notifications;
    const previousCount = unreadCount;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
    setUnreadCount(Math.max(0, previousCount - 1));

    const response = await markNotificationAsRead(notification.id);

    if (!response.data) {
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <div className="client-notification-bell" ref={containerRef}>
      <button
        type="button"
        className="client-notification-bell__trigger"
        aria-label={t('ariaLabel')}
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <BellIcon />
        {hasUnread && (
          <span className="client-notification-bell__count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="client-notification-bell__dropdown">
          <header className="client-notification-bell__header">
            <p className="client-notification-bell__title">{t('title')}</p>
            {hasUnread && (
              <button
                type="button"
                className="client-notification-bell__mark-all"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheckIcon aria-hidden="true" />
                {t('markAllAsRead')}
              </button>
            )}
          </header>

          <ul className="client-notification-bell__list">
            {notifications.map((notification) => {
              const { title, body } = resolveNotificationText(notification, t);

              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={`client-notification-bell__item${
                      notification.readAt ? '' : ' client-notification-bell__item--unread'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="client-notification-bell__item-header">
                      <span className="client-notification-bell__item-title">{title}</span>
                      <Badge
                        variant={NOTIFICATION_SEVERITY_VARIANTS[notification.severity]}
                        text={t(`Severity.${notification.severity}`)}
                      />
                    </span>
                    {body && <span className="client-notification-bell__item-body">{body}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {!isLoading && notifications.length === 0 && (
            <p className="client-notification-bell__empty">{t('emptyTitle')}</p>
          )}

          <Link
            href="/private-area/notifications"
            className="client-notification-bell__view-all"
            onClick={() => setIsOpen(false)}
          >
            {t('viewAll')}
          </Link>
        </div>
      )}
    </div>
  );
}
