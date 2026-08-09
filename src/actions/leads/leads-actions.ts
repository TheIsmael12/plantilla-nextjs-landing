"use server";

import { fetchData } from "@/actions/fetch";
import type { CreatePublicLeadPayload } from "@/types/leads/leads";
import type { FetchResponse } from "@/types/responses";

/**
 * Envía el formulario de contacto público. El backend responde siempre
 * `201` con `data: null` (anti-enumeración), tanto si el lead se creó como
 * si se descartó en silencio por honeypot/captcha/lista de supresión — el
 * único error real es la falta de email y teléfono a la vez.
 * @param {CreatePublicLeadPayload} values - Datos del formulario de contacto
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function submitContactLead(
  values: CreatePublicLeadPayload,
): Promise<FetchResponse<null>> {
  return fetchData<null, CreatePublicLeadPayload>("public/leads", "POST", values);
}

/**
 * Confirma la baja de comunicaciones comerciales de un lead a partir del
 * token de su enlace de email. El backend responde siempre `200` con
 * `data: null` si el token es sintácticamente válido (anti-enumeración),
 * exista o no ya el lead; solo da error si el HMAC del token no valida.
 * @param {string} token - Token de baja incluido en el enlace del email
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function unsubscribeLead(token: string): Promise<FetchResponse<null>> {
  return fetchData<null, { token: string }>("public/leads/unsubscribe", "POST", { token });
}
