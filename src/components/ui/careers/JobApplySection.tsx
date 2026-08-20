'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { submitJobApplication } from '@/actions/careers/careers-actions';

import JobApplyForm from '@/components/ui/careers/JobApplyForm';

import { PRIVACY_NOTICE_VERSION } from '@/config/settings';

import { isErrorStatus } from '@/utils/httpStatusUtils';

/**
 * Envío de una candidatura: el estado y la llamada a la API alrededor de {@link JobApplyForm}.
 *
 * Existe por el mismo reparto que en el formulario de contacto —donde esto vive en `ContactViewPage`—: el
 * formulario valida y entrega los valores, y quien lo usa se encarga del envío, del estado de carga, del
 * error y de la confirmación. Aquí hace falta un componente aparte porque las vistas de empleo son Server
 * Components a propósito (el listado y la ficha tienen que salir ya pintados en el HTML), así que la parte
 * de cliente se queda en esta capa fina en vez de arrastrar la página entera al cliente.
 *
 * También es donde se traduce el formulario a lo que espera la API: los valores se recortan y la versión de
 * la información de privacidad se pone aquí, porque es un dato del despliegue y no algo que el usuario
 * rellene.
 * @param {JobApplySectionProps} props - Oferta, ciudades, si la bolsa de talento es obligatoria y si el título lo pone quien contiene
 * @returns {JSX.Element} El formulario con su estado
 */
export default function JobApplySection({
    jobCode,
    cities,
    requireTalentPool = false,
    hideHeader = false,
}: JobApplySectionProps) {
    const t = useTranslations('Careers.form');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    /**
     * Manda la candidatura y refleja el resultado.
     *
     * La API responde `201` **también** cuando descarta el envío por spam, así que un envío «aceptado» aquí
     * no garantiza que se haya guardado: es a propósito, y el mismo criterio que el formulario de contacto.
     * @param {JobApplicationFormValues} values - Valores ya validados por Yup
     * @param {string} [captchaToken] - Token de Turnstile, si el widget está activo y se resolvió
     * @returns {Promise<void>} Se resuelve al terminar el intento
     */
    async function handleSubmit(values: JobApplicationFormValues, captchaToken?: string) {
        // Yup ya garantiza que el CV es un PDF de tamaño válido; esto solo estrecha el tipo.
        if (!values.cv) return;

        setLoading(true);
        setError(undefined);

        const response = await submitJobApplication({
            jobCode,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim() || undefined,
            citySlug: values.citySlug || undefined,
            coverLetter: values.coverLetter.trim() || undefined,
            linkedinUrl: values.linkedinUrl.trim() || undefined,
            cv: values.cv,
            privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
            privacyNoticeAcknowledged: values.privacyNoticeAcknowledged,
            talentPoolConsent: values.talentPoolConsent,
            captchaToken,
            honeypot: values.honeypot || undefined,
        });

        setLoading(false);

        if (isErrorStatus(response.status)) {
            setError(response.message || t('error'));
            return;
        }

        setSuccess(true);
    }

    return (
        <JobApplyForm
            jobCode={jobCode}
            cities={cities}
            requireTalentPool={requireTalentPool}
            onSubmit={handleSubmit}
            loading={loading}
            success={success}
            error={error}
            hideHeader={hideHeader}
        />
    );
}
