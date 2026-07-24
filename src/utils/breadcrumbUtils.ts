import type { StaticPathname } from "@/types/route";
import type { SegmentInfo } from "@/types/ui/navigations/bread-crumbs";

/**
 * Analiza los segmentos del pathname activo para construir las migas de pan,
 * distinguiendo los segmentos dinámicos (p. ej. `[id]`, resuelto con el valor
 * real de `useParams()`) de los estáticos, y acumulando la ruta canónica
 * hasta cada segmento para poder traducirlo y buscarlo en el catálogo de
 * rutas (`findRouteByPathname`).
 * @param {string} pathname - Pathname activo sin prefijo de locale (valor de `usePathname()` de `@/i18n/navigation`)
 * @param {Record<string, string | string[] | undefined>} params - Route params activos (valor de `useParams()`), usados para resolver el valor real de los segmentos dinámicos
 * @returns {SegmentInfo[]} La información de cada segmento de `pathname`, en orden, sin incluir la raíz (`/`)
 */
export function analyzeSegments(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
): SegmentInfo[] {
  const segments = pathname.split("/").filter(Boolean);

  let canonicalPath = "";

  return segments.map((segment) => {
    const dynamicSegmentMatch = /^\[(.+)\]$/.exec(segment);
    const isDynamic = dynamicSegmentMatch !== null;

    const paramName = dynamicSegmentMatch?.[1];
    const paramValue = paramName ? params[paramName] : undefined;
    const resolvedValue = Array.isArray(paramValue) ? paramValue.join("/") : paramValue;

    canonicalPath += `/${segment}`;

    return {
      value: isDynamic ? resolvedValue ?? segment : segment,
      isDynamic,
      canonicalKey: canonicalPath as StaticPathname,
    };
  });
}
