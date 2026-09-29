import * as Yup from 'yup';

/** Tipos de reclamación que acepta el backend (`ComplaintType`). */
export const COMPLAINT_TYPES = ['SERVICE_QUALITY', 'ETHICS_COMPLIANCE'] as const;

/** Fecha del servicio en formato `YYYY-MM-DD`, que es como la manda el asistente (`toLocalIsoDate`). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Esquema del cuerpo de `POST /public/complaints` (requisitos-reclamaciones.md, sección 3).
 *
 * El asistente (`ComplaintsCreateWizard`) valida paso a paso con su propio estado y no con Formik, así que
 * este esquema no lo usa él: lo usa `submitComplaint` **en servidor**, que es la única validación que no se
 * puede saltar llamando a la acción a mano. Refleja las reglas del DTO del backend (`CreatePublicComplaintDto`):
 *
 * - Con `SERVICE_QUALITY` son obligatorios la comunidad, la fecha y el servicio; con el otro tipo no aplican
 *   y se descartan (`strip`), igual que hace el asistente al montar el envío.
 * - Nombre y email solo se piden si **no** es anónima; si lo es, se descartan aunque lleguen: una
 *   reclamación anónima no puede acabar identificada porque alguien los mandó igualmente.
 *
 * Los mensajes son claves de `Validations.complaint`, como en el resto de esquemas.
 * @returns {Yup.ObjectSchema} El esquema del envío
 */
export const complaintSchema = () =>
    Yup.object({
        type: Yup.string()
            .oneOf([...COMPLAINT_TYPES], 'complaint.typeRequired')
            .required('complaint.typeRequired'),

        affectedCommunityName: Yup.string().when('type', {
            is: 'SERVICE_QUALITY',
            then: (schema) =>
                schema
                    .trim()
                    .max(255, 'complaint.maxLength')
                    .required('complaint.affectedCommunityRequired'),
            otherwise: (schema) => schema.strip(),
        }),

        serviceDate: Yup.string().when('type', {
            is: 'SERVICE_QUALITY',
            then: (schema) =>
                schema
                    .matches(ISO_DATE, 'complaint.serviceDateRequired')
                    .required('complaint.serviceDateRequired'),
            otherwise: (schema) => schema.strip(),
        }),

        serviceDescription: Yup.string().when('type', {
            is: 'SERVICE_QUALITY',
            then: (schema) =>
                schema
                    .trim()
                    .max(5000, 'complaint.maxLength')
                    .required('complaint.serviceDescriptionRequired'),
            otherwise: (schema) => schema.strip(),
        }),

        incidentLocation: Yup.string().trim().max(255, 'complaint.maxLength'),

        reporterIsEmployee: Yup.boolean(),

        description: Yup.string()
            .trim()
            .max(5000, 'complaint.maxLength')
            .required('complaint.descriptionRequired'),

        isAnonymous: Yup.boolean().required('common.required'),

        contactName: Yup.string().when('isAnonymous', {
            is: false,
            then: (schema) =>
                schema.trim().max(255, 'complaint.maxLength').required('complaint.contactNameRequired'),
            otherwise: (schema) => schema.strip(),
        }),

        contactEmail: Yup.string().when('isAnonymous', {
            is: false,
            then: (schema) =>
                schema
                    .trim()
                    .email('complaint.emailInvalid')
                    .max(320, 'complaint.maxLength')
                    .required('complaint.contactEmailRequired'),
            otherwise: (schema) => schema.strip(),
        }),

        privacyNoticeVersion: Yup.string().trim().max(50, 'complaint.maxLength').required('common.required'),

        privacyNoticeAcknowledged: Yup.boolean()
            .oneOf([true], 'complaint.privacyRequired')
            .required('complaint.privacyRequired'),

        captchaToken: Yup.string().trim().max(4096, 'common.invalid'),

        honeypot: Yup.string(),
    });
