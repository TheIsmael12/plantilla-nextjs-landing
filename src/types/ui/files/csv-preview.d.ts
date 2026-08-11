/**
 * Props de {@link CsvPreview}, la vista previa de un CSV como tabla que monta
 * {@link FileViewer} cuando el fichero abierto es un CSV.
 * @interface CsvPreviewProps
 * @property {string} url - URL del fichero CSV, que el propio componente descarga al montarse
 * @property {string} name - Nombre del fichero, usado como `caption` de la tabla y en los mensajes de error
 */
export interface CsvPreviewProps {
  url: string;
  name: string;
}
