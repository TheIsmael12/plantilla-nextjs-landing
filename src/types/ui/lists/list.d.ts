import type { ReactNode } from 'react';

import type { PaginationState } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';

import type { Filter, FilterValue, FilterValues } from '@/types/ui/tables/table';

/**
 * Props de {@link List}, el componente de listado genérico del sistema de
 * diseño: el equivalente a `Table` cuando cada registro se presenta como una
 * tarjeta/fila libre (`renderItem`) en vez de como una fila de celdas con
 * columnas. Comparte con `Table` las tres piezas transversales — búsqueda,
 * panel de filtros (`Filters`) y paginación (`TablePagination`) — y los
 * mismos dos modos de operación: delegado al servidor
 * (`manualPagination`/`manualFiltering`, la API ya devuelve la página
 * filtrada) o resuelto en memoria, reservado a los listados cuya API no
 * pagina.
 * @interface ListProps
 * @template TData - Tipo de cada elemento de `items`
 * @property {TData[]} items - Elementos a renderizar; en modo `manualPagination` es únicamente la página actual, nunca el listado completo
 * @property {(item: TData, index: number) => ReactNode} renderItem - Renderiza el contenido de un elemento; normalmente un {@link ListItem}
 * @property {(item: TData, index: number) => string} [getItemId] - Calcula el `key` estable de cada elemento; por defecto el índice
 * @property {boolean} [searchable] - Si `true`, muestra el campo de búsqueda en la barra de herramientas
 * @property {string} [searchPlaceholder] - Placeholder del campo de búsqueda; si se omite se usa el de traducción por defecto
 * @property {string} [globalFilter] - Valor de búsqueda controlado externamente; si se omite, la lista gestiona el suyo internamente
 * @property {(value: string) => void} [onSearchChange] - Notifica cada cambio del texto de búsqueda, controlado o no
 * @property {boolean} [manualFiltering] - Si `true`, el filtrado lo resuelve la API y `items` ya llega filtrado; si `false`, la lista filtra en memoria con `searchAccessor`
 * @property {(item: TData) => string} [searchAccessor] - Texto de un elemento sobre el que busca el modo en memoria; sin él, `searchable` sin `manualFiltering` no filtraría nada
 * @property {Filter[]} [filters] - Filtros disponibles en el desplegable "Filtros", con el mismo contrato que `Table`; si se omite o está vacío, el botón no se muestra
 * @property {FilterValues} [filterValues] - Valor actual de cada filtro, por `key`; siempre controlado por el llamador
 * @property {(key: string, value: FilterValue) => void} [onFilterChange] - Notifica el cambio de un filtro concreto
 * @property {() => void} [onClearAll] - Limpia todos los filtros a la vez; si se omite, el panel no muestra el botón "Limpiar filtros"
 * @property {ReactNode} [toolbarActions] - Contenido libre alineado a la derecha de la barra de herramientas (p. ej. el botón de "Nuevo…")
 * @property {boolean} [paginated] - Si `false`, no se pagina ni se renderiza el pie de paginación; por defecto `true`
 * @property {boolean} [manualPagination] - Si `true`, la paginación la resuelve la API (`items` ya viene paginado) y `rowCount` es obligatorio
 * @property {PaginationState} [pagination] - Estado de paginación controlado externamente; si se omite, la lista gestiona el suyo internamente
 * @property {number} [rowCount] - Total de elementos sin paginar, requerido cuando `manualPagination` es `true`
 * @property {(pagination: PaginationState) => void} [onPaginationChange] - Notifica cada cambio de paginación, controlada o no
 * @property {number} [initialPageSize] - Tamaño de página inicial cuando la paginación no está controlada; por defecto 10
 * @property {number[]} [pageSizeOptions] - Opciones ofrecidas en el selector de tamaño de página
 * @property {boolean} [isLoading] - Si `true`, sustituye los elementos por la silueta de carga ({@link ListSkeleton})
 * @property {string} [emptyMessage] - Mensaje mostrado cuando no hay elementos que mostrar; si se omite se usa el de traducción por defecto
 * @property {string} [ariaLabel] - Nombre accesible de la lista (`aria-label` del `<ul>`)
 * @property {string} [className] - Clases CSS adicionales para el contenedor raíz
 * @property {string} [listClassName] - Clases CSS adicionales para el `<ul>` interno; separado de `className` porque algunos listados (p. ej. una rejilla de tarjetas) necesitan aplicar `display: grid` al `<ul>`, no al contenedor que también envuelve la barra de herramientas y la paginación
 */
