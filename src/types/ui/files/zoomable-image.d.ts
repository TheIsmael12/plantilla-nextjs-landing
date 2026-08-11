/**
 * Props de {@link ZoomableImage}.
 * @interface ZoomableImageProps
 * @property {string} src - URL de la imagen
 * @property {string} alt - Texto alternativo de accesibilidad
 * @property {number} zoom - Factor de ampliación sobre el ajuste "a la ventana" (1 = sin ampliar); controlado por {@link FileViewer}
 * @property {HTMLElement | null} containerElement - Elemento cuyo tamaño visible define el ajuste "a la ventana" (el contenedor con scroll de {@link FileViewer}, no el propio wrapper de la imagen: medirse a sí misma entraría en bucle, porque su tamaño crece con el zoom que ese mismo cálculo produce)
 */
export interface ZoomableImageProps {
  src: string;
  alt: string;
  zoom: number;
  containerElement: HTMLElement | null;
}
