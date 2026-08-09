"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityListQuery,
  CreateLockGroupDto,
  KeyMatrix,
  LockGroup,
  UpdateLockGroupDto,
} from "@/types/client-portal/community";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

const CATALOG_LIMIT = 100;

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
 * Página de llaveros de una comunidad
 * (`GET client/me/communities/:serviceId/keyrings`). `search` filtra por
 * nombre.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityListQuery} [query] - Paginación y búsqueda
 * @returns {Promise<FetchResponse<PaginatedResult<LockGroup>>>} Página de llaveros con sus puertas
 */
export async function getCommunityKeyringsPaginated(
  serviceId: string,
  query: CommunityListQuery = {},
): Promise<FetchResponse<PaginatedResult<LockGroup>>> {
  return fetchDataToken<PaginatedResult<LockGroup>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyrings${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Catálogo completo de llaveros, para poblar los selectores de los formularios
 * (p. ej. qué llaveros se conceden al invitar a un vecino, o sobre qué llavero
 * se emite una credencial). El endpoint pagina, así que pide una única página
 * grande en vez de recorrerlas todas.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<LockGroup[]>>} Los llaveros con sus puertas
 */
export async function getCommunityKeyrings(
  serviceId: string,
): Promise<FetchResponse<LockGroup[]>> {
  const response = await getCommunityKeyringsPaginated(serviceId, { limit: CATALOG_LIMIT });

  return { ...response, data: response.data?.items };
}

/**
 * Crea un llavero (`POST client/me/communities/:serviceId/keyrings`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CreateLockGroupDto} dto - Nombre, descripción y puertas que incluye
 * @returns {Promise<FetchResponse<LockGroup>>} El llavero recién creado
 */
export async function createCommunityKeyring(
  serviceId: string,
  dto: CreateLockGroupDto,
): Promise<FetchResponse<LockGroup>> {
  return fetchDataToken<LockGroup, CreateLockGroupDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyrings`,
    "POST",
    dto,
  );
}

/**
 * Modifica un llavero
 * (`PATCH client/me/communities/:serviceId/keyrings/:keyringId`). Si se envía
 * `lockIds`, sustituye la lista completa de puertas del llavero.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} keyringId - Llavero a modificar
 * @param {UpdateLockGroupDto} dto - Campos a cambiar
 * @returns {Promise<FetchResponse<LockGroup>>} El llavero ya actualizado
 */
export async function updateCommunityKeyring(
  serviceId: string,
  keyringId: string,
  dto: UpdateLockGroupDto,
): Promise<FetchResponse<LockGroup>> {
  return fetchDataToken<LockGroup, UpdateLockGroupDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyrings/${encodeURIComponent(keyringId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Elimina un llavero
 * (`DELETE client/me/communities/:serviceId/keyrings/:keyringId`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} keyringId - Llavero a eliminar
 * @returns {Promise<FetchResponse<void>>} Respuesta vacía si se eliminó correctamente
 */
export async function deleteCommunityKeyring(
  serviceId: string,
  keyringId: string,
): Promise<FetchResponse<void>> {
  return fetchDataToken<void, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyrings/${encodeURIComponent(keyringId)}`,
    "DELETE",
  );
}

/**
 * Obtiene la matriz vecino×puerta
 * (`GET client/me/communities/:serviceId/key-matrix`): la vista que responde a
 * "quién tiene llave del garaje", en vez de a "qué credenciales existen".
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<KeyMatrix>>} Puertas (columnas) y vecinos con su estado por puerta (filas)
 */
export async function getCommunityKeyMatrix(
  serviceId: string,
): Promise<FetchResponse<KeyMatrix>> {
  return fetchDataToken<KeyMatrix, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/key-matrix`,
    "GET",
  );
}
