import * as Yup from 'yup';

const URL_REGEX = /^https?:\/\/.+/;

/**
 * Tamaño y tipo del CV, comprobados en cliente **antes** de subir.
 *
 * Los mismos valores que el backend (`CAREERS_MAX_CV_MB` y `CAREERS_ALLOWED_CV_TYPES`), y no por
 * duplicar reglas: dejar que se suban 20 MB para que el servidor los rechace es gastar la conexión de quien
 * se presenta, que muchas veces está en el móvil.
 */
const MAX_CV_BYTES = 5 * 1024 * 1024;
const ACCEPTED_CV_TYPES = ['application/pdf'];

/**
 * Esquema del formulario de candidatura (requisitos-empleo.md, sección 4.2).
 *
 * Los mensajes son claves del namespace `Validations`, igual que en el resto del landing: `Input` las
 * resuelve por su cuenta.
 *
 * Lo que **no** valida es tan importante como lo que valida: no hay fotografía, ni fecha de nacimiento, ni
 * nacionalidad, ni DNI. No es que no se validen: es que no existen en el formulario (ver 8.3 del documento
 * del backend).
 * @returns {Yup.ObjectSchema} El esquema del formulario
 */
export const jobApplicationSchema = () =>
    Yup.object({
        firstName: Yup.string()
            .trim()
            .max(80, 'careers.maxLength')
            .required('careers.firstNameRequired'),

        lastName: Yup.string()
            .trim()
            .max(80, 'careers.maxLength')
            .required('careers.lastNameRequired'),

        email: Yup.string()
            .trim()
            .email('careers.emailInvalid')
            .max(254, 'careers.maxLength')
            .required('careers.emailRequired'),

        phone: Yup.string().trim().max(30, 'careers.maxLength'),

        citySlug: Yup.string().trim(),

        coverLetter: Yup.string().trim().max(4000, 'careers.maxLength'),

        linkedinUrl: Yup.string()
            .trim()
            .matches(URL_REGEX, { message: 'careers.urlInvalid', excludeEmptyString: true })
            .max(500, 'careers.maxLength'),

        cv: Yup.mixed<File>()
            .required('careers.cvRequired')
            .test('cv-type', 'careers.cvType', (file) =>
                file instanceof File ? ACCEPTED_CV_TYPES.includes(file.type) : false,
            )
            .test('cv-size', 'careers.cvSize', (file) =>
                file instanceof File ? file.size <= MAX_CV_BYTES : false,
            ),

        // El backend exige que sea `true`, así que aquí también: sin esta confirmación no se ha informado a
        // nadie de nada, y el envío se rechazaría con un 400.
        privacyNoticeAcknowledged: Yup.boolean().oneOf([true], 'careers.privacyRequired'),

        // Sin `oneOf`: la bolsa de talento es opcional y **no viene marcada**. Solo es obligatoria en la
        // candidatura espontánea, y de eso se encarga la pantalla que no tiene oferta.
        talentPoolConsent: Yup.boolean(),

        honeypot: Yup.string(),
    });
