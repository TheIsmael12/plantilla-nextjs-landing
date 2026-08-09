"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  AcceptQuoteDto,
  ClientQuotesQuery,
  QuoteDetail,
  QuoteListItem,
} from "@/types/client-portal/quotes";
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
 * Lista los presupuestos del cliente autenticado (`GET client/me/quotes`).
 * @param {ClientQuotesQuery} [query] - Paginación y filtro por estado
 * @returns {Promise<FetchResponse<PaginatedResult<QuoteListItem>>>} Página de presupuestos
 */
export async function getClientQuotes(
  query: ClientQuotesQuery = {},
): Promise<FetchResponse<PaginatedResult<QuoteListItem>>> {
  return fetchDataToken<PaginatedResult<QuoteListItem>, never>(
    `client/me/quotes${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Obtiene el detalle completo de un presupuesto, con líneas, totales y
 * cláusulas (`GET client/me/quotes/:id`).
 * @param {string} id - Identificador del presupuesto
 * @returns {Promise<FetchResponse<QuoteDetail>>} El presupuesto, o `status: 404` si no pertenece al cliente
 */
export async function getClientQuoteDetail(id: string): Promise<FetchResponse<QuoteDetail>> {
  return fetchDataToken<QuoteDetail, never>(`client/me/quotes/${encodeURIComponent(id)}`, "GET");
}

/**
 * Acepta un presupuesto (`POST client/me/quotes/:id/accept`). Solo es válido
 * mientras está en `SENT`: en cualquier otro estado el backend responde 409
 * (`QUOTE_NOT_SENT`), que llega como `status`/`message` en la respuesta.
 * @param {string} id - Identificador del presupuesto
 * @param {AcceptQuoteDto} [dto] - Método de firma y firmantes; vacío deja que el backend aplique su valor por defecto
 * @returns {Promise<FetchResponse<QuoteDetail>>} El presupuesto ya actualizado
 */
export async function acceptClientQuote(
  id: string,
  dto: AcceptQuoteDto = {},
): Promise<FetchResponse<QuoteDetail>> {
  return fetchDataToken<QuoteDetail, AcceptQuoteDto>(
    `client/me/quotes/${encodeURIComponent(id)}/accept`,
    "POST",
    dto,
  );
}

/**
 * Rechaza un presupuesto (`POST client/me/quotes/:id/reject`). Igual que
 * aceptar, solo es válido mientras está en `SENT`.
 * @param {string} id - Identificador del presupuesto
 * @returns {Promise<FetchResponse<QuoteDetail>>} El presupuesto ya actualizado
 */
export async function rejectClientQuote(id: string): Promise<FetchResponse<QuoteDetail>> {
  return fetchDataToken<QuoteDetail, never>(
    `client/me/quotes/${encodeURIComponent(id)}/reject`,
    "POST",
  );
}
