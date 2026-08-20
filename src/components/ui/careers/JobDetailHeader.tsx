import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Cabecera de la ficha de una oferta: volver, familia profesional, título, resumen y la referencia.
 *
 * Sigue la forma que tienen las demás cabeceras de detalle de la web —la de un servicio, la de una zona—:
 * fondo `surface` con una línea inferior en vez de un degradado propio, enlace de volver al listado, la
 * píldora de categoría, el título y la descripción. Antes llevaba un degradado que no usa ninguna otra
 * página de detalle y no había forma de volver al buscador salvo el botón del navegador.
 *
 * Las condiciones del puesto —ciudad, contrato, jornada, salario— y el botón de presentarse **no** están
 * aquí: viven en la columna de datos de la derecha ({@link JobDetailAside}), que es donde se comparan de un
 * vistazo. La cabecera se queda con lo que identifica la oferta y lo que hace decidir si seguir leyendo.
 * @param {JobDetailHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} La cabecera renderizada
 */
export default function JobDetailHeader({ job }: JobDetailHeaderProps) {
    const t = useTranslations('Careers');

    return (
        <header className="careers__detail-header">
            <div className="careers__container careers__detail-header-inner">
                <Link href="/careers" className="careers__detail-back">
                    <ArrowLeft size={16} aria-hidden="true" />
                    {t('detail.back')}
                </Link>

                <p className="careers__detail-tag">{job.categoryName}</p>

                <h1 className="careers__detail-title">{job.title}</h1>
                <p className="careers__detail-summary">{job.summary}</p>

                {/*
                  La referencia debajo y en pequeño, no como antetítulo.

                  Es el dato con el que se llama por teléfono para preguntar por la oferta, así que tiene que
                  estar; pero encabezando la página ocupaba el sitio de lo que dice de qué va el puesto, que
                  es lo que decide si se sigue leyendo.
                */}
                <p className="careers__detail-reference">
                    {t('detail.reference')}: <code>{job.jobCode}</code>
                </p>
            </div>
        </header>
    );
}
