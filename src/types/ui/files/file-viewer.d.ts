/**
 * Fichero que {@link FileViewer} sabe representar a pantalla completa.
 * @interface ViewableFile
 * @property {string} id - Identificador estable del fichero, usado como `key`
 * @property {string} url - URL con la que se pinta el fichero (adjunto del backend o `blob:` de una selección local)
 * @property {string} name - Nombre visible del fichero, mostrado en el pie y usado al descargar
 * @property {string} [mimeType] - Tipo MIME; decide si se pinta como imagen, como PDF embebido o como "no previsualizable"
 */
export interface ViewableFile {
  id: string;
  url: string;
  name: string;
  mimeType?: string;
}

/**
 * Props de {@link FileViewer}, el visor de adjuntos a pantalla completa del
 * sistema de diseño: imágenes y PDFs, con navegación entre los ficheros de la
 * misma colección. No es un {@link ModalComponent} porque no tiene formulario
 * ni cabecera con título — es una capa de visualización sobre el contenido.
 * @interface FileViewerProps
 * @property {boolean} isOpen - Controla la visibilidad del visor
 * @property {ViewableFile[]} files - Ficheros navegables; normalmente solo los previsualizables de una lista
 * @property {number} [initialIndex] - Índice del fichero mostrado al abrir; por defecto el primero
 * @property {() => void} onClose - Handler invocado al cerrar (botón, `Escape` o clic fuera del contenido)
 * @property {(file: ViewableFile) => void} [onDownload] - Descarga personalizada; sin él, el visor descarga `file.url` directamente
 */
export interface FileViewerProps {
  isOpen: boolean;
  files: ViewableFile[];
  initialIndex?: number;
  onClose: () => void;
  onDownload?: (file: ViewableFile) => void;
}
