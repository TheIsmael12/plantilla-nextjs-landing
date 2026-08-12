'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslations } from 'next-intl';

import {
  BellIcon,
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import { markNotificationAsRead } from '@/actions/client-portal/notifications-actions';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useRealtime } from '@/context/RealtimeProvider';
import { useRouter, type AnyHref } from '@/i18n/navigation';
import {
  isPhrasableNotification,
  resolveNotificationText,
} from '@/utils/notificationFormatUtils';

import type { NotificationResponseDto, NotificationSeverity } from '@/types/client-portal/notifications';

import '@/styles/04-components/client-area/notification-banner.scss';

/**
 * Cuántos avisos se ven a la vez.
 *
 * Tres: el cuarto tapando los tres anteriores no aporta nada, y una pila alta acaba cubriendo la pantalla
 * entera —justo lo que hace que la gente aprenda a descartar sin leer—. El resto sigue en la campana.
 */
const MAX_VISIBLE = 3;

/** Cuánto aguanta un aviso antes de irse solo. */
const AUTO_DISMISS_MS = 8000;

/** El icono de cada severidad, igual que en la campana y en los listados. */
const SEVERITY_ICONS: Record<NotificationSeverity, LucideIcon> = {
  INFO: InfoIcon,
  SUCCESS: CheckCircle2Icon,
  WARNING: TriangleAlertIcon,
  CRITICAL: BellIcon,
};

/**
 * Avisos emergentes de las notificaciones que llegan en vivo, al estilo de las del móvil: un cartel que
 * baja desde arriba con su icono, su título y su texto, se puede tocar para ir al sitio y se va solo.
 *
 * **Por qué no reutiliza el `Toaster` general.** Un toast es la respuesta a algo que acabas de hacer
 * («guardado», «no se pudo enviar»): una línea, abajo, y se va. Una notificación es lo contrario —llega
 * sola, tiene título, cuerpo y un destino— y mezclarlas haría que «tu factura ha vencido» se leyera igual
 * que «cambios guardados» y desapareciera igual de rápido.
 *
 * **Se anuncia todo lo que sabemos redactar, no solo lo grave.** La intranet filtra por severidad porque
 * allí llega un aviso por cada comentario de cada incidencia y un cartel por cada uno enseñaría a
 * ignorarlos. Aquí el catálogo del portal son cinco tipos —presupuesto enviado, factura emitida, vencida,
 * pagada y presupuesto por caducar—, todos cosas que el cliente quiere saber en el momento, y son un puñado
 * al mes. Lo que sí se descarta es lo que no sabemos poner en palabras: ver `isPhrasableNotification`.
 *
 * Detalles que no son adorno:
 *
 * - **Al pasar el ratón o dar el foco, el reloj se para.** Un cartel de dos líneas que se va mientras lo
 *   estás leyendo es peor que no haberlo puesto.
 * - **Tocarlo marca como leído y navega**, para que no haya que hacer el trabajo dos veces en la campana.
 * - **`aria-live="polite"`**: un lector de pantalla lo lee al llegar, pero sin interrumpir lo que estuviera
 *   diciendo. `assertive` sería robarle la palabra por una factura.
 * @returns {JSX.Element | null} La pila de avisos, o `null` mientras no haya ninguno
 */
export default function ClientNotificationBanners() {
  const t = useTranslations('Views.ClientArea.Notifications');
  const router = useRouter();
  const isMounted = useIsMounted();

  const { onNotification, unreadCount, setUnreadCount } = useRealtime();

  const [banners, setBanners] = useState<NotificationResponseDto[]>([]);

  const dismiss = useCallback((id: string) => {
    setBanners((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(
    () =>
      onNotification((incoming) => {
        if (!isPhrasableNotification(incoming)) return;

        setBanners((current) =>
          // El nuevo arriba, y sin duplicar si el servidor reenvía el mismo id.
          [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, MAX_VISIBLE),
        );
      }),
    [onNotification],
  );

  const handleOpen = (notification: NotificationResponseDto) => {
    dismiss(notification.id);

    /* `url` llega canónica del backend pero es un `string` en tiempo de ejecución: no puede satisfacer la
       unión estricta de pathnames de next-intl, de ahí el escape hatch documentado en `i18n/navigation`. */
    if (notification.url) router.push(notification.url as AnyHref);

    if (notification.readAt) return;

    /*
     * Se descuenta el contador sin esperar a la API.
     *
     * El cartel ya ha desaparecido, así que dejar la campana con el número viejo unos cientos de
     * milisegundos se ve como que el toque no ha servido de nada. Si la petición falla, el siguiente
     * `unread.count` del websocket devuelve la verdad.
     */
    if (unreadCount !== null && unreadCount > 0) setUnreadCount(unreadCount - 1);

    void markNotificationAsRead(notification.id);
  };

  // Sin `document` no hay portal: el aviso vive en `body` para que ninguna pila de contexto lo recorte.
  if (!isMounted || banners.length === 0) return null;

  return createPortal(
    <div className="notification-banners" aria-live="polite" aria-label={t('title')}>
      {banners.map((notification) => (
        <NotificationBanner
          key={notification.id}
          notification={notification}
          onOpen={() => handleOpen(notification)}
          onDismiss={() => dismiss(notification.id)}
        />
      ))}
    </div>,
    document.body,
  );
}

interface NotificationBannerProps {
  notification: NotificationResponseDto;
  onOpen: () => void;
  onDismiss: () => void;
}

/** Un aviso suelto, con su propio reloj de cierre para que el de al lado no se lo lleve por delante. */
function NotificationBanner({ notification, onOpen, onDismiss }: NotificationBannerProps) {
  const t = useTranslations('Views.ClientArea.Notifications');

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // Al despausar, el reloj vuelve a empezar: es más generoso que reanudar lo que quedaba, y quien acaba
    // de apartar el ratón sigue teniendo tiempo de decidir.
  }, [isPaused, onDismiss]);

  const { title, body } = resolveNotificationText(notification, t);
  const Icon = SEVERITY_ICONS[notification.severity];

  return (
    <div
      className={`notification-banner notification-banner--${notification.severity.toLowerCase()}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/*
        El cartel entero es un botón, no un `div` con `onClick`: así se llega con el tabulador y se abre
        con Enter. El botón de cerrar va aparte porque son dos acciones distintas.
      */}
      <button type="button" className="notification-banner__open" onClick={onOpen}>
        <span className="notification-banner__icon">
          <Icon aria-hidden="true" />
        </span>

        <span className="notification-banner__text">
          <span className="notification-banner__title">{title}</span>
          {body && <span className="notification-banner__body">{body}</span>}
        </span>
      </button>

      <button
        type="button"
        className="notification-banner__close"
        aria-label={t('dismiss')}
        onClick={onDismiss}
      >
        <XIcon aria-hidden="true" />
      </button>
    </div>
  );
}
