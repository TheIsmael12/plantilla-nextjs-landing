import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Props de {@link EmptyState}.
 * @interface EmptyStateProps
 * @property {string} [title] - Título breve del estado vacío
 * @property {string} [description] - Explicación adicional de por qué no hay contenido que mostrar
 * @property {LucideIcon} [icon] - Icono mostrado sobre el título; por defecto `InboxIcon`
 * @property {ReactNode} [action] - Contenido opcional bajo la descripción (p. ej. un botón de creación)
 * @property {string} [className] - Clases CSS adicionales
 */
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}
