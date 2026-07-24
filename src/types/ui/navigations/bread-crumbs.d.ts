import type { StaticPathname } from "@/types/route";

/**
 * Ítem ya resuelto de las migas de pan (`components/ui/navigations/BreadCrumbs.tsx`),
 * listo para renderizar en la lista de la navegación.
 * @interface BreadcrumbItem
 * @property {string} label - Texto visible del ítem: traducido (segmentos estáticos) o el valor real del route param (segmentos dinámicos)
 * @property {StaticPathname} [href] - Ruta canónica a la que enlaza el ítem (con los segmentos dinámicos todavía como `[id]`, resueltos al vuelo en `BreadCrumbs.tsx` vía `resolveHref`); `undefined` en el último ítem, que no es navegable
 * @property {boolean} isNavigable - Si el ítem debe renderizarse como enlace en vez de texto plano (`false` para el último ítem o para rutas sin `page.tsx` propio)
 */
export interface BreadcrumbItem {
  label: string;
  href?: StaticPathname;
  isNavigable: boolean;
}

/**
 * Información de un segmento del pathname activo, calculada por
 * `analyzeSegments` (`utils/breadcrumbUtils.ts`) a partir del pathname y los
 * route params actuales, para que `BreadCrumbs.tsx` pueda traducir cada
 * segmento estático y mostrar el valor real de cada segmento dinámico.
 * @interface SegmentInfo
 * @property {string} value - Valor visible del segmento: el propio segmento estático, o el valor real del route param si es dinámico
 * @property {boolean} isDynamic - Si el segmento corresponde a un route param dinámico (p. ej. `[id]`) en vez de a un segmento estático del catálogo de rutas
 * @property {StaticPathname} canonicalKey - Ruta canónica acumulada hasta este segmento, con los segmentos dinámicos todavía como `[id]` (clave de `config/pathnames.ts`), usada para traducir su label, para buscarlo en el catálogo de rutas vía `findRouteByPathname` y como `href` de navegación (resuelto al vuelo vía `resolveHref`)
 */
export interface SegmentInfo {
  value: string;
  isDynamic: boolean;
  canonicalKey: StaticPathname;
}
