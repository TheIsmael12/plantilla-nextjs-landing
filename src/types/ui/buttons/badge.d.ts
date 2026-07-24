import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Variantes visuales soportadas por {@link Badge}, mapeadas 1:1 a las clases
 * `badge--<variant>` y a los mismos tokens de color semánticos que {@link Alert}.
 * @typedef {("info"|"success"|"warning"|"error"|"danger"|"neutral")} BadgeVariant
 */
export type BadgeVariant = "info" | "success" | "warning" | "error" | "danger" | "neutral" | "pending";

/**
 * Props de {@link Badge}. Extiende los atributos nativos de `<p>` (`id`,
 * `aria-*`, `title`...) para que cualquier caso de uso pueda pasarlos sin que
 * el componente tenga que reexponerlos uno a uno.
 * @interface BadgeProps
 * @property {BadgeVariant} [variant] - Variante visual: determina el color de fondo/texto; por defecto "neutral"
 * @property {string} [text] - Texto mostrado en la insignia; se ignora si se pasa `children`
 * @property {LucideIcon} [icon] - Icono opcional mostrado antes del texto
 * @property {ReactNode} [children] - Contenido personalizado; si se omite se usa `text`, y si tampoco hay `text` se usa el propio `variant` como texto de respaldo
 */
export interface BadgeProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "children"> {
  variant?: BadgeVariant;
  text?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  status?: BadgeVariant;
  value?: string;
}
