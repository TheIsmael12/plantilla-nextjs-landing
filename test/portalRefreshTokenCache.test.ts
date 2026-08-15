import { describe, expect, it } from "vitest";

import { getPortalRefreshTokenCache } from "@/lib/portalRefreshTokenCache";

/*
 * Esta caché existe para un problema concreto de Next: **cada módulo puede cargarse varias veces**.
 *
 * En desarrollo el recargado en caliente reevalúa los módulos, y en producción distintos *bundles* (el del
 * servidor, el de una ruta, el de una server action) pueden traer su propia copia. Una caché guardada en una
 * variable de módulo tendría entonces una instancia por copia, y el propósito —que dos peticiones simultáneas
 * compartan la misma renovación de token en vuelo— se perdería justo cuando importa.
 *
 * Por eso cuelga de `globalThis` con un `Symbol.for`, que devuelve el **mismo** símbolo para la misma cadena en
 * todo el proceso. Lo que se prueba aquí es exactamente eso: que siempre se obtiene la misma instancia.
 */
describe("getPortalRefreshTokenCache", () => {
  it("devuelve siempre la misma instancia", () => {
    expect(getPortalRefreshTokenCache()).toBe(getPortalRefreshTokenCache());
  });

  it("trae los dos mapas listos para usar", () => {
    const cache = getPortalRefreshTokenCache();

    expect(cache.pending).toBeInstanceOf(Map);
    expect(cache.rotated).toBeInstanceOf(Map);
  });

  it("lo que se guarda sobrevive a la siguiente llamada", () => {
    getPortalRefreshTokenCache().rotated.set("sesion-1", {
      accessToken: "nuevo",
      refreshToken: "refresco",
    } as never);

    expect(getPortalRefreshTokenCache().rotated.get("sesion-1")).toEqual({
      accessToken: "nuevo",
      refreshToken: "refresco",
    });

    // Se limpia para no dejar estado colgando entre ficheros de prueba: la caché es global de verdad.
    getPortalRefreshTokenCache().rotated.delete("sesion-1");
  });

  /** Vive en `globalThis` bajo un símbolo compartido, que es lo que la hace única entre copias del módulo. */
  it("cuelga de globalThis bajo un símbolo compartido", () => {
    const key = Symbol.for("plantilla-nextjs-landing.client-portal.refresh-token-cache");

    expect((globalThis as Record<symbol, unknown>)[key]).toBe(getPortalRefreshTokenCache());
  });
});
