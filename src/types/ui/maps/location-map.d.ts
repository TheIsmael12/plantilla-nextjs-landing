/**
 * Props de `LocationMap`.
 * @interface LocationMapProps
 * @property {string} [address] - Dirección postal completa a situar; sin ella el componente no pinta nada
 * @property {string} [title] - Título de la sección; por defecto "Ubicación"
 * @property {string} [label] - Nombre del sitio, mostrado sobre la dirección
 * @property {string} [className] - Clase extra del contenedor
 */
export interface LocationMapProps {
  address?: string;
  title?: string;
  label?: string;
  className?: string;
}