export interface ListProps<TData> {
  items: TData[];
  renderItem: (item: TData, index: number) => ReactNode;
  getItemId?: (item: TData, index: number) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilter?: string;
  onSearchChange?: (value: string) => void;
  manualFiltering?: boolean;
  searchAccessor?: (item: TData) => string;
  filters?: Filter[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: FilterValue) => void;
  onClearAll?: () => void;
  toolbarActions?: ReactNode;
  paginated?: boolean;
  manualPagination?: boolean;
  pagination?: PaginationState;
  rowCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
}

/**
 * Props de {@link ListToolbar}: compone búsqueda y filtros (`Filters`, el
 * mismo desplegable que usa `Table`) a la izquierda, y las acciones libres de
 * la vista a la derecha. No se renderiza nada si ninguna de las tres partes
 * aplica.
 * @interface ListToolbarProps
 * @property {boolean} searchable - Si se muestra el campo de búsqueda
 * @property {string} [searchPlaceholder] - Placeholder del campo de búsqueda; si se omite se usa el de traducción por defecto
 * @property {string} globalFilter - Valor actual del campo de búsqueda
 * @property {(value: string) => void} onSearchChange - Handler de cambio del texto de búsqueda
 * @property {Filter[]} [filters] - Filtros disponibles en el desplegable "Filtros"
 * @property {FilterValues} [filterValues] - Valor actual de cada filtro, por `key`
 * @property {(key: string, value: FilterValue) => void} [onFilterChange] - Notifica el cambio de un filtro concreto
 * @property {() => void} [onClearAll] - Limpia todos los filtros a la vez
 * @property {ReactNode} [actions] - Contenido libre alineado a la derecha (p. ej. el botón de "Nuevo…")
 */
export interface ListToolbarProps {
  searchable: boolean;
  searchPlaceholder?: string;
  globalFilter: string;
  onSearchChange: (value: string) => void;
  filters?: Filter[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: FilterValue) => void;
  onClearAll?: () => void;
  actions?: ReactNode;
}

/**
 * Props de {@link ListItem}, la fila estándar de {@link List}: icono
 * opcional, título (con insignia de estado opcional), subtítulo, contenido
 * libre y acciones a la derecha.
 * @interface ListItemProps
 * @property {ReactNode} title - Título del elemento, normalmente su nombre
 * @property {ReactNode} [subtitle] - Segunda línea con los datos secundarios (código, ciudad...)
 * @property {ReactNode} [badge] - Insignia de estado renderizada junto al título
 * @property {LucideIcon} [icon] - Icono decorativo a la izquierda del contenido
 * @property {ReactNode} [children] - Contenido libre bajo el subtítulo (métricas, chips...)
 * @property {ReactNode} [actions] - Acciones del elemento, alineadas a la derecha
 * @property {() => void} [onClick] - Si se pasa, el cuerpo del elemento se comporta como un botón (fila navegable)
 * @property {string} [className] - Clases CSS adicionales para la raíz del elemento
 */
export interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  icon?: LucideIcon;
  children?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Props de {@link ListSkeleton}, el placeholder de carga con la misma forma
 * visual que {@link List} (barra de herramientas y filas).
 * @interface ListSkeletonProps
 * @property {number} [items] - Número de filas de placeholder; por defecto 5
 * @property {boolean} [showToolbar] - Si se muestra el placeholder de la barra de búsqueda/filtros; por defecto `true`
 */
export interface ListSkeletonProps {
  items?: number;
  showToolbar?: boolean;
}
