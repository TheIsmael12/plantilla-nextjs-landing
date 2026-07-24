/**
 * Props de {@link BackupCodesModal}. Sin `isOpen`: el padre lo monta solo
 * cuando hay códigos que mostrar.
 * @interface BackupCodesModalProps
 * @property {string[]} codes - Códigos de recuperación a mostrar, una única vez
 * @property {() => void} onClose - Handler invocado al cerrar el modal
 */
export interface BackupCodesModalProps {
  codes: string[];
  onClose: () => void;
}
