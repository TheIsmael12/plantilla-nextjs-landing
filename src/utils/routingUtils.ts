import type { NextRequest } from "next/server";
import { getPathname, type AnyHref } from "@/i18n/navigation";

import type { Route, StaticPathname } from "@/types/route";

import { pathnames } from "@/config/pathnames";
import { AREA_PRIVADA_ROUTES, AUTH_ROUTES, PRIVATE_ROUTES } from "@/config/routing";
import { isSupportedLocale, type AppLocale, DEFAULT_LOCALE } from "@/config/locales";

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

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
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

  const match = Object.entries(pathnames).find(([, localized]) => {
    if (typeof localized === "string") {
      return localized === normalized;
    }

    const localizedValue = localized[locale as keyof typeof localized];
    return localizedValue === normalized;
  });

  return match ? (match[0] as StaticPathname) : null;
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
