"use client";

import "@/styles/04-components/ui/modals/modal.scss";

import { useRef } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useOutsideClick } from "@/hooks/useOutsideClick";

import Button from "@/components/ui/buttons/Button";

import { Form, Formik, FormikValues } from "formik";

import type { FormikRenderProps, ModalProps } from "@/types/ui/modals/modal";

import { XIcon } from "lucide-react";

export type { FormikRenderProps, ModalProps };

/**
 * Modal genérico del sistema de diseño: confirmaciones simples (`onConfirm`/`onCancel`),
 * contenido estático, o un formulario Formik completo cuando se indican
 * `initialValues` + `onSubmit` (en cuyo caso `children` puede ser una render-function
 * que recibe {@link FormikRenderProps}).
 * @template T - Forma de los valores del formulario cuando el modal actúa como formulario
 * @param {ModalProps<T>} props - Propiedades del modal
 * @returns {JSX.Element | null} El modal (vía `createPortal`) o `null` si `isOpen` es `false`
 */
export default function ModalComponent<T extends FormikValues = FormikValues>({
  title,
  isOpen,
  closeOnOutsideClick = true,
  isLoading,
  onClose,
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  confirmDisabled,
  confirmText,
  cancelText,
  confirmIcon: ConfirmIcon,
  cancelIcon: CancelIcon,
  footerError,
  isLoadingText,
  submitText,
  submittingText,
  initialValues,
  validationSchema,
  onSubmit,
  children,
  isLarge,
  isFull,
}: ModalProps<T>) {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useFocusTrap<HTMLDialogElement>({
    isActive: isOpen,
    onEscape: onClose,
    ref: modalRef,
  });

  useOutsideClick(modalRef, {
    onOutsideClick: () => onClose(),
    isActive: isOpen && closeOnOutsideClick,
    lockScroll: true,
  });

  if (!isOpen) return null;

  const isFormModal = initialValues && onSubmit;
  const isRenderFunction = typeof children === "function";

  const renderContent = () => {
    if (!children) {
      return (
        <h3 id="modal-title" className="modal__content__title">
          {title}
        </h3>
      );
    }

    if (isFormModal) {
      return (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form className="modal__form" noValidate>
              <div className="modal__form__content">
                {isRenderFunction
                  ? children({
                    values: values as T,
                    errors: errors as Record<string, string | undefined>,
                    touched: touched as Record<string, boolean | undefined>,
                    handleChange,
                    handleBlur,
                    setFieldValue,
                    isSubmitting,
                  })
                  : children}
              </div>

              {/*
                Mismo pie que el del modal de confirmación: cancelar y enviar, a la derecha.

                Antes solo había el botón de enviar, así que un formulario únicamente se podía abandonar por
                el aspa de la esquina —que se lee como «cerrar la ventana», no como «no lo hagas»— o con
                Escape, que hay que saber. El icono va solo si quien monta el modal pasa `confirmIcon`: el
                «+» que llevaba fijo decía «añadir» también cuando el botón era «Guardar» o «Consultar».
              */}
              <div className="modal__form__footer">
                <Button
                  type="button"
                  variant="outline"
                  title={cancelText ? cancelText : "cancel"}
                  onClick={onClose}
                  disabled={isSubmitting || isLoading}
                >
                  {CancelIcon && <CancelIcon />}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  title={
                    isSubmitting || isLoading
                      ? (submittingText ?? "loading")
                      : (submitText ?? "confirm")
                  }
                  disabled={isSubmitting || isLoading}
                >
                  {!(isSubmitting || isLoading) && ConfirmIcon && <ConfirmIcon />}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      );
    }

    return (
      <section className="modal__content">
        {children as React.ReactNode}
      </section>
    );
  };

  const modalContent = (
    <>
      <div className="modal__overlay" />

      <dialog
        open
        ref={modalRef}
        className={`modal${isFull ? " modal--full" : isLarge ? " modal--large" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          {children && (
            <h3 id="modal-title" className="modal__header__title">
              {title}
            </h3>
          )}

          {/*
            «Cerrar» y no «Cancelar»: con `ariaLabel="cancel"` esta X y el botón de cancelar del pie se
            llamaban igual, y quien navega con lector de pantalla oía dos botones «Cancelar» sin poder
            distinguirlos. Además la X cierra (`onClose`), que no siempre es lo mismo que cancelar.
          */}
          <Button
            size="sm"
            ariaLabel="close"
            className="modal__header__close"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </div>

        {renderContent()}

        {!isFormModal && (
          <section className="modal__footer">
            {footerError && (
              <p className="modal__footer__error">{footerError}</p>
            )}

            {/*
              Cancelar antes de confirmar, y no al revés.

              El pie alinea a la derecha, así que este orden deja la acción que continúa al final de la
              lectura y donde cae el pulgar en un móvil. El orden lo pone el JSX y no un `row-reverse` de
              CSS: así el foco por teclado los recorre en el mismo orden en que se ven.
            */}
            {onCancel && (
              <Button
                variant="outline"
                title={cancelText ? cancelText : "cancel"}
                onClick={onCancel}
              >
                {CancelIcon && <CancelIcon />}
              </Button>
            )}

            {onConfirm && (
              <Button
                variant={confirmVariant}
                title={
                  isLoading
                    ? (isLoadingText ?? "loading")
                    : (confirmText ?? "confirm")
                }
                onClick={onConfirm}
                disabled={isLoading || confirmDisabled}
              >
                {!isLoading && ConfirmIcon && <ConfirmIcon />}
              </Button>
            )}
          </section>
        )}
      </dialog>
    </>
  );

  return createPortal(modalContent, document.body);
}
