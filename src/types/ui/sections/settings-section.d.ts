import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Props de {@link SettingsSection}.
 * @interface SettingsSectionProps
 * @property {string} [title] - Título de la sección; se omite en páginas de un único propósito ya tituladas por `TitleComponent`
 * @property {string} [description] - Breve explicación de qué controla la sección; siempre visible junto al título para que quede claro qué hace antes de tocar nada
 * @property {LucideIcon} [icon] - Icono que identifica la sección a simple vista cuando hay varias en la misma página (p. ej. tema, idioma, notificaciones)
 * @property {ReactNode} [actions] - Contenido opcional alineado con la cabecera (p. ej. un botón)
 * @property {ReactNode} [children] - Contenido propio de la sección
 */
export interface SettingsSectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children?: ReactNode;
}
