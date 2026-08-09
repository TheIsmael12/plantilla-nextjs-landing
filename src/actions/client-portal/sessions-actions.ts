"use server";

import { revalidatePath } from "next/cache";

import { fetchDataToken } from "@/actions/fetch";
import { HTTPStatus } from "@/constants/httpStatus";
import type { FetchResponse } from "@/types/responses";
import type { PortalSession, PortalSessionStatus } from "@/types/client-portal/sessions";

/** Ruta que lista las sesiones y que hay que revalidar tras revocar alguna. */
const SESSIONS_PATH = "/private-area/profile/sessions";

/** `true` si la respuesta de una revocación fue satisfactoria. */
function isSuccess(status: number): boolean {
  return status === HTTPStatus.OK || status === HTTPStatus.NO_CONTENT;
}

/**
 * Sesiones abiertas del cliente autenticado (`GET client/me/sessions`).
 * @returns {Promise<FetchResponse<PortalSession[]>>} Las sesiones abiertas, o el error de la API
 */
export async function getMySessions(): Promise<FetchResponse<PortalSession[]>> {
  return fetchDataToken<PortalSession[], never>("client/me/sessions", "GET");
}

/**
 * Estado de la sesión en curso (`GET client/me/session-status`), usado por el
 * latido de `usePortalSessionMonitor`. Un 401 significa que la sesión fue
 * revocada, así que se traduce a `revoked: true`; cualquier otro fallo se
 * considera indeterminado y no cierra la sesión, para que un corte de red
 * pasajero no eche al cliente de la pantalla.
 * @returns {Promise<PortalSessionStatus>} Si la sesión debe darse por revocada
 */
export async function getPortalSessionStatus(): Promise<PortalSessionStatus> {
  const response = await fetchDataToken<PortalSessionStatus, never>(
    "client/me/session-status",
    "GET",
  );

  if (response.status === HTTPStatus.UNAUTHORIZED) return { revoked: true };

  return { revoked: response.data?.revoked ?? false };
}

/**
 * Cierra una sesión concreta del cliente autenticado
 * (`DELETE client/me/sessions/{id}`).
 * @param {string} id - Identificador de la sesión a cerrar
 * @returns {Promise<FetchResponse<void>>} Éxito o el error de la API
 */
export async function revokeSession(id: string): Promise<FetchResponse<void>> {
  const response = await fetchDataToken<void, never>(`client/me/sessions/${id}`, "DELETE");

  if (isSuccess(response.status)) revalidatePath(SESSIONS_PATH);

  return response;
}

/**
 * Cierra todas las sesiones del cliente salvo la actual
 * (`DELETE client/me/sessions`).
 * @returns {Promise<FetchResponse<void>>} Éxito o el error de la API
 */
export async function revokeAllOtherSessions(): Promise<FetchResponse<void>> {
  const response = await fetchDataToken<void, never>("client/me/sessions", "DELETE");

  if (isSuccess(response.status)) revalidatePath(SESSIONS_PATH);

  return response;
}
