import { describe, expect, it } from "vitest";

import { formatJobSalary } from "@/utils/careersFormatUtils";

/**
 * Un salario tal como llega de la API: importes en cadena decimal.
 * @param {Partial<PublicJobSalary>} overrides - Lo que cambia respecto a la base
 * @returns {PublicJobSalary} El salario
 */
function salary(overrides: Partial<PublicJobSalary> = {}): PublicJobSalary {
  return { min: "18000.00", max: "21000.00", currency: "EUR", period: "YEAR", ...overrides };
}

/** Quita los espacios raros (fino, duro) que mete `Intl` antes del símbolo de la divisa. */
function normalize(value: string): string {
  return value.replace(/ | /g, " ");
}

describe("formatJobSalary", () => {
  /**
   * El motivo de que exista la función: la API manda `"18000.00"` y la tarjeta enseñaba eso literalmente,
   * con el punto decimal y los dos ceros.
   */
  it("formatea los importes con separador de miles y sin decimales", () => {
    const formatted = formatJobSalary(salary(), "es");

    expect(formatted).not.toBeNull();
    expect(formatted?.min).toBe("18.000");
    expect(normalize(formatted!.max!)).toBe("21.000 €");
  });

  /** La divisa va en un solo importe: es como se lee un rango de salario. */
  it("pone la divisa solo en el máximo cuando hay rango", () => {
    const formatted = formatJobSalary(salary(), "es");

    expect(formatted?.min).not.toContain("€");
    expect(formatted?.max).toContain("€");
  });

  it("con solo mínimo, la divisa va en ese importe y no hay máximo", () => {
    const formatted = formatJobSalary(salary({ max: null }), "es");

    expect(normalize(formatted!.min)).toBe("18.000 €");
    expect(formatted?.max).toBeNull();
  });

  /** El backend lo permite, y dejar la línea vacía sería peor que enseñar el único importe que hay. */
  it("con solo máximo, lo enseña como si fuera el único importe", () => {
    const formatted = formatJobSalary(salary({ min: null }), "es");

    expect(normalize(formatted!.min)).toBe("21.000 €");
    expect(formatted?.max).toBeNull();
  });

  /** Sin salario no hay nada que formatear: el componente enseña «no publicado». */
  it("devuelve null cuando la oferta no publica salario", () => {
    expect(formatJobSalary(null, "es")).toBeNull();
    expect(formatJobSalary(undefined, "es")).toBeNull();
    expect(formatJobSalary(salary({ min: null, max: null }), "es")).toBeNull();
  });

  /** Un importe que no es un número no puede acabar en la página como `NaN`. */
  it("ignora un importe que no es numérico", () => {
    expect(formatJobSalary(salary({ min: "no-es-un-numero", max: null }), "es")).toBeNull();
  });

  /** El locale decide el separador y dónde va el símbolo, así que se pasa y no se asume. */
  it("respeta el idioma para el separador y la posición del símbolo", () => {
    const spanish = formatJobSalary(salary({ max: null }), "es");
    const english = formatJobSalary(salary({ max: null }), "en");

    expect(normalize(spanish!.min)).toBe("18.000 €");
    expect(normalize(english!.min)).toBe("€18,000");
  });
});
