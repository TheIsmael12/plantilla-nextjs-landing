import type { CSSProperties, PropsWithChildren } from "react";

import type { LucideIcon } from "lucide-react";

/**
 * Una pestaña de {@link TabsComponent}.
 * @interface Tab
 * @property {string} label - Texto de la pestaña; clave de traducción del namespace `Tabs`, salvo que `noTranslation` esté activo
 * @property {string} key - Identificador único de la pestaña, usado como `key` de React y como valor en modo controlado (`activeKey`/`onTabChange`)
 * @property {string} [href] - Ruta asociada, en modo no controlado: la pestaña se renderiza como `Link` y se marca activa según `pathname`
 * @property {LucideIcon} [icon] - Icono mostrado antes de la etiqueta
 * @property {boolean} [disabled] - Deshabilita la pestaña sin ocultarla
 */
export interface Tab {
  label: string;
  key: string;
  href?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

/**
 * Props de {@link TabsComponent}.
 * @interface TabsProps
 * @property {Tab[]} tabs - Pestañas a renderizar
 * @property {string} [className] - Clases CSS adicionales para la raíz
 * @property {CSSProperties} [style] - Estilos inline adicionales para la raíz
 * @property {boolean} [disableScroll] - Si `true`, el contenido no hace scroll interno (`overflow: visible`)
 * @property {string} [activeKey] - Pestaña activa en modo controlado; junto con `onTabChange` sustituye la navegación por `href`
 * @property {(key: string) => void} [onTabChange] - Handler de cambio de pestaña en modo controlado
 * @property {boolean} [noTranslation] - Si `true`, `label` se muestra literal en vez de resolverse como clave de traducción del namespace `Tabs`
 */
export interface TabsProps extends PropsWithChildren {
  tabs: Tab[];
  className?: string;
  style?: CSSProperties;
  disableScroll?: boolean;
  activeKey?: string;
  onTabChange?: (key: string) => void;
  noTranslation?: boolean;
}
