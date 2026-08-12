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
 * @property {ReactNode} [children] - Contenido adicional (icono, texto) renderizado junto al texto de `title`, a un lado u otro según `iconPosition`
 * @property {("left"|"right")} [iconPosition] - En qué lado del texto de `title` se renderiza `children`; por defecto "left" (p. ej. "siguiente" queda más natural con la flecha a la derecha)
 * @property {MouseEventHandler<HTMLButtonElement>} [onClick] - Handler de click
 * @property {string} [ariaLabel] - Clave de traducción (namespace `Buttons`) usada como `aria-label`, para botones sin texto visible
 * @property {string} [className] - Clases CSS adicionales
 */
export interface ButtonProps {
  title?: string;
  /**
   * Valores a interpolar en `title`, para las etiquetas que llevan un número o un nombre.
   *
   * Sin esto, un botón que quiere decir «Marcar 3 como leídas» tenía dos salidas malas: escribir el texto ya
   * traducido —rompiendo la regla de que `title` es una clave— o dejar la etiqueta genérica y perder el dato.
   * Mismo mecanismo que `ariaLabelValues` en `IconButton`.
   */
  titleValues?: Record<string, string | number>;
  type?: "button" | "submit" | "reset";
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  children?: ReactNode;
  iconPosition?: "left" | "right";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
}
