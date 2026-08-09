/**
 * Metadatos de paginación devueltos por cualquier listado paginado del
 * backend (`buildPaginationMeta`, común a todos los módulos).
 * @interface Pagination
 * @property {number} page - Página actual (1-indexada)
 * @property {number} limit - Tamaño de página solicitado
 * @property {number} totalItems - Total de elementos que cumplen el filtro
 * @property {number} totalPages - Total de páginas (`Math.max(1, Math.ceil(totalItems / limit))`)
 */
export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Forma genérica de `data` en cualquier respuesta paginada del backend.
 * @interface PaginatedResult
 * @template T - Tipo de cada elemento de `items`
 * @property {T[]} items - Elementos de la página actual
 * @property {Pagination} pagination - Metadatos de paginación
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
