import { describe, expect, it, vi } from "vitest";

/*
 * Se dobla `@/i18n/navigation`, y hace falta por una razón de empaquetado, no de diseño.
 *
 * Ese módulo crea la navegación de next-intl con `createNavigation`, que a su vez importa `next/navigation`. En
 * el árbol de pnpm, next-intl no puede resolver ese import desde su propia carpeta y la importación revienta
 * antes de que se ejecute una sola comprobación.
 *
 * El doble devuelve la ruta localizada leyendo **el mismo catálogo** que usa la aplicación, así que lo que se
 * comprueba de `localizedPath` sigue siendo lo nuestro —que delega en el catálogo y respeta el idioma— y no la
 * implementación de la librería, que no es cosa de esta prueba.
 */
vi.mock("@/i18n/navigation", async () => {
  const { pathnames } = await import("@/config/pathnames");

  return {
    getPathname: ({ href, locale }: { href: string; locale: string }) => {
      const localized = (pathnames as Record<string, string | Record<string, string>>)[href];
      if (!localized) return href;

      return typeof localized === "string" ? localized : (localized[locale] ?? href);
    },
  };
});

const {
  detectLocale,
  findRouteByPathname,
  isAuthPathname,
  isPrivateRoute,
  localizedPath,
  resolveCanonicalPathname,
} = await import("@/utils/routingUtils");

import type { NextRequest } from "next/server";

/**
 * Una petición con lo justo que `detectLocale` mira.
 *
 * Se construye a mano en vez de instanciar un `NextRequest` de verdad: el constructor real exige un entorno de
 * Next que aquí no hay, y la función solo lee tres cosas —la ruta, una cookie y una cabecera—.
 * @param {{pathname?: string, cookie?: string, acceptLanguage?: string}} options - Qué trae la petición
 * @returns {NextRequest} La petición simulada
 */
function request({
  pathname = "/",
  cookie,
  acceptLanguage,
}: { pathname?: string; cookie?: string; acceptLanguage?: string } = {}): NextRequest {
  return {
    nextUrl: { pathname },
    cookies: { get: (name: string) => (name === "NEXT_LOCALE" && cookie ? { value: cookie } : undefined) },
    headers: { get: (name: string) => (name === "accept-language" ? (acceptLanguage ?? null) : null) },
  } as unknown as NextRequest;
}

/*
 * `detectLocale` decide el idioma con **tres fuentes en orden**, y el orden es lo que se prueba: la URL manda
 * sobre la cookie, y la cookie sobre lo que pida el navegador. Invertirlo haría que compartir un enlace en
 * inglés le abriera la página en español a quien tuviera esa cookie, que es justo lo que no debe pasar.
 */
describe("detectLocale", () => {
  it("el idioma de la URL manda sobre todo", () => {
    expect(detectLocale(request({ pathname: "/en/services", cookie: "es", acceptLanguage: "es-ES" }))).toBe("en");
  });

  it("sin idioma en la URL, manda la cookie", () => {
    expect(detectLocale(request({ pathname: "/services", cookie: "en", acceptLanguage: "es-ES" }))).toBe("en");
  });

  it("sin URL ni cookie, se negocia con el navegador", () => {
    expect(detectLocale(request({ acceptLanguage: "en-GB,en;q=0.9,es;q=0.8" }))).toBe("en");
  });

  /** De `en-GB` se queda solo con `en`: la app no distingue variantes regionales. */
  it("descarta la región del Accept-Language", () => {
    expect(detectLocale(request({ acceptLanguage: "en-US" }))).toBe("en");
  });

  it("recorre el Accept-Language hasta encontrar uno que se hable", () => {
    expect(detectLocale(request({ acceptLanguage: "de-DE,fr;q=0.9,es;q=0.8" }))).toBe("es");
  });

  it.each([
    ["sin nada", request()],
    ["con un idioma que no se habla", request({ acceptLanguage: "de-DE,fr;q=0.9" })],
    ["con una cookie inválida", request({ cookie: "klingon" })],
    ["con un prefijo de URL que no es idioma", request({ pathname: "/servicios" })],
  ])("%s cae al idioma por defecto", (_name, req) => {
    expect(detectLocale(req)).toBe("es");
  });
});

