/**
 * Props de {@link PdfPreview}, la vista previa de un PDF que monta
 * {@link FileViewer} cuando el fichero abierto es un PDF: renderizado con
 * PDF.js sobre un `<canvas>` propio en vez del visor nativo del navegador en
 * un `<iframe>`, que Chrome bloquea al embeberlo desde un origen distinto.
 * @interface PdfPreviewProps
 * @property {string} url - URL del fichero PDF, que el propio componente descarga y renderiza al montarse
 * @property {string} name - Nombre del fichero, usado en los mensajes de error
 * @property {number} [zoom] - Factor de ampliación sobre el ajuste "a la ventana" (1 = sin ampliar); controlado por {@link FileViewer}
 */
export interface PdfPreviewProps {
  url: string;
  name: string;
  zoom?: number;
}
