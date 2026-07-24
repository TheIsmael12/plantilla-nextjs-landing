/**
 * Tamaños soportados por {@link Avatar}.
 * @typedef {("sm"|"md"|"lg"|"xl")} AvatarSize
 */
export type AvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Props de {@link Avatar}.
 * @interface AvatarProps
 * @property {string | null} [src] - URL del avatar servido por el backend; sin valor o si falla al cargar, se muestra el icono de {@link Avatar} genérico
 * @property {string} alt - Texto alternativo de accesibilidad
 * @property {AvatarSize} [size] - Tamaño del avatar; por defecto "md"
 * @property {boolean} [bordered] - Añade un borde de 1px alrededor del avatar (p. ej. el de la barra de navegación)
 * @property {string} [className] - Clases CSS adicionales
 */
export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  bordered?: boolean;
  className?: string;
}
