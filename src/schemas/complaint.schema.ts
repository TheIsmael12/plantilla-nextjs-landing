import * as Yup from 'yup';

// Mismo criterio que `contact.schema.ts`: la obligatoriedad condicional replica exactamente lo
// que el backend exige en el servicio (no en el DTO), para no dejar pasar un envío que el
// backend rechazaría con 400, y sin ser más estricto que la fuente de verdad.
export const complaintSchema = () =>
    Yup.object({
        type: Yup.string()
            .oneOf(['SERVICE_QUALITY', 'ETHICS_COMPLIANCE'])
            .required('complaint.typeRequired'),

        // Solo obligatorios si type = SERVICE_QUALITY (requisitos-reclamaciones.md, sección 1.2).
        affectedCommunityName: Yup.string()
            .trim()
            .max(255, 'complaint.maxLength')
            .when('type', {
                is: 'SERVICE_QUALITY',
                then: (schema) => schema.required('complaint.affectedCommunityRequired'),
            }),

        serviceDate: Yup.string()
            .when('type', {
                is: 'SERVICE_QUALITY',
                then: (schema) => schema.required('complaint.serviceDateRequired'),
            }),

        serviceDescription: Yup.string()
            .trim()
            .max(5000, 'complaint.maxLength')
            .when('type', {
                is: 'SERVICE_QUALITY',
                then: (schema) => schema.required('complaint.serviceDescriptionRequired'),
            }),

        description: Yup.string()
            .trim()
            .max(5000, 'complaint.maxLength')
            .required('complaint.descriptionRequired'),

        isAnonymous: Yup.boolean().default(false),

        // Solo obligatorios si isAnonymous = false (sección 1.3): marcar "prefiero no
        // identificarme" limpia estos campos en el propio formulario (ver ComplaintForm.tsx),
        // así que aquí basta con condicionar sobre isAnonymous.
        contactName: Yup.string()
            .trim()
            .max(255, 'complaint.maxLength')
            .when('isAnonymous', {
                is: false,
                then: (schema) => schema.required('complaint.contactNameRequired'),
            }),

        contactEmail: Yup.string()
            .trim()
            .email('complaint.emailInvalid')
            .max(320, 'complaint.maxLength')
            .when('isAnonymous', {
                is: false,
                then: (schema) => schema.required('complaint.contactEmailRequired'),
            }),

        privacyNoticeAcknowledged: Yup.boolean()
            .oneOf([true], 'complaint.privacyRequired')
            .required('complaint.privacyRequired'),

        honeypot: Yup.string(),
    });
