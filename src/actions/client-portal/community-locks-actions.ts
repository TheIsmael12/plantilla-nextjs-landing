"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityListQuery,
  CommunityLock,
  CreateLockScheduleExceptionDto,
  LockAccessLogEntry,
  LockAccessLogQuery,
  LockAccessSummary,
  LockSchedule,
  LockScheduleSlotDto,
  PutLockScheduleDto,
  ReleaseLockDto,
} from "@/types/client-portal/community";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

const CATALOG_LIMIT = 100;

/**
 * Construye el query string de un listado del portal, omitiendo los valores
 * vacíos/`undefined` para no mandar filtros sin valor al backend.
 * @param {Record<string, string | number | undefined>} params - Filtros activos
 * @returns {string} El query string, incluyendo el `?` inicial, o cadena vacía si no hay filtros
 */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `?${search}` : "";
}

/**
 * Página de cerraduras de una comunidad
 * (`GET client/me/communities/:serviceId/locks`). `search` filtra por nombre.
 * El cliente no da de alta ni de baja cerraduras: solo puede tocar su horario y
 * liberarlas.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityListQuery} [query] - Paginación y búsqueda
 * @returns {Promise<FetchResponse<PaginatedResult<CommunityLock>>>} Página de cerraduras con su estado, batería y capacidades
 */
export async function getCommunityLocksPaginated(
  serviceId: string,
  query: CommunityListQuery = {},
): Promise<FetchResponse<PaginatedResult<CommunityLock>>> {
  return fetchDataToken<PaginatedResult<CommunityLock>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/locks${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Catálogo completo de cerraduras, para la rejilla de puertas y para poblar los
 * selectores de los formularios (qué puertas incluye un llavero, sobre qué
 * puerta se emite una credencial). El endpoint pagina, así que pide una única
 * página grande en vez de recorrerlas todas.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<CommunityLock[]>>} Las cerraduras con su estado, batería y capacidades
 */
export async function getCommunityLocks(
  serviceId: string,
): Promise<FetchResponse<CommunityLock[]>> {
  const response = await getCommunityLocksPaginated(serviceId, { limit: CATALOG_LIMIT });

  return { ...response, data: response.data?.items };
}

/**
 * Obtiene el horario semanal de una cerradura
 * (`GET client/me/communities/locks/:lockId/schedule`), con sus excepciones
 * embebidas: no hay endpoint separado para leerlas.
 * @param {string} lockId - Cerradura consultada
 * @returns {Promise<FetchResponse<LockSchedule>>} Tramos, excepciones y si el horario se aplica de verdad
 */
export async function getLockSchedule(lockId: string): Promise<FetchResponse<LockSchedule>> {
  return fetchDataToken<LockSchedule, never>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/schedule`,
    "GET",
  );
}

/**
 * Sustituye la semana completa de horarios de una cerradura
 * (`PUT client/me/communities/locks/:lockId/schedule`). Un array vacío deja la
 * puerta abierta siempre: no es lo mismo que cerrarla.
 * @param {string} lockId - Cerradura a configurar
 * @param {LockScheduleSlotDto[]} slots - Semana completa de tramos
 * @returns {Promise<FetchResponse<LockSchedule>>} El horario ya guardado
 */
export async function putLockSchedule(
  lockId: string,
  slots: LockScheduleSlotDto[],
): Promise<FetchResponse<LockSchedule>> {
  return fetchDataToken<LockSchedule, PutLockScheduleDto>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/schedule`,
    "PUT",
    { slots },
  );
}

/**
 * Añade una excepción puntual al horario de una cerradura
 * (`POST client/me/communities/locks/:lockId/schedule/exceptions`).
 * @param {string} lockId - Cerradura a la que aplica
 * @param {CreateLockScheduleExceptionDto} dto - Día, tipo y horas alternativas
 * @returns {Promise<FetchResponse<LockSchedule>>} El horario ya con la excepción añadida
 */
export async function createLockScheduleException(
  lockId: string,
  dto: CreateLockScheduleExceptionDto,
): Promise<FetchResponse<LockSchedule>> {
  return fetchDataToken<LockSchedule, CreateLockScheduleExceptionDto>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/schedule/exceptions`,
    "POST",
    dto,
  );
}

/**
 * Elimina una excepción del horario
 * (`DELETE client/me/communities/locks/:lockId/schedule/exceptions/:exceptionId`).
 * @param {string} lockId - Cerradura a la que pertenece
 * @param {string} exceptionId - Excepción a eliminar
 * @returns {Promise<FetchResponse<void>>} Respuesta vacía si se eliminó correctamente
 */
export async function deleteLockScheduleException(
  lockId: string,
  exceptionId: string,
): Promise<FetchResponse<void>> {
  return fetchDataToken<void, never>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/schedule/exceptions/${encodeURIComponent(exceptionId)}`,
    "DELETE",
  );
}

/**
 * Libera una puerta temporalmente
 * (`POST client/me/communities/locks/:lockId/release`): la deja abierta hasta
 * la hora indicada, como máximo 24 h desde ahora.
 * @param {string} lockId - Cerradura a liberar
 * @param {ReleaseLockDto} dto - Hasta cuándo y por qué
 * @returns {Promise<FetchResponse<CommunityLock>>} La cerradura con su nuevo estado de liberación
 */
export async function releaseLock(
  lockId: string,
  dto: ReleaseLockDto,
): Promise<FetchResponse<CommunityLock>> {
  return fetchDataToken<CommunityLock, ReleaseLockDto>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/release`,
    "POST",
    dto,
  );
}

/**
 * Cancela la liberación de una puerta
 * (`DELETE client/me/communities/locks/:lockId/release`).
 * @param {string} lockId - Cerradura cuya liberación se cancela
 * @returns {Promise<FetchResponse<CommunityLock>>} La cerradura ya sin liberación activa
 */
export async function cancelLockRelease(lockId: string): Promise<FetchResponse<CommunityLock>> {
  return fetchDataToken<CommunityLock, never>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/release`,
    "DELETE",
  );
}

/**
 * Resumen agregado de accesos por puerta
 * (`GET client/me/communities/:serviceId/access-log`). No identifica a ningún
 * vecino, y es deliberado: no debe cruzarse con otras fuentes para ponerle
 * nombres.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<LockAccessSummary[]>>} Contadores de concedidos/denegados por puerta
 */
export async function getCommunityAccessSummary(
  serviceId: string,
): Promise<FetchResponse<LockAccessSummary[]>> {
  return fetchDataToken<LockAccessSummary[], never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/access-log`,
    "GET",
  );
}

/**
 * Detalle nominal del registro de accesos de una puerta
 * (`GET client/me/communities/locks/:lockId/access-log`). El backend exige un
 * `reason` de 5 a 300 caracteres y lo audita: la UI debe pedirlo siempre antes
 * de llamar aquí, no es un filtro opcional.
 * @param {string} lockId - Cerradura consultada
 * @param {LockAccessLogQuery} query - Motivo obligatorio de la consulta y filtros de fecha/vecino
 * @returns {Promise<FetchResponse<LockAccessLogEntry[]>>} Los eventos de acceso registrados
 */
export async function getLockAccessLog(
  lockId: string,
  query: LockAccessLogQuery,
): Promise<FetchResponse<LockAccessLogEntry[]>> {
  return fetchDataToken<LockAccessLogEntry[], never>(
    `client/me/communities/locks/${encodeURIComponent(lockId)}/access-log${buildQueryString({ ...query })}`,
    "GET",
  );
}
