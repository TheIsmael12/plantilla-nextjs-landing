'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersSearch.scss';

/**
 * Buscador de empleo: texto libre y ciudad, los dos filtros que usa la gente de verdad.
 *
 * Es un `<form>` de verdad y **funciona sin JavaScript**: al enviarlo, el navegador navega con los dos
 * campos en la query y el servidor devuelve la página ya filtrada. El `onSubmit` solo evita la recarga
 * completa cuando sí hay JavaScript.
 * @param {JobSearchBarProps} props - Propiedades del componente
 * @returns {JSX.Element} El buscador renderizado
 */
export default function JobSearchBar({ cities, activeSearch, activeCity }: JobSearchBarProps) {
    const t = useTranslations('Careers.search');

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [search, setSearch] = useState(activeSearch ?? '');
    const [city, setCity] = useState(activeCity ?? '');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');

        if (search.trim()) params.set('search', search.trim());
        else params.delete('search');

        params.delete('citySlug');
        if (city) params.append('citySlug', city);

        const query = params.toString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
        router.replace((query ? `${pathname}?${query}` : pathname) as any, { scroll: false });
    };

    return (
        <form className="careers__search" onSubmit={handleSubmit} role="search">
            <div className="careers__search-field">
                <label htmlFor="careers-search">{t('label')}</label>
                <div className="careers__search-input">
                    <SearchIcon size={18} aria-hidden="true" />
                    <input
                        id="careers-search"
                        name="search"
                        type="search"
                        placeholder={t('placeholder')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            <div className="careers__search-field">
                <label htmlFor="careers-city">{t('cityLabel')}</label>
                <select
                    id="careers-city"
                    name="citySlug"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                >
                    <option value="">{t('cityAll')}</option>
                    {cities.map((option) => (
                        <option key={option.slug} value={option.slug}>
                            {option.name} ({option.count})
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" className="careers__search-submit">
                {t('submit')}
            </button>
        </form>
    );
}
