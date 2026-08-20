import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useTranslations } from 'next-intl';
import { CheckIcon } from 'lucide-react';

import { Link, type AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Cuerpo de la ficha de una oferta.
 *
 * Los tres bloques van con su propio encabezado —qué vas a hacer, qué pedimos, qué suma— porque son las tres
 * preguntas que alguien busca al leer una oferta, y separar «se pide» de «suma» reduce el número de personas
 * válidas que se autodescartan.
 *
 * El Markdown se renderiza sin `rehype-raw`, igual que el del blog: así el HTML embebido no se ejecuta, y el
 * contenido queda saneado sin pasos adicionales.
 * @param {JobDetailBodyProps} props - Propiedades del componente
 * @returns {JSX.Element} El cuerpo renderizado
 */
export default function JobDetailBody({ job }: JobDetailBodyProps) {
    const t = useTranslations('Careers.detail');
    const tCities = useTranslations('Careers.cities');

    const sections = [
        { key: 'description', body: job.description, title: null },
        { key: 'responsibilities', body: job.responsibilities, title: t('responsibilities') },
        { key: 'requirements', body: job.requirements, title: t('requirements') },
        { key: 'niceToHave', body: job.niceToHave, title: t('niceToHave') },
    ].filter((section) => !!section.body);

    return (
        <div className="careers__detail-body">
            {sections.map((section) => (
                <section key={section.key} className="careers__detail-section">
                    {section.title && <h2>{section.title}</h2>}
                    <div className="careers__prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                    </div>
                </section>
            ))}

            {job.benefits.length > 0 && (
                <section className="careers__detail-section">
                    <h2>{t('benefits')}</h2>
                    <ul className="careers__benefits">
                        {job.benefits.map((benefit) => (
                            <li key={benefit}>
                                <CheckIcon size={18} aria-hidden="true" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/*
              Enlace a la página de zona de servicios de cada ciudad, cuando existe: es enlazado interno entre
              dos secciones que hablan del mismo municipio, y lo pide el requisito de SEO (§5.5).
            */}
            {job.locations.some((location) => location.zoneSlug) && (
                <section className="careers__detail-section">
                    <ul className="careers__detail-links">
                        {job.locations
                            .filter((location) => location.zoneSlug)
                            .map((location) => (
                                <li key={location.slug}>
                                    {/*
                                      Las páginas de zona no son una ruta dinámica: hay una entrada estática
                                      por municipio en `config/pathnames.ts`. Se construye el href a mano con
                                      el mismo `as AnyHref` que ya usa `ZoneNearby`, porque el tipo no puede
                                      saber en compilación qué zona trae la oferta.
                                    */}
                                    <Link href={`/zones/${location.zoneSlug}` as AnyHref}>
                                        {tCities('seeServices', { city: location.name })}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
