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
 * Forma de respuesta de las Server Actions locales (`src/actions/**`): más
 * simple que {@link Response}, sin envolver el resultado en un objeto de
 * éxito/error explícito.
 * @interface FetchResponse
 * @template T - Tipo de los datos devueltos en `data` cuando la operación tiene éxito.
 * @property {number} status - Código de estado (p. ej. {@link HTTPStatus}) de la operación.
 * @property {string} [message] - Mensaje descriptivo, normalmente presente solo en caso de error.
 * @property {T} [data] - Datos devueltos por la operación cuando tiene éxito.
 */
export interface FetchResponse<T> {
  status: number;
  message?: string;
  data?: T;
}
