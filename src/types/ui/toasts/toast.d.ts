import type { AlertType } from "@/types/ui/alerts/alert";

/**
 * Opciones al disparar un toast.
 * @interface ToastOptions
 * @property {number} [duration] - Milisegundos antes de autocerrarse; por defecto 4000
 */
export interface ToastOptions {
  duration?: number;
}

/**
 * Toast activo en la pila de {@link Toaster}, gestionado por `lib/toast.ts`.
 * @interface ToastItem
 * @property {number} id - Identificador único, usado para cerrarlo individualmente
 * @property {AlertType} type - Tipo de toast: determina el icono y el color, igual que {@link Alert}
 * @property {string} message - Texto mostrado en el toast
 * @property {number} duration - Milisegundos antes de autocerrarse
 */
export interface ToastItem {
  id: number;
  type: AlertType;
  message: string;
  duration: number;
}

/**
 * Esquina/lado de la pantalla donde {@link Toaster} apila los toasts.
 * @typedef {("top-left"|"top-center"|"top-right"|"bottom-left"|"bottom-center"|"bottom-right")} ToastPosition
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Props de {@link Toaster}.
 * @interface ToasterProps
 * @property {ToastPosition} [position] - Esquina/lado donde se apilan los toasts; por defecto "top-right"
 */
export interface ToasterProps {
  position?: ToastPosition;
}
