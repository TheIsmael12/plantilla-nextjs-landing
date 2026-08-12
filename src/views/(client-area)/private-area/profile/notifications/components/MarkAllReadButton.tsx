'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { CheckCheckIcon } from 'lucide-react';

import { markAllNotificationsAsRead } from '@/actions/client-portal/notifications-actions';
import { useRealtime } from '@/context/RealtimeProvider';
import { useRouter } from '@/i18n/navigation';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';

interface MarkAllReadButtonProps {
  /** Cuántas hay sin leer, para decirlo en el botón. */
  unreadCount: number;
}

/**
 * «Marcar todas como leídas» del histórico.
 *
 * Dice **cuántas** va a marcar, no solo la acción: es una operación que no se puede deshacer y saber que son
 * tres o treinta y siete cambia si se pulsa. Aun así no pide confirmación: lo que se pierde es la marca de
 * «nuevo», no la notificación, y un modal por eso es una interrupción cara para lo que se arriesga.
 *
 * Pone el contador de la campana a cero además de refrescar la lista: los dos miran el mismo dato y dejar la
 * campana con el número viejo hasta la siguiente respuesta del websocket se lee como que no ha funcionado.
 * @param {MarkAllReadButtonProps} props - Cuántas notificaciones hay sin leer
 * @returns {JSX.Element} El botón de marcar todas
 */
export default function MarkAllReadButton({ unreadCount }: MarkAllReadButtonProps) {
  const t = useTranslations('Views.ClientArea.Notifications');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const { setUnreadCount } = useRealtime();

  const [isPending, setIsPending] = useState(false);

  const handleClick = () => {
    setIsPending(true);

    void (async () => {
      const response = await markAllNotificationsAsRead();

      notifyResponse(response, tErrors('unexpectedError'));

      if (response.data) {
        setUnreadCount(0);
        router.refresh();
      }

      setIsPending(false);
    })();
  };

  return (
    <Button
      size="sm"
      variant="outline"
      title={isPending ? 'saving' : 'markAllAsRead'}
      titleValues={{ count: unreadCount }}
      onClick={handleClick}
      disabled={isPending}
    >
      {!isPending && <CheckCheckIcon />}
    </Button>
  );
}
