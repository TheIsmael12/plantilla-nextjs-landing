import { describe, expect, it } from "vitest";

import {
  INVOICE_PAYMENT_METHOD_VARIANTS,
  formatBillingAmount,
  formatBillingDate,
} from "@/utils/billingFormatUtils";

describe("formatBillingDate", () => {
  it("formatea la fecha en el locale que se le pase", () => {
    const formatted = formatBillingDate("2026-03-14T09:30:00.000Z", "es-ES", "—");

    // Sin comparar la cadena exacta: depende de la zona y de la versión de ICU del entorno.
    expect(formatted).not.toBe("—");
    expect(formatted).toMatch(/2026/);
  });

  it.each([undefined, ""])("con %j devuelve el texto de reserva", (value) => {
    expect(formatBillingDate(value, "es-ES", "Sin fecha")).toBe("Sin fecha");
  });

  it("una fecha inválida devuelve el texto de reserva, no «Invalid Date»", () => {
    expect(formatBillingDate("14/03/2026", "es-ES", "—")).toBe("—");
  });
});

describe("formatBillingAmount", () => {
  it("formatea con la moneda indicada", () => {
    const formatted = formatBillingAmount(1234.5, "EUR", "es-ES", "—");

    expect(formatted).toContain("234");
    expect(formatted).toMatch(/€|EUR/);
  });

  /*
   * El **cero se formatea**, no se trata como ausencia.
   *
   * Es el caso que distingue un `if (!value)` mal escrito de la comprobación correcta: una factura de 0 € existe
   * —una rectificativa que salda a cero— y enseñar un guion en su lugar haría pensar que el dato no ha cargado.
   */
  it("el cero es un importe, no un hueco", () => {
    expect(formatBillingAmount(0, "EUR", "es-ES", "—")).not.toBe("—");
  });

  it("formatea también los negativos, que son los abonos", () => {
    expect(formatBillingAmount(-50, "EUR", "es-ES", "—")).toMatch(/-|−/);
  });

  it.each([undefined, null])("con %j devuelve el texto de reserva", (value) => {
    expect(formatBillingAmount(value as undefined, "EUR", "es-ES", "Sin importe")).toBe(
      "Sin importe",
    );
  });
});

describe("INVOICE_PAYMENT_METHOD_VARIANTS", () => {
  it("tiene una variante para cada forma de pago", () => {
    expect(Object.keys(INVOICE_PAYMENT_METHOD_VARIANTS).sort()).toEqual([
      "BANK_TRANSFER",
      "CARD",
      "CASH",
      "OTHER",
      "SEPA_DIRECT_DEBIT",
    ]);
  });

  /** El recibo domiciliado es el caso bueno del portal: es el único que va en verde. */
  it("la domiciliación se distingue del resto", () => {
    expect(INVOICE_PAYMENT_METHOD_VARIANTS.SEPA_DIRECT_DEBIT).toBe("success");
    expect(INVOICE_PAYMENT_METHOD_VARIANTS.BANK_TRANSFER).not.toBe("success");
  });
});
