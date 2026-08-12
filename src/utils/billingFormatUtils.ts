import type { InvoicePaymentMethod } from "@/types/client-portal/invoices";
import type { BadgeVariant } from "@/types/ui/buttons/badge";

/** Variante de `Badge` por medio de pago de un cobro. */
export const INVOICE_PAYMENT_METHOD_VARIANTS: Record<InvoicePaymentMethod, BadgeVariant> = {
  BANK_TRANSFER: "info",
  SEPA_DIRECT_DEBIT: "success",
  CASH: "neutral",
  CARD: "warning",
  OTHER: "neutral",
};

/**
 * Formatea una fecha ISO del backend (`YYYY-MM-DD` o ISO 8601 completo) al
 * formato corto del locale activo. Funciones sueltas y no un hook porque las
 * vistas del portal que las usan son Server Components, donde
 * `useFormatDate` (que es `"use client"`) no puede ejecutarse.
 * @param {string | undefined} value - Fecha en ISO, o `undefined` si el backend no la envía
 * @param {string} locale - Locale activo
 * @param {string} fallback - Texto a devolver cuando no hay fecha
 * @returns {string} La fecha formateada, o `fallback` si no hay valor
 */
export function formatBillingDate(
  value: string | undefined,
  locale: string,
  fallback: string,
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/**
 * Formatea un importe con su divisa. La divisa llega del backend como ISO
 * 4217 arbitrario (no un union cerrado), así que se pasa tal cual a `Intl`.
 * @param {number | undefined} value - Importe a formatear
 * @param {string} currency - Código ISO 4217 de la divisa (p. ej. `EUR`)
 * @param {string} locale - Locale activo
 * @param {string} fallback - Texto a devolver cuando no hay importe
 * @returns {string} El importe formateado, o `fallback` si no hay valor
 */
export function formatBillingAmount(
  value: number | undefined,
  currency: string,
  locale: string,
  fallback: string,
): string {
  if (value === undefined || value === null) return fallback;

  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}
