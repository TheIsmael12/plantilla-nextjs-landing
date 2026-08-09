"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";

import { getRealtimeTicket } from "@/actions/client-portal/notifications-actions";

import type { NotificationResponseDto } from "@/types/client-portal/notifications";
import type { IncidentCommentResponse } from "@/types/client-portal/community";

type NotificationListener = (notification: NotificationResponseDto) => void;
type NotificationReadListener = (id: string) => void;
type IncidentCommentListener = (comment: IncidentCommentResponse) => void;

interface RealtimeContextValue {
  isConnected: boolean;
  /**
   * Notificaciones sin leer según el tiempo real, o `null` mientras no haya
   * llegado ningún dato. El `null` es significativo: permite a quien lo
   * consume seguir mostrando el contador que resolvió el servidor en vez de
   * pintar un cero que todavía no sabe si es cierto.
   */
  unreadCount: number | null;
  setUnreadCount: (count: number) => void;
  onNotification: (listener: NotificationListener) => () => void;
  /** Avisa de que una notificación se marcó como leída, p. ej. desde otra pestaña. */
  onNotificationRead: (listener: NotificationReadListener) => () => void;
  /**
   * Comentario nuevo de cualquier incidencia del cliente, con su contenido completo. El servidor
   * emite a la sala personal del cliente (el portal no tiene salas por recurso, a diferencia de la
   * intranet), así que quien escuche debe descartar los que no sean de la incidencia que tiene
   * abierta comparando `comment.incidentId`.
   */
  onIncidentComment: (listener: IncidentCommentListener) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * Estado del tiempo real del portal: conexión, contador de no leídas y
 * suscripción a las notificaciones que llegan por websocket.
 *
 * Fuera del `RealtimeProvider` devuelve un valor inerte (desconectado, cero
 * sin leer, suscripción que no hace nada) en vez de lanzar: así los
 * componentes que lo usan —la campana, sobre todo— pueden renderizarse
 * también en Storybook o en tests sin montar todo el árbol de providers.
 * @returns {RealtimeContextValue} Estado de la conexión y utilidades de suscripción
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);

  if (!context) {
    return {
      isConnected: false,
      unreadCount: null,
      setUnreadCount: () => {},
      onNotification: () => () => {},
      onNotificationRead: () => () => {},
      onIncidentComment: () => () => {},
    };
  }

  return context;
}

type RealtimeProviderProps = PropsWithChildren;

/**
 * Abre y mantiene el websocket del portal (`/rt/client`) mientras haya sesión
 * activa, y publica lo que llega por él al resto de la interfaz.
 *
 * Solo conecta con sesión iniciada: sin ella no hay ticket que pedir. La
 * autenticación es por ticket de un solo uso con 30 segundos de validez, así
 * que se pide uno nuevo en cada intento —incluidas las reconexiones— usando
 * el hook `auth` como función, que socket.io vuelve a invocar antes de cada
 * reintento. La reconexión con backoff es la nativa de socket.io.
 *
 * Si el socket no llega a conectar (sin Redis en desarrollo, proxy que no
 * habla websocket, red caída...), la aplicación sigue funcionando igual: el
 * fallo se queda en `isConnected: false` y el contador conserva el valor
 * resuelto en servidor, sin romper nada ni avisar al usuario.
 * El contador arranca en cero y lo siembra la campana con el valor que
 * resuelve el servidor: este proveedor envuelve toda la aplicación, incluidas
 * las páginas públicas, así que no puede recibir por prop un dato que solo
 * tiene sentido dentro del área privada.
 * @param {RealtimeProviderProps} props - `children`, el resto del árbol de la app
 * @returns {JSX.Element} El árbol envuelto en el contexto de tiempo real
 */
export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const listenersRef = useRef(new Set<NotificationListener>());
  const readListenersRef = useRef(new Set<NotificationReadListener>());
  const commentListenersRef = useRef(new Set<IncidentCommentListener>());

  useEffect(() => {
    if (status !== "authenticated") return;

    let socket: Socket | null = null;
    let cancelled = false;

    async function connect() {
      const response = await getRealtimeTicket();

      if (cancelled || !response.data) return;

      const { origin, namespace, ticket } = response.data;
      let isFirstAttempt = true;

      socket = io(`${origin}${namespace}`, {
        transports: ["websocket"],
        auth: (callback) => {
          /*
           * El primer intento reutiliza el ticket ya pedido; a partir de ahí
           * cada reintento pide uno nuevo, porque el anterior se quemó al
           * usarlo y solo vive 30 segundos.
           */
          if (isFirstAttempt) {
            isFirstAttempt = false;
            callback({ ticket });
            return;
          }

          void getRealtimeTicket().then((refreshed) => {
            callback({ ticket: refreshed.data?.ticket ?? "" });
          });
        },
      });

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("connect_error", () => setIsConnected(false));

      socket.on("notification", (notification: NotificationResponseDto) => {
        listenersRef.current.forEach((listener) => listener(notification));
      });

      socket.on("notification.read", (payload: { id: string }) => {
        readListenersRef.current.forEach((listener) => listener(payload.id));
      });

      socket.on("unread.count", (payload: { count: number }) => {
        setUnreadCount(payload.count);
      });

      socket.on("incident.comment", (comment: IncidentCommentResponse) => {
        commentListenersRef.current.forEach((listener) => listener(comment));
      });
    }

    void connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
      setIsConnected(false);
    };
  }, [status]);

  const onNotification = useCallback((listener: NotificationListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const onNotificationRead = useCallback((listener: NotificationReadListener) => {
    readListenersRef.current.add(listener);
    return () => {
      readListenersRef.current.delete(listener);
    };
  }, []);

  const onIncidentComment = useCallback((listener: IncidentCommentListener) => {
    commentListenersRef.current.add(listener);
    return () => {
      commentListenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({
      isConnected,
      unreadCount,
      setUnreadCount,
      onNotification,
      onNotificationRead,
      onIncidentComment,
    }),
    [isConnected, unreadCount, onNotification, onNotificationRead, onIncidentComment],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
