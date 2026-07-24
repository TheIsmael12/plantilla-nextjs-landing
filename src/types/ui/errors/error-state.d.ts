import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Props de {@link ErrorState}.
 * @interface ErrorStateProps
 * @property {string} [title] - Título del error; si se omite se usa la traducción `Common.Errors.generic`
 * @property {string} message - Mensaje descriptivo del error
 * @property {LucideIcon} [icon] - Icono mostrado sobre el título; por defecto `AlertTriangleIcon`
 * @property {ReactNode} [action] - Contenido opcional bajo el mensaje (p. ej. un botón de reintentar)
 * @property {string} [className] - Clases CSS adicionales
 */
export interface ErrorStateProps {
  title?: string;
  message: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}
