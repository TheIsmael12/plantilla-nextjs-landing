"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  ClientInvoicesQuery,
  InvoiceDetail,
  InvoiceListItem,
} from "@/types/client-portal/invoices";
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
 * Lista las facturas del cliente autenticado (`GET client/me/invoices`). El
 * backend fuerza `type=STANDARD`, así que los abonos no aparecen como
 * documento propio del listado.
 * @param {ClientInvoicesQuery} [query] - Paginación y filtro por estado
 * @returns {Promise<FetchResponse<PaginatedResult<InvoiceListItem>>>} Página de facturas
 */
export async function getClientInvoices(
  query: ClientInvoicesQuery = {},
): Promise<FetchResponse<PaginatedResult<InvoiceListItem>>> {
  return fetchDataToken<PaginatedResult<InvoiceListItem>, never>(
    `client/me/invoices${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Obtiene el detalle completo de una factura, con líneas, totales, cobros y
 * abonos (`GET client/me/invoices/:id`).
 * @param {string} id - Identificador de la factura
 * @returns {Promise<FetchResponse<InvoiceDetail>>} La factura, o `status: 404` si no pertenece al cliente
 */
export async function getClientInvoiceDetail(
  id: string,
): Promise<FetchResponse<InvoiceDetail>> {
  return fetchDataToken<InvoiceDetail, never>(
    `client/me/invoices/${encodeURIComponent(id)}`,
    "GET",
  );
}
