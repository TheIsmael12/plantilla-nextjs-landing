import type { MouseEventHandler, ReactNode } from "react";

/**
 * Variantes visuales soportadas por {@link Button}, mapeadas 1:1 a los tokens
 * de color semánticos de `styles/00-settings/_colors.scss`. Además de las
 * variantes "fill" (fondo sólido) hay una variante "outline" por color
 * semántico (borde y texto del color, fondo transparente) para los casos en
 * los que un fondo sólido pesa demasiado (p. ej. una acción secundaria de
 * peligro junto a la principal).
 * @typedef {("primary"|"secondary"|"outline"|"fill-color"|"danger"|"error"|"info"|"success"|"warning"|"outline-primary"|"outline-secondary"|"outline-danger"|"outline-error"|"outline-info"|"outline-success"|"outline-warning")} ButtonVariant
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "fill-color"
  | "danger"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "outline-primary"
  | "outline-secondary"
  | "outline-danger"
  | "outline-error"
  | "outline-info"
  | "outline-success"
  | "outline-warning";

/**
 * Tamaños soportados por {@link Button}.
 * @typedef {("sm"|"md"|"full")} ButtonSize
 */
export type ButtonSize = "sm" | "md" | "full";

/**
 * Props de {@link Button}.
 * @interface ButtonProps
 * @property {string} [title] - Clave de traducción (namespace `Buttons`) usada como atributo `title` (tooltip) y como texto visible junto a `children`
 * @property {("button"|"submit"|"reset")} [type] - Tipo HTML nativo del botón; por defecto "button"
 * @property {ButtonSize} [size] - Tamaño del botón; por defecto "md"
 * @property {ButtonVariant} [variant] - Variante visual; sin valor se usa el estilo base sin color semántico (p. ej. el botón de cerrar de un modal)
 * @property {boolean} [disabled] - Deshabilita el botón e impide cualquier interacción
 * @property {ReactNode} [children] - Contenido adicional (icono, texto) renderizado antes del texto de `title`
 * @property {MouseEventHandler<HTMLButtonElement>} [onClick] - Handler de click
 * @property {string} [ariaLabel] - Clave de traducción (namespace `Buttons`) usada como `aria-label`, para botones sin texto visible
 * @property {string} [className] - Clases CSS adicionales
 */
export interface ButtonProps {
  title?: string;
  type?: "button" | "submit" | "reset";
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
}
