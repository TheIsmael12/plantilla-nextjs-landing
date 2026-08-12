"use client";

import { useBreadcrumbLabel } from "@/context/BreadcrumbProvider";

/**
 * Puente entre una página de detalle (Server Component) y {@link useBreadcrumbLabel}: no renderiza
 * nada, solo inyecta `label` como la etiqueta a mostrar en el segmento dinámico activo de
 * {@link import("./BreadCrumbs").default} mientras la página está montada.
 * @param {{ label?: string }} props - Etiqueta a mostrar (p. ej. el código de la factura ya cargada)
 * @returns {null} No renderiza ningún elemento
 */
export default function BreadcrumbLabel({ label }: { label?: string }) {
  useBreadcrumbLabel(label);
  return null;
}
