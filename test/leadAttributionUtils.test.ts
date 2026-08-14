import { afterEach, describe, expect, it, vi } from "vitest";

import { readAttribution } from "@/utils/leadAttributionUtils";

/**
 * Coloca la ventana en una URL y con un referente concretos.
 *
 * `window.location` no se puede reasignar en jsdom, así que se usa `history.replaceState` —que sí mueve la URL de
 * verdad— y `document.referrer` se redefine, porque es de solo lectura.
 * @param {string} search - La cadena de consulta, con su `?`
 * @param {string} referrer - De dónde viene la visita
 * @returns {void}
 */
function visitWith(search: string, referrer = ""): void {
  window.history.replaceState({}, "", `/contacto${search}`);
  Object.defineProperty(document, "referrer", { value: referrer, configurable: true });
}

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
  Object.defineProperty(document, "referrer", { value: "", configurable: true });
});

describe("readAttribution", () => {
  it("recoge las UTM de la URL", () => {
    visitWith("?utm_source=google&utm_medium=cpc&utm_campaign=marca");

    expect(readAttribution()).toMatchObject({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "marca",
    });
  });

  it("recoge también los identificadores de clic de Google y Meta", () => {
    visitWith("?gclid=abc123&fbclid=def456");

    expect(readAttribution()).toMatchObject({ gclid: "abc123", fbclid: "def456" });
  });

  it("guarda la URL de aterrizaje y el referente", () => {
    visitWith("?utm_source=boletin", "https://www.google.com/");

    const attribution = readAttribution();

    expect(attribution.landingUrl).toContain("/contacto");
    expect(attribution.referrer).toBe("https://www.google.com/");
  });

  /*
   * Lo que no viene **no se manda como `undefined`**: la clave desaparece.
   *
   * Es lo que hace el filtro final, y no es cosmético: el DTO del backend valida campo por campo, y una visita
   * directa —sin ninguna UTM— enviaría nueve claves vacías que solo sirven para ensuciar la ficha del lead.
   */
  it("no incluye las claves de lo que no venía", () => {
    visitWith("?utm_source=google");

    const attribution = readAttribution();

    expect(attribution).toHaveProperty("utmSource");
    expect(attribution).not.toHaveProperty("utmMedium");
    expect(attribution).not.toHaveProperty("gclid");
    expect(attribution).not.toHaveProperty("referrer");
  });

  /** Una visita directa sin nada deja solo la URL, que siempre existe. */
  it("una visita directa deja solo la URL de aterrizaje", () => {
    visitWith("");

    expect(Object.keys(readAttribution())).toEqual(["landingUrl"]);
  });

  /** Un parámetro presente pero vacío tampoco cuenta: `?utm_source=` no es una fuente. */
  it("un parámetro vacío se descarta", () => {
    visitWith("?utm_source=");

    expect(readAttribution()).not.toHaveProperty("utmSource");
  });
});
