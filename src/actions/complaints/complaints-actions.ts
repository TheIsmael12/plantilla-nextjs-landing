"use server";

import { fetchData } from "@/actions/fetch";
import type { CreatePublicComplaintPayload } from "@/types/complaints/complaints";
import type { FetchResponse } from "@/types/responses";

/**
 * Envía el formulario del canal de reclamaciones público. El backend responde siempre `201` con
 * `data: null` (anti-enumeración), tanto si la reclamación se creó como si se descartó en
 * silencio por honeypot/captcha — el único error real es la falta de nombre/email cuando
 * `isAnonymous = false`. Mismo criterio que `submitContactLead`.
 * @param {CreatePublicComplaintPayload} values - Datos del formulario del canal de reclamaciones
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function submitComplaint(
  values: CreatePublicComplaintPayload,
): Promise<FetchResponse<null>> {
  return fetchData<null, CreatePublicComplaintPayload>("public/complaints", "POST", values);
}
