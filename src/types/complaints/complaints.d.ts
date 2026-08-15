/**
 * Cuerpo de `POST /public/complaints` (requisitos-reclamaciones.md, sección 3).
 *
 * `contactName`/`contactEmail` son opcionales a nivel de tipo porque el backend exige "nombre y
 * email" solo si `isAnonymous = false`, en el servicio, no en el DTO — la validación de ese
 * requisito vive en `complaint.schema.ts`, mismo criterio que `CreatePublicLeadPayload`.
 * @interface CreatePublicComplaintPayload
 */
export interface CreatePublicComplaintPayload {
  type: 'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE';
  affectedCommunityName?: string;
  serviceDate?: string;
  serviceDescription?: string;
  description: string;
  isAnonymous: boolean;
  contactName?: string;
  contactEmail?: string;
  privacyNoticeVersion: string;
  privacyNoticeAcknowledged: boolean;
  captchaToken?: string;
  /** Campo trampa: si llega con contenido, el backend descarta el envío en silencio. */
  honeypot?: string;
}
