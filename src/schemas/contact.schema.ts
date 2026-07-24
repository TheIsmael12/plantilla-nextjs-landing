import * as Yup from 'yup';

// Mensajes como claves de `Validations` (no texto ya traducido): `Input`
// resuelve `error` internamente contra ese namespace, igual que hace con
// `OtpInput`/`Select`/`SelectSearch`/`DatePicker`/`DateRangePicker`.
export const contactSchema = () =>
    Yup.object({
        name: Yup.string()
            .trim()
            .required('contact.nameRequired'),

        email: Yup.string()
            .trim()
            .email('contact.emailInvalid')
            .required('contact.emailRequired'),

        subject: Yup.string()
            .trim()
            .required('contact.subjectRequired'),

        message: Yup.string()
            .trim()
            .min(10, 'contact.messageMin')
            .required('contact.messageRequired'),
    });
