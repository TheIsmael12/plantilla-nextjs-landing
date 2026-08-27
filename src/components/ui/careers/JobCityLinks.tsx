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
export default function JobCityLinks({ cities, totalJobs, limit = DEFAULT_LIMIT }: JobCityLinksProps) {
    const t = useTranslations('Careers.cities');

    if (cities.length === 0) return null;

    /*
     * Si los recuentos por ciudad suman más que las ofertas que hay, **se puede leer mal**.
     *
     * Pasa con una sola oferta que cubre veinte municipios: cada ficha dice «1», y veinte fichas con un uno al lado
     * parecen veinte ofertas distintas. Los números son ciertos —en cada una de esas zonas hay una oferta a la que
     * optar— pero invitan a sumarlos, y sumarlos da un número que no existe.
     *
     * Se detecta comparando, y no fijando un caso concreto: en cuanto una oferta cubre varias zonas el aviso aparece
     * solo, y cuando cada oferta es de una sola ciudad no sobra ninguna línea.
     */
    const shown = cities.slice(0, limit);
    const isCountMisleading = cities.reduce((sum, city) => sum + city.count, 0) > totalJobs;

    return (
        <section className="careers__cities">
            <h2 className="careers__cities-title">{t('title')}</h2>
            <p className="careers__cities-subtitle">{t('subtitle')}</p>

            <ul className="careers__cities-list">
                {shown.map((city) => (
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

            {isCountMisleading && (
                <p className="careers__cities-note">{t('countNote', { total: totalJobs })}</p>
            )}
        </section>
    );
}
