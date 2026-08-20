import { useLocale, useTranslations } from 'next-intl';
import { BriefcaseIcon, ClockIcon, MapPinIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import { formatJobSalary } from '@/utils/careersFormatUtils';

import '@/styles/04-components/careers/careersCard.scss';

/** Días transcurridos desde una fecha, en días completos. */
function daysSince(date: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
}

/**
 * Tarjeta de una oferta en el listado.
 *
 * **El título es el único enlace de la tarjeta**, y toda la superficie es pulsable extendiendo su área con
 * `::after` desde el CSS. No es un detalle de estilo: una tarjeta con enlaces anidados es un problema de
 * accesibilidad y ya causó un fallo real de anchors duplicados en esta web (requisitos-seo.md, §23).
 *
 * Sin logotipo: todas las ofertas son de la misma empresa, y repetir la marca doce veces solo quita sitio.
 * @param {JobCardProps} props - Propiedades de la tarjeta
 * @returns {JSX.Element} La tarjeta renderizada
 */
export default function JobCard({ job }: JobCardProps) {
    const t = useTranslations('Careers');
    const locale = useLocale();

    const cities = job.locations.map((location) => location.name).join(' · ');
    const salary = formatJobSalary(job.salary, locale);

    return (
        <article
            className={`careers__card${job.isFeatured ? ' careers__card--featured' : ''}`}
        >
            <div className="careers__card-tags">
                {job.isFeatured && <span className="careers__tag">{t('card.featured')}</span>}
                {!job.acceptingApplications && (
                    <span className="careers__tag careers__tag--muted">{t('card.paused')}</span>
                )}
            </div>

            <h3 className="careers__card-title">
                <Link href={{ pathname: '/careers/[slug]', params: { slug: job.slug } }}>
                    {job.title}
                </Link>
            </h3>

            <p className="careers__card-summary">{job.summary}</p>

            <ul className="careers__card-meta">
                {cities && (
                    <li>
                        <MapPinIcon size={16} aria-hidden="true" />
                        {cities}
                    </li>
                )}
                <li>
                    <BriefcaseIcon size={16} aria-hidden="true" />
                    {job.contractTypeName} · {t(`WorkMode.${job.workMode}`)}
                </li>
                <li>
                    <ClockIcon size={16} aria-hidden="true" />
                    {job.scheduleName}
                </li>
            </ul>

            <p className="careers__card-salary">
                {salary
                    ? salary.max
                        ? t('card.salaryRange', { min: salary.min, max: salary.max })
                        : t('card.salaryFrom', { min: salary.min })
                    : t('card.salaryHidden')}
                {salary && job.salary && ` ${t(`SalaryPeriod.${job.salary.period}`)}`}
            </p>

            <p className="careers__card-date">
                {t('card.publishedAgo', { days: daysSince(job.publishedAt) })}
            </p>
        </article>
    );
}
