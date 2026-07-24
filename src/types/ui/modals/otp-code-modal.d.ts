/**
 * Props de {@link OtpCodeModal}, el modal específico para pedir un código de
 * verificación de 6 dígitos (reto MFA del login, alta de 2FA).
 * @interface OtpCodeModalProps
 * @property {boolean} isOpen - Controla la visibilidad del modal
 * @property {string} title - Título del modal
 * @property {string} description - Texto descriptivo bajo el título, explicando el origen del código esperado
 * @property {string} [submitText] - Clave de traducción del botón de envío; por defecto "verify"
 * @property {string} [submittingText] - Clave de traducción del botón de envío mientras se valida el código; por defecto "verifying"
 * @property {() => void} onClose - Handler invocado al cerrar el modal
 * @property {(code: string) => Promise<string | void>} onSubmit - Valida el código introducido; devuelve un mensaje de error (clave de traducción) si no es válido, o `undefined`/`void` si la verificación tuvo éxito
 */
export interface OtpCodeModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  submitText?: string;
  submittingText?: string;
  onClose: () => void;
  onSubmit: (code: string) => Promise<string | void>;
}
