import * as Yup from 'yup';

// Mensajes como claves de `Validations` (no texto ya traducido): `Input`
// resuelve `error` internamente contra ese namespace, igual que hace con
// `OtpInput`/`Select`/`SelectSearch`/`DatePicker`/`DateRangePicker`.
//
// El backend exige "email o teléfono" en el servicio (no en el DTO), así
// que se replica aquí con `.when` sobre ambos campos para no dejar pasar un
// envío que el backend rechazaría con 400. No se valida el formato del
// teléfono (solo su longitud): el propio backend tampoco lo hace más
// estricto que `Length(1, 16)`, y hacerlo aquí sería más restrictivo que la
// fuente de verdad.
export const contactSchema = () =>
    Yup.object({
        contactName: Yup.string()
            .trim()
            .max(255, 'contact.maxLength')
            .required('contact.nameRequired'),

        companyName: Yup.string()
            .trim()
            .max(255, 'contact.maxLength'),

        email: Yup.string()
            .trim()
            .email('contact.emailInvalid')
            .max(320, 'contact.maxLength')
            .when('phone', {
                is: (phone: string) => !phone,
                then: (schema) => schema.required('contact.emailOrPhoneRequired'),
            }),

        phone: Yup.string()
            .trim()
            .max(16, 'contact.maxLength'),

        message: Yup.string()
            .trim()
            .max(5000, 'contact.maxLength'),

        privacyNoticeAcknowledged: Yup.boolean()
            .oneOf([true], 'contact.privacyRequired')
            .required('contact.privacyRequired'),

        marketingConsent: Yup.boolean().default(false),
        attributionConsent: Yup.boolean().default(false),

        honeypot: Yup.string(),
    });
