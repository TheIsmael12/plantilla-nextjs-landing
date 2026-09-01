"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityListQuery,
  CommunityLock,
  LockAccessLogEntry,
  LockAccessLogQuery,
  LockAccessSummary,
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
 * El registro de accesos de una comunidad
 * (`GET client/me/communities/:serviceId/access-log-detail`).
 *
 * **Ya no pide motivo.** Se exigía escribir uno de cinco letras antes de enseñar una sola fila, y eso no
 * protegía nada: quien tiene acceso a esta pantalla lo mira igual. La consulta se sigue auditando en el
 * servidor, que es lo que sí deja rastro de quién ha mirado.
 *
 * La puerta es un filtro más y no la condición para ver algo: la pregunta que trae aquí casi nunca es «qué ha
 * pasado en el garaje», es «qué ha pasado esta noche».
 * @param {string} serviceId - Comunidad
 * @param {LockAccessLogQuery} [filters] - Puerta, fechas, resultado y búsqueda por nombre
 * @returns {Promise<FetchResponse<LockAccessLogEntry[]>>} Las entradas, de la más reciente a la más antigua
 */
export async function getCommunityAccessLog(
  serviceId: string,
  filters?: LockAccessLogQuery,
): Promise<FetchResponse<LockAccessLogEntry[]>> {
  return fetchDataToken<LockAccessLogEntry[], never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/access-log-detail${buildQueryString({ ...filters })}`,
    "GET",
  );
}
