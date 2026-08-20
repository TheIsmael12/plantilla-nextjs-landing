import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersBase.scss';

/** Cuántas ciudades se enseñan por defecto: las que más ofertas tienen. */
const DEFAULT_LIMIT = 8;

/**
 * Accesos rápidos por ciudad.
 *
 * Son **enlaces a las páginas de ciudad**, no filtros: es el enlazado interno que hace que esas páginas
 * existan para un buscador. Un filtro en la query no las enlaza con nada.
 * @param {JobCityLinksProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Los accesos, o `null` si no hay ninguna ciudad con ofertas
 */
export default function JobCityLinks({ cities, limit = DEFAULT_LIMIT }: JobCityLinksProps) {
    const t = useTranslations('Careers.cities');

    if (cities.length === 0) return null;

    return (
        <section className="careers__cities">
            <h2 className="careers__cities-title">{t('title')}</h2>
            <p className="careers__cities-subtitle">{t('subtitle')}</p>

            <ul className="careers__cities-list">
                {cities.slice(0, limit).map((city) => (
                    <li key={city.slug}>
                        <Link
                            href={{ pathname: '/careers/cities/[city]', params: { city: city.slug } }}
                            className="careers__chip"
                        >
                            {city.name} <span className="careers__chip-count">{city.count}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
