"use server";

import { fetchDataToken } from "@/actions/fetch";
import { ENV } from "@/config/env";
import type {
  MarkAllReadResponse,
  NotificationResponseDto,
  QueryNotificationsQuery,
  RealtimeConnectionInfo,
  RealtimeTicketResponse,
  UnreadCountResponse,
} from "@/types/client-portal/notifications";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

/**
 * Construye el query string de un listado del portal, omitiendo los valores
 * vacíos/`undefined` para no mandar filtros sin valor al backend.
 * @param {Record<string, string | number | boolean | undefined>} params - Filtros activos
 * @returns {string} El query string, incluyendo el `?` inicial, o cadena vacía si no hay filtros
 */
function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `?${search}` : "";
}

/**
 * Lista las notificaciones del cliente autenticado (`GET client/notifications`).
 * @param {QueryNotificationsQuery} [query] - Paginación y filtros por lectura, archivado, tipo y fecha
 * @returns {Promise<FetchResponse<PaginatedResult<NotificationResponseDto>>>} Página de notificaciones
 */
export async function getClientNotifications(
  query: QueryNotificationsQuery = {},
): Promise<FetchResponse<PaginatedResult<NotificationResponseDto>>> {
  return fetchDataToken<PaginatedResult<NotificationResponseDto>, never>(
    `client/notifications${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Obtiene el número de notificaciones sin leer
 * (`GET client/notifications/unread-count`), con el que arranca el contador de
 * la campana antes de que el websocket empiece a mandar `unread.count`.
 * @returns {Promise<FetchResponse<UnreadCountResponse>>} El contador de no leídas
 */
export async function getClientUnreadCount(): Promise<FetchResponse<UnreadCountResponse>> {
  return fetchDataToken<UnreadCountResponse, never>(
    "client/notifications/unread-count",
    "GET",
  );
}

/**
 * Marca todas las notificaciones del cliente como leídas
 * (`PATCH client/notifications/read-all`).
 * @returns {Promise<FetchResponse<MarkAllReadResponse>>} Cuántas pasaron a leídas
 */
export async function markAllNotificationsAsRead(): Promise<
  FetchResponse<MarkAllReadResponse>
> {
  return fetchDataToken<MarkAllReadResponse, never>(
    "client/notifications/read-all",
    "PATCH",
  );
}

/**
 * Marca una notificación concreta como leída (`PATCH client/notifications/:id/read`).
 * @param {string} id - Identificador de la notificación
 * @returns {Promise<FetchResponse<NotificationResponseDto>>} La notificación ya actualizada
 */
export async function markNotificationAsRead(
  id: string,
): Promise<FetchResponse<NotificationResponseDto>> {
  return fetchDataToken<NotificationResponseDto, never>(
    `client/notifications/${encodeURIComponent(id)}/read`,
    "PATCH",
  );
}

/**
 * Pide un ticket de un solo uso para abrir el websocket
 * (`POST client/realtime/ticket`).
 *
 * El ticket caduca en 30 segundos y se quema al conectar: hay que llamar a
 * esta acción justo antes de cada intento de conexión y de cada reconexión,
 * nunca reutilizar el anterior.
 * Devuelve además el origen del backend, que el navegador no puede resolver
 * por su cuenta: sale de `API_BASE_URL`, una variable sin prefijo
 * `NEXT_PUBLIC_` y por tanto solo legible en servidor.
 * @returns {Promise<FetchResponse<RealtimeConnectionInfo>>} Ticket, validez, namespace y origen al que conectar
 */
export async function getRealtimeTicket(): Promise<FetchResponse<RealtimeConnectionInfo>> {
  const response = await fetchDataToken<RealtimeTicketResponse, never>(
    "client/realtime/ticket",
    "POST",
  );

  if (!response.data) return { status: response.status, message: response.message };

  return {
    status: response.status,
    data: { ...response.data, origin: ENV.BACKEND_ORIGIN },
  };
}
