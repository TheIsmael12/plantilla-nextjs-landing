import type { ReactNode } from "react";

/**
 * Props de {@link BackendImage}.
 * @interface BackendImageProps
 * @property {string | null} [src] - URL de la imagen servida por el backend (ya absoluta)
 * @property {string} alt - Texto alternativo de accesibilidad
 * @property {boolean} [fill] - Si `true`, la imagen ocupa el contenedor posicionado más cercano (`position: absolute; inset: 0`), igual que `next/image`'s `fill`
 * @property {string} [className] - Clases CSS adicionales, aplicadas tanto a la imagen como al contenedor de `fallback`
 * @property {ReactNode} [fallback] - Contenido mostrado si no hay `src` o la imagen falla al cargar (p. ej. un icono genérico)
 */
export interface BackendImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  fallback?: ReactNode;
}