describe("resolveCanonicalPathname", () => {
  it("traduce una ruta localizada a su clave del catálogo", () => {
    expect(resolveCanonicalPathname("/area-privada/servicios", "es")).toBe("/private-area/services");
  });

  it("en inglés la clave y la ruta coinciden", () => {
    expect(resolveCanonicalPathname("/private-area/services", "en")).toBe("/private-area/services");
  });

  /*
   * Resuelve también los segmentos dinámicos, que es la parte con sustancia.
   *
   * `/area-privada/facturas/INV-1` tiene que caer en `/private-area/invoices/[id]`, no quedarse sin resolver: de
   * esa clave salen el título de la página y la miga de pan.
   */
  it("resuelve las rutas con segmento dinámico", () => {
    expect(resolveCanonicalPathname("/area-privada/facturas/INV-1", "es")).toBe(
      "/private-area/invoices/[id]",
    );
  });

  it("la raíz se resuelve", () => {
    expect(resolveCanonicalPathname("/", "es")).toBe("/");
  });

  /** Una cadena vacía se trata como la raíz: es lo que llega al quitar el prefijo de idioma de `/es`. */
  it("la cadena vacía cuenta como raíz", () => {
    expect(resolveCanonicalPathname("", "es")).toBe("/");
  });

  it("una ruta que no está en el catálogo devuelve null", () => {
    expect(resolveCanonicalPathname("/esto-no-existe", "es")).toBeNull();
  });
});

describe("isAuthPathname / isPrivateRoute", () => {
  it("reconoce el área privada como privada", () => {
    expect(isPrivateRoute("/private-area")).toBe(true);
    expect(isPrivateRoute("/private-area/invoices")).toBe(true);
  });

  it("una pública no es privada", () => {
    expect(isPrivateRoute("/")).toBe(false);
    expect(isPrivateRoute("/services")).toBe(false);
  });

  it.each([null])("con %j responden que no en vez de reventar", (pathname) => {
    expect(isPrivateRoute(pathname)).toBe(false);
    expect(isAuthPathname(pathname)).toBe(false);
  });

  /*
   * Las de autenticación **no** son privadas, y esa distinción es la que evita un bucle de redirección.
   *
   * Si el login contara como privado, el guardián mandaría al login a quien ya está en el login, una y otra vez.
   */
  it("el login no cuenta como ruta privada", () => {
    const authRoutes = ["/login", "/auth/login", "/sign-in"] as const;
    const known = authRoutes.filter((route) => isAuthPathname(route as never));

    // Al menos una de las formas habituales tiene que estar registrada como ruta de autenticación.
    expect(known.length).toBeGreaterThan(0);

    for (const route of known) expect(isPrivateRoute(route as never)).toBe(false);
  });
});

describe("localizedPath", () => {
  it("devuelve la ruta con su prefijo de idioma", () => {
    expect(localizedPath("/private-area/services", "es")).toContain("servicios");
    expect(localizedPath("/private-area/services", "en")).toContain("services");
  });
});

describe("findRouteByPathname", () => {
  it("encuentra una ruta del catálogo, esté al nivel que esté", () => {
    expect(findRouteByPathname("/private-area")?.pathname).toBe("/private-area");
    expect(findRouteByPathname("/private-area/profile")?.pathname).toBe("/private-area/profile");
  });

  it("baja hasta los niveles anidados", () => {
    expect(findRouteByPathname("/private-area/profile/preferences/theme")?.pathname).toBe(
      "/private-area/profile/preferences/theme",
    );
  });

  it("con una ruta que no existe no devuelve nada", () => {
    expect(findRouteByPathname("/no-existe")).toBeUndefined();
  });
});
