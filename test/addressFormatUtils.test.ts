import { describe, expect, it } from "vitest";

import { formatServiceAddress } from "@/utils/addressFormatUtils";

import type { ClientServiceAddress } from "@/types/client-portal/services";

/**
 * Una dirección completa a la que quitarle campos en cada caso.
 * @param {Partial<ClientServiceAddress>} overrides - Lo que cambia respecto a la base
 * @returns {ClientServiceAddress} La dirección
 */
function address(overrides: Partial<ClientServiceAddress> = {}): ClientServiceAddress {
  return {
    line1: "Calle Serrano 145",
    city: "Madrid",
    postalCode: "28006",
    country: "ES",
    ...overrides,
  };
}

describe("formatServiceAddress", () => {
  it("junta la calle con el código postal y la localidad", () => {
    expect(formatServiceAddress(address())).toBe("Calle Serrano 145, 28006 Madrid");
  });

  /*
   * Sin dirección devuelve `undefined` y no una cadena vacía.
   *
   * La diferencia importa en quien lo pinta: con `undefined` la fila no se dibuja, y con `""` se dibuja vacía —una
   * etiqueta «Dirección» seguida de nada, que parece un dato que no ha cargado—.
   */
  it("sin dirección no devuelve nada", () => {
    expect(formatServiceAddress(undefined)).toBeUndefined();
  });

  it("se apaña con el código postal o la localidad a medias", () => {
    expect(formatServiceAddress(address({ postalCode: "" }))).toBe("Calle Serrano 145, Madrid");
    expect(formatServiceAddress(address({ city: "" }))).toBe("Calle Serrano 145, 28006");
  });

  /*
   * Con la calle vacía no queda una coma suelta al principio.
   *
   * Es lo que hace el `filter(Boolean)`: sin él saldría «, 28006 Madrid», que se lee como un dato roto.
   */
  it("no deja comas sueltas si falta la calle", () => {
    expect(formatServiceAddress(address({ line1: "" }))).toBe("28006 Madrid");
  });

  it("con todo vacío devuelve una cadena vacía, no una coma", () => {
    expect(formatServiceAddress(address({ line1: "", city: "", postalCode: "" }))).toBe("");
  });

  /** Los campos opcionales que no entran en el formato no lo alteran. */
  it("ignora la línea 2, la provincia y el país", () => {
    const full = address({ line2: "Portal B", province: "Madrid", label: "Sede" });

    expect(formatServiceAddress(full)).toBe("Calle Serrano 145, 28006 Madrid");
  });
});
