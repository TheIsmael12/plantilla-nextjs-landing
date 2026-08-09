import type { BillingFrequency } from "@/types/client-portal/services";

/**
 * Estado de un presupuesto (`QuoteStatus` del backend). El portal nunca
 * expone `DRAFT`: el backend lo filtra antes de responder.
 */
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

/** Método de firma al aceptar un presupuesto (`SignatureMethod` del backend). */
export type SignatureMethod = "ELECTRONIC" | "MANUAL";

/**
 * Desglose de un tipo impositivo dentro de los totales de un documento.
 * @interface DocumentTaxBreakdown
 * @property {number} taxRate - Tipo impositivo aplicado (porcentaje)
 * @property {string | null} taxException - Causa de exención, si el tipo es 0
 * @property {number} base - Base imponible a la que se aplica el tipo
 * @property {number} taxAmount - Cuota resultante
 */
export interface DocumentTaxBreakdown {
  taxRate: number;
  taxException: string | null;
  base: number;
  taxAmount: number;
}

/**
 * Totales de un documento comercial (presupuesto o factura), ya calculados
 * por el backend.
 * @interface DocumentTotals
 * @property {number} subtotal - Suma de las líneas antes del descuento de documento
 * @property {number} documentDiscountAmount - Importe del descuento global del documento
 * @property {number} subtotalAfterDocumentDiscount - Base tras aplicar el descuento global
 * @property {number} taxAmount - Total de impuestos repercutidos
 * @property {number} withholdingAmount - Total de retenciones practicadas
 * @property {number} total - Importe total del documento
 * @property {DocumentTaxBreakdown[]} taxBreakdown - Desglose por tipo impositivo
 */
export interface DocumentTotals {
  subtotal: number;
  documentDiscountAmount: number;
  subtotalAfterDocumentDiscount: number;
  taxAmount: number;
  withholdingAmount: number;
  total: number;
  taxBreakdown: DocumentTaxBreakdown[];
}

/**
 * Línea de un documento comercial (presupuesto o factura).
 * @interface DocumentLine
 * @property {string} id - Identificador de la línea
 * @property {string} description - Descripción del concepto
 * @property {number} quantity - Cantidad
 * @property {number} unitPrice - Precio unitario
 * @property {number} discountPercentage - Descuento aplicado a la línea (porcentaje)
 * @property {number} taxRate - Tipo impositivo aplicado (porcentaje)
 * @property {number} subtotal - Importe de la línea antes de impuestos
 * @property {number} taxAmount - Cuota de impuestos de la línea
 * @property {number} total - Importe total de la línea
 */
export interface DocumentLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Elemento del listado `GET client/me/quotes`: versión ligera de un
 * presupuesto, sin líneas ni totales.
 * @interface QuoteListItem
 * @property {string} id - Identificador del presupuesto
 * @property {string} quoteCode - Código de presupuesto (`PRE-000001`)
 * @property {QuoteStatus} status - Estado actual
 * @property {string} issueDate - Fecha de emisión (ISO `YYYY-MM-DD`)
 * @property {string} validUntil - Fecha límite de validez (ISO `YYYY-MM-DD`)
 * @property {string} currency - Divisa ISO 4217 (p. ej. `EUR`)
 * @property {number} documentDiscountPercentage - Descuento global del documento
 * @property {string} [notes] - Notas visibles para el cliente
 * @property {string} [pdfUrl] - URL del PDF ya generado; su ausencia indica que aún no hay PDF
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 * @property {string} updatedAt - Fecha de última modificación (ISO 8601)
 * @property {string} [serviceId] - Servicio del catálogo que se contrataría al aceptar
 * @property {BillingFrequency} [billingFrequency] - Periodicidad de facturación propuesta
 * @property {number} [contractMonths] - Duración propuesta del contrato, en meses
 * @property {string} [relatedClientServiceId] - Servicio ya contratado al que se asocia el presupuesto
 */
export interface QuoteListItem {
  id: string;
  quoteCode: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  currency: string;
  documentDiscountPercentage: number;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  serviceId?: string;
  billingFrequency?: BillingFrequency;
  contractMonths?: number;
  relatedClientServiceId?: string;
}

/**
 * Detalle de `GET client/me/quotes/:id`: el elemento de listado más líneas,
 * totales y las cláusulas contractuales de la oferta.
 * @interface QuoteDetail
 * @property {DocumentLine[]} lines - Líneas del presupuesto
 * @property {DocumentTotals} totals - Totales calculados
 * @property {string} [paymentTermsText] - Condiciones de pago
 * @property {string} [billingTermsText] - Condiciones de facturación
 * @property {string} [latePaymentTermsText] - Condiciones de demora
 * @property {string} [terminationTermsText] - Condiciones de resolución
 * @property {string} [jurisdictionTermsText] - Fuero y legislación aplicable
 */
export interface QuoteDetail extends QuoteListItem {
  lines: DocumentLine[];
  totals: DocumentTotals;
  paymentTermsText?: string;
  billingTermsText?: string;
  latePaymentTermsText?: string;
  terminationTermsText?: string;
  jurisdictionTermsText?: string;
}

/**
 * Firmante propuesto al aceptar un presupuesto.
 * @interface QuoteSigner
 * @property {string} [contactId] - Contacto del cliente que firmará
 * @property {string} [email] - Email al que enviar la solicitud de firma
 * @property {number} [order] - Orden de firma cuando hay varios firmantes
 */
export interface QuoteSigner {
  contactId?: string;
  email?: string;
  order?: number;
}

/**
 * Cuerpo de `POST client/me/quotes/:id/accept`. Todos sus campos son
 * opcionales: el portal envía el objeto vacío y deja que el backend aplique
 * su método de firma por defecto — el tipo los declara para poder ofrecer
 * selección de firmantes más adelante sin cambiar la firma de la acción.
 * @interface AcceptQuoteDto
 * @property {SignatureMethod} [signatureMethod] - Método de firma a emplear
 * @property {QuoteSigner[]} [signers] - Firmantes propuestos
 */
export interface AcceptQuoteDto {
  signatureMethod?: SignatureMethod;
  signers?: QuoteSigner[];
}

/**
 * Filtros de `GET client/me/quotes`.
 * @interface ClientQuotesQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {QuoteStatus} [status] - Filtro por estado
 */
export interface ClientQuotesQuery {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
}
