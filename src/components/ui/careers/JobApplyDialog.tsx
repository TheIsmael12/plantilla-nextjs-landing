'use client';

import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { useTranslations } from 'next-intl';
import { XIcon } from 'lucide-react';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOutsideClick } from '@/hooks/useOutsideClick';

import JobApplySection from '@/components/ui/careers/JobApplySection';

import '@/styles/04-components/careers/careersApplyDialog.scss';

/** Id del título, para que el `aria-labelledby` del diálogo y el `h2` no se puedan desincronizar. */
const TITLE_ID = 'job-apply-dialog-title';

/**
 * El diálogo de presentar candidatura, propio y no el modal genérico del sistema de diseño.
 *
 * Antes esto era `ModalComponent` con una variante `isFull` añadida solo para este caso. Funcionaba, pero
 * el modal genérico está pensado para una confirmación o un formulario corto, y aquí se notaba en tres
 * cosas concretas:
 *
 * - **Los pasos y los botones se iban con el scroll.** Todo el asistente vivía dentro del cuerpo
 *   desplazable, así que en el paso del CV —el más alto— desaparecían de la pantalla a la vez el indicador
 *   de en qué paso estás y el botón para pasar al siguiente. Aquí la fila de pasos se queda arriba y las
 *   acciones abajo, y solo se desplazan los campos.
 * - **Se perdía a qué oferta se estaba presentando.** El modal genérico lleva un título fijo, así que en
 *   cuanto tapaba la ficha ya no había forma de comprobar el puesto. Este lleva el título y la referencia
 *   de la oferta en su cabecera.
 * - **Un click fuera lo cerraba y se perdía todo lo escrito.** Aquí solo cierran la aspa y Escape
 *   (`closeOnOutsideClick` no existe en este diálogo): rellenar nueve campos y un fichero para perderlos por
 *   pulsar al lado es la clase de cosa que hace que alguien no se vuelva a presentar.
 *
 * Y el genérico se queda como estaba: la variante `modal--full` se ha quitado, porque este era su único uso.
 * @param {JobApplyDialogProps} props - Oferta, ciudades y estado de apertura
 * @returns {JSX.Element | null} El diálogo, o `null` si está cerrado
 */
export default function JobApplyDialog({
    jobCode,
    jobTitle,
    cities,
    isOpen,
    onClose,
}: JobApplyDialogProps) {
    const t = useTranslations('Careers.detail');
    const tButtons = useTranslations('Buttons');

    const dialogRef = useRef<HTMLDivElement | null>(null);

    useFocusTrap<HTMLDivElement>({ isActive: isOpen, onEscape: onClose, ref: dialogRef });

    /*
     * `useOutsideClick` **solo** para bloquear el scroll de la página, con `onOutsideClick` vacío.
     *
     * Es el hook que sabe restaurar el scroll al desmontar, y duplicar ese manejo aquí es la forma de
     * dejarse el `overflow` del `body` puesto al cerrar. Que el click fuera no cierre es lo que se quiere:
     * ver el comentario del componente.
     */
    useOutsideClick(dialogRef, {
        onOutsideClick: () => undefined,
        isActive: isOpen,
        lockScroll: true,
    });

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="careers__dialog-overlay" />

            <div
                ref={dialogRef}
                className="careers__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={TITLE_ID}
            >
                <header className="careers__dialog-header">
                    <div className="careers__dialog-heading">
                        <h2 id={TITLE_ID} className="careers__dialog-title">
                            {t('applyModalTitle')}
                        </h2>

                        {/*
                          A qué oferta. Es lo único que este diálogo añade al formulario, y es justo lo que
                          faltaba: con la ficha tapada, «Presentar candidatura» a secas no dice a qué puesto.
                        */}
                        <p className="careers__dialog-subtitle">
                            {jobTitle} · <code>{jobCode}</code>
                        </p>
                    </div>

                    <button
                        type="button"
                        className="careers__dialog-close"
                        onClick={onClose}
                        aria-label={tButtons('close')}
                    >
                        <XIcon size={20} aria-hidden="true" />
                    </button>
                </header>

                <JobApplySection jobCode={jobCode} cities={cities} hideHeader />
            </div>
        </>,
        document.body,
    );
}
