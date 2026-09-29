"use server";

import type * as Yup from "yup";

import { fetchData } from "@/actions/fetch";
import { validatePublicPayload } from "@/actions/publicPayloadValidation";
import { complaintSchema } from "@/schemas/complaint.schema";
import type { CreatePublicComplaintPayload } from "@/types/complaints/complaints";
import type { FetchResponse } from "@/types/responses";

type ValidatedComplaint = Yup.InferType<ReturnType<typeof complaintSchema>>;

/**
 * Envía el formulario del canal de reclamaciones público. El backend responde siempre `201` con
 * `data: null` (anti-enumeración), tanto si la reclamación se creó como si se descartó en
 * silencio por honeypot/captcha — el único error real es la falta de nombre/email cuando
 * `isAnonymous = false`. Mismo criterio que `submitContactLead`.
 *
 * Se valida aquí con `complaint.schema.ts` y el cuerpo se monta campo a campo: es un endpoint público, y lo
 * que llegue de más (o una reclamación «anónima» con nombre y email) no debe reenviarse tal cual.
 * @param {CreatePublicComplaintPayload} values - Datos del formulario del canal de reclamaciones
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function submitComplaint(
  values: CreatePublicComplaintPayload,
): Promise<FetchResponse<null>> {
  const validation = await validatePublicPayload<ValidatedComplaint>(complaintSchema(), values);
  if (!validation.ok) return validation.response;

  const complaint = validation.value;
  const isServiceQuality = complaint.type === "SERVICE_QUALITY";

  const payload: CreatePublicComplaintPayload = {
    type: complaint.type,
    affectedCommunityName: isServiceQuality ? complaint.affectedCommunityName : undefined,
    serviceDate: isServiceQuality ? complaint.serviceDate : undefined,
    serviceDescription: isServiceQuality ? complaint.serviceDescription : undefined,
    incidentLocation: complaint.incidentLocation || undefined,
    reporterIsEmployee: complaint.reporterIsEmployee,
    description: complaint.description,
    isAnonymous: complaint.isAnonymous,
    contactName: complaint.isAnonymous ? undefined : complaint.contactName,
    contactEmail: complaint.isAnonymous ? undefined : complaint.contactEmail,
    privacyNoticeVersion: complaint.privacyNoticeVersion,
    privacyNoticeAcknowledged: complaint.privacyNoticeAcknowledged === true,
    captchaToken: complaint.captchaToken || undefined,
    honeypot: complaint.honeypot || undefined,
  };

  return fetchData<null, CreatePublicComplaintPayload>("public/complaints", "POST", payload);
}
