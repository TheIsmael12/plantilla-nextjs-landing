'use client';

import { useTranslations } from 'next-intl';

import JobApplySection from '@/components/ui/careers/JobApplySection';
import ModalComponent from '@/components/ui/modals/ModalComponent';

/**
 * El formulario de candidatura, a pantalla completa.
 *
 * Se abre desde el botón de la columna de datos ({@link JobDetailAside}) en vez de vivir dentro de la
 * página, y son dos cosas distintas: la ficha se lee, la candidatura se rellena. Con el formulario metido en
 * la propia página, nueve campos y un fichero empujaban la descripción de la oferta fuera de la pantalla
 * justo cuando alguien está decidiendo si le interesa.
 *
 * Es un modal **sin pie propio**: los botones de avanzar, volver y enviar son los del asistente, que es
 * quien sabe en qué paso está. El modal solo aporta la capa, el título y la salida.
 * @param {JobApplyModalProps} props - Oferta, ciudades y estado de apertura
 * @returns {JSX.Element} El modal renderizado
 */
export default function JobApplyModal({ jobCode, cities, isOpen, onClose }: JobApplyModalProps) {
    const t = useTranslations('Careers.detail');

    return (
        <ModalComponent title={t('applyModalTitle')} isOpen={isOpen} onClose={onClose} isFull>
            <JobApplySection jobCode={jobCode} cities={cities} />
        </ModalComponent>
    );
}
