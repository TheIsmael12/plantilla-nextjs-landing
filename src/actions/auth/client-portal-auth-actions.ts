"use server";

import { fetchData, fetchDataToken } from "@/actions/fetch";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

/**
 * Solicita el enlace de recuperación de contraseña. Siempre responde con
 * éxito genérico (anti-enumeración), tanto si el `taxId` existe como si no.
 * @param {string} taxId - CIF/NIF del cliente
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function forgotClientPortalPassword(
  taxId: string,
): Promise<{ status: number; message?: string }> {
  return fetchData<null, { taxId: string }>("client/auth/forgot-password", "POST", { taxId });
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
  return fetchData<null, typeof input>("client/auth/reset-password", "POST", input);
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
 * server-side a partir de la sesión de NextAuth para no exponerlo nunca al
 * bundle de cliente.
 * @returns {Promise<void>} No devuelve nada
 */
export async function logoutCurrentClientPortalSession(): Promise<void> {
  const session = await getServerSession(authOptions);
  const refreshToken = session?.user.backendTokens?.refreshToken;

  if (!refreshToken) return;

  await fetchData<null, { refreshToken: string }>("client/auth/logout", "POST", { refreshToken });
}
