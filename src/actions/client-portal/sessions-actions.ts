"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { fetchDataToken } from "@/actions/fetch";
import { HTTPStatus } from "@/constants/httpStatus";
import { authOptions } from "@/lib/authOptions";
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
 * latido de `usePortalSessionMonitor`.
 *
 * Un 401 solo se traduce a `revoked: true` si **nuestro** `accessToken` todavía debería valer: los dos
 * casos llegan igual —«te han revocado la sesión» y «el token que acabo de mandar está caducado»— y solo
 * uno justifica echar al cliente de su pantalla. Confundirlos era lo que la cerraba a los 15 minutos.
 *
 * Cualquier otro fallo se considera indeterminado y tampoco cierra la sesión, para que un corte de red
 * pasajero no eche a nadie. Equivocarse hacia el lado prudente no abre nada: la autorización real la
 * aplica la API en cada llamada.
 * @returns {Promise<PortalSessionStatus>} Si la sesión debe darse por revocada
 */
export async function getPortalSessionStatus(): Promise<PortalSessionStatus> {
  const response = await fetchDataToken<PortalSessionStatus, never>(
    "client/me/session-status",
    "GET",
  );

  if (response.status === HTTPStatus.UNAUTHORIZED) {
    const session = await getServerSession(authOptions);
    const tokenExpired =
      !session?.user?.accessTokenExpires || Date.now() >= session.user.accessTokenExpires;

    return { revoked: !tokenExpired };
  }

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
