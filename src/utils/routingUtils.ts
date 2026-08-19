import type { NextRequest } from "next/server";
import { getPathname, type AnyHref } from "@/i18n/navigation";

import type { Route, StaticPathname } from "@/types/route";

import { pathnames } from "@/config/pathnames";
import { AREA_PRIVADA_ROUTES, AUTH_ROUTES, PRIVATE_ROUTES } from "@/config/routing";
import { isSupportedLocale, type AppLocale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/config/locales";

/**
 * Aplana un catálogo de rutas (incluidas sus `subRoutes` anidadas) a la lista
 * plana de pathnames canónicos que contiene.
 * @param {Route[]} routes - Catálogo de rutas (`AUTH_ROUTES`/`PRIVATE_ROUTES`)
 * @returns {StaticPathname[]} Los pathnames canónicos de `routes`, sin anidar
 */
function flattenPathnames(routes: Route[]): StaticPathname[] {
  return routes.flatMap((route) => [
    route.pathname,
    ...(route.subRoutes ? flattenPathnames(route.subRoutes) : []),
  ]);
}

const AUTH_PATHNAMES = flattenPathnames(AUTH_ROUTES);
const PRIVATE_PATHNAMES = flattenPathnames(PRIVATE_ROUTES).concat(flattenPathnames(AREA_PRIVADA_ROUTES));

/**
 * Rutas públicas que, aunque no requieren sesión, no aportan contenido único
 * que valga la pena indexar: el hub de ayuda es solo un menú hacia sus
 * sub-páginas, y los canales de contacto/reclamaciones duplican información
 * que ya vive en la página de contacto o no tiene intención de posicionar en
 * buscadores. `/help/faq` queda fuera a propósito: sí tiene contenido propio
 * (zonas, precios, servicios) con valor de búsqueda de cola larga.
 */
const NOINDEX_PATHNAMES: StaticPathname[] = [
  "/help",
  "/help/support",
  "/help/complaints",
  "/complaints-channel",
];

/**
 * Detecta el locale con el que debe servirse una petición cuando su URL
 * todavía no lo indica: primero el prefijo de la propia URL, luego la cookie
 * `NEXT_LOCALE` (preferencia ya elegida por el usuario) y, si no hay ninguna,
 * el idioma del navegador (`Accept-Language`) — para que la primera visita
 * de un usuario nuevo se sirva en su idioma sin que tenga que cambiarlo a mano.
 * @param {NextRequest} request - Petición entrante
 * @returns {AppLocale} El locale detectado, o {@link DEFAULT_LOCALE} si no se pudo determinar ninguno soportado
 */
export function detectLocale(request: NextRequest): AppLocale {
  const [, maybeLocale] = request.nextUrl.pathname.split("/");
  if (isSupportedLocale(maybeLocale)) return maybeLocale;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  const negotiated = acceptLanguage
    ?.split(",")
    .map((part) => part.split(";")[0]?.trim().split("-")[0]?.toLowerCase())
    .find((lang) => isSupportedLocale(lang));

  return negotiated && isSupportedLocale(negotiated) ? negotiated : DEFAULT_LOCALE;
}

/**
 * Traduce el pathname localizado de una petición ya normalizada por next-intl
 * (p. ej. `/iniciar-sesion` en español) de vuelta a su clave canónica de
 * `config/pathnames.ts` (`/login`), para poder clasificarlo con
 * {@link isAuthPathname}/{@link isPrivateRoute} independientemente del idioma.
 * @param {string} localizedPathname - Pathname sin el prefijo de locale (p. ej. `/iniciar-sesion`)
 * @param {AppLocale} locale - Locale con el que se sirvió `localizedPathname`
 * @returns {StaticPathname | null} La ruta canónica correspondiente, o `null` si no está declarada en `config/pathnames.ts` (rutas todavía no construidas, 404...)
 */
export function resolveCanonicalPathname(
  localizedPathname: string,
  locale: AppLocale,
): StaticPathname | null {
  const normalized = localizedPathname === "" ? "/" : localizedPathname;

  /** El patrón localizado de una entrada del catálogo, en el idioma pedido. */
  const patternFor = (localized: (typeof pathnames)[keyof typeof pathnames]): string =>
    typeof localized === "string"
      ? localized
      : localized[locale as keyof typeof localized];

  const entries = Object.entries(pathnames);

  /*
   * Primero, coincidencia exacta.
   *
   * El orden importa: `/incidencias/nueva` casa exactamente con su entrada y además encajaría en la
   * plantilla `/incidencias/[id]`. Si se probaran las plantillas antes, el alta de incidencia se
   * clasificaría como el detalle de una incidencia llamada «nueva».
   */
  const exact = entries.find(([, localized]) => patternFor(localized) === normalized);
  if (exact) return exact[0] as StaticPathname;

  /*
   * Después, las plantillas con segmentos dinámicos.
   *
   * Sin esto, **ninguna** URL con un identificador real resolvía su ruta canónica: la comparación era de
   * cadenas y `/area-privada/facturas/eca00b3b-…` nunca es igual a `/area-privada/facturas/[id]`. Las
   * consecuencias no eran teóricas: el detalle de una factura se quedaba con el título genérico de la
   * portada y, peor, `generateTranslatedMetadata` lo marcaba `index, follow` —porque decidía el `noindex`
   * por una ruta canónica que había resuelto a `null`—, es decir, invitaba a indexar la factura de un
   * cliente.
   *
   * El valor del segmento se limita a `[^/]+`: un `[id]` es un segmento, no un camino, y con `.+` la
   * plantilla `/facturas/[id]` habría absorbido cualquier cosa colgada debajo.
   */
  const dynamic = entries.find(([, localized]) => {
    const pattern = patternFor(localized);
    if (!pattern.includes("[")) return false;

    const source = pattern
      // Se escapa lo que en una expresión regular significa otra cosa, antes de meter los comodines.
      .replace(/[.*+?^${}()|\\]/g, "\\$&")
      .replace(/\[[^\]]+\]/g, "[^/]+");

    return new RegExp(`^${source}$`).test(normalized);
  });

  return dynamic ? (dynamic[0] as StaticPathname) : null;
}

