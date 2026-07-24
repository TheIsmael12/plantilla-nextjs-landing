import { TOAST_DEFAULT_DURATION_MS } from "@/config/settings";
import type { AlertType } from "@/types/ui/alerts/alert";
import type { ToastItem, ToastOptions } from "@/types/ui/toasts/toast";

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: ToastListener[] = [];
let nextId = 0;

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function push(
  type: AlertType,
  message: string,
  { duration = TOAST_DEFAULT_DURATION_MS }: ToastOptions = {},
) {
  nextId += 1;
  const id = nextId;
  toasts = [...toasts, { id, type, message, duration }];
  emit();
  return id;
}

function dismiss(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

/**
 * API imperativa de notificaciones flotantes (toasts), inspirada en `sonner`:
 * se llama desde cualquier client component (p. ej. al recibir la respuesta
 * de una Server Action) sin contexto ni estado propio. Requiere `Toaster`
 * (`components/ui/toasts/Toaster.tsx`) montado una vez en el layout raíz.
 * @function toast
 * @param {string} message - Texto del toast (variante `info` por defecto)
 * @param {ToastOptions} [options] - Opciones del toast
 */
export const toast = Object.assign(
  (message: string, options?: ToastOptions) => push("info", message, options),
  {
    info: (message: string, options?: ToastOptions) =>
      push("info", message, options),
    success: (message: string, options?: ToastOptions) =>
      push("success", message, options),
    warning: (message: string, options?: ToastOptions) =>
      push("warning", message, options),
    error: (message: string, options?: ToastOptions) =>
      push("error", message, options),
    dismiss,
  },
);

/**
 * Suscribe un listener a la pila de toasts activos; usado por {@link Toaster}
 * para re-renderizar cuando `toast.*()`/`toast.dismiss()` cambian el estado.
 * @param {ToastListener} listener - Callback invocado con la pila actual de toasts
 * @returns {() => void} Función para cancelar la suscripción
 */
export function subscribeToToasts(listener: ToastListener): () => void {
  listeners = [...listeners, listener];
  listener(toasts);

  return () => {
    listeners = listeners.filter((current) => current !== listener);
  };
}
