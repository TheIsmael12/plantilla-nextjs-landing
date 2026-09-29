"use server";

import { fetchData, fetchDataToken } from "@/actions/fetch";
import { HTTPStatus } from "@/constants/httpStatus";
import { getPortalBackendTokens } from "@/lib/portalBackendTokens";

/**
 * `true` si el valor es una cadena no vacía de como mucho `max` caracteres.
 * @param {unknown} value - Valor recibido
 * @param {number} max - Longitud máxima
 * @returns {boolean} Si es una cadena válida
 */
function isBoundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

/**
 * Solicita el enlace de recuperación de contraseña. Siempre responde con
 * éxito genérico (anti-enumeración), tanto si el `taxId` existe como si no.
 * @param {string} taxId - CIF/NIF del cliente
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function forgotClientPortalPassword(
  taxId: string,
): Promise<{ status: number; message?: string }> {
  // Acción pública: se reenvía solo el campo esperado y con su tipo, no lo que llegue.
  if (typeof taxId !== "string" || taxId.trim().length === 0 || taxId.length > 32) {
    return { status: HTTPStatus.BAD_REQUEST };
  }

  return fetchData<null, { taxId: string }>("client/auth/forgot-password", "POST", {
    taxId: taxId.trim(),
  });
}

/**
 * Fija una nueva contraseña a partir del token recibido en el enlace de
 * recuperación.
 * @param {{ token: string; newPassword: string }} input - Token del enlace y nueva contraseña
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function resetClientPortalPassword(input: {
  token: string;
  newPassword: string;
}): Promise<{ status: number; message?: string }> {
  // Cuerpo explícito: esta acción es pública y el objeto recibido podría traer claves de más.
  if (!isBoundedString(input?.token, 2048) || !isBoundedString(input?.newPassword, 256)) {
    return { status: HTTPStatus.BAD_REQUEST };
  }

  return fetchData<null, typeof input>("client/auth/reset-password", "POST", {
    token: input.token,
    newPassword: input.newPassword,
  });
}

/**
 * Cambia la contraseña del cliente ya autenticado (autoservicio, distinto
 * del cambio obligatorio tras login).
 * @param {{ currentPassword: string; newPassword: string }} input - Contraseña actual y nueva
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function changeClientPortalPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ status: number; message?: string }> {
  return fetchDataToken<null, typeof input>("client/auth/change-password", "POST", input);
}

/**
 * Cierra la sesión del cliente actual: revoca en el backend el `refreshToken`
 * de la sesión activa (best-effort, no bloquea si falla) antes de que el
 * componente cliente destruya la sesión local con `signOut()` de
 * `next-auth/react`. Sin parámetros a propósito: resuelve el `refreshToken`
 * server-side a partir del JWT de NextAuth para no exponerlo nunca al
 * bundle de cliente.
 * @returns {Promise<void>} No devuelve nada
 */
export async function logoutCurrentClientPortalSession(): Promise<void> {
  const refreshToken = (await getPortalBackendTokens())?.refreshToken;

  if (!refreshToken) return;

  await fetchData<null, { refreshToken: string }>("client/auth/logout", "POST", { refreshToken });
}
