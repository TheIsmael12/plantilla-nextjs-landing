import * as Yup from 'yup';

import {
    CONTACT_PROFILES,
    MAX_MANAGED_PROPERTIES,
    PROPERTY_MANAGER_PROFILE,
    SERVICE_INTERESTS,
    TIMEFRAMES,
} from '@/config/leadQualification';
import { ZONES } from '@/config/zones';

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

        /*
         * Cualificación (sección 7.2.1 del documento de leads). Los cinco son **opcionales**: se piden
         * para atender mejor, no para dejar preguntar, y un formulario de contacto con cinco respuestas
         * obligatorias es gente que se va.
         *
         * Lo que sí se valida es que lo elegido esté entre las opciones. No es desconfianza del
         * desplegable: el backend rechaza con un 400 cualquier valor que no sea de su enum, y sin esta
         * comprobación ese rechazo llegaría como «no se ha podido enviar tu mensaje», sin decir qué campo.
         * La cadena vacía se admite en todos porque es «no ha contestado».
         */
        contactProfile: Yup.string().oneOf(
            ['', ...CONTACT_PROFILES],
            'contact.invalidOption',
        ),

        serviceInterest: Yup.string().oneOf(
            ['', ...SERVICE_INTERESTS],
            'contact.invalidOption',
        ),

        zone: Yup.string().oneOf(
            ['', ...ZONES.map((item) => item.slug)],
            'contact.invalidOption',
        ),

        timeframe: Yup.string().oneOf(['', ...TIMEFRAMES], 'contact.invalidOption'),

        /*
         * El número de fincas solo se valida —y solo se manda— cuando el perfil es administrador.
         *
         * El `when` no está por elegancia: el campo se queda montado con lo último escrito si
         * alguien elige «administrador», teclea un número y cambia de perfil, y sin esto ese resto
         * bloquearía el envío por un campo que ya no se ve. Con el perfil cambiado deja de validarse, y
         * el contenedor tampoco lo manda.
         */
        managedPropertiesCount: Yup.string().when('contactProfile', {
            is: PROPERTY_MANAGER_PROFILE,
            then: (schema) =>
                schema.test(
                    'managed-properties-range',
                    'contact.invalidPropertiesCount',
                    (value) => {
                        if (!value) return true;

                        const parsed = Number(value);
                        return (
                            Number.isInteger(parsed) &&
                            parsed >= 1 &&
                            parsed <= MAX_MANAGED_PROPERTIES
                        );
                    },
                ),
            otherwise: (schema) => schema.strip(),
        }),

        privacyNoticeAcknowledged: Yup.boolean()
            .oneOf([true], 'contact.privacyRequired')
            .required('contact.privacyRequired'),

        marketingConsent: Yup.boolean().default(false),
        attributionConsent: Yup.boolean().default(false),

        honeypot: Yup.string(),
    });
