"use server";

import { fetchDataToken } from "@/actions/fetch";
import type { TwoFactorDisablePayload, TwoFactorSetupData } from "@/types/profile/security";

/**
 * Genera el secreto y el código QR necesarios para iniciar el alta de
 * autenticación en dos pasos (`POST client/2fa/setup`).
 * @returns {Promise<{status: number, message?: string, data?: TwoFactorSetupData}>} Estado de la operación y los datos de configuración
 */
export async function setupTwoFactor(): Promise<{
  status: number;
  message?: string;
  data?: TwoFactorSetupData;
}> {
  return fetchDataToken<TwoFactorSetupData, never>("client/2fa/setup", "POST");
}

/**
 * Confirma el código introducido por el cliente durante el alta de
 * autenticación en dos pasos (`POST client/2fa/verify`, vía Bearer).
 * @param {string} code Código de verificación introducido por el cliente
 * @returns {Promise<{status: number, message?: string}>} Estado de la operación
 */
export async function verifyTwoFactorSetup(code: string): Promise<{
  status: number;
  message?: string;
}> {
  return fetchDataToken<undefined, { code: string }>("client/2fa/verify", "POST", { code });
}

/**
 * Desactiva la autenticación en dos pasos tras validar la contraseña y el
 * código introducidos por el cliente (`POST client/2fa/disable`).
 * @param {TwoFactorDisablePayload} values Contraseña y código de verificación actuales
 * @returns {Promise<{status: number, message?: string}>} Estado de la operación
 */
export async function disableTwoFactor(values: TwoFactorDisablePayload): Promise<{
  status: number;
  message?: string;
}> {
  return fetchDataToken<undefined, TwoFactorDisablePayload>("client/2fa/disable", "POST", values);
}
