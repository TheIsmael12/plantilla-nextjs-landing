'use client';

import type { PropsWithChildren } from 'react';

import { markNotificationAsRead } from '@/actions/client-portal/notifications-actions';
import { useRouter, type AnyHref } from '@/i18n/navigation';

interface NotificationLinkProps extends PropsWithChildren {
  id: string;
  url: string | null;
  isUnread: boolean;
}

/**
 * Fila pinchable del listado de notificaciones: marca como leída y navega al
 * recurso.
 *
 * Existe como Client Component porque la vista que la usa es de servidor y
 * necesita un manejador de click. Una notificación sin `url` sigue siendo
 * pinchable: leerla es una acción por sí misma aunque no lleve a ningún sitio.
 * @param {NotificationLinkProps} props - Identificador, destino y si sigue sin leer
 * @returns {JSX.Element} La fila pinchable
 */
export default function NotificationLink({
  id,
  url,
  isUnread,
  children,
}: NotificationLinkProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (isUnread) await markNotificationAsRead(id);

    if (url) {
      router.push(url as AnyHref);
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      className={`notifications-list__link${isUnread ? ' notifications-list__link--unread' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
