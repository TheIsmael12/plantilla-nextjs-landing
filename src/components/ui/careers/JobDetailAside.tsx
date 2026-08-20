'use client';

import { useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import {
    BriefcaseIcon,
    ClockIcon,
    ExternalLinkIcon,
    MapPinIcon,
    SendIcon,
    UsersIcon,
} from 'lucide-react';

import Button from '@/components/ui/buttons/Button';
import Alert from '@/components/ui/alerts/Alert';
import JobApplyModal from '@/components/ui/careers/JobApplyModal';

import { formatJobSalary } from '@/utils/careersFormatUtils';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Columna derecha de la ficha: las condiciones del puesto y el botón de presentarse.
 *
 * Los datos van juntos y a la derecha porque son los que se comparan —ciudad, contrato, jornada, salario— y
 * se leen de un vistazo mientras el cuerpo de la oferta se lee de arriba abajo a la izquierda. El botón va
 * **debajo de los datos**, que es donde termina esa lectura: quien ya ha visto el salario y la ciudad es
 * quien está listo para presentarse.
 *
 * El formulario no vive aquí: se abre en un modal a pantalla completa con sus pasos ({@link JobApplyModal}).
 * Así la ficha se puede leer entera sin un formulario de nueve campos empujando el contenido.
 * @param {JobDetailAsideProps} props - La oferta y las ciudades del selector
 * @returns {JSX.Element} La columna renderizada
 */
export default function JobDetailAside({ job, cities }: JobDetailAsideProps) {
    const t = useTranslations('Careers');
    const locale = useLocale();

    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const salary = formatJobSalary(job.salary, locale);
    const canApply = job.acceptingApplications && !job.applyUrl;

    return (
        <aside className="careers__aside">
            <div className="careers__aside-card">
                <h2 className="careers__aside-title">{t('detail.conditions')}</h2>

                <dl className="careers__aside-data">
                    <dt>
                        <MapPinIcon size={16} aria-hidden="true" />
                        {t('filters.city')}
                    </dt>
                    <dd>{job.locations.map((location) => location.name).join(' · ')}</dd>

                    <dt>
                        <BriefcaseIcon size={16} aria-hidden="true" />
                        {t('filters.contract')}
                    </dt>
                    <dd>{job.contractTypeName}</dd>

                    <dt>
                        <ClockIcon size={16} aria-hidden="true" />
                        {t('filters.workMode')}
                    </dt>
                    <dd>
                        {job.scheduleName} · {t(`WorkMode.${job.workMode}`)}
                    </dd>

                    <dt>
                        <UsersIcon size={16} aria-hidden="true" />
                        {t('filters.experience')}
                    </dt>
                    <dd>{t(`Experience.${job.experienceLevel}`)}</dd>
                </dl>

                <p className="careers__aside-salary">
                    {salary && job.salary
                        ? `${
                              salary.max
                                  ? t('card.salaryRange', { min: salary.min, max: salary.max })
                                  : t('card.salaryFrom', { min: salary.min })
                          } ${t(`SalaryPeriod.${job.salary.period}`)}`
                        : t('card.salaryHidden')}
                </p>

                <p className="careers__aside-vacancies">
                    {t('card.vacancies', { count: job.vacancies })}
                </p>

                {/*
                  El número de candidaturas solo llega del backend a partir de un mínimo (cinco por
                  defecto), así que aquí basta comprobar que viene: por debajo de ese mínimo el dato no
                  existe, no es que se oculte.
                */}
                {typeof job.applicantCount === 'number' && (
                    <p className="careers__aside-applicants">
                        <UsersIcon size={16} aria-hidden="true" />
                        {t('detail.applicants', { count: job.applicantCount })}
                    </p>
                )}

                {!job.acceptingApplications && !job.applyUrl && (
                    <Alert type="info" message={t('detail.pausedNotice')} />
                )}

                {job.applyUrl ? (
                    <a
                        href={job.applyUrl}
                        className="careers__button"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLinkIcon size={18} aria-hidden="true" />
                        {t('detail.applyExternal')}
                    </a>
                ) : (
                    canApply && (
                        <Button variant="primary" onClick={() => setIsApplyOpen(true)}>
                            <SendIcon size={18} aria-hidden="true" />
                            {t('detail.apply')}
                        </Button>
                    )
                )}
            </div>

            {canApply && (
                <JobApplyModal
                    jobCode={job.jobCode}
                    cities={cities}
                    isOpen={isApplyOpen}
                    onClose={() => setIsApplyOpen(false)}
                />
            )}
        </aside>
    );
}
