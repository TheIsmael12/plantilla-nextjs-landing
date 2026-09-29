"use server";

import { fetchData } from "@/actions/fetch";
import { HTTPStatus } from "@/constants/httpStatus";
import { apiPath } from "@/utils/apiPathUtils";

/**
 * `true` si el valor falta o es una cadena de como mucho `max` caracteres.
 * @param {unknown} value - Valor recibido
 * @param {number} max - Longitud máxima
 * @returns {boolean} Si es válido
 */
function isOptionalString(value: unknown, max: number): value is string | undefined {
  return value === undefined || (typeof value === "string" && value.length <= max);
}

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
  phone: string | null;
  communityName: string | null;
  unitCode: string | null;
  role: string;
  expiresAt: string;
  keyringNames: string[];
  allowGoogleSignIn: boolean;
  allowPasswordSignIn: boolean;
  /** Si la cuenta ya existe con sus datos puestos: no se piden, solo se muestran. */
  accountAlreadyExists: boolean;
  /** Si ya tiene alguna forma de entrar. Con `false` hace falta pedir contraseña, tenga o no datos ya puestos. */
  hasIdentity: boolean;
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
    apiPath`residents/auth/invitation/${token}`,
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
 * Sin `password`, solo confirma la pertenencia de una cuenta que ya tiene forma de entrar (sección 4.2).
 *
 * `name`/`phone`/`language` solo hacen falta si la cuenta es nueva: si ya existía —dada de alta desde la
 * intranet, o porque el vecino vive en otra comunidad— sus datos no se piden ni se mandan aquí.
 *
 * El backend devuelve una sesión de dispositivo junto con la confirmación, pero esta acción **no la usa**: tras
 * aceptar desde la web, el vecino entra por su cuenta desde la app, con su propio dispositivo.
 * @param {{ token: string; password?: string; name?: string; phone?: string; language?: string }} input - Token del enlace y, si la cuenta es nueva, sus datos y la contraseña elegida
 * @returns {Promise<{ status: number; message?: string }>} El resultado de la operación
 */
export async function acceptResidentInvitation(input: {
  token: string;
  password?: string;
  name?: string;
  phone?: string;
  language?: string;
  privacyNoticeAccepted?: boolean;
}): Promise<{ status: number; message?: string }> {
  // Acción pública: el cuerpo se monta campo a campo y con su tipo, en vez de propagar `...input` con lo que
  // quiera que traiga quien la llame.
  if (!isOptionalString(input?.token, 2048) || !input.token) return { status: HTTPStatus.BAD_REQUEST };
  if (
    !isOptionalString(input.password, 256) ||
    !isOptionalString(input.name, 255) ||
    !isOptionalString(input.phone, 32) ||
    !isOptionalString(input.language, 8) ||
    (input.privacyNoticeAccepted !== undefined && typeof input.privacyNoticeAccepted !== "boolean")
  ) {
    return { status: HTTPStatus.BAD_REQUEST };
  }

  return fetchData<null, typeof input & { deviceId: string }>("residents/auth/accept-invitation", "POST", {
    token: input.token,
    password: input.password,
    name: input.name,
    phone: input.phone,
    language: input.language,
    privacyNoticeAccepted: input.privacyNoticeAccepted,
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
  if (!isOptionalString(input?.token, 2048) || !input.token || !isOptionalString(input.password, 256) || !input.password) {
    return { status: HTTPStatus.BAD_REQUEST };
  }

  return fetchData<null, typeof input>("residents/auth/reset-password", "POST", {
    token: input.token,
    password: input.password,
  });
}
