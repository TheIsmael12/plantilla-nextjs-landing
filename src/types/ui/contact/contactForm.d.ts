/**
 * ContactFormValues represents the shape of the data collected by the contact form.
 *
 * @interface ContactFormValues
 * @property {string} contactName - Full name of the person submitting the form.
 * @property {string} companyName - Company or community name (optional).
 * @property {string} email       - Email address of the person submitting the form.
 * @property {string} phone       - Phone number of the person submitting the form.
 * @property {string} message     - Full body of the message or enquiry (optional).
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
