/**
 * Response interface represents a standard structure for API responses.
 * @interface Response
 * @template T - The type of the data contained in the response.
 * @property {boolean} success - A boolean indicating whether the request was successful.
 * @property {number} code - The HTTP status code of the response.
 * @property {string} message - A message providing additional information about the response.
 * @property {T} data - The data contained in the response.
 * @property {Array} [errors] - An optional array of errors, if any occurred.
 */
export interface Response<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors?: [];
}

/**
 * PaginatedResponse interface represents a standard structure for paginated API responses.
 * @interface PaginatedResponse
 * @template T - The type of the items contained in the paginated response.
 * @property {boolean} success - A boolean indicating whether the request was successful.
 * @property {number} code - The HTTP status code of the response.
 * @property {string} message - A message providing additional information about the response.
 * @property {Object} data - An object containing the paginated data.
 * @property {Array<T>} data.items - An array of items of type T contained in the paginated response.
 * @property {number} data.total - The total number of items available.
 * @property {number} data.page - The current page number of the paginated response.
 * @property {number} data.limit - The number of items per page in the paginated response.
 * @property {Array} [errors] - An optional array of errors, if any occurred.
 */

interface PaginatedResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
  errors?: [];
}

/**
 * Error de validación de un campo concreto, tal y como lo devuelve el
 * backend (RFC 9457 Problem Details, array `errors[]`) en un 400 de
 * validación.
 * @interface FetchResponseFieldError
 * @property {string} field - Nombre del campo del DTO que falló la validación.
 * @property {string} message - Mensaje descriptivo del error, ya traducido por el backend.
 */
export interface FetchResponseFieldError {
  field: string;
  message: string;
}

/**
 * Forma de respuesta de las Server Actions locales (`src/actions/**`): más
 * simple que {@link Response}, sin envolver el resultado en un objeto de
 * éxito/error explícito.
 * @interface FetchResponse
 * @template T - Tipo de los datos devueltos en `data` cuando la operación tiene éxito.
 * @property {number} status - Código de estado (p. ej. {@link HTTPStatus}) de la operación.
 * @property {string} [message] - Mensaje descriptivo, normalmente presente solo en caso de error.
 * @property {T} [data] - Datos devueltos por la operación cuando tiene éxito.
 * @property {FetchResponseFieldError[]} [errors] - Errores de validación por campo, si el backend los envía.
 */
export interface FetchResponse<T> {
  status: number;
  message?: string;
  data?: T;
  errors?: FetchResponseFieldError[];
}

/**
 * Respuesta de {@link fetchDataToken} cuando se pide con `{ blob: true }`
 * (descarga de un fichero, p. ej. un adjunto de incidencia): en vez de `data`
 * ya parseado, trae el contenido binario tal cual.
 * @interface FetchResponseWithBlob
 * @template T - Forma de `data` cuando la petición tiene éxito (no aplica al propio fichero)
 * @property {Blob} file - Contenido binario descargado
 * @property {string} mimeType - Tipo MIME del fichero, resuelto desde la cabecera `Content-Type`
 * @property {string} fileName - Nombre de fichero, resuelto desde `Content-Disposition`
 */
export interface FetchResponseWithBlob<T> extends FetchResponse<T> {
  file: Blob;
  mimeType: string;
  fileName: string;
}

/**
 * Metadatos de paginación de un listado paginado del backend.
 * @interface PaginationMeta
 * @property {number} page - Página actual (1-indexada).
 * @property {number} limit - Tamaño de página solicitado.
 * @property {number} totalItems - Número total de elementos en todas las páginas.
 * @property {number} totalPages - Número total de páginas disponibles.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Forma de `data` para un listado paginado del backend (p. ej. `GET /blog/posts`),
 * distinta de {@link PaginatedResponse}: esta refleja el `PaginatedResult<T>` real
 * que usa la API pública, no el formato legacy `{items, total, page, limit}`.
 * @interface PaginatedResult
 * @template T - Tipo de cada elemento de `items`.
 * @property {T[]} items - Elementos de la página actual.
 * @property {PaginationMeta} pagination - Metadatos de paginación.
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
