import { useLocale, useTranslations } from 'next-intl';
import { BriefcaseIcon, ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import { formatJobSalary } from '@/utils/careersFormatUtils';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Cabecera de la ficha de una oferta: título, condiciones y el botón de presentarse.
 *
 * El aviso de proceso en pausa va aquí arriba y no junto al formulario: quien llega a la ficha necesita saber
 * antes de leerse la oferta entera que ahora mismo no puede presentarse.
 * @param {JobDetailHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} La cabecera renderizada
 */
export default function JobDetailHeader({ job }: JobDetailHeaderProps) {
    const t = useTranslations('Careers');
    const locale = useLocale();

    const cities = job.locations.map((location) => location.name).join(' · ');
    const salary = formatJobSalary(job.salary, locale);

    return (
        <header className="careers__detail-header">
            <div className="careers__container">
                <p className="careers__detail-reference">
                    {t('detail.reference')}: {job.jobCode}
                </p>

                <h1 className="careers__detail-title">{job.title}</h1>
                <p className="careers__detail-summary">{job.summary}</p>

                <ul className="careers__detail-meta">
                    {cities && (
                        <li>
                            <MapPinIcon size={18} aria-hidden="true" />
                            {cities}
                        </li>
                    )}
                    <li>
                        <BriefcaseIcon size={18} aria-hidden="true" />
                        {job.contractTypeName} · {t(`WorkMode.${job.workMode}`)}
                    </li>
                    <li>
                        <ClockIcon size={18} aria-hidden="true" />
                        {job.scheduleName}
                    </li>
                    <li>
                        <UsersIcon size={18} aria-hidden="true" />
                        {t('card.vacancies', { count: job.vacancies })}
                    </li>
                </ul>

                <p className="careers__detail-salary">
                    {salary && job.salary
                        ? `${
                              salary.max
                                  ? t('card.salaryRange', { min: salary.min, max: salary.max })
                                  : t('card.salaryFrom', { min: salary.min })
                          } ${t(`SalaryPeriod.${job.salary.period}`)}`
                        : t('card.salaryHidden')}
                </p>

                {!job.acceptingApplications && !job.applyUrl && (
                    <p className="careers__notice">{t('detail.pausedNotice')}</p>
                )}

                {job.applyUrl ? (
                    <a
                        href={job.applyUrl}
                        className="careers__button"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('detail.applyExternal')}
                    </a>
                ) : (
                    /*
                      Ancla dentro de la misma página, no una ruta: un `<a>` normal es exactamente lo que
                      hace falta, y `Link` de next-intl solo acepta rutas del catálogo.
                    */
                    job.acceptingApplications && (
                        <a href="#candidatura" className="careers__button">
                            {t('detail.apply')}
                        </a>
                    )
                )}
            </div>
        </header>
    );
}
