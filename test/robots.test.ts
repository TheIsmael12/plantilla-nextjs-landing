import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

/** Los bloques de reglas de `robots.txt`, siempre como lista. */
const rules = (() => {
  const value = robots().rules;
  return Array.isArray(value) ? value : [value];
})();

/**
 * Los patrones bloqueados para un agente concreto.
 * @param {string} userAgent - Nombre del agente
 * @returns {string[]} Sus `disallow`
 */
function disallowFor(userAgent: string): string[] {
  const disallow = rules.find((rule) => rule.userAgent === userAgent)?.disallow ?? [];
  return Array.isArray(disallow) ? disallow : [disallow];
}

describe("robots.txt", () => {
  /*
   * Los bots de IA solo tenían bloqueados `/api/` y las candidaturas: el área privada y el login quedaban
   * anunciados como rastreables para ellos.
   */
  it.each(["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "*", "Googlebot", "Bingbot"])(
    "%s tiene bloqueadas las rutas privadas",
    (userAgent) => {
      const disallow = disallowFor(userAgent);

      expect(disallow).toEqual(
        expect.arrayContaining([
          "/api/",
          "/area-privada/",
          "/*/private-area/",
          "/iniciar-sesion",
          "/darse-de-baja",
          "/empleo/candidatura/",
        ]),
      );
    },
  );

  /** El idioma por defecto va sin prefijo (`as-needed`): `/*` + ruta no casa con `/iniciar-sesion`. */
  it("cada ruta privada va con y sin comodín de locale", () => {
    const disallow = disallowFor("*");

    expect(disallow).toContain("/login");
    expect(disallow).toContain("/*/login");
  });
});
