import type { MouseEventHandler, ReactNode } from "react";

/**
 * Variantes visuales soportadas por {@link IconButton}: sin color propio
 * ("neutral", para acciones secundarias tipo "editar") o uno de los colores
 * semánticos, con fondo tenue y color de icono a juego (p. ej. "error" para
 * "eliminar"/"cancelar").
 * @typedef {("neutral"|"primary"|"error"|"info"|"success"|"warning")} IconButtonVariant
 */
export type IconButtonVariant = "neutral" | "primary" | "error" | "info" | "success" | "warning";

/**
 * Tamaños soportados por {@link IconButton}.
 * @typedef {("sm"|"md")} IconButtonSize
 */
export type IconButtonSize = "sm" | "md";

/**
 * Props de {@link IconButton}.
 * @interface IconButtonProps
 * @property {ReactNode} children - El icono a renderizar (p. ej. un icono de `lucide-react`)
 * @property {string} ariaLabel - Clave de traducción (namespace `Buttons`) usada como `aria-label` y `title`; obligatoria, al no haber texto visible
 * @property {Record<string, string|number>} [ariaLabelValues] - Valores a interpolar en `ariaLabel` cuando su mensaje los pida (p. ej. `Quitar {name}`)
 * @property {IconButtonVariant} [variant] - Variante de color; por defecto "neutral"
 * @property {IconButtonSize} [size] - Tamaño del botón; por defecto "md"
 * @property {boolean} [disabled] - Deshabilita el botón e impide cualquier interacción
 * @property {("button"|"submit"|"reset")} [type] - Tipo HTML nativo del botón; por defecto "button"
 * @property {MouseEventHandler<HTMLButtonElement>} [onClick] - Handler de click
 * @property {string} [className] - Clases CSS adicionales
 */
export interface IconButtonProps {
  children: ReactNode;
  ariaLabel: string;
  ariaLabelValues?: Record<string, string | number>;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
