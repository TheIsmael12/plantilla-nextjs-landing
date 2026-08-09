"use server";

import { fetchDataToken } from "@/actions/fetch";
import type { PortalClientMeResponseData } from "@/types/client-portal/profile";

/**
 * Obtiene los datos de perfil del cliente autenticado (`GET client/me`).
 * Solo lectura: el backend no expone edición de estos campos desde el portal.
 * @returns {Promise<{status: number, message?: string, data?: PortalClientMeResponseData}>} Estado de la operación y los datos del cliente
 */
export async function getClientProfile(): Promise<{
  status: number;
  message?: string;
  data?: PortalClientMeResponseData;
}> {
  return fetchDataToken<PortalClientMeResponseData, never>("client/me", "GET");
}

/**
 * Consulta si la autenticación en dos pasos está activa para el cliente
 * autenticado (`GET client/2fa/status`).
 * @returns {Promise<{status: number, message?: string, data?: {enabled: boolean}}>} Estado de la operación y si 2FA está activo
 */
export async function getClientTwoFactorStatus(): Promise<{
  status: number;
  message?: string;
  data?: { enabled: boolean };
}> {
  return fetchDataToken<{ enabled: boolean }, never>("client/2fa/status", "GET");
}

/**
 * Regenera los códigos de recuperación de 2FA del cliente autenticado,
 * invalidando los anteriores (`POST client/2fa/recovery-codes/regenerate`).
 * El backend devuelve el nuevo lote directamente como array de strings.
 * @returns {Promise<{status: number, message?: string, data?: string[]}>} Estado de la operación y los nuevos códigos
 */
export async function regenerateClientTwoFactorRecoveryCodes(): Promise<{
  status: number;
  message?: string;
  data?: string[];
}> {
  return fetchDataToken<string[], never>("client/2fa/recovery-codes/regenerate", "POST");
}
