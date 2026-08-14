import { describe, expect, it } from "vitest";

import { matchesSearch, normalizeForSearch } from "@/utils/searchTextUtils";

describe("normalizeForSearch", () => {
  it("quita las tildes y baja a minúsculas", () => {
    expect(normalizeForSearch("Peña")).toBe("pena");
    expect(normalizeForSearch("ÁÉÍÓÚ")).toBe("aeiou");
    expect(normalizeForSearch("Müller")).toBe("muller");
  });

  it("recorta los espacios de los extremos", () => {
    expect(normalizeForSearch("  Serrano  ")).toBe("serrano");
  });

  /*
   * La ñ se convierte en n, y es una decisión escrita en el módulo, no un descuido.
   *
   * Quien busca a un vecino teclea deprisa y no pone la tilde; confundir «año» con «ano» no es un problema en una
   * lista de nombres y viviendas. Se comprueba para que nadie lo «arreglé» sin leer el porqué.
   */
  it("la ñ se compara como n, a propósito", () => {
    expect(normalizeForSearch("año")).toBe("ano");
  });

  it("con una cadena vacía devuelve una cadena vacía", () => {
    expect(normalizeForSearch("")).toBe("");
    expect(normalizeForSearch("   ")).toBe("");
  });
});

describe("matchesSearch", () => {
  it("encuentra sin que importen acentos ni mayúsculas", () => {
    expect(matchesSearch("Diego Peña Marín", "pena")).toBe(true);
    expect(matchesSearch("Diego Peña Marín", "PEÑA")).toBe(true);
    expect(matchesSearch("Diego Peña Marín", "  marin ")).toBe(true);
  });

  it("busca en cualquier parte del texto, no solo al principio", () => {
    expect(matchesSearch("Calle Serrano 145", "serrano")).toBe(true);
  });

  it("dice que no cuando de verdad no está", () => {
    expect(matchesSearch("Diego Peña Marín", "López")).toBe(false);
  });

  /*
   * Una búsqueda vacía enseña **todo**, no nada.
   *
   * Es el caso que decide cómo se comporta la lista al borrar el filtro: devolviendo `false` la pantalla se
   * quedaría en blanco al vaciar el cuadro de búsqueda, que es justo lo contrario de lo que se espera.
   */
  it.each(["", "   "])("una búsqueda vacía (%j) no filtra nada", (term) => {
    expect(matchesSearch("lo que sea", term)).toBe(true);
  });
});
