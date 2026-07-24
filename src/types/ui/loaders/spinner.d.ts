/**
 * Estilo de animación soportado por {@link Spinner}.
 * @typedef {("orbit"|"twin-orbit"|"planet"|"ring"|"eclipse"|"gyro"|"track")} SpinnerVariant
 */
export type SpinnerVariant =
  | "orbit"
  | "twin-orbit"
  | "planet"
  | "ring"
  | "eclipse"
  | "gyro"
  | "track";

/**
 * Props de {@link Spinner}.
 * @interface SpinnerProps
 * @property {SpinnerVariant} [variant] - Estilo de la animación de carga; por defecto "orbit"
 * @property {string} [size] - Tamaño del spinner (`font-size`, admite cualquier unidad CSS)
 * @property {string} [className] - Clases CSS adicionales
 */
export interface SpinnerProps {
  variant?: SpinnerVariant;
  size?: string;
  className?: string;
}
