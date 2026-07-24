import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/config/routing";

import { Route } from "@/types/route";

// Helpers

/**
 * Busca una ruta pública por su pathname exacto.
 * @param {string} path Pathname a buscar
 * @returns {Route | undefined} La ruta encontrada, o `undefined` si `path` no es una ruta pública
 */
export function getPublicRoute(path: string): Route | undefined {
  return PUBLIC_ROUTES.find((r) => r.pathname === path);
}

/**
 * Busca una ruta privada cuyo pathname coincida exactamente con `path` o sea
 * un prefijo de él (para clasificar sus sub-rutas).
 * @param {string} path Pathname a buscar
 * @returns {Route | undefined} La ruta encontrada, o `undefined` si `path` no pertenece a ninguna ruta privada
 */
export function getPrivateRoute(path: string): Route | undefined {
  return PRIVATE_ROUTES.find(
    (r) => path === r.pathname || path.startsWith(r.pathname + "/"),
  );
}

/**
 * Indica si `path` pertenece al catálogo de rutas públicas.
 * @param {string} path Pathname a comprobar
 * @returns {boolean} `true` si `path` es una ruta pública o una sub-ruta de una
 */
export function isPublicPath(path: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => path === r.pathname || path.startsWith(r.pathname + "/"),
  );
}

/**
 * Indica si `path` pertenece al catálogo de rutas privadas.
 * @param {string} path Pathname a comprobar
 * @returns {boolean} `true` si `path` es una ruta privada o una sub-ruta de una
 */
export function isPrivatePath(path: string): boolean {
  return PRIVATE_ROUTES.some(
    (r) => path === r.pathname || path.startsWith(r.pathname + "/"),
  );
}