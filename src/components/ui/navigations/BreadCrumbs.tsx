"use client";

import "@/styles/04-components/ui/navigations/bread-crumbs.scss";

import { useMemo } from "react";

import { useParams } from "next/navigation";

import { Link, resolveHref, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { useBreadcrumbContext } from "@/context/BreadcrumbProvider";
import { analyzeSegments } from "@/utils/breadcrumbUtils";
import { findRouteByPathname } from "@/utils/routingUtils";

import type { BreadcrumbItem } from "@/types/ui/navigations/bread-crumbs";

/**
 * Migas de pan que reconstruyen la ruta actual a partir de los segmentos de la
 * URL: traduce los segmentos estáticos, muestra el valor real (o la etiqueta
 * inyectada vía `useBreadcrumbContext`) en los dinámicos, y cae a "Error 404"
 * si la ruta no está registrada.
 * @returns {JSX.Element} Las migas de pan renderizadas
 */
export default function Breadcrumbs() {
  const t = useTranslations("Navigation.Breadcrumbs");

  const pathname = usePathname();
  const params = useParams<Record<string, string | string[] | undefined>>();
  const { label: dynamicLabelOverride } = useBreadcrumbContext();

  const items = useMemo(() => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: t("home"), href: "/", isNavigable: true },
    ];

    const segmentInfos = analyzeSegments(pathname, params);

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

    segmentInfos.forEach(({ value, isDynamic, canonicalKey }, index) => {
      const isLast = index === segmentInfos.length - 1;
      const isLastDynamicSegment = isDynamic && index === lastDynamicIndex;

      // Segmento dinámico → valor real sin traducir (o la etiqueta inyectada
      // por la página vía `useBreadcrumbLabel` para el último segmento
      // dinámico, p. ej. el nombre de un usuario en vez de su id); estático → clave i18n
      const label = isDynamic
        ? (isLastDynamicSegment && dynamicLabelOverride) || value
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
                  href={resolveHref(item.href, params)}
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
