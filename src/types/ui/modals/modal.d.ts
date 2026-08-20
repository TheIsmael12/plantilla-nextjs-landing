import type { ReactNode } from "react";
import type {
  FormikConfig,
  FormikHandlers,
  FormikHelpers,
  FormikValues,
} from "formik";
import type { LucideIcon } from "lucide-react";

import type { ButtonVariant } from "@/types/ui/buttons/button";

/**
 * Datos y helpers de Formik expuestos al render-function `children` de
 * {@link ModalComponent} cuando el modal actúa como formulario. `errors`/`touched`
 * se simplifican a `Record<string, ...>` (en vez de `FormikErrors<T>`/`FormikTouched<T>`)
 * porque los tipos anidados de Formik no encajan con formularios de un solo nivel
 * como los que usa este modal.
 * @interface FormikRenderProps
 * @template T - Forma de los valores del formulario
 * @property {T} values - Valores actuales del formulario
 * @property {Record<string, string | undefined>} errors - Errores de validación por campo
 * @property {Record<string, boolean | undefined>} touched - Campos que el usuario ya ha interactuado
 * @property {FormikHandlers["handleChange"]} handleChange - Handler de cambio genérico de Formik
 * @property {FormikHandlers["handleBlur"]} handleBlur - Handler de blur genérico de Formik
 * @property {FormikHelpers<T>["setFieldValue"]} setFieldValue - Actualiza un campo concreto de forma imperativa
 * @property {boolean} isSubmitting - Si el formulario se está enviando
 */
export interface FormikRenderProps<T extends FormikValues = FormikValues> {
  values: T;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: FormikHelpers<T>["setFieldValue"];
  isSubmitting: boolean;
}

/**
 * Props de {@link ModalComponent}, el modal genérico usado tanto para
 * confirmaciones simples como para formularios completos (modo Formik,
 * activado al indicar `initialValues` + `onSubmit`).
 * @interface ModalProps
 * @template T - Forma de los valores del formulario cuando el modal actúa como formulario
 * @property {string} [title] - Título mostrado en la cabecera/contenido del modal
 * @property {boolean} isOpen - Controla la visibilidad del modal
 * @property {boolean} [closeOnOutsideClick] - Si un click fuera del modal lo cierra; por defecto `true`
 * @property {boolean} [isLoading] - Muestra el estado de carga en el botón de confirmar/enviar
 * @property {() => void} onClose - Handler invocado al cerrar el modal (botón de cierre, click fuera, tecla Escape)
 * @property {() => void} [onConfirm] - Handler del botón de confirmación (modo no-formulario)
 * @property {() => void} [onCancel] - Handler del botón de cancelar (modo no-formulario)
 * @property {ButtonVariant} [confirmVariant] - Variante visual del botón de confirmar; por defecto "error"
 * @property {boolean} [confirmDisabled] - Deshabilita el botón de confirmar (p. ej. mientras el código OTP no está completo)
 * @property {string} [confirmText] - Clave de traducción del botón de confirmar
 * @property {string} [cancelText] - Clave de traducción del botón de cancelar
 * @property {LucideIcon} [confirmIcon] - Icono mostrado junto al texto del botón de confirmar
 * @property {LucideIcon} [cancelIcon] - Icono mostrado junto al texto del botón de cancelar
 * @property {string} [footerError] - Mensaje de error mostrado en el pie del modal (modo no-formulario)
 * @property {string} [isLoadingText] - Clave de traducción del botón de confirmar mientras `isLoading` es `true`
 * @property {string} [submitText] - Clave de traducción del botón de envío (modo formulario)
 * @property {string} [submittingText] - Clave de traducción del botón de envío mientras se está enviando (modo formulario)
 * @property {T} [initialValues] - Valores iniciales de Formik; junto con `onSubmit` activa el modo formulario
 * @property {FormikConfig<T>["validationSchema"]} [validationSchema] - Esquema Yup de validación del formulario
 * @property {FormikConfig<T>["onSubmit"]} [onSubmit] - Handler de envío del formulario
 * @property {ReactNode | ((props: FormikRenderProps<T>) => ReactNode)} [children] - Contenido estático, o render-function con acceso al estado de Formik en modo formulario
 * @property {boolean} [isLarge] - Activa la variante ancha del modal (`max-width` mayor)
 * @property {boolean} [isFull] - Activa la variante a pantalla completa; pensada para formularios largos con pasos, donde una caja centrada deja el contenido a saltos
 */
export interface ModalProps<T extends FormikValues = FormikValues> {
  title?: string;
  isOpen: boolean;
  closeOnOutsideClick?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmVariant?: ButtonVariant;
  confirmDisabled?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: LucideIcon;
  cancelIcon?: LucideIcon;
  footerError?: string;
  isLoadingText?: string;
  submitText?: string;
  submittingText?: string;
  initialValues?: T;
  validationSchema?: FormikConfig<T>["validationSchema"];
  onSubmit?: FormikConfig<T>["onSubmit"];
  children?: ReactNode | ((props: FormikRenderProps<T>) => ReactNode);
  isLarge?: boolean;
  isFull?: boolean;
}
