"use server";

import * as Yup from "yup";

import { fetchData } from "@/actions/fetch";
import { serverText, validatePublicPayload } from "@/actions/publicPayloadValidation";
import {
  isContactProfile,
  isServiceInterest,
  isTimeframe,
  PROPERTY_MANAGER_PROFILE,
} from "@/config/leadQualification";
import { HTTPStatus } from "@/constants/httpStatus";
import { contactSchema } from "@/schemas/contact.schema";
import type { CreatePublicLeadPayload, LeadAttribution } from "@/types/leads/leads";
import type { FetchResponse } from "@/types/responses";

/** Campos de atribución que el backend guarda (solo con `attributionConsent`). */
const ATTRIBUTION_FIELDS = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "gclid",
  "fbclid",
  "landingUrl",
  "referrer",
] as const satisfies readonly (keyof LeadAttribution)[];

/**
 * El esquema del formulario de contacto (`contact.schema.ts`) más lo que añade el contenedor al enviar y el
 * formulario no pinta: versión del aviso de privacidad, token del captcha, consentimiento y datos de
 * atribución. Límites alineados con el DTO del backend (`CreatePublicLeadDto`).
 * @returns {Yup.AnyObjectSchema} El esquema de lo que acepta la acción
 */
const publicLeadSchema = () =>
  contactSchema().shape({
    privacyNoticeVersion: serverText(50).required("common.required"),
    attributionConsent: Yup.boolean(),
    captchaToken: serverText(4096),
    ...Object.fromEntries(ATTRIBUTION_FIELDS.map((field) => [field, serverText(2048)])),
  });

type ValidatedLead = Yup.InferType<ReturnType<typeof contactSchema>> &
  Partial<Record<(typeof ATTRIBUTION_FIELDS)[number], string>> & {
    privacyNoticeVersion: string;
    attributionConsent?: boolean;
    captchaToken?: string;
  };

/**
 * Envía el formulario de contacto público. El backend responde siempre
 * `201` con `data: null` (anti-enumeración), tanto si el lead se creó como
 * si se descartó en silencio por honeypot/captcha/lista de supresión — el
 * único error real es la falta de email y teléfono a la vez.
 *
 * Lo recibido se valida aquí con el mismo esquema del formulario y el cuerpo se monta **campo a campo**:
 * esta acción es un endpoint público y nada garantiza que quien la llame haya pasado por el formulario.
 * @param {CreatePublicLeadPayload} values - Datos del formulario de contacto
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function submitContactLead(
  values: CreatePublicLeadPayload,
): Promise<FetchResponse<null>> {
  const validation = await validatePublicPayload<ValidatedLead>(publicLeadSchema(), values);
  if (!validation.ok) return validation.response;

  const lead = validation.value;
  const isPropertyManager = lead.contactProfile === PROPERTY_MANAGER_PROFILE;
  const attributionConsent = lead.attributionConsent === true;

  const payload: CreatePublicLeadPayload = {
    contactName: lead.contactName,
    email: lead.email || undefined,
    phone: lead.phone || undefined,
    companyName: lead.companyName || undefined,
    message: lead.message || undefined,
    contactProfile:
      lead.contactProfile && isContactProfile(lead.contactProfile) ? lead.contactProfile : undefined,
    serviceInterest:
      lead.serviceInterest && isServiceInterest(lead.serviceInterest)
        ? lead.serviceInterest
        : undefined,
    zone: lead.zone || undefined,
    timeframe: lead.timeframe && isTimeframe(lead.timeframe) ? lead.timeframe : undefined,
    // Solo con perfil de administrador, igual que hace el contenedor: con otro perfil el backend da 400.
    managedPropertiesCount:
      isPropertyManager && lead.managedPropertiesCount
        ? Number(lead.managedPropertiesCount)
        : undefined,
    privacyNoticeVersion: lead.privacyNoticeVersion,
    privacyNoticeAcknowledged: lead.privacyNoticeAcknowledged === true,
    marketingConsent: lead.marketingConsent === true,
    attributionConsent,
    captchaToken: lead.captchaToken || undefined,
    honeypot: lead.honeypot || undefined,
  };

  // La atribución solo viaja con consentimiento (art. 22.2 LSSI); sin él ni se manda.
  if (attributionConsent) {
    for (const field of ATTRIBUTION_FIELDS) {
      if (lead[field]) payload[field] = lead[field];
    }
  }

  return fetchData<null, CreatePublicLeadPayload>("public/leads", "POST", payload);
}

/** Forma admitida para el token de baja: el backend lo firma con HMAC y lo codifica en base64url. */
const UNSUBSCRIBE_TOKEN = /^[A-Za-z0-9._~-]{1,2048}$/;

/**
 * Confirma la baja de comunicaciones comerciales de un lead a partir del
 * token de su enlace de email. El backend responde siempre `200` con
 * `data: null` si el token es sintácticamente válido (anti-enumeración),
 * exista o no ya el lead; solo da error si el HMAC del token no valida.
 * @param {string} token - Token de baja incluido en el enlace del email
 * @returns {Promise<FetchResponse<null>>} El resultado de la operación
 */
export async function unsubscribeLead(token: string): Promise<FetchResponse<null>> {
  // Lo que no tiene forma de token no se reenvía: el backend lo rechazaría igual, y así no viaja cualquier
  // cosa (un objeto, un texto de megas) que alguien meta llamando a la acción a mano.
  if (typeof token !== "string" || !UNSUBSCRIBE_TOKEN.test(token)) {
    return { status: HTTPStatus.BAD_REQUEST };
  }

  return fetchData<null, { token: string }>("public/leads/unsubscribe", "POST", { token });
}
