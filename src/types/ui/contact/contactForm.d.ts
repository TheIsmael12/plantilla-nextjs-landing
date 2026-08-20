/**
 * ContactFormValues represents the shape of the data collected by the contact form.
 *
 * @interface ContactFormValues
 * @property {string} contactName - Full name of the person submitting the form.
 * @property {string} companyName - Company or community name (optional).
 * @property {string} email       - Email address of the person submitting the form.
 * @property {string} phone       - Phone number of the person submitting the form.
 * @property {string} message     - Full body of the message or enquiry (optional).
 * @property {string} contactProfile - Selected caller profile, or empty when not answered.
 * @property {string} serviceInterest - Selected service of interest, or empty when not answered.
 * @property {string} zone - Selected coverage-area slug, or empty when not answered.
 * @property {string} timeframe - Selected timeframe, or empty when not answered.
 * @property {string} managedPropertiesCount - Number of managed properties, as typed. Only asked of property managers.
 * @property {boolean} privacyNoticeAcknowledged - Mandatory acknowledgement of the privacy notice.
 * @property {boolean} marketingConsent - Optional, unchecked-by-default consent to receive marketing communications.
 * @property {boolean} attributionConsent - Optional consent to store attribution data (UTMs, referrer...).
 * @property {string} honeypot - Hidden trap field; the backend silently discards the submission if it arrives filled in.
 */
interface ContactFormValues {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  message: string;
  /*
   * Los cinco campos de cualificación son cadenas, también el número de fincas.
   *
   * Es lo que devuelve un campo del DOM, y mantenerlo así deja que Formik y Yup trabajen con un solo
   * tipo por campo: la cadena vacía es «no ha contestado», que es distinto de cero y de «ninguno». La
   * conversión a número y a los enums del backend la hace el contenedor al montar el envío, en un solo
   * sitio y no en cada `onChange`.
   */
  contactProfile: string;
  serviceInterest: string;
  zone: string;
  timeframe: string;
  managedPropertiesCount: string;
  privacyNoticeAcknowledged: boolean;
  marketingConsent: boolean;
  attributionConsent: boolean;
  honeypot: string;
}

/**
 * ContactFormProps defines the properties for the ContactForm component.
 *
 * @interface ContactFormProps
 * @property {(values: ContactFormValues, captchaToken?: string) => void} [onSubmit]
 *   Callback invoked with the validated form values (and the Turnstile token, if solved) when the user submits.
 * @property {boolean} [loading]
 *   When `true` the form displays a loading indicator and disables inputs.
 * @property {boolean} [success]
 *   When `true` the form shows a success confirmation message.
 * @property {string}  [error]
 *   Error message to display at the form level (e.g. network failure).
 */
interface ContactFormProps {
  onSubmit?: (values: ContactFormValues, captchaToken?: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
}
