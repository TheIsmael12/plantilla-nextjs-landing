import { useTranslations } from 'next-intl';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * Cabecera de la ficha de una oferta: referencia, título y resumen. Nada más.
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
            <div className="careers__container">
                <p className="careers__detail-reference">
                    {t('detail.reference')}: {job.jobCode}
                </p>

                <h1 className="careers__detail-title">{job.title}</h1>
                <p className="careers__detail-summary">{job.summary}</p>
            </div>
        </header>
    );
}
