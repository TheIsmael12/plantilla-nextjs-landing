/**
 * Props de {@link FileItem}, la fila de un fichero adjunto: vista previa
 * (miniatura de imagen, icono de PDF o extensión), nombre, tamaño y las
 * acciones que le pase el llamador. Es puramente presentacional — no sabe de
 * dónde sale el fichero ni qué se puede hacer con él.
 * @interface FileItemProps
 * @property {string} name - Nombre visible del fichero
 * @property {number} sizeBytes - Tamaño en bytes, mostrado formateado (`formatFileSize`)
 * @property {string} src - URL de la vista previa (adjunto del backend o `blob:` de una selección local)
 * @property {string} [mimeType] - Tipo MIME; decide el tipo de vista previa
 * @property {() => void} [onView] - Abre el fichero en el visor; sin él, la vista previa no es interactiva
 * @property {() => void} [onRemove] - Quita el fichero de la selección; sin él, no se muestra el botón de eliminar
 * @property {() => void} [onDownload] - Descarga el fichero; sin él, no se muestra el botón de descargar
 * @property {boolean} [disabled] - Deshabilita las acciones de la fila
 * @property {string} [className] - Clases CSS adicionales para el contenedor raíz
 */
export interface FileItemProps {
  name: string;
  sizeBytes: number;
  src: string;
  mimeType?: string;
  onView?: () => void;
  onRemove?: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  className?: string;
}
