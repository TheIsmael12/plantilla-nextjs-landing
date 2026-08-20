import type { ContactProfile, ServiceInterest, Timeframe } from "@/config/leadQualification";

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
  /** Qué es quien escribe (sección 7.2.1 del documento de leads). */
  contactProfile?: ContactProfile;
  /** Servicio por el que pregunta: el slug de la web en mayúsculas, u `OTHER`. */
  serviceInterest?: ServiceInterest;
  /** Slug del municipio de la zona de cobertura (`ZONES`). */
  zone?: string;
  /** Para cuándo lo necesita. */
  timeframe?: Timeframe;
  /**
   * Cuántas fincas gestiona.
   *
   * **Solo viaja con `contactProfile = PROPERTY_MANAGER`**: con cualquier otro perfil el backend
   * responde 400, y con razón — «un particular que gestiona 30 fincas» no significa nada. De eso se
   * encarga el contenedor al montar el envío, no el campo.
   */
  managedPropertiesCount?: number;
  privacyNoticeVersion: string;
  privacyNoticeAcknowledged: boolean;
  marketingConsent?: boolean;
  attributionConsent?: boolean;
  captchaToken?: string;
  /** Campo trampa: si llega con contenido, el backend descarta el envío en silencio. */
  honeypot?: string;
}
