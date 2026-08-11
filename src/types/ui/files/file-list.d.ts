/**
 * Fichero adjunto tal y como lo consume {@link FileList}: la forma común a un
 * documento ya guardado en el backend y a un fichero recién seleccionado en
 * {@link FileUpload}, para que la misma lista sirva en los dos casos.
 * @interface FileAttachment
 * @property {string} id - Identificador estable del fichero, usado como `key`
 * @property {string} name - Nombre visible del fichero
 * @property {number} sizeBytes - Tamaño en bytes
 * @property {string} src - URL del fichero (adjunto del backend o `blob:` de una selección local)
 * @property {string} [mimeType] - Tipo MIME; decide la vista previa y si es previsualizable
 */
export interface FileAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  src: string;
  mimeType?: string;
}

/**
 * Props de {@link FileList}, la lista de ficheros adjuntos del sistema de
 * diseño: un {@link FileItem} por fichero y un {@link FileViewer} compartido
 * que se abre al pulsar sobre los previsualizables. A diferencia de
 * {@link List}, no tiene búsqueda, filtros ni paginación: es una colección
 * corta y completa (los adjuntos de un registro), no un listado paginado.
 * @interface FileListProps
 * @property {FileAttachment[]} files - Ficheros a mostrar; con la lista vacía el componente no renderiza nada
 * @property {(file: FileAttachment, index: number) => void} [onRemove] - Quita un fichero; sin él, ninguna fila muestra el botón de eliminar
 * @property {(file: FileAttachment, index: number) => boolean} [canRemove] - Decide fichero a fichero si se puede eliminar (p. ej. solo los subidos por el propio usuario)
 * @property {(file: FileAttachment, index: number) => void} [onDownload] - Descarga personalizada; sin él, la lista descarga `src` directamente
 * @property {(file: FileAttachment, index: number) => void} [onView] - Se llama justo antes de abrir el visor; sirve para traerse el original cuando la fila solo tenía miniatura
 * @property {boolean} [disabled] - Deshabilita las acciones de todas las filas
 * @property {(src: string) => string} [resolveUrl] - Transforma el `src` antes de usarlo (p. ej. anteponer el origen del backend a una ruta relativa). Es la URL que abre el visor
 * @property {(src: string) => string} [resolveThumbnailUrl] - URL de la imagen de la fila, cuando es distinta de la del visor. Sin él, la fila usa `resolveUrl`
 * @property {string} [className] - Clases CSS adicionales para el contenedor raíz
 */
export interface FileListProps {
  files: FileAttachment[];
  onRemove?: (file: FileAttachment, index: number) => void;
  canRemove?: (file: FileAttachment, index: number) => boolean;
  onDownload?: (file: FileAttachment, index: number) => void;
  onView?: (file: FileAttachment, index: number) => void;
  disabled?: boolean;
  resolveUrl?: (src: string) => string;
  resolveThumbnailUrl?: (src: string) => string;
  className?: string;
}
