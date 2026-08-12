"use server";

import { fetchDataToken } from "@/actions/fetch";
import { downloadPortalDocument, type PortalDocumentFile } from "@/lib/portalDocuments";
import type {
  ClientInvoicesQuery,
  InvoiceDetail,
  InvoiceListItem,
  PortalInvoiceSummary,
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

/**
 * Descarga el PDF de una factura propia (`GET client/me/invoices/:id/pdf`).
 *
 * Vuelve en base64 y no como URL por lo mismo que los adjuntos de una incidencia: el documento es
 * privado, así que cada descarga tiene que pasar por el endpoint autenticado, que comprueba otra vez
 * que la factura es de este cliente. Una URL pública sería un enlace que sigue funcionando para
 * cualquiera que lo tenga.
 * @param {string} id - Identificador de la factura
 * @returns {Promise<FetchResponse<PortalDocumentFile>>} El PDF en base64, o el error de la API
 */
export async function downloadClientInvoicePdf(
  id: string,
): Promise<FetchResponse<PortalDocumentFile>> {
  return downloadPortalDocument(`client/me/invoices/${encodeURIComponent(id)}/pdf`);
}

/**
 * Resumen de facturación del cliente (`GET client/me/invoices/summary`).
 *
 * Se pide aparte del listado y no se calcula sobre él por lo mismo que en incidencias: los importes se suman
 * en la base de datos sobre todas las facturas, porque «te quedan 1.200 € por pagar» sacado de las diez filas
 * de la primera página es un número inventado, y ese es justo el número con el que alguien decide si paga.
 * @returns {Promise<FetchResponse<PortalInvoiceSummary>>} Contadores e importes de su facturación
 */
export async function getClientInvoiceSummary(): Promise<FetchResponse<PortalInvoiceSummary>> {
  return fetchDataToken<PortalInvoiceSummary, never>("client/me/invoices/summary", "GET");
}