/**
 * Indica si una ruta canónica pertenece al grupo `(auth)` (accesible sin sesión).
 * @param {StaticPathname | null} pathname - Ruta canónica, o `null` si no se pudo resolver
 * @returns {boolean} `true` si `pathname` está en {@link AUTH_ROUTES}
 */
export function isAuthPathname(pathname: StaticPathname | null): boolean {
  return !!pathname && AUTH_PATHNAMES.includes(pathname);
}

/**
 * Indica si una ruta canónica pertenece al grupo `(intranet)` (requiere sesión).
 * @param {StaticPathname | null} pathname - Ruta canónica, o `null` si no se pudo resolver
 * @returns {boolean} `true` si `pathname` está en {@link PRIVATE_ROUTES}
 */
export function isPrivateRoute(pathname: StaticPathname | null): boolean {
  return !!pathname && PRIVATE_PATHNAMES.includes(pathname);
}

/**
 * Indica si una ruta canónica es pública pero no debe indexarse (ver {@link NOINDEX_PATHNAMES}).
 * @param {StaticPathname | null} pathname - Ruta canónica, o `null` si no se pudo resolver
 * @returns {boolean} `true` si `pathname` está en {@link NOINDEX_PATHNAMES}
 */
export function isNoIndexPathname(pathname: StaticPathname | null): boolean {
  return !!pathname && NOINDEX_PATHNAMES.includes(pathname);
}

/**
 * Construye la ruta localizada y con prefijo de locale de una ruta canónica,
 * para usarla al redirigir desde `proxy.ts` (que no tiene acceso al contexto
 * de React de `Link`/`useRouter`).
 * @param {StaticPathname} pathname - Ruta canónica (clave de `config/pathnames.ts`)
 * @param {AppLocale} locale - Locale al que traducir la ruta
 * @returns {string} La ruta localizada y prefijada, lista para asignar a `NextURL.pathname`
 */
export function localizedPath(pathname: StaticPathname, locale: AppLocale): string {
  return getPathname({ href: pathname as AnyHref, locale });
}

/**
 * Traduce el segmento `pathname` dentro de una URL completa (`rawPathname`)
 * al idioma indicado por `locale`, dejando el resto de la URL intacto —
 * pensado para reescribir enlaces de cambio de idioma sin perder sub-rutas.
 * @param {StaticPathname} pathname - Ruta canónica cuyo segmento hay que traducir
 * @param {string} rawPathname - URL completa (con posibles sub-rutas) que contiene `pathname`
 * @param {AppLocale} locale - Locale al que traducir `pathname`
 * @returns {string} `rawPathname` con el segmento `pathname` traducido al `locale` indicado
 */
export function localizePathnameAcrossLocales(
  pathname: StaticPathname,
  rawPathname: string,
  locale: AppLocale,
): string {
  const localizedRoutePath = localizedPath(pathname, locale);
  return rawPathname === pathname ? localizedRoutePath : rawPathname.replace(pathname, localizedRoutePath);
}

/**
 * Busca una entrada del catálogo de rutas (`PRIVATE_ROUTES`/`AUTH_ROUTES`,
 * incluidas sus `subRoutes` anidadas a cualquier profundidad) por su pathname
 * canónico, para que `TitleComponent`/`BreadCrumbs` puedan resolver el icono
 * y clasificar la ruta activa sin recorrer los catálogos por su cuenta.
 * @param {string} pathname - Pathname a buscar (p. ej. el valor de `usePathname()` o un `canonicalKey` calculado por `breadcrumbUtils.ts`)
 * @returns {Route | undefined} La entrada encontrada, o `undefined` si `pathname` no está registrado en ningún catálogo
 */
export function findRouteByPathname(pathname: string): Route | undefined {
  function search(routes: Route[]): Route | undefined {
    for (const route of routes) {
      if (route.pathname === pathname) return route;

      if (route.subRoutes) {
        const found = search(route.subRoutes);
        if (found) return found;
      }
    }

    return undefined;
  }

  return search(PRIVATE_ROUTES) ?? search(AREA_PRIVADA_ROUTES) ?? search(AUTH_ROUTES);
}
