import { routing } from "@/i18n/routing";

import { createNavigation } from "next-intl/navigation";

const navigation = createNavigation(routing);

export const { Link, redirect, usePathname, useRouter, getPathname } = navigation;

/**
 * Escape hatch deliberado para el `href` de {@link Link}/{@link getPathname}.
 * `next-intl` genera, a partir de `routing.ts`, una unión estricta y muy
 * anidada de todos los pathnames tipados; las rutas que se resuelven en
 * tiempo de ejecución (metadata, breadcrumbs...) son un `string` plano que
 * nunca la satisface estructuralmente aunque sea un pathname válido. Se
 * documenta el `any` en vez de ocultarlo: cualquier alternativa tipada
 * (p. ej. `Parameters<typeof Link>[0]["href"]`) reintroduce esos falsos
 * positivos en cada punto de uso.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyHref = any;

/**
 * Resuelve un `href` (ruta simple o con `pathname`) a la cadena final,
 * añadiendo la query string si se proporciona.
 * @param {string | {pathname: string}} href Ruta destino, como cadena o con `pathname`
 * @param {Record<string, string | string[] | number | undefined>} [query] Parámetros a añadir como query string
 * @returns {Parameters<typeof Link>[0]["href"]} El `href` resuelto, listo para {@link Link}
 */
export function resolveHref(
  href: string | { pathname: string },
  query?: Record<string, string | string[] | number | undefined>,
) {
  if (typeof href === "string") {
    return href as Parameters<typeof Link>[0]["href"];
  }

  const pathname = href.pathname;

  if (!query || Object.keys(query).length === 0) {
    return pathname as Parameters<typeof Link>[0]["href"];
  }

  const search = new URLSearchParams(
    Object.entries(query).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Array.isArray(value) ? value.join(",") : String(value);
      }
      return acc;
    }, {}),
  ).toString();

  return `${pathname}${search ? `?${search}` : ""}` as Parameters<typeof Link>[0]["href"];
}
