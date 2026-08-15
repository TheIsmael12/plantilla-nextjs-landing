'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { submitComplaint } from '@/actions/complaints/complaints-actions';
import { PRIVACY_NOTICE_VERSION } from '@/config/settings';
import { isErrorStatus } from '@/utils/httpStatusUtils';

import ComplaintForm from '@/components/ui/complaints/ComplaintForm';

/**
 * Envoltorio cliente del formulario del canal de reclamaciones, montado dentro de
 * `ComplaintsChannelView.tsx` (Server Component). Gestiona el ciclo de envío
 * (`loading`/`success`/`formError`) delegando la validación en `ComplaintForm` y el envío real
 * en `submitComplaint` (`POST /public/complaints`) — mismo patrón que `ContactViewPage.tsx` con
 * `ContactForm`.
 * @returns {JSX.Element} La sección del formulario renderizada
 */
export default function ComplaintsChannelFormSection() {
    const t = useTranslations('Complaints.form');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();

    /**
     * Envía los datos del formulario al backend y actualiza el estado de carga/éxito/error. El
     * honeypot y el captcha no cambian el flujo visible: el backend responde `201` igual si
     * descarta el envío en silencio (anti-enumeración), así que un envío "aceptado" aquí no
     * garantiza que se haya creado una reclamación real.
     * @param {ComplaintFormValues} values - Valores validados del formulario
     * @param {string} [captchaToken] - Token de Turnstile, si el widget está activo y se resolvió
     * @returns {Promise<void>} Se resuelve cuando finaliza el intento de envío
     */
    async function handleSubmit(values: ComplaintFormValues, captchaToken?: string) {
        setLoading(true);
        setFormError(undefined);

        const isServiceQuality = values.type === 'SERVICE_QUALITY';

        const response = await submitComplaint({
            type: values.type as 'SERVICE_QUALITY' | 'ETHICS_COMPLIANCE',
            affectedCommunityName: isServiceQuality ? values.affectedCommunityName : undefined,
            serviceDate: isServiceQuality ? values.serviceDate : undefined,
            serviceDescription: isServiceQuality ? values.serviceDescription : undefined,
            description: values.description,
            isAnonymous: values.isAnonymous,
            contactName: values.isAnonymous ? undefined : values.contactName || undefined,
            contactEmail: values.isAnonymous ? undefined : values.contactEmail || undefined,
            privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
            privacyNoticeAcknowledged: values.privacyNoticeAcknowledged,
            captchaToken,
            honeypot: values.honeypot || undefined,
        });

        setLoading(false);

        if (isErrorStatus(response.status)) {
            setFormError(response.message || t('error'));
            return;
        }

        setSuccess(true);
    }

    return (
        <ComplaintForm
            loading={loading}
            success={success}
            error={formError}
            onSubmit={handleSubmit}
        />
    );
}
