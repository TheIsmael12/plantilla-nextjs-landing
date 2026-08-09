import { HTTPStatus } from "@/constants/httpStatus";
import { toast } from "@/lib/toast";
import type { FetchResponse } from "@/types/responses";

const SUCCESS_STATUSES: number[] = [HTTPStatus.OK, HTTPStatus.CREATED];

/**
 * Dispara el toast adecuado a partir de una {@link FetchResponse}: éxito
 * (`200`/`201`) o error (cualquier otro `status`), sin fiarse de si `message`
 * viene relleno o no — el backend también manda `message` en las respuestas
 * de éxito (p. ej. "Operación realizada correctamente"), así que el `status`
 * es la única señal fiable.
 * @param {FetchResponse<unknown>} response - Respuesta ya resuelta de `fetchData`/`fetchDataToken`
 * @param {string} fallbackErrorMessage - Mensaje a mostrar si la API no da uno propio en el error
 * @returns {void}
 */
export function notifyResponse(
  response: FetchResponse<unknown>,
  fallbackErrorMessage: string,
): void {
  if (SUCCESS_STATUSES.includes(response.status)) {
    if (response.message) toast.success(response.message);
    return;
  }

  toast.error(response.message ?? fallbackErrorMessage);
}
