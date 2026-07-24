import type { ReactNode } from "react";

/**
 * Variantes visuales soportadas por {@link Card}.
 * @typedef {("surface"|"outline")} CardVariant
 */
export type CardVariant = "surface" | "outline";

/**
 * Props de {@link Card}.
 * @interface CardProps
 * @property {string} [title] - Título opcional de la tarjeta
 * @property {ReactNode} [actions] - Contenido opcional alineado a la derecha de `title` (p. ej. un botón)
 * @property {CardVariant} [variant] - Variante visual: "surface" (fondo sólido, pensada para secciones de página) u "outline" (borde, fondo transparente, pensada para agrupar contenido dentro de otra tarjeta); por defecto "surface"
 * @property {ReactNode} [children] - Contenido propio de la tarjeta
 * @property {string} [className] - Clases CSS adicionales
 */
export interface CardProps {
  title?: string;
  actions?: ReactNode;
  variant?: CardVariant;
  children?: ReactNode;
  className?: string;
}
