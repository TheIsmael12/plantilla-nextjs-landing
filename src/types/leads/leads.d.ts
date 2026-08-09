/**
 * Parámetros de atribución que el backend sabe guardar, solo si
 * `attributionConsent` viaja en `true` (si no, los descarta aunque se envíen).
 * @interface LeadAttribution
 */
export interface LeadAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  landingUrl?: string;
  referrer?: string;
}

/**
 * Cuerpo de `POST /public/leads`. `email`/`phone` son ambos opcionales a
 * nivel de tipo porque el backend exige "al menos uno de los dos" en el
 * servicio (no en el DTO) — la validación de ese requisito vive en
 * `contact.schema.ts`, en el propio formulario.
 * @interface CreatePublicLeadPayload
 */
export interface CreatePublicLeadPayload extends LeadAttribution {
  contactName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  message?: string;
  privacyNoticeVersion: string;
  privacyNoticeAcknowledged: boolean;
  marketingConsent?: boolean;
  attributionConsent?: boolean;
  captchaToken?: string;
  /** Campo trampa: si llega con contenido, el backend descarta el envío en silencio. */
  honeypot?: string;
}
