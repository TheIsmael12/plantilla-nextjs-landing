"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityUnit,
  CommunityUnitsQuery,
  CreateCommunityUnitDto,
  ImportPortalUnitsDto,
  PortalUnitImportRow,
  UpdateCommunityUnitDto,
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
 * Página de unidades del edificio de una comunidad
 * (`GET client/me/communities/:serviceId/units`). `search` filtra por código,
 * bloque y puerta.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityUnitsQuery} [query] - Paginación, búsqueda y si incluir las unidades inactivas
 * @returns {Promise<FetchResponse<PaginatedResult<CommunityUnit>>>} Página de unidades dadas de alta
 */
export async function getCommunityUnitsPaginated(
  serviceId: string,
  query: CommunityUnitsQuery = {},
): Promise<FetchResponse<PaginatedResult<CommunityUnit>>> {
  return fetchDataToken<PaginatedResult<CommunityUnit>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/units${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Catálogo completo de unidades, para poblar los selectores de los formularios
 * (p. ej. a qué vivienda se asigna un vecino al invitarlo). El endpoint pagina,
 * así que pide una única página grande en vez de recorrerlas todas.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<CommunityUnit[]>>} Las unidades dadas de alta
 */
export async function getCommunityUnits(
  serviceId: string,
): Promise<FetchResponse<CommunityUnit[]>> {
  const response = await getCommunityUnitsPaginated(serviceId, { limit: CATALOG_LIMIT });

  return { ...response, data: response.data?.items };
}

/**
 * Da de alta una unidad (`POST client/me/communities/:serviceId/units`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CreateCommunityUnitDto} dto - Datos de la unidad
 * @returns {Promise<FetchResponse<CommunityUnit>>} La unidad recién creada
 */
export async function createCommunityUnit(
  serviceId: string,
  dto: CreateCommunityUnitDto,
): Promise<FetchResponse<CommunityUnit>> {
  return fetchDataToken<CommunityUnit, CreateCommunityUnitDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/units`,
    "POST",
    dto,
  );
}

/**
 * Modifica una unidad
 * (`PATCH client/me/communities/:serviceId/units/:unitId`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} unitId - Unidad a modificar
 * @param {UpdateCommunityUnitDto} dto - Campos a cambiar
 * @returns {Promise<FetchResponse<CommunityUnit>>} La unidad ya actualizada
 */
export async function updateCommunityUnit(
  serviceId: string,
  unitId: string,
  dto: UpdateCommunityUnitDto,
): Promise<FetchResponse<CommunityUnit>> {
  return fetchDataToken<CommunityUnit, UpdateCommunityUnitDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/units/${encodeURIComponent(unitId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Da de baja una unidad
 * (`DELETE client/me/communities/:serviceId/units/:unitId`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} unitId - Unidad a eliminar
 * @returns {Promise<FetchResponse<void>>} Respuesta vacía si se eliminó correctamente
 */
export async function deleteCommunityUnit(
  serviceId: string,
  unitId: string,
): Promise<FetchResponse<void>> {
  return fetchDataToken<void, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/units/${encodeURIComponent(unitId)}`,
    "DELETE",
  );
}

/**
 * Importa unidades en bloque
 * (`POST client/me/communities/:serviceId/units/import`), típicamente desde un
 * CSV ya parseado en el navegador.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {PortalUnitImportRow[]} rows - Unidades a dar de alta
 * @returns {Promise<FetchResponse<CommunityUnit[]>>} Las unidades creadas
 */
export async function importCommunityUnits(
  serviceId: string,
  rows: PortalUnitImportRow[],
): Promise<FetchResponse<CommunityUnit[]>> {
  return fetchDataToken<CommunityUnit[], ImportPortalUnitsDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/units/import`,
    "POST",
    { rows },
  );
}
