import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

/**
 * Convierte un patrón de `robots.txt` en una expresión regular con las mismas reglas que usan los
 * rastreadores: `*` casa con cualquier cosa (**incluidas las barras**) y el patrón ancla al principio de la
 * ruta, no al final.
 * @param {string} pattern - Patrón tal cual se escribe en `robots.txt`
 * @returns {RegExp} La expresión equivalente
 */
function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}`);
}

/**
 * Devuelve las reglas que aplican a un agente concreto, con el mismo criterio que un rastreador: si hay un
 * bloque con su nombre, ese manda; si no, el de `*`.
 * @param {string} userAgent - Nombre del agente
 * @returns {{ disallow: string[] }} Los patrones de bloqueo que le aplican
 */
function rulesFor(userAgent: string): { disallow: string[] } {
  const rules = robots().rules;
  const list = Array.isArray(rules) ? rules : [rules];

  const match = list.find((rule) => rule.userAgent === userAgent) ??
    list.find((rule) => rule.userAgent === "*");

  const disallow = match?.disallow ?? [];
  return { disallow: Array.isArray(disallow) ? disallow : [disallow] };
}

/**
 * ¿Está bloqueada esa ruta para ese agente?
 * @param {string} pathname - Ruta a comprobar, tal como la vería el rastreador
 * @param {string} userAgent - Nombre del agente
 * @returns {boolean} `true` si algún patrón de bloqueo casa
 */
function isBlocked(pathname: string, userAgent = "*"): boolean {
  return rulesFor(userAgent).disallow.some((pattern) => patternToRegExp(pattern).test(pathname));
}

/**
 * La lección de `requisitos-seo.md` §26: allí los patrones estaban escritos pero **no casaban con ninguna
 * ruta real**, así que `robots.txt` no bloqueaba nada. Esta prueba existe para que eso no pueda volver a
 * pasar sin que se note.
 */
describe("robots.txt y el seguimiento de candidaturas", () => {
  /**
   * El caso que más fácil se escapa: `localePrefix: "as-needed"` sirve el idioma por defecto **sin**
   * prefijo, así que la URL real no tiene nada entre el dominio y `/empleo`.
   */
  it("bloquea el enlace de seguimiento en español, que va sin prefijo de idioma", () => {
    expect(isBlocked("/empleo/candidatura/8f3a9c1e4b7d")).toBe(true);
  });

  it("bloquea el enlace de seguimiento en inglés, que sí lleva prefijo", () => {
    expect(isBlocked("/en/careers/applications/8f3a9c1e4b7d")).toBe(true);
  });

  /** Los bots de IA tienen permitido el contenido público, y esta página no lo es. */
  it("lo bloquea también para los rastreadores de IA y para Googlebot", () => {
    for (const userAgent of ["GPTBot", "anthropic-ai", "PerplexityBot", "Googlebot", "Bingbot"]) {
      expect(isBlocked("/empleo/candidatura/8f3a9c1e4b7d", userAgent)).toBe(true);
      expect(isBlocked("/en/careers/applications/8f3a9c1e4b7d", userAgent)).toBe(true);
    }
  });

  /**
   * Y lo que **no** debe bloquear: el buscador, la ficha de una oferta y las páginas de ciudad son
   * exactamente lo que se quiere indexar. Un patrón demasiado ancho aquí sacaría el módulo entero de Google.
   */
  it("no bloquea el buscador, las ofertas ni las páginas de ciudad", () => {
    expect(isBlocked("/empleo")).toBe(false);
    expect(isBlocked("/empleo/conserje-en-getafe")).toBe(false);
    expect(isBlocked("/empleo/ciudades/getafe")).toBe(false);
    expect(isBlocked("/en/careers")).toBe(false);
    expect(isBlocked("/en/careers/concierge-in-getafe")).toBe(false);
    expect(isBlocked("/en/careers/cities/getafe")).toBe(false);
  });

  /** Las URLs con filtros ya estaban cubiertas por los patrones de query, y siguen estándolo. */
  it("sigue bloqueando las URLs con filtros del buscador", () => {
    expect(isBlocked("/empleo?page=2")).toBe(true);
    expect(isBlocked("/empleo?search=conserje")).toBe(true);
  });
});
