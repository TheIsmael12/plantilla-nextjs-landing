import { HTTPStatus } from "@/constants/httpStatus";

/**
 * Indica si un código de estado de {@link FetchResponse} representa un fallo:
 * `0` (error de red, ver `networkError`) o cualquier código `>= 400`.
 * @param {number} status - Código de estado devuelto por una server action de `src/actions/**`
 * @returns {boolean} `true` si la petición ha fallado
 */
export function isErrorStatus(status: number): boolean {
  return status === 0 || status >= HTTPStatus.BAD_REQUEST;
}
