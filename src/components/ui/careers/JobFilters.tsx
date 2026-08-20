'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontalIcon, XIcon } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersFilters.scss';

/** Claves de filtro que admiten varios valores a la vez. */
const MULTI_KEYS = ['citySlug'];

/**
 * Filtros del buscador de empleo.
 *
 * Cada cambio es una **navegación** a la misma ruta con la query actualizada, no un `setState`: así los
 * filtros son compartibles, sobreviven al recargar y al botón de atrás, y el listado lo pinta el servidor ya
 * filtrado. Se usa `replace` y `scroll: false` para no llenar el historial ni saltar al principio de la
 * página en cada clic.
 *
 * El panel se pinta siempre en el DOM y se abre y cierra por CSS en móvil: un panel que se monta al abrirlo
 * pierde el foco y deja el botón sin `aria-controls` al que apuntar.
 * @param {JobFiltersProps} props - Propiedades del componente
 * @returns {JSX.Element} Los filtros renderizados
 */
export default function JobFilters({ filters, activeFilters, resultCount }: JobFiltersProps) {
    const t = useTranslations('Careers.filters');
    const tCareers = useTranslations('Careers');

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);

    /**
     * Navega con un filtro puesto, quitado o alternado.
     * @param {string} key - Clave del filtro en la URL
     * @param {string} value - Valor a aplicar; vacío lo quita
     */
    const toggleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        // Cambiar cualquier filtro vuelve a la página 1: seguir en la 3 de un resultado que ya no existe es
        // la forma más rápida de ver una lista vacía sin entender por qué.
        params.delete('page');

        if (!value) {
            params.delete(key);
        } else if (MULTI_KEYS.includes(key)) {
            const current = params.getAll(key);
            params.delete(key);
            const next = current.includes(value)
                ? current.filter((entry) => entry !== value)
                : [...current, value];
            for (const entry of next) params.append(key, entry);
        } else {
            params.set(key, value);
        }

        const query = params.toString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
        router.replace((query ? `${pathname}?${query}` : pathname) as any, { scroll: false });
    };

    const clearAll = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- misma razón que arriba.
        router.replace(pathname as any, { scroll: false });
    };

    const isActive = (key: string, value: string): boolean => {
        const current = activeFilters[key];
        return Array.isArray(current) ? current.includes(value) : current === value;
    };

    const activeCount = Object.entries(activeFilters).filter(([, value]) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value),
    ).length;

    const groups: { key: string; label: string; options: PublicJobFacet[] }[] = [
        { key: 'citySlug', label: t('city'), options: filters.cities },
        { key: 'categorySlug', label: t('category'), options: filters.categories },
        { key: 'contractSlug', label: t('contract'), options: filters.contractTypes },
        {
            key: 'workMode',
            label: t('workMode'),
            options: filters.workModes.map((mode) => ({
                ...mode,
                name: tCareers(`WorkMode.${mode.slug}` as 'WorkMode.ON_SITE'),
            })),
        },
    ];

    return (
        <div className="careers__filters">
            <div className="careers__filters-bar">
                <button
                    type="button"
                    className="careers__filters-toggle"
                    aria-expanded={isOpen}
                    aria-controls="careers-filters-panel"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <SlidersHorizontalIcon size={18} aria-hidden="true" />
                    {isOpen ? t('close') : t('open')}
                    {activeCount > 0 && <span className="careers__filters-count">{activeCount}</span>}
                </button>

                {/*
                  El resultado se anuncia en una región viva: sin esto, con lector de pantalla el filtro
                  parece no hacer nada, porque lo único que cambia está más abajo en la página.
                */}
                <p className="careers__filters-results" aria-live="polite">
                    {t('results', { count: resultCount })}
                </p>
            </div>

            {activeCount > 0 && (
                <div className="careers__filters-applied">
                    <span className="careers__filters-applied-label">{t('applied')}</span>

                    {groups.flatMap((group) =>
                        group.options
                            .filter((option) => isActive(group.key, option.slug))
                            .map((option) => (
                                <button
                                    key={`${group.key}-${option.slug}`}
                                    type="button"
                                    className="careers__chip careers__chip--active"
                                    aria-label={t('remove')}
                                    onClick={() => toggleFilter(group.key, option.slug)}
                                >
                                    {option.name}
                                    <XIcon size={14} aria-hidden="true" />
                                </button>
                            )),
                    )}

                    <button type="button" className="careers__filters-clear" onClick={clearAll}>
                        {t('clear')}
                    </button>
                </div>
            )}

            <div
                id="careers-filters-panel"
                className={`careers__filters-panel${isOpen ? ' careers__filters-panel--open' : ''}`}
            >
                {groups.map((group) => (
                    <fieldset key={group.key} className="careers__filters-group">
                        <legend>{group.label}</legend>

                        <div className="careers__filters-options">
                            {group.options.map((option) => (
                                <button
                                    key={option.slug}
                                    type="button"
                                    className={`careers__chip${
                                        isActive(group.key, option.slug) ? ' careers__chip--active' : ''
                                    }`}
                                    aria-pressed={isActive(group.key, option.slug)}
                                    onClick={() => toggleFilter(group.key, option.slug)}
                                >
                                    {/* El contador va dentro de la etiqueta para que se lean juntos. */}
                                    {option.name} <span className="careers__chip-count">{option.count}</span>
                                </button>
                            ))}
                        </div>
                    </fieldset>
                ))}

                <fieldset className="careers__filters-group">
                    <legend>{t('experience')}</legend>

                    <div className="careers__filters-options">
                        <button
                            type="button"
                            className={`careers__chip${!activeFilters.experience ? ' careers__chip--active' : ''}`}
                            onClick={() => toggleFilter('experience', '')}
                        >
                            {t('experienceAny')}
                        </button>

                        {filters.experienceLevels.map((level) => (
                            <button
                                key={level.slug}
                                type="button"
                                className={`careers__chip${
                                    isActive('experience', level.slug) ? ' careers__chip--active' : ''
                                }`}
                                aria-pressed={isActive('experience', level.slug)}
                                onClick={() => toggleFilter('experience', level.slug)}
                            >
                                {tCareers(`Experience.${level.slug}` as 'Experience.NONE')}{' '}
                                <span className="careers__chip-count">{level.count}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>

                {/*
                  Filtrar por salario **esconde** las ofertas que no lo publican, y hay que decirlo: sin este
                  aviso el filtro parece decir que no hay ofertas mejor pagadas, cuando lo que pasa es que no
                  lo dicen.
                */}
                {activeFilters.salaryMin && <p className="careers__filters-hint">{t('salaryHint')}</p>}
            </div>
        </div>
    );
}
