import { useTranslations } from 'next-intl';
import { BriefcaseIcon } from 'lucide-react';

import { Link, type AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersBase.scss';

/**
 * Estado vacío del buscador de empleo.
 *
 * Distingue los dos casos porque son dos cosas distintas: **no hay ofertas** (y entonces la salida es dejar
 * una candidatura espontánea) o **los filtros no encajan con nada** (y entonces la salida es quitarlos).
 * Enseñar el mismo texto en los dos deja a la gente sin saber qué hacer.
 * @param {JobEmptyStateProps} props - Propiedades del componente
 * @returns {JSX.Element} El estado vacío renderizado
 */
export default function JobEmptyState({ hasFilters }: JobEmptyStateProps) {
    const t = useTranslations('Careers.empty');

    return (
        <div className="careers__empty">
            <BriefcaseIcon size={40} aria-hidden="true" />

            <h2 className="careers__empty-title">{hasFilters ? t('noResults') : t('noJobs')}</h2>
            <p className="careers__empty-text">{hasFilters ? t('noResultsText') : t('noJobsText')}</p>

            {hasFilters ? (
                <Link href="/careers" className="careers__button">
                    {t('clearFilters')}
                </Link>
            ) : (
                <Link
                    href={{ pathname: '/careers', query: { spontaneous: 'true' } } as AnyHref}
                    className="careers__button"
                >
                    {t('spontaneous')}
                </Link>
            )}
        </div>
    );
}
