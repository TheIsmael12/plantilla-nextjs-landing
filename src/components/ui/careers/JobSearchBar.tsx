'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';

import '@/styles/04-components/careers/careersSearch.scss';

/**
 * Buscador de empleo: texto libre y ciudad, los dos filtros que usa la gente de verdad.
 *
 * Los campos son los del sistema de diseño (`Input` y `Select`), no `<input>`/`<select>` a pelo: es lo que
 * hace que se vean, se enfoquen y se lean igual que los del formulario de contacto o los del área de
 * cliente, y que un cambio en el sistema de diseño llegue también aquí.
 *
 * Sigue siendo un `<form>` de verdad: al enviarlo, el navegador navega con los dos campos en la query y el
 * servidor devuelve la página ya filtrada. El texto viaja en un `input` normal y la ciudad en el `input`
 * oculto que pinta `Select`, así que el envío nativo lleva las dos cosas; lo que necesita JavaScript es
 * **abrir** el desplegable de ciudades, igual que en el resto de la web.
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
            <Input
                id="careers-search"
                name="search"
                type="search"
                label={t('label')}
                placeholder={t('placeholder')}
                noTranslate
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input__full"
            />

            <Select
                id="careers-city"
                name="citySlug"
                label={t('cityLabel')}
                placeholder={t('cityAll')}
                noTranslate
                value={city}
                onChange={setCity}
                options={[
                    { value: '', label: t('cityAll') },
                    ...cities.map((option) => ({
                        value: option.slug,
                        label: `${option.name} (${option.count})`,
                    })),
                ]}
                className="select__full"
            />

            <Button type="submit" variant="primary">
                <SearchIcon size={18} aria-hidden="true" />
                {t('submit')}
            </Button>
        </form>
    );
}
