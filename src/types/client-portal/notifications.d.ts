/**
 * Severidad de una notificación (`NotificationSeverity` del backend), que
 * decide el color con el que se pinta en la campana.
 */
export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

/**
 * Tipos de notificación que el backend emite hoy hacia el portal de cliente.
 * Se declara solo como ayuda de autocompletado: el campo `type` de
 * {@link NotificationResponseDto} sigue siendo `string` a propósito, porque el
 * catálogo del backend es abierto y una notificación de un tipo nuevo no debe
 * romper el listado, solo caer en el texto genérico de respaldo.
 */
export type KnownNotificationType =
  | "QUOTE_SENT"
  | "QUOTE_EXPIRING_SOON"
  | "INVOICE_ISSUED"
  | "INVOICE_OVERDUE_PORTAL"
  | "INVOICE_PAID_PORTAL";

/**
 * Notificación del cliente (`GET client/notifications`), tal y como llega
 * también por el evento `notification` del websocket.
 *
 * El backend no manda el texto ya traducido salvo en `titleOverride`/
 * `bodyOverride` (avisos manuales): para el resto, el frontend compone el
 * texto con `type` + `data` contra las claves `Notifications.Types.<TYPE>`.
 * @interface NotificationResponseDto
 * @property {string} id - Identificador de la notificación
 * @property {string} type - Código del catálogo (`QUOTE_SENT`, `INVOICE_ISSUED`...); abierto, ver {@link KnownNotificationType}
 * @property {NotificationSeverity} severity - Severidad, para el color de la insignia
 * @property {Record<string, unknown>} data - Parámetros de interpolación del texto, distintos según `type`
 * @property {string | null} titleOverride - Título ya escrito, solo en avisos manuales; tiene prioridad sobre la traducción
 * @property {string | null} bodyOverride - Cuerpo ya escrito, solo en avisos manuales
 * @property {string | null} resourceType - Tipo del recurso relacionado (`QUOTE`, `INVOICE`...)
 * @property {string | null} resourceId - Identificador de ese recurso
 * @property {string | null} url - Ruta del portal ya canónica; se usa tal cual, no hay que construirla
 * @property {string | null} groupKey - Clave de agrupación del backend
 * @property {string | null} readAt - Cuándo se leyó (ISO 8601), o `null` si sigue sin leer
 * @property {string | null} archivedAt - Cuándo se archivó (ISO 8601)
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 */
export interface NotificationResponseDto {
  id: string;
  type: string;
  severity: NotificationSeverity;
  data: Record<string, unknown>;
  titleOverride: string | null;
  bodyOverride: string | null;
  resourceType: string | null;
  resourceId: string | null;
  url: string | null;
  groupKey: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
}

/**
 * Filtros de `GET client/notifications`.
 * @interface QueryNotificationsQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {boolean} [unreadOnly] - Solo las que siguen sin leer
 * @property {boolean} [includeArchived] - Incluir también las archivadas
 * @property {string} [type] - Filtro por código de tipo
 * @property {string} [since] - Solo las creadas después de esta fecha (ISO 8601)
 */
export interface QueryNotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  includeArchived?: boolean;
  type?: string;
  since?: string;
}

/**
 * Respuesta de `GET client/notifications/unread-count`.
 * @interface UnreadCountResponse
 * @property {number} count - Notificaciones sin leer del cliente
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Respuesta de `PATCH client/notifications/read-all`.
 * @interface MarkAllReadResponse
 * @property {number} updated - Cuántas notificaciones pasaron a leídas
 */
export interface MarkAllReadResponse {
  updated: number;
}

/**
 * Ticket de un solo uso para abrir el websocket (`POST client/realtime/ticket`).
 * Dura 30 segundos y se quema al conectar: hay que pedir uno nuevo en cada
 * intento de conexión, nunca cachearlo.
 * @interface RealtimeTicketResponse
 * @property {string} ticket - Credencial que viaja en `handshake.auth.ticket`
 * @property {number} expiresInSeconds - Validez del ticket en segundos
 * @property {string} namespace - Namespace de socket.io al que conectar (`/rt/client`)
 */
export interface RealtimeTicketResponse {
  ticket: string;
  expiresInSeconds: number;
  namespace: string;
}

/**
 * Lo que la acción `getRealtimeTicket` entrega al cliente: el ticket del
 * backend más el origen al que conectar.
 *
 * El origen viaja aquí porque se deriva de `API_BASE_URL`, una variable de
 * entorno sin prefijo `NEXT_PUBLIC_` y por tanto ilegible desde el navegador:
 * resolverlo en el servidor evita tener que publicar una variable nueva solo
 * para que el socket sepa a dónde conectarse.
 * @interface RealtimeConnectionInfo
 * @property {string} ticket - Credencial de un solo uso para `handshake.auth.ticket`
 * @property {number} expiresInSeconds - Validez del ticket en segundos
 * @property {string} namespace - Namespace de socket.io (`/rt/client`)
 * @property {string} origin - Origen del backend, sin el prefijo `/api`
 */
export interface RealtimeConnectionInfo extends RealtimeTicketResponse {
  origin: string;
}
