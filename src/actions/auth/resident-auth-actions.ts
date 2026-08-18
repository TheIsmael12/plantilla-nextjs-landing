"use server";

import { fetchData } from "@/actions/fetch";

/** Una comunidad tal y como la ofrece la API de vecino, en la previsualización de la invitación. */
export interface ResidentRoleValue {
  role: string;
}

/**
 * Previsualización de una invitación de vecino (`GET /residents/auth/invitation/:token`), sin aceptarla.
 * Misma forma que `ResidentInvitationPreviewDto` del backend.
 */
export interface ResidentInvitationPreview {
  email: string;
  name: string | null;
  communityName: string | null;
  unitCode: string | null;
  role: string;
  expiresAt: string;
  keyringNames: string[];
  allowGoogleSignIn: boolean;
  allowPasswordSignIn: boolean;
  accountAlreadyExists: boolean;
}

/**
 * Trae la previsualización de una invitación de vecino a partir del token del enlace del correo.
 * @param {string} token - Token de la invitación, tal y como llega en la URL
 * @returns {Promise<{ status: number; message?: string; data?: ResidentInvitationPreview }>} El resultado de la operación
 */
export async function previewResidentInvitation(
  token: string,
): Promise<{ status: number; message?: string; data?: ResidentInvitationPreview }> {
  return fetchData<ResidentInvitationPreview, never>(
    `residents/auth/invitation/${encodeURIComponent(token)}`,
    "GET",
  );
}

/**
 * El `deviceId` que manda esta web al aceptar una invitación.
 *
 * El endpoint lo exige y con él emite una sesión (`accessToken`/`refreshToken`) pensada para guardarse en un
 * móvil — aquí no se guarda en ningún sitio, se descarta en cuanto llega. Es un valor fijo y no aleatorio para
 * que quede claro en cualquier registro del backend que esa "sesión" nunca correspondió a un dispositivo real;
 * cambiarla a un valor por visita no aportaría nada, porque de todas formas no hay sesión web que mantener viva.
 */
const WEB_DEVICE_ID = "landing-web-accept-invitation";

/**
 * Acepta una invitación de vecino: crea la pertenencia (y la cuenta, si no existía) con la contraseña dada.
 * Sin `password`, solo confirma la pertenencia de una cuenta que ya existe (sección 4.2).
 *
 * El backend devuelve una sesión de dispositivo junto con la confirmación, pero esta acción **no la usa**: tras
 * aceptar desde la web, el vecino entra por su cuenta desde la app, con su propio dispositivo.
 * @param {{ token: string; password?: string }} input - Token del enlace y, si la cuenta no existe, la contraseña elegida
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function acceptResidentInvitation(input: {
  token: string;
  password?: string;
}): Promise<{ status: number; message?: string }> {
  return fetchData<null, typeof input & { deviceId: string }>("residents/auth/accept-invitation", "POST", {
    ...input,
    deviceId: WEB_DEVICE_ID,
  });
}

/**
 * Fija la contraseña nueva de un vecino a partir del token recibido en el enlace de recuperación de acceso.
 * @param {{ token: string; password: string }} input - Token del enlace y contraseña nueva
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function resetResidentPassword(input: {
  token: string;
  password: string;
}): Promise<{ status: number; message?: string }> {
  return fetchData<null, typeof input>("residents/auth/reset-password", "POST", input);
}
