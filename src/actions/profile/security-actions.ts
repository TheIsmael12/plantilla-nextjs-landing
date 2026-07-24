import type { TwoFactorDisablePayload, TwoFactorSetupData } from "@/types/profile/security";
import { HTTPStatus } from "@/constants/httpStatus";

/**
 * Genera el secreto y el código QR necesarios para iniciar el alta de
 * autenticación en dos pasos.
 * @returns {Promise<{status: number, message?: string, data?: TwoFactorSetupData}>} Estado de la operación y los datos de configuración
 */
export async function setupTwoFactor(): Promise<{
  status: number;
  message?: string;
  data?: TwoFactorSetupData;
}> {
  return {
    status: HTTPStatus.OK,
    data: {
      secret: "JBSWY3DPEHPK3PXP",
      qrDataUri: "data:image/png;base64,"
    }
  };
}

/**
 * Confirma el código introducido por el usuario durante el alta de
 * autenticación en dos pasos.
 * @param {string} code Código de verificación introducido por el usuario
 * @returns {Promise<{status: number, message?: string}>} Estado de la operación
 */
export async function verifyTwoFactorSetup(code: string): Promise<{
  status: number;
  message?: string;
}> {
  return code === "123456"
    ? { status: HTTPStatus.OK }
    : { status: HTTPStatus.BAD_REQUEST, message: "Invalid code" };
}

/**
 * Desactiva la autenticación en dos pasos tras validar la contraseña y el
 * código introducidos por el usuario.
 * @param {TwoFactorDisablePayload} values Contraseña y código de verificación actuales
 * @returns {Promise<{status: number, message?: string}>} Estado de la operación
 */
export async function disableTwoFactor(values: TwoFactorDisablePayload): Promise<{
  status: number;
  message?: string;
}> {
  return values.password && values.code
    ? { status: HTTPStatus.OK }
    : { status: HTTPStatus.BAD_REQUEST, message: "Invalid credentials" };
}
