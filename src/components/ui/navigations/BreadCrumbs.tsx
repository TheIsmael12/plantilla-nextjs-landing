"use client";

import "@/styles/04-components/ui/navigations/bread-crumbs.scss";

import { useMemo } from "react";

import { useParams } from "next/navigation";

import { Link, resolveTemplateHref, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { useBreadcrumbContext } from "@/context/BreadcrumbProvider";
import { analyzeSegments } from "@/utils/breadcrumbUtils";
import { findRouteByPathname } from "@/utils/routingUtils";

import type { BreadcrumbItem } from "@/types/ui/navigations/bread-crumbs";

/** Un segmento dinámico con esta forma es un identificador, no algo que enseñar. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Raíz del área privada: es la miga de «Inicio», así que su segmento no se repite como miga aparte. */
const PRIVATE_AREA_ROOT = "/private-area";

/**
 * Migas de pan que reconstruyen la ruta actual a partir de los segmentos de la
 * URL: traduce los segmentos estáticos, muestra el valor real (o la etiqueta
 * inyectada vía `useBreadcrumbContext`) en los dinámicos, y cae a "Error 404"
 * si la ruta no está registrada.
 *
 * Solo se montan en el área privada (`(client-area)/private-area/layout.tsx`): en las páginas públicas la
 * navegación es la del sitio, no un camino de vuelta por una jerarquía.
 * @returns {JSX.Element | null} Las migas de pan, o `null` en la portada del área privada
 */
export default function Breadcrumbs() {
  const t = useTranslations("Navigation.Breadcrumbs");

  const pathname = usePathname();
  const params = useParams<Record<string, string | string[] | undefined>>();
  const { label: dynamicLabelOverride } = useBreadcrumbContext();

  const items = useMemo(() => {
    /*
     * La primera miga es la portada del área privada, no la del sitio público.
     *
     * Desde una factura, «Inicio» tiene que llevar al panel del cliente: volver a la web comercial en
     * mitad de una gestión no es subir un nivel, es salirse. Y como esa portada es ya el primer segmento
     * de la ruta, se descuenta de la lista para no verla dos veces seguidas.
     */
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: t("home"), href: PRIVATE_AREA_ROOT, isNavigable: true },
    ];

    const segmentInfos = analyzeSegments(pathname, params).slice(
      pathname.startsWith(PRIVATE_AREA_ROOT) ? 1 : 0,
    );

    if (segmentInfos.length === 0) return breadcrumbItems;

    // Un segmento dinámico final (p. ej. "[id]") no tiene entrada propia en
    // el catálogo de rutas hasta que exista su página (p. ej. "/users/[id]",
    // cuya edición hoy es solo un modal sobre "/users"); comprobamos su
    // segmento estático más cercano en su lugar para no confundir "sin
    // página propia todavía" con "ruta desconocida" (404).
    // El `return` anterior garantiza `segmentInfos.length > 0`.
    const lastSegment = segmentInfos[segmentInfos.length - 1]!;
    const routeExistenceKey = lastSegment.isDynamic
      ? (segmentInfos[segmentInfos.length - 2]?.canonicalKey ?? "/")
      : pathname;

    // Ruta no encontrada en el registro de rutas → 404
    if (!findRouteByPathname(routeExistenceKey)) {
      return [
        ...breadcrumbItems,
        { label: "Error 404", href: "/", isNavigable: true },
      ];
    }

    // Último segmento dinámico del pathname (no necesariamente el último
    // segmento a secas: en `/users/[id]/sessions`, "[id]" es dinámico pero le
    // sigue el segmento estático "sessions"). La etiqueta inyectada vía
    // `useBreadcrumbLabel` (p. ej. el nombre de un usuario) sustituye siempre
    // a ESTE segmento, esté o no al final de la ruta, para que el nombre se
    // vea igual en todas las pestañas de `/users/[id]/*`.
    const lastDynamicIndex = segmentInfos.reduce(
      (acc, segment, index) => (segment.isDynamic ? index : acc),
      -1,
    );

    /**
     * Etiqueta de un segmento dinámico cuando la página no ha inyectado ninguna: el valor tal cual si es
     * legible (un código, un slug), o el nombre del recurso en singular si es un UUID.
     * @param {string} value - Valor real del segmento
     * @param {number} index - Posición del segmento, para poder mirar el estático anterior
     * @returns {string} La etiqueta a mostrar
     */
    function resolveDynamicFallback(value: string, index: number): string {
      if (!UUID_PATTERN.test(value)) return value;

      // El segmento estático anterior es el listado del recurso ("/invoices" → "Facturas"), así que su
      // clave en singular es la que describe a un elemento.
      const parentKey = segmentInfos[index - 1]?.canonicalKey.split("/").pop() ?? "";

      return t(`Singular.${parentKey.replace(/[^a-zA-Z0-9_-]/g, "")}`, {
        default: t("record", { default: "Registro" }),
      });
    }

    segmentInfos.forEach(({ value, isDynamic, canonicalKey }, index) => {
      const isLast = index === segmentInfos.length - 1;
      const isLastDynamicSegment = isDynamic && index === lastDynamicIndex;

      /*
       * Segmento dinámico → la etiqueta inyectada por la página vía `useBreadcrumbLabel` (p. ej. el
       * código de la factura), y si no hay, el valor real del segmento... salvo que sea un UUID: 36
       * caracteres de identificador no dicen nada a quien lee la ruta y ocupan la línea entera. En ese
       * caso se usa el nombre del recurso en singular («Factura», «Incidencia»), impreciso pero legible.
       *
       * Aquí importa más que en la intranet: todos los detalles del portal se direccionan por UUID.
       */
      const label = isDynamic
        ? (isLastDynamicSegment && dynamicLabelOverride) || resolveDynamicFallback(value, index)
        : t(
            canonicalKey
              .split("/")
              .pop()!
              .replace(/[^a-zA-Z0-9_-]/g, ""),
            {
              default: value.charAt(0).toUpperCase() + value.slice(1),
            },
          );

      // Rutas sin página propia (p. ej. "Preferencias") no son un destino
      // navegable: solo agrupan sub-rutas, no representan una URL real.
      const hasPage = findRouteByPathname(canonicalKey)?.hasPage !== false;

      breadcrumbItems.push({
        label,
        href: isLast ? undefined : canonicalKey,
        isNavigable: !isLast && hasPage,
      });
    });

    return breadcrumbItems;
  }, [pathname, params, t, dynamicLabelOverride]);

  /*
   * En la portada del área privada no hay migas: una sola miga que dice «Inicio» dentro de la propia
   * página de inicio no orienta a nadie, solo ocupa la primera línea de la pantalla que más contenido
   * tiene. En cualquier otra ruta la primera miga es el camino de vuelta aquí. Igual que en la intranet.
   */
  if (pathname === PRIVATE_AREA_ROOT) return null;

  return (
    <nav className="breadcrumb">
      <ol>
        {items.map((item, index) => {
          // El último ítem representa la página actual: se marca con
          // `aria-current="page"` (patrón WAI-ARIA de migas de pan, ya usado
          // en `Tabs.tsx` para la pestaña activa) para que un lector de
          // pantalla lo identifique aunque visualmente ya no sea un enlace.
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={index}
              className="breadcrumb__item"
              aria-current={isCurrent ? "page" : undefined}
            >
              {item.isNavigable && item.href ? (
                <Link
                  href={resolveTemplateHref(item.href, params)}
                  className="breadcrumb__item__link"
                >
                  {item.label}
                </Link>
              ) : (
                <p>{item.label.charAt(0).toUpperCase() + item.label.slice(1)}</p>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
