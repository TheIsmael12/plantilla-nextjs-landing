/**
 * Props de {@link TwoFactorSetupModal}. Sin `isOpen`: el padre lo monta y
 * desmonta condicionalmente (en vez de mantenerlo montado con un flag), así
 * cada intento de alta arranca con estado limpio sin necesidad de resetearlo
 * a mano en un efecto.
 * @interface TwoFactorSetupModalProps
 * @property {() => void} onClose - Handler invocado al cerrar el modal sin completar el alta
 * @property {() => void | Promise<void>} onVerified - Handler invocado tras confirmar el código y activar la verificación en dos pasos
 */
export interface TwoFactorSetupModalProps {
  onClose: () => void;
  onVerified: () => void | Promise<void>;
}
