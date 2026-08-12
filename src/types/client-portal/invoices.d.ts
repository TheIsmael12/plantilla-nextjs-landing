import type { DocumentLine, DocumentTotals } from "@/types/client-portal/quotes";

/**
 * Estado de una factura (`InvoiceStatus` del backend). El portal nunca
 * expone `DRAFT`: el backend lo filtra antes de responder.
 */
export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

/** Tipo de documento de facturación (`InvoiceType` del backend). */
export type InvoiceType = "STANDARD" | "CREDIT_NOTE";

/**
 * Elemento del listado `GET client/me/invoices`. El backend fuerza
 * `type=STANDARD` server-side: el portal nunca lista abonos como documento
 * principal, solo aparecen colgando de su factura en {@link InvoiceDetail}.
 * @interface InvoiceListItem
 * @property {string} id - Identificador de la factura
 * @property {string} [fullNumber] - Número completo (`FRA-2026-000001`); ausente mientras no está emitida
 * @property {string} orderId - Pedido del que nace la factura
 * @property {"STANDARD"} type - Tipo de documento, siempre `STANDARD` en el portal
 * @property {string} [correctsInvoiceId] - Factura que este documento rectifica
 * @property {InvoiceStatus} status - Estado actual
 * @property {string} [issueDate] - Fecha de emisión (ISO `YYYY-MM-DD`)
 * @property {string} [dueDate] - Fecha de vencimiento (ISO `YYYY-MM-DD`)
 * @property {string} currency - Divisa ISO 4217 (p. ej. `EUR`)
 * @property {number} documentDiscountPercentage - Descuento global del documento
 * @property {string} [pdfUrl] - URL del PDF ya generado; su ausencia indica que aún no hay PDF
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 * @property {string} updatedAt - Fecha de última modificación (ISO 8601)
 */
export interface InvoiceListItem {
  id: string;
  fullNumber?: string;
  orderId: string;
  type: "STANDARD";
  correctsInvoiceId?: string;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  currency: string;
  documentDiscountPercentage: number;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cobro registrado contra una factura.
 * @interface InvoicePayment
 * @property {string} id - Identificador del cobro
 * @property {string} paymentDate - Fecha del cobro (ISO `YYYY-MM-DD`)
 * @property {number} amount - Importe cobrado
 * @property {string} method - Medio de pago empleado
 * @property {string} [reference] - Referencia bancaria o del cobro
 */
export interface InvoicePayment {
  id: string;
  paymentDate: string;
  amount: number;
  method: string;
  reference?: string;
}

/**
 * Abono (factura rectificativa) emitido contra una factura.
 * @interface InvoiceCreditNote
 * @property {string} id - Identificador del abono
 * @property {string} [fullNumber] - Número completo del abono
 * @property {string} [issueDate] - Fecha de emisión (ISO `YYYY-MM-DD`)
 * @property {number} total - Importe total del abono
 */
export interface InvoiceCreditNote {
  id: string;
  fullNumber?: string;
  issueDate?: string;
  total: number;
}

/**
 * Detalle de `GET client/me/invoices/:id`: el elemento de listado más líneas,
 * totales, cobros y abonos asociados.
 * @interface InvoiceDetail
 * @property {DocumentLine[]} lines - Líneas de la factura
 * @property {InvoicePayment[]} payments - Cobros registrados
 * @property {DocumentTotals} totals - Totales calculados
 * @property {number} pendingAmount - Importe pendiente, ya calculado por el backend (`total` menos los cobros)
 * @property {InvoiceCreditNote[]} [creditNotes] - Abonos emitidos contra esta factura
 */
export interface InvoiceDetail extends InvoiceListItem {
  lines: DocumentLine[];
  payments: InvoicePayment[];
  totals: DocumentTotals;
  pendingAmount: number;
  creditNotes?: InvoiceCreditNote[];
}

/**
 * Filtros de `GET client/me/invoices`.
 * @interface ClientInvoicesQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {InvoiceStatus} [status] - Filtro por estado
 * @property {string} [search] - Búsqueda libre por número de factura (`fullNumber`)
 */
export interface ClientInvoicesQuery {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  search?: string;
}

/**
 * Resumen de facturación del cliente (`GET client/me/invoices/summary`).
 * @interface PortalInvoiceSummary
 * @property {number} total - Facturas emitidas (los borradores no cuentan)
 * @property {number} unpaid - Facturas con algo pendiente de pago
 * @property {number} overdue - De las pendientes, las que ya han pasado su vencimiento
 * @property {number} pendingAmount - Suma de lo que queda por pagar
 * @property {number} billedLastYear - Suma de lo facturado en los últimos doce meses
 * @property {string} currency - Moneda de los importes
 */
export interface PortalInvoiceSummary {
  total: number;
  unpaid: number;
  overdue: number;
  pendingAmount: number;
  billedLastYear: number;
  currency: string;
  monthly: PortalInvoiceMonth[];
}

/**
 * Un mes de la serie de facturación del cliente.
 * @interface PortalInvoiceMonth
 * @property {string} month - Mes en formato `YYYY-MM`
 * @property {number} billed - Facturado ese mes
 * @property {number} paid - Cobrado de esas facturas
 */
export interface PortalInvoiceMonth {
  month: string;
  billed: number;
  paid: number;
}
