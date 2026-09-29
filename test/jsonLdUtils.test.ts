import { describe, expect, it } from "vitest";

import { safeJsonLd } from "@/utils/jsonLdUtils";

/** U+2028 y U+2029, construidos para no llevarlos literales (e invisibles) en el fuente. */
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe("safeJsonLd", () => {
  /*
   * El motivo de todo: un título con `</script>` cerraba el bloque JSON-LD y lo que venía detrás se
   * ejecutaba como HTML de la página.
   */
  it("no deja cerrar el `<script>` con un `</script>` dentro de un texto", () => {
    const output = safeJsonLd({ headline: "</script><script>alert(1)</script>" });

    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
    expect(output).not.toMatch(/<\/script/i);
  });

  it("escapa `<`, `>`, `&`, U+2028 y U+2029 como secuencias \\uXXXX", () => {
    expect(safeJsonLd({ a: `<>&${LS}${PS}` })).toBe(
      '{"a":"\\u003c\\u003e\\u0026\\u2028\\u2029"}',
    );
  });

  it("el resultado sigue siendo JSON que se lee igual que el original", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: "¿Qué incluye? <b>Limpieza & jardinería</b> <!-- -->" + LS + "fin",
      nested: [{ text: "a > b" }],
    };

    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });

  it("no toca un JSON sin caracteres conflictivos", () => {
    const data = { "@type": "Organization", name: "Imora", url: "https://imora.es/" };

    expect(safeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
