import { describe, expect, it } from "vitest";

import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/config/routing";
import {
  getPrivateRoute,
  getPublicRoute,
  isPrivatePath,
  isPublicPath,
} from "@/utils/routeHelpers";

/*
 * Estas cuatro funciones deciden **qué es zona privada**, así que se prueban contra el catálogo de verdad y no
 * contra rutas inventadas: si mañana alguien mueve `/private-area` en `config/routing.ts`, lo que tiene que fallar
 * es esta prueba, no el guardián en producción.
 *
 * La diferencia entre las dos parejas es la que importa y la que no salta a la vista leyendo el módulo:
 * `getPublicRoute` compara la ruta **exacta** y `getPrivateRoute` acepta también los descendientes. Es coherente
 * con para qué sirve cada una —una busca la ficha de una ruta concreta, la otra pregunta si algo cae bajo un área
 * protegida—, pero es justo lo que alguien asume simétrico.
 */
describe("getPublicRoute", () => {
  it("encuentra una ruta pública por su ruta exacta", () => {
    expect(getPublicRoute("/")?.pathname).toBe("/");
    expect(getPublicRoute("/services")?.pathname).toBe("/services");
  });

  it("no encuentra nada con una ruta que no existe", () => {
    expect(getPublicRoute("/no-existe")).toBeUndefined();
  });

  /** Compara exacto: un hijo no devuelve la ficha del padre. */
  it("no devuelve el padre al pedir un descendiente", () => {
    expect(getPublicRoute("/services/algo-que-no-esta")).toBeUndefined();
  });
});

describe("getPrivateRoute", () => {
  it("encuentra el área privada por su ruta exacta", () => {
    expect(getPrivateRoute("/private-area")?.pathname).toBe("/private-area");
  });

  /** Y **sí** por prefijo: es lo que permite proteger todo lo que cuelga sin enumerarlo. */
  it("encuentra el área privada desde cualquier descendiente", () => {
    expect(getPrivateRoute("/private-area/invoices/INV-1")?.pathname).toBe("/private-area");
  });

  it("no confunde una ruta que solo empieza igual", () => {
    expect(getPrivateRoute("/private-areas-falsa")).toBeUndefined();
  });

  it("no encuentra nada con una ruta pública", () => {
    expect(getPrivateRoute("/")).toBeUndefined();
  });
});

describe("isPublicPath / isPrivatePath", () => {
  it("todas las rutas del catálogo público se reconocen como públicas", () => {
    for (const route of PUBLIC_ROUTES) {
      expect(isPublicPath(route.pathname), route.pathname).toBe(true);
    }
  });

  it("todas las rutas del catálogo privado se reconocen como privadas", () => {
    for (const route of PRIVATE_ROUTES) {
      expect(isPrivatePath(route.pathname), route.pathname).toBe(true);
    }
  });

  it("reconocen también los descendientes", () => {
    expect(isPrivatePath("/private-area/profile/notifications")).toBe(true);
    expect(isPublicPath("/services/lo-que-sea")).toBe(true);
  });

  /*
   * El caso que separa un `startsWith` bien escrito de uno mal escrito.
   *
   * Sin la barra en `r.pathname + "/"`, `/private-areas-falsa` empieza por `/private-area` y se daría por
   * protegida —o peor, en el sentido contrario: una ruta pública inventada pasaría por pública—.
   */
  it("un prefijo parecido no cuenta como descendiente", () => {
    expect(isPrivatePath("/private-areas-falsa")).toBe(false);
  });

  it("una ruta desconocida no es ni pública ni privada", () => {
    expect(isPrivatePath("/xyz")).toBe(false);
  });

  /*
   * La raíz está en el catálogo público y **no** se traga todo lo demás, que es lo que uno teme al leer un
   * `startsWith` sobre una lista que incluye `/`.
   *
   * El motivo es el propio `r.pathname + "/"`: para la raíz eso da `"//"`, y ninguna ruta real empieza por dos
   * barras. Así que `/` solo casa consigo misma por la comparación exacta. Sale gratis y por accidente, pero
   * funciona, y por eso se fija aquí: quien «simplifique» esa concatenación a un `startsWith(r.pathname)` a secas
   * convertiría `isPublicPath` en una función que dice que sí a cualquier cosa —incluido `/private-area`—.
   */
  it("la raíz del catálogo no convierte en pública cualquier ruta", () => {
    expect(isPublicPath("/private-area")).toBe(false);
    expect(isPublicPath("/una-ruta-cualquiera")).toBe(false);
    expect(isPublicPath("/")).toBe(true);
  });
});
