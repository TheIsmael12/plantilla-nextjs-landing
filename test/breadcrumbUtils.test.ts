import { describe, expect, it } from "vitest";

import { analyzeSegments } from "@/utils/breadcrumbUtils";

describe("analyzeSegments", () => {
  it("parte la ruta y va acumulando la clave canónica", () => {
    expect(analyzeSegments("/private-area/invoices", {})).toEqual([
      { value: "private-area", isDynamic: false, canonicalKey: "/private-area" },
      { value: "invoices", isDynamic: false, canonicalKey: "/private-area/invoices" },
    ]);
  });

  /*
   * Un segmento dinámico enseña **el valor** y guarda **el patrón**, y esa distinción es toda la función.
   *
   * `value` es lo que lee el vecino en la miga —el código de la factura— y `canonicalKey` sigue siendo `[id]`,
   * porque es la clave con la que se busca la traducción del nivel en `config/pathnames.ts`. Si la clave llevara el
   * valor real, cada factura sería una entrada distinta del catálogo y ninguna tendría nombre.
   */
  it("en un segmento dinámico, el valor se resuelve y la clave conserva el patrón", () => {
    const segments = analyzeSegments("/private-area/invoices/[id]", { id: "INV-000123" });

    expect(segments[2]).toEqual({
      value: "INV-000123",
      isDynamic: true,
      canonicalKey: "/private-area/invoices/[id]",
    });
  });

  /*
   * Sin valor para el parámetro se enseña el patrón en crudo en vez de un hueco.
   *
   * Pasa cuando la miga se pinta antes de que los parámetros estén resueltos: «[id]» es feo, pero un espacio en
   * blanco en medio de la miga parece que la página está rota.
   */
  it("si el parámetro no viene, se queda el patrón", () => {
    const segments = analyzeSegments("/private-area/invoices/[id]", {});

    expect(segments[2]?.value).toBe("[id]");
    expect(segments[2]?.isDynamic).toBe(true);
  });

  /** Un catch-all llega como array y se une con barras, que es como se lee en la barra de direcciones. */
  it("un parámetro con varios valores se une con barras", () => {
    const segments = analyzeSegments("/blog/[...slug]", { "...slug": ["2026", "marzo", "obras"] });

    expect(segments[1]?.value).toBe("2026/marzo/obras");
  });

  it.each(["/", ""])("una ruta vacía (%j) no tiene segmentos", (pathname) => {
    expect(analyzeSegments(pathname, {})).toEqual([]);
  });

  /** Las barras de más no crean segmentos vacíos: se descartan al partir. */
  it("las barras dobles no generan segmentos vacíos", () => {
    expect(analyzeSegments("//private-area//invoices//", {})).toHaveLength(2);
  });
});
