/**
 * ComplaintFormValues represents the shape of the data collected by the complaint form.
 *
 * @interface ComplaintFormValues
 * @property {string} type - Complaint type: service quality or ethics/compliance.
 * @property {string} affectedCommunityName - Affected community/building name (only for service quality).
 * @property {string} serviceDate - Date of the service being complained about (only for service quality).
 * @property {string} serviceDescription - Description of the service received (only for service quality).
 * @property {string} description - General description of the complaint.
 * @property {boolean} isAnonymous - Whether the sender chose not to be identified.
 * @property {string} contactName - Full name of the person submitting the complaint, if not anonymous.
 * @property {string} contactEmail - Email address of the person submitting the complaint, if not anonymous.
 * @property {boolean} privacyNoticeAcknowledged - Mandatory acknowledgement of the privacy notice.
 * @property {string} honeypot - Hidden trap field; the backend silently discards the submission if it arrives filled in.
 */
interface ComplaintFormValues {
  type: 'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE' | '';
  affectedCommunityName: string;
  serviceDate: string;
  serviceDescription: string;
  description: string;
  isAnonymous: boolean;
  contactName: string;
  contactEmail: string;
  privacyNoticeAcknowledged: boolean;
  honeypot: string;
}

/**
 * ComplaintFormProps defines the properties for the ComplaintForm component.
 *
 * @interface ComplaintFormProps
 * @property {(values: ComplaintFormValues, captchaToken?: string) => void} [onSubmit]
 *   Callback invoked with the validated form values (and the Turnstile token, if solved) when the user submits.
 * @property {boolean} [loading]
 *   When `true` the form displays a loading indicator and disables inputs.
 * @property {boolean} [success]
 *   When `true` the form shows a success confirmation message.
 * @property {string}  [error]
 *   Error message to display at the form level (e.g. network failure).
 */
interface ComplaintFormProps {
  onSubmit?: (values: ComplaintFormValues, captchaToken?: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
}
