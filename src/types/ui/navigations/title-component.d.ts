import type { ReactNode } from "react";

/**
 * Props de {@link TitleComponent}.
 * @interface TitleComponentProps
 * @property {ReactNode} [extra] - Contenido adicional mostrado junto al título resuelto (p. ej. el nombre de la entidad en una vista de detalle)
 * @property {string} [description] - Breve explicación de qué es o para qué sirve la página, mostrada bajo el título (p. ej. en páginas de un único propósito como crear/editar un rol)
 * @property {string} [returnPath] - Ruta a la que enlaza el link de "volver" bajo el título; si se omite, no se muestra el link
 */
export interface TitleComponentProps {
  extra?: ReactNode;
  description?: string;
  returnPath?: string;
}
