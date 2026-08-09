"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  ClientServiceDetail,
  ClientServiceListItem,
  ClientServicePriceRevision,
  ClientServiceSubResourceQuery,
  ClientServicesQuery,
} from "@/types/client-portal/services";
import type { QuoteListItem } from "@/types/client-portal/quotes";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

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
 * Lista los servicios contratados del cliente autenticado
 * (`GET client/me/services`).
 * @param {ClientServicesQuery} [query] - Paginación y filtro por estado
 * @returns {Promise<FetchResponse<PaginatedResult<ClientServiceListItem>>>} Página de servicios contratados
 */
export async function getClientServices(
  query: ClientServicesQuery = {},
): Promise<FetchResponse<PaginatedResult<ClientServiceListItem>>> {
  return fetchDataToken<PaginatedResult<ClientServiceListItem>, never>(
    `client/me/services${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Obtiene el detalle de un servicio contratado
 * (`GET client/me/services/:id`). El backend devuelve una versión redactada,
 * con distinta forma que el elemento del listado.
 * @param {string} id - Identificador del servicio contratado
 * @returns {Promise<FetchResponse<ClientServiceDetail>>} El detalle del servicio, o `status: 404` si no pertenece al cliente
 */
export async function getClientServiceDetail(
  id: string,
): Promise<FetchResponse<ClientServiceDetail>> {
  return fetchDataToken<ClientServiceDetail, never>(
    `client/me/services/${encodeURIComponent(id)}`,
    "GET",
  );
}

/**
 * Lista los presupuestos puntuales asociados a un servicio contratado
 * (`GET client/me/services/:id/quotes`).
 * @param {string} id - Identificador del servicio contratado
 * @param {ClientServiceSubResourceQuery} [query] - Paginación
 * @returns {Promise<FetchResponse<PaginatedResult<QuoteListItem>>>} Página de presupuestos del servicio
 */
export async function getClientServiceQuotes(
  id: string,
  query: ClientServiceSubResourceQuery = {},
): Promise<FetchResponse<PaginatedResult<QuoteListItem>>> {
  return fetchDataToken<PaginatedResult<QuoteListItem>, never>(
    `client/me/services/${encodeURIComponent(id)}/quotes${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Lista las revisiones de precio de un servicio contratado
 * (`GET client/me/services/:id/price-revisions`).
 * @param {string} id - Identificador del servicio contratado
 * @param {ClientServiceSubResourceQuery} [query] - Paginación
 * @returns {Promise<FetchResponse<PaginatedResult<ClientServicePriceRevision>>>} Página de revisiones de precio
 */
export async function getClientServicePriceRevisions(
  id: string,
  query: ClientServiceSubResourceQuery = {},
): Promise<FetchResponse<PaginatedResult<ClientServicePriceRevision>>> {
  return fetchDataToken<PaginatedResult<ClientServicePriceRevision>, never>(
    `client/me/services/${encodeURIComponent(id)}/price-revisions${buildQueryString({ ...query })}`,
    "GET",
  );
}
