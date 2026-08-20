'use client';

import { useState } from 'react';

import { useFormatter, useTranslations } from 'next-intl';
import { CalendarClockIcon, CheckCircle, HashIcon, BriefcaseIcon } from 'lucide-react';

import { withdrawApplication } from '@/actions/careers/careers-actions';

import { Link, type AnyHref } from '@/i18n/navigation';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Stepper from '@/components/ui/navigations/Stepper';

import { isErrorStatus } from '@/utils/httpStatusUtils';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Las fases por las que pasa una candidatura que sigue viva, en orden.
 *
 * `REJECTED` y `WITHDRAWN` no están: no son un paso más de la fila, son el final del camino, y pintarlos
 * como «paso 6» daría a entender que después hay algo.
 */
const PROGRESS: JobApplicationStatus[] = ['RECEIVED', 'IN_REVIEW', 'INTERVIEW', 'OFFER', 'HIRED'];

/** Color de la insignia según el estado: lo que se ve antes de leer nada. */
const STATUS_VARIANT: Record<JobApplicationStatus, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> =
    {
        RECEIVED: 'info',
        IN_REVIEW: 'info',
        INTERVIEW: 'warning',
        OFFER: 'warning',
        HIRED: 'success',
        REJECTED: 'danger',
        WITHDRAWN: 'neutral',
    };

/**
 * Estado de una candidatura, con la opción de retirarla.
 *
 * Enseña **en qué punto del proceso está** con la misma fila de pasos que usa el resto de la web, y no solo
 * el nombre del estado: «en revisión» no dice si eso es al principio o al final, y esa es justo la pregunta
 * de quien abre este enlace.
 *
 * Retirarse **es** el derecho de supresión, así que está aquí y no detrás de un correo a nadie: obligar a
 * escribir para ejercerlo funciona en la práctica como una barrera. Va en su propio bloque al final, separado
 * de los datos, para que nadie lo pulse por inercia; y la confirmación dice lo que pasa de verdad —se retira
 * la candidatura y **se borra el CV**— antes de pulsar, no después.
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

    const isRejected = application.status === 'REJECTED';
    const stepIndex = Math.max(0, PROGRESS.indexOf(application.status));
    const isClosed = isRejected || application.status === 'HIRED';

    return (
        <div className="careers__tracking">
            <header className="careers__tracking-header">
                <div>
                    <p className="careers__tracking-code">
                        <HashIcon size={14} aria-hidden="true" />
                        {application.applicationCode}
                    </p>
                    <h1>{t('title')}</h1>
                </div>

                <Badge
                    variant={STATUS_VARIANT[application.status]}
                    text={t(`Status.${application.status}`)}
                />
            </header>

            {/*
              La fila de pasos solo tiene sentido mientras el proceso sigue: un descarte no es «el paso
              siguiente», así que ahí se sustituye por el aviso con el motivo, cuando el motivo es de los que
              se pueden compartir.
            */}
            {isRejected ? (
                <Alert
                    type="info"
                    message={
                        application.rejectionReason
                            ? `${t('rejectedTitle')} ${application.rejectionReason}`
                            : t('rejectedTitle')
                    }
                />
            ) : (
                <Stepper
                    steps={PROGRESS.map((status) => ({ key: status, label: t(`Status.${status}`) }))}
                    currentIndex={stepIndex}
                    furthestIndex={stepIndex}
                />
            )}

            <dl className="careers__tracking-data">
                {application.jobTitle && (
                    <>
                        <dt>
                            <BriefcaseIcon size={15} aria-hidden="true" />
                            {t('job')}
                        </dt>
                        <dd>
                            {application.jobSlug ? (
                                <Link
                                    href={
                                        {
                                            pathname: '/careers/[slug]',
                                            params: { slug: application.jobSlug },
                                        } as AnyHref
                                    }
                                >
                                    {application.jobTitle}
                                </Link>
                            ) : (
                                application.jobTitle
                            )}
                        </dd>
                    </>
                )}

                <dt>
                    <CalendarClockIcon size={15} aria-hidden="true" />
                    {t('submitted')}
                </dt>
                <dd>{format.dateTime(new Date(application.submittedAt), { dateStyle: 'long' })}</dd>

                <dt>
                    <CalendarClockIcon size={15} aria-hidden="true" />
                    {t('lastChange')}
                </dt>
                <dd>
                    {format.dateTime(new Date(application.statusChangedAt), { dateStyle: 'long' })}
                </dd>
            </dl>

            <p className="careers__form-hint">
                {application.talentPoolConsent ? t('talentPool') : t('noTalentPool')}
            </p>

            {error && <p className="careers__form-error">{error}</p>}

            {/*
              Retirar sigue disponible con la candidatura descartada o cerrada: el derecho de supresión no
              depende de en qué punto esté el proceso, y es la única forma de que se borre el CV antes del
              plazo de conservación.
            */}
            <div className="careers__tracking-danger">
                <div>
                    <h2>{t('dangerTitle')}</h2>
                    <p>{isClosed ? t('withdrawClosedHint') : t('withdrawHint')}</p>
                </div>

                <Button variant="outline" onClick={() => setIsConfirming(true)}>
                    {t('withdraw')}
                </Button>
            </div>

            <ModalComponent
                title={t('withdrawTitle')}
                isOpen={isConfirming}
                isLoading={isWithdrawing}
                confirmVariant="danger"
                confirmText={t('withdrawConfirm')}
                cancelText={t('withdrawCancel')}
                isLoadingText={t('withdrawing')}
                onClose={() => setIsConfirming(false)}
                onCancel={() => setIsConfirming(false)}
                onConfirm={() => void handleWithdraw()}
                footerError={error}
            >
                <p>{t('withdrawText')}</p>
            </ModalComponent>
        </div>
    );
}
