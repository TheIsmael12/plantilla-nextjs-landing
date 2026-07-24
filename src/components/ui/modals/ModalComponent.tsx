"use client";

import "@/styles/04-components/ui/modals/modal.scss";

import { useRef } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useOutsideClick } from "@/hooks/useOutsideClick";

import Button from "@/components/ui/buttons/Button";

import { Form, Formik, FormikValues } from "formik";

import type { FormikRenderProps, ModalProps } from "@/types/ui/modals/modal";

import { PlusIcon, XIcon } from "lucide-react";

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

              <div className="modal__form__footer">
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
                  {!(isSubmitting || isLoading) && <PlusIcon />}
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
        className={`modal ${isLarge ? "modal--large" : ""}`}
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

          <Button
            size="sm"
            ariaLabel="cancel"
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

            {onCancel && (
              <Button
                variant="outline"
                title={cancelText ? cancelText : "cancel"}
                onClick={onCancel}
              >
                {CancelIcon && <CancelIcon />}
              </Button>
            )}
          </section>
        )}
      </dialog>
    </>
  );

  return createPortal(modalContent, document.body);
}
