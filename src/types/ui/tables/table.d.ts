import type { InputHTMLAttributes } from "react";

import type {
  ColumnDef,
  PaginationState,
  Row,
  SortingState,
  Table as ReactTableInstance,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

import type { DateInputValue } from "@/types/ui/inputs/date-picker";
import type { DateRangeValue } from "@/types/ui/inputs/date-range-picker";

/**
 * Opción disponible en un filtro `"select"`/`"multi-select"` de {@link Filter}.
 * @interface FilterOption
 * @property {string} value - Valor interno de la opción, enviado tal cual a `onFilterChange`
 * @property {string} label - Texto visible de la opción, ya resuelto (no es una clave de traducción)
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Campos comunes a cualquier {@link Filter}, sea cual sea su `type`.
 * @interface FilterBase
 * @property {string} key - Identificador único del filtro, usado como clave de `filterValues`/`onFilterChange`
 * @property {string} label - Etiqueta visible del filtro, ya resuelta (no es una clave de traducción)
 * @property {string} [placeholder] - Texto mostrado en el campo mientras no hay ninguna selección, ya resuelto (no es una clave de traducción)
 */
interface FilterBase {
  key: string;
  label: string;
  placeholder?: string;
}

/**
 * Filtro de valor único, renderizado como un `Select` de una sola opción. El
 * filtro "sin selección" (mostrar todo) se modela como una opción más con
 * `value: ""`, no como un estado aparte.
 * @interface SelectFilter
 * @augments FilterBase
 * @property {"select"} type
 * @property {FilterOption[]} options - Opciones disponibles, incluida la opción "todos" si aplica
 */
export interface SelectFilter extends FilterBase {
  type: "select";
  options: FilterOption[];
}

/**
 * Filtro de selección múltiple, renderizado como un `Select` con `multiple`
 * (checkboxes dentro del desplegable).
 * @interface MultiSelectFilter
 * @augments FilterBase
 * @property {"multi-select"} type
 * @property {FilterOption[]} options - Opciones disponibles
 */
export interface MultiSelectFilter extends FilterBase {
  type: "multi-select";
  options: FilterOption[];
}

/**
 * Filtro de fecha única, renderizado con `DatePicker`.
 * @interface DateFilter
 * @augments FilterBase
 * @property {"date"} type
 * @property {DateInputValue} [minDate] - Fecha mínima seleccionable
 * @property {DateInputValue} [maxDate] - Fecha máxima seleccionable
 */
export interface DateFilter extends FilterBase {
  type: "date";
  minDate?: DateInputValue;
  maxDate?: DateInputValue;
}

/**
 * Filtro de rango de fechas, renderizado con `DateRangePicker`.
 * @interface DateRangeFilter
 * @augments FilterBase
 * @property {"date-range"} type
 * @property {DateInputValue} [minDate] - Fecha mínima seleccionable
 * @property {DateInputValue} [maxDate] - Fecha máxima seleccionable
 */
export interface DateRangeFilter extends FilterBase {
  type: "date-range";
  minDate?: DateInputValue;
  maxDate?: DateInputValue;
}

/**
 * Definición de un filtro disponible en el desplegable de filtros de
 * {@link Table} (botón "Filtros" a la izquierda del buscador), discriminada
 * por `type`: `"select"`/`"multi-select"` para listas de opciones,
 * `"date"`/`"date-range"` para fechas. No depende de `Table`: cualquier vista
 * que necesite un panel de filtros equivalente (no solo una tabla) reutiliza
 * el mismo tipo.
 * @typedef {(SelectFilter|MultiSelectFilter|DateFilter|DateRangeFilter)} Filter
 */
export type Filter = SelectFilter | MultiSelectFilter | DateFilter | DateRangeFilter;

/**
 * Valor actual de un {@link Filter}: cadena para `"select"`, lista de cadenas
 * para `"multi-select"`, fecha o `null` para `"date"`, o {@link DateRangeValue}
 * para `"date-range"`.
 * @typedef {(string|string[]|DateInputValue|null|DateRangeValue)} FilterValue
 */
export type FilterValue = string | string[] | DateInputValue | null | DateRangeValue;

/**
 * Valores actuales de un conjunto de filtros, por `key`.
 * @typedef {Object.<string, FilterValue>} FilterValues
 */
export type FilterValues = Record<string, FilterValue>;

/**
 * Acción disponible sobre el conjunto de filas seleccionadas de {@link Table}
 * (barra de acciones masivas, visible cuando `selectable` está activo y hay
 * al menos una fila marcada).
 * @interface TableAction
 * @template TData - Tipo de fila de la tabla sobre la que actúa
 * @property {string} key - Identificador único de la acción, usado como `key` de React
 * @property {string} label - Texto visible del botón/ítem de menú, ya resuelto (no es una clave de traducción)
 * @property {LucideIcon} [icon] - Icono renderizado antes de `label`
 * @property {"danger"} [variant] - Variante visual; `"danger"` pinta la acción con el color semántico de peligro (p. ej. eliminar)
 * @property {boolean} [disabled] - Deshabilita la acción sin ocultarla del menú
 * @property {(rows: TData[]) => void} onClick - Handler invocado con las filas actualmente seleccionadas al pulsar la acción
 */
export interface TableAction<TData> {
  key: string;
  label: string;
  icon?: LucideIcon;
  variant?: "danger";
  disabled?: boolean;
  onClick: (rows: TData[]) => void;
}

/**
 * Acción disponible sobre una única fila, mostrada en el desplegable de
 * {@link RowActionsMenu} (editar, activar, eliminar...). A diferencia de
 * {@link TableAction}, no recibe las filas seleccionadas: opera siempre sobre
 * la fila a la que pertenece el menú que la renderiza.
 * @interface RowAction
 * @property {string} key - Identificador único de la acción, usado como `key` de React
 * @property {string} label - Texto visible del ítem de menú, ya resuelto (no es una clave de traducción)
 * @property {LucideIcon} [icon] - Icono renderizado antes de `label`
 * @property {"danger"} [variant] - Variante visual; `"danger"` pinta la acción con el color semántico de peligro (p. ej. eliminar)
 * @property {boolean} [disabled] - Deshabilita la acción sin ocultarla del menú
 * @property {() => void} onClick - Handler invocado al pulsar la acción
 */
export interface RowAction {
  key: string;
  label: string;
  icon?: LucideIcon;
  variant?: "danger";
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Props de {@link Table}, el componente de tabla genérico del sistema de
 * diseño (§3.4/§11 requisitos.md). Soporta selección de filas, acciones
 * masivas, búsqueda y paginación/orden/filtrado tanto en memoria como
 * delegados al servidor (`manualPagination`/`manualSorting`/`manualFiltering`),
 * caso en el que la tabla nunca ordena/filtra/pagina el array de `data`
 * recibido: solo refleja el estado y delega en `on*Change`/los hooks de URL.
 * @interface TableProps
 * @template TData - Tipo de cada fila de `data`
 * @template TValue - Tipo de valor de celda por defecto de las columnas sin `TValue` propio
 * @property {TData[]} data - Filas a renderizar; en modo `manualPagination` es únicamente la página actual, nunca el listado completo
 * @property {ColumnDef<TData, TValue>[]} columns - Definición de columnas de TanStack Table
 * @property {(originalRow: TData, index: number, parent?: Row<TData>) => string} [getRowId] - Calcula el id estable de cada fila (por defecto el índice); necesario para que la selección sobreviva a un refetch
 * @property {boolean} [selectable] - Si `true`, añade la columna de checkbox/radio de selección; por defecto `false`
 * @property {boolean} [multiSelect] - Si `true` (por defecto), la selección es múltiple; si `false`, se comporta como radio (selección única)
 * @property {TableAction<TData>[]} [actions] - Acciones masivas disponibles sobre las filas seleccionadas; su barra solo se muestra si `selectable` está activo
 * @property {number} [initialPageSize] - Tamaño de página inicial cuando la paginación no está controlada externamente; por defecto 10
 * @property {number[]} [pageSizeOptions] - Opciones ofrecidas en el selector de "filas por página"; por defecto `[10, 25, 50, 100]`
 * @property {boolean} [paginated] - Si `false`, la tabla no pagina en absoluto (se muestran todas las filas de `data` y no se renderiza `TablePagination`); por defecto `true`. Pensado para listados sin paginación en la API (p. ej. `/roles`), donde paginar en cliente ocultaría filas sin motivo
 * @property {boolean} [manualPagination] - Si `true`, la paginación la resuelve la API (`data` ya viene paginado) y `rowCount` es obligatorio para calcular el número de páginas
 * @property {PaginationState} [pagination] - Estado de paginación controlado externamente; si se omite, la tabla gestiona el suyo internamente vía `usePagination`
 * @property {number} [rowCount] - Total de filas sin paginar, requerido cuando `manualPagination` es `true`
 * @property {(pagination: PaginationState) => void} [onPaginationChange] - Notifica cada cambio de paginación, controlada o no, para que el llamador dispare el refetch correspondiente
 * @property {boolean} [manualSorting] - Si `true`, el orden lo resuelve la API y `data` ya llega ordenado
 * @property {SortingState} [sorting] - Estado de orden controlado externamente; si se omite, la tabla gestiona el suyo internamente vía `useSorting`
 * @property {(sorting: SortingState) => void} [onSortingChange] - Notifica cada cambio de orden, controlado o no
 * @property {boolean} [searchable] - Si `true`, muestra el campo de búsqueda global en la barra de herramientas
 * @property {string} [searchPlaceholder] - Placeholder del campo de búsqueda; si se omite se usa el de traducción por defecto
 * @property {boolean} [manualFiltering] - Si `true`, el filtrado lo resuelve la API y `data` ya llega filtrado
 * @property {string} [globalFilter] - Valor de búsqueda controlado externamente; si se omite, la tabla gestiona el suyo internamente vía `useFilters`
 * @property {(value: string) => void} [onSearchChange] - Notifica cada cambio del texto de búsqueda, controlado o no
 * @property {Filter[]} [filters] - Filtros disponibles en el desplegable "Filtros" a la izquierda del buscador; si se omite o está vacío, el botón no se muestra
 * @property {FilterValues} [filterValues] - Valor actual de cada filtro, por `key`; siempre controlado por el llamador (no hay estado interno, a diferencia de paginación/orden/búsqueda)
 * @property {(key: string, value: FilterValue) => void} [onFilterChange] - Notifica el cambio de un filtro concreto
 * @property {() => void} [onClearAll] - Limpia todos los filtros a la vez; si se omite, el panel no muestra el botón "Limpiar filtros"
 * @property {boolean} [isLoading] - Si `true`, sustituye el cuerpo de la tabla por el estado de carga
 * @property {string} [emptyMessage] - Mensaje mostrado cuando no hay filas; si se omite se usa el de traducción por defecto
 * @property {string} [className] - Clases CSS adicionales para el contenedor raíz
 */
export interface TableProps<TData, TValue = unknown> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  selectable?: boolean;
  multiSelect?: boolean;
  actions?: TableAction<TData>[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  paginated?: boolean;
  manualPagination?: boolean;
  pagination?: PaginationState;
  rowCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  manualFiltering?: boolean;
  globalFilter?: string;
  onSearchChange?: (value: string) => void;
  filters?: Filter[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: FilterValue) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Props de {@link TablePagination}, el pie de página de {@link Table}: muestra
 * el resumen de registros, la navegación entre páginas y el selector de
 * tamaño de página. No gestiona estado propio: es puramente controlado por
 * `Table`, que a su vez delega en `usePagination`/la instancia de TanStack Table.
 * @interface TablePaginationProps
 * @property {number} currentPage - Página actual, en base 1
 * @property {number} pageCount - Total de páginas disponibles
 * @property {number} totalRecords - Total de filas sin paginar
 * @property {boolean} canPreviousPage - Si `false`, deshabilita "primera"/"anterior"
 * @property {boolean} canNextPage - Si `false`, deshabilita "siguiente"/"última"
 * @property {() => void} onFirstPage - Handler para ir a la primera página
 * @property {() => void} onPreviousPage - Handler para ir a la página anterior
 * @property {() => void} onNextPage - Handler para ir a la página siguiente
 * @property {() => void} onLastPage - Handler para ir a la última página
 * @property {(page: number) => void} onGoToPage - Handler para ir a una página concreta (base 1) desde la ventana de números
 * @property {number} pageSize - Tamaño de página actual
 * @property {number[]} pageSizeOptions - Opciones ofrecidas en el selector de tamaño de página
 * @property {(size: number) => void} onPageSizeChange - Handler invocado al cambiar el tamaño de página
 */
export interface TablePaginationProps {
  currentPage: number;
  pageCount: number;
  totalRecords: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onGoToPage: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
}

/**
 * Props de {@link TableSkeleton}, el placeholder de carga con la misma forma
 * visual que {@link Table} (barra de herramientas, cabecera y filas), usado
 * en los `fallback` de `Suspense` de las vistas de listado mientras
 * `use()` resuelve la promesa de datos.
 * @interface TableSkeletonProps
 * @property {number} [rows] - Número de filas de placeholder; por defecto 5
 * @property {number} [columns] - Número de columnas de placeholder; por defecto 4
 * @property {boolean} [showToolbar] - Si se muestra el placeholder de la barra de búsqueda/filtros; por defecto `true`
 */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showToolbar?: boolean;
}

/**
 * Props de {@link TableBulkActions}, el contador de filas seleccionadas +
 * menú desplegable de acciones masivas de {@link Table} (a la derecha de la
 * barra de herramientas, solo montado cuando se pasan `actions`).
 * @interface TableBulkActionsProps
 * @template TData - Tipo de fila de la tabla
 * @property {TableAction<TData>[]} actions - Acciones masivas disponibles
 * @property {TData[]} selectedRows - Filas actualmente seleccionadas, pasadas tal cual a cada `action.onClick`
 * @property {number} selectedCount - Número de filas seleccionadas (= `selectedRows.length`, ya calculado por el llamador)
 * @property {() => void} onClearSelection - Handler para vaciar la selección actual
 */
export interface TableBulkActionsProps<TData> {
  actions: TableAction<TData>[];
  selectedRows: TData[];
  selectedCount: number;
  onClearSelection: () => void;
}

/**
 * Props de {@link Filters}, el botón "Filtros" de la barra de herramientas de
 * {@link Table} (a la izquierda del buscador) y su panel desplegable, con un
 * control por cada filtro de `filters`.
 * @interface FiltersProps
 * @property {Filter[]} filters - Filtros disponibles
 * @property {FilterValues} values - Valor actual de cada filtro, por `key`
 * @property {(key: string, value: FilterValue) => void} onChange - Notifica el cambio de un filtro concreto
 * @property {() => void} [onClearAll] - Limpia todos los filtros a la vez; si se omite, no se muestra el botón "Limpiar filtros"
 */
export interface FiltersProps {
  filters: Filter[];
  values: FilterValues;
  onChange: (key: string, value: FilterValue) => void;
  onClearAll?: () => void;
}

/**
 * Props de {@link TableToolbar}: compone búsqueda global, filtros
 * (`Filters`) y acciones masivas (`TableBulkActions`) en la barra de
 * herramientas de {@link Table}. No se renderiza nada si ninguna de las tres
 * partes aplica (ni `searchable`, ni `filters`, ni `actions`).
 * @interface TableToolbarProps
 * @template TData - Tipo de fila de la tabla
 * @property {boolean} searchable - Si se muestra el campo de búsqueda global
 * @property {string} [searchPlaceholder] - Placeholder del campo de búsqueda; si se omite se usa el de traducción por defecto
 * @property {string} globalFilter - Valor actual del campo de búsqueda
 * @property {(value: string) => void} onSearchChange - Handler de cambio del texto de búsqueda
 * @property {Filter[]} [filters] - Filtros disponibles en el desplegable "Filtros"
 * @property {FilterValues} [filterValues] - Valor actual de cada filtro, por `key`
 * @property {(key: string, value: FilterValue) => void} [onFilterChange] - Notifica el cambio de un filtro concreto
 * @property {() => void} [onClearAll] - Limpia todos los filtros a la vez
 * @property {TableAction<TData>[]} [actions] - Acciones masivas disponibles sobre las filas seleccionadas
 * @property {TData[]} selectedRows - Filas actualmente seleccionadas
 * @property {number} selectedCount - Número de filas seleccionadas
 * @property {() => void} onClearSelection - Handler para vaciar la selección actual
 */
export interface TableToolbarProps<TData> {
  searchable: boolean;
  searchPlaceholder?: string;
  globalFilter: string;
  onSearchChange: (value: string) => void;
  filters?: Filter[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: FilterValue) => void;
  onClearAll?: () => void;
  actions?: TableAction<TData>[];
  selectedRows: TData[];
  selectedCount: number;
  onClearSelection: () => void;
}

/**
 * Props de {@link IndeterminateCheckbox}, el checkbox/radio de selección de
 * fila de {@link Table}.
 * @interface IndeterminateCheckboxProps
 * @augments InputHTMLAttributes<HTMLInputElement>
 * @property {boolean} [indeterminate] - Estado "parcialmente seleccionado" (algunas filas de la página, no todas)
 * @property {boolean} [radio] - Si `true`, se renderiza como radio (selección única de fila) en vez de checkbox
 */
export interface IndeterminateCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  radio?: boolean;
}

/**
 * Props de {@link TableHead}, la cabecera de {@link Table}.
 * @interface TableHeadProps
 * @template TData - Tipo de fila de la tabla
 * @property {ReactTableInstance<TData>} table - Instancia de TanStack Table de la que se leen los grupos de cabecera
 */
export interface TableHeadProps<TData> {
  table: ReactTableInstance<TData>;
}

/**
 * Props de {@link TableBody}, el cuerpo de {@link Table}.
 * @interface TableBodyProps
 * @template TData - Tipo de fila de la tabla
 * @property {ReactTableInstance<TData>} table - Instancia de TanStack Table de la que se leen las filas
 * @property {number} columnCount - Número de columnas visibles, usado como `colSpan` de los estados de carga/vacío
 * @property {boolean} isLoading - Si `true`, muestra el estado de carga en vez de las filas
 * @property {string} [emptyMessage] - Mensaje del estado vacío; si se omite se usa el de traducción por defecto
 */
export interface TableBodyProps<TData> {
  table: ReactTableInstance<TData>;
  columnCount: number;
  isLoading: boolean;
  emptyMessage?: string;
}
