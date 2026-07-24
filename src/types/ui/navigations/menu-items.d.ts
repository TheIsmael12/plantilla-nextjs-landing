import type { StaticPathname } from "@/types/route";

/**
 * Props de {@link MenuItems}.
 * @interface MenuItemsProps
 * @property {StaticPathname} [path] - Ruta cuyas `subRoutes` se listan (más un enlace a la propia ruta, si existe en el catálogo); si se omite, se monta el árbol completo del sidebar a partir de las rutas de primer nivel de `PRIVATE_ROUTES`
 * @property {() => void} [onNavigate] - Handler invocado al pulsar cualquier enlace del menú, usado por el contenedor (drawer del `Sidebar`, desplegable de `User`) para cerrarse tras la navegación
 */
export interface MenuItemsProps {
  path?: StaticPathname;
  onNavigate?: () => void;
}
