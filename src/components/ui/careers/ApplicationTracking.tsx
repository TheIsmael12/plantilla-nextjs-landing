'use client';

import { useState } from 'react';

import { useFormatter, useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';

import { withdrawApplication } from '@/actions/careers/careers-actions';

import Button from '@/components/ui/buttons/Button';

import { isErrorStatus } from '@/utils/httpStatusUtils';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Estado de una candidatura, con la opción de retirarla.
 *
 * Retirarse **es** el derecho de supresión, así que está aquí y no detrás de un correo a nadie: obligar a
 * escribir para ejercerlo funciona en la práctica como una barrera.
 *
 * La confirmación dice lo que pasa de verdad —se retira la candidatura y **se borra el CV**— y la palabra
 * «irreversible» aparece antes de pulsar, no después.
 * @param {ApplicationTrackingProps} props - Propiedades del componente
 * @returns {JSX.Element} El estado de la candidatura renderizado
 */
export default function ApplicationTracking({ application, token }: ApplicationTrackingProps) {
    const t = useTranslations('Careers.tracking');
    const format = useFormatter();

    const [isConfirming, setIsConfirming] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isWithdrawn, setIsWithdrawn] = useState(application.status === 'WITHDRAWN');
    const [error, setError] = useState<string | undefined>(undefined);

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setError(undefined);

        const response = await withdrawApplication(token);
        setIsWithdrawing(false);

        if (isErrorStatus(response.status)) {
            setError(response.message);
            return;
        }

        setIsConfirming(false);
        setIsWithdrawn(true);
    };

    if (isWithdrawn) {
        return (
            <div className="careers__tracking careers__tracking--done">
                <CheckCircle aria-hidden="true" />
                <h2>{t('withdrawnTitle')}</h2>
                <p>{t('withdrawnText')}</p>
            </div>
        );
    }

    return (
        <div className="careers__tracking">
            <h1>{t('title')}</h1>

            <dl className="careers__tracking-data">
                <dt>{t('reference')}</dt>
                <dd>{application.applicationCode}</dd>

                {application.jobTitle && (
                    <>
                        <dt>{t('job')}</dt>
                        <dd>{application.jobTitle}</dd>
                    </>
                )}

                <dt>{t('status')}</dt>
                <dd>{t(`Status.${application.status}`)}</dd>

                {application.rejectionReason && (
                    <>
                        <dt>{t('reason')}</dt>
                        <dd>{application.rejectionReason}</dd>
                    </>
                )}

                <dt>{t('submitted')}</dt>
                <dd>{format.dateTime(new Date(application.submittedAt), { dateStyle: 'long' })}</dd>

                <dt>{t('lastChange')}</dt>
                <dd>{format.dateTime(new Date(application.statusChangedAt), { dateStyle: 'long' })}</dd>
            </dl>

            <p className="careers__form-hint">
                {application.talentPoolConsent ? t('talentPool') : t('noTalentPool')}
            </p>

            {error && <p className="careers__form-error">{error}</p>}

            {isConfirming ? (
                <div className="careers__tracking-confirm">
                    <h2>{t('withdrawTitle')}</h2>
                    <p>{t('withdrawText')}</p>

                    <div className="careers__tracking-actions">
                        <Button variant="danger" disabled={isWithdrawing} onClick={handleWithdraw}>
                            {isWithdrawing ? t('withdrawing') : t('withdrawConfirm')}
                        </Button>

                        <Button disabled={isWithdrawing} onClick={() => setIsConfirming(false)}>
                            {t('withdrawCancel')}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button variant="danger" onClick={() => setIsConfirming(true)}>
                    {t('withdraw')}
                </Button>
            )}
        </div>
    );
}
