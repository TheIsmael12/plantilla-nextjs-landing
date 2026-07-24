import type { ReactNode } from "react";

/**
 * Props de {@link TabPanel}.
 * @interface TabPanelProps
 * @property {string} [title] - Título opcional del panel; a diferencia de `SettingsSection`, no lleva icono ni descripción porque el contexto ya lo aporta la pestaña activa (`TabsComponent`)
 * @property {ReactNode} [actions] - Contenido opcional alineado a la derecha de `title` (p. ej. un botón)
 * @property {ReactNode} [children] - Contenido propio del panel
 * @property {string} [className] - Clases CSS adicionales
 */
export interface TabPanelProps {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}
