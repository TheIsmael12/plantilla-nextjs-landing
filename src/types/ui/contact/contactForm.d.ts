/**
 * ContactFormValues represents the shape of the data collected by the contact form.
 *
 * @interface ContactFormValues
 * @property {string} name    - Full name of the person submitting the form.
 * @property {string} email   - Email address of the person submitting the form.
 * @property {string} subject - Brief subject or topic of the enquiry.
 * @property {string} message - Full body of the message or enquiry.
 */
interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * ContactFormProps defines the properties for the ContactForm component.
 *
 * @interface ContactFormProps
 * @property {(values: ContactFormValues) => void} [onSubmit]
 *   Callback invoked with the validated form values when the user submits.
 * @property {boolean} [loading]
 *   When `true` the form displays a loading indicator and disables inputs.
 * @property {boolean} [success]
 *   When `true` the form shows a success confirmation message.
 * @property {string}  [error]
 *   Error message to display at the form level (e.g. network failure).
 */
interface ContactFormProps {
  onSubmit?: (values: ContactFormValues) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
}
