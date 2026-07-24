/**
 * Forma visual del placeholder de {@link Skeleton}.
 * @typedef {("text"|"circular"|"rectangular")} SkeletonVariant
 */
export type SkeletonVariant = "text" | "circular" | "rectangular";

/**
 * Props de {@link Skeleton}.
 * @interface SkeletonProps
 * @property {SkeletonVariant} [variant] - Forma del placeholder; por defecto "text"
 * @property {(number|string)} [width] - Ancho del placeholder (px si es number, cualquier unidad CSS si es string)
 * @property {(number|string)} [height] - Alto del placeholder (px si es number, cualquier unidad CSS si es string)
 * @property {number} [count] - Número de líneas repetidas, agrupadas con espaciado vertical; por defecto 1
 * @property {string} [className] - Clases CSS adicionales
 */
export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  count?: number;
  className?: string;
}
