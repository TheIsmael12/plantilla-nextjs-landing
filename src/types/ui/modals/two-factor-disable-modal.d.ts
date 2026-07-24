/**
 * Props de {@link TwoFactorDisableModal}. Sin `isOpen`: el padre lo monta y
 * desmonta condicionalmente.
 * @interface TwoFactorDisableModalProps
 * @property {() => void} onClose - Handler invocado al cerrar el modal sin desactivar
 * @property {() => void | Promise<void>} onDisabled - Handler invocado tras desactivar correctamente la verificación en dos pasos
 */
export interface TwoFactorDisableModalProps {
  onClose: () => void;
  onDisabled: () => void | Promise<void>;
}
