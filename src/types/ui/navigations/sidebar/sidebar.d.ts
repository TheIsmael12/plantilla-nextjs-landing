/**
 * Props de {@link Sidebar}.
 * @interface SidebarProps
 * @property {boolean} isOpen - Si el drawer del sidebar está visible; relevante solo en mobile, en desktop (≥ 1024px) el panel se muestra siempre
 * @property {() => void} [onClose] - Handler invocado al cerrar el sidebar (click fuera, o navegación a otra ruta)
 */
export interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}
